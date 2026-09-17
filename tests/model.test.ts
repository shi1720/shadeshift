import test from "node:test";
import assert from "node:assert/strict";
import {
  defaultScenario,
  evaluate,
  optimize,
  corridors,
  packages,
  heatIndex,
  sensitivity,
  snapshot,
  toCsv,
  Scenario,
} from "../lib/model";
import { scenarioSchema } from "../lib/validation";
const base = () => structuredClone(defaultScenario);
test("default example has independently calculated exposure and price", () => {
  const r = evaluate(base());
  assert.equal(r.base, 409260);
  assert.ok(Math.abs(r.saved - 97448.4) < 1e-7);
  assert.equal(r.cost, 70000);
  assert.equal(r.water, 1200);
  assert.equal(r.annualCost, 171200);
});
test("no intervention conserves exposure and costs zero", () => {
  const s = base();
  s.packages = {};
  const r = evaluate(s);
  assert.equal(r.saved, 0);
  assert.equal(r.cost, 0);
  assert.equal(r.base, r.after);
});
test("arrivals allocated once and sum to total under varied demand weights", () => {
  const s = base();
  s.attendance = 57000;
  s.overrides.rail = { visitors: 30000 };
  const r = evaluate(s);
  assert.ok(
    Math.abs(r.rows.reduce((a, c) => a + c.visitors, 0) - 57000) < 1e-7,
  );
});
test("combination does not double-count shade and queue benefits", () => {
  const s = base();
  s.packages = { rail: "complete" };
  const r = evaluate(s).rows[0];
  assert.equal(r.after, 7200 * (12 + 8 * 0.6) * 0.55);
  assert.ok(r.saved < 7200 * 20 * 0.35 + 7200 * 8 * 0.4 * 0.9);
});
test("shade never exceeds 100 percent; savings remain bounded", () => {
  const s = base();
  s.overrides.rail = { shade: 0.9 };
  s.packages = { rail: "complete" };
  const r = evaluate(s);
  assert.equal(r.rows[0].coverage, 1);
  for (const c of r.rows) {
    assert.ok(c.after >= 0);
    assert.ok(c.saved <= c.base);
  }
});
test("zero effectiveness produces no improvement or purchasing recommendation", () => {
  const s = base();
  s.effectiveness = 0;
  assert.equal(evaluate(s).saved, 0);
  assert.equal(optimize(s).feasible, false);
  assert.equal(optimize(s).noBenefit, true);
});
test("optimizer known optimum obeys budget and community constraint", () => {
  const s = base();
  const o = optimize(s);
  assert.ok(o.feasible);
  const r = evaluate({ ...s, packages: o.packages });
  assert.equal(r.saved, 127902);
  assert.equal(r.cost, 70000);
  assert.ok(r.budgetValid);
  assert.ok(r.equityValid);
  assert.equal(r.water, 0);
});
test("optimizer equals independent flat base-five enumerator", () => {
  const s = { ...base(), budget: 50000, residentMinimum: 40 };
  const ids = Object.keys(packages) as (keyof typeof packages)[];
  let best = -1;
  for (let mask = 0; mask < 15625; mask++) {
    let m = mask;
    const plan: Scenario["packages"] = {};
    corridors.forEach((c) => {
      plan[c.id] = ids[m % 5];
      m = Math.floor(m / 5);
    });
    const r = evaluate({ ...s, packages: plan });
    if (r.budgetValid && r.equityValid) best = Math.max(best, r.saved);
  }
  const o = optimize(s);
  assert.ok(o.feasible);
  assert.ok(
    Math.abs(evaluate({ ...s, packages: o.packages }).saved - best) < 1e-7,
  );
});
test("infeasible constraints report failure rather than silent relaxation", () => {
  const s = base();
  s.budget = 1000;
  assert.equal(optimize(s).feasible, false);
  s.budget = 150000;
  s.residentMinimum = 99;
  assert.equal(optimize(s).feasible, false);
});
test("higher budget cannot decrease optimal objective at fixed constraints", () => {
  let last = 0;
  for (const budget of [8000, 26000, 50000, 75000, 100000, 150000]) {
    const s = { ...base(), budget, residentMinimum: 0 };
    const o = optimize(s);
    if (o.feasible) {
      const r = evaluate({ ...s, packages: o.packages });
      assert.ok(r.saved >= last);
      last = r.saved;
    }
  }
});
test("zero visitors and all-zero demand receive no false benefit", () => {
  const s = base();
  s.attendance = 0;
  assert.equal(evaluate(s).saved, 0);
  assert.equal(optimize(s).feasible, false);
  s.attendance = 22000;
  s.overrides = Object.fromEntries(
    corridors.map((c) => [c.id, { visitors: 0 }]),
  );
  assert.equal(scenarioSchema.safeParse(s).success, false);
});
test("water alone has same shade benefit; refill capacity capped by arrivals", () => {
  const a = base();
  a.packages = { rail: "shade" };
  const b = base();
  b.packages = { rail: "water" };
  assert.equal(evaluate(a).saved, evaluate(b).saved);
  b.attendance = 100;
  assert.ok(evaluate(b).water <= 100);
});
test("weather context does not claim to change sun exposure", () => {
  const a = base(),
    b = { ...base(), temperature: 100, humidity: 80 };
  assert.equal(evaluate(a).saved, evaluate(b).saved);
  assert.notEqual(evaluate(a).heatIndex, evaluate(b).heatIndex);
});
test("NWS heat index examples and cool fallback", () => {
  assert.ok(Math.abs(heatIndex(90, 70) - 105.922) < 0.01);
  assert.ok(Math.abs(heatIndex(80, 40) - 79.929) < 0.2);
  assert.ok(Number.isFinite(heatIndex(110, 5)));
});
test("legacy use is independent of event arrival hour and no queue benefit persists", () => {
  const a = base(),
    b = { ...base(), hour: 20 };
  assert.equal(evaluate(a).legacy, evaluate(b).legacy);
  const c = base();
  c.packages = { rail: "queue" };
  assert.equal(evaluate(c).legacy, 0);
  c.packages = { rail: "shade" };
  const d = { ...c, legacySunlight: 0.5 };
  assert.equal(evaluate(d).legacy, evaluate(c).legacy / 2);
});
test("cost quotes propagate through objective and exports", () => {
  const s = base();
  s.costOverrides.shade = 20000;
  assert.equal(evaluate(s).cost, 74000);
  const o = optimize(s);
  assert.ok(evaluate({ ...s, packages: o.packages }).cost <= s.budget);
});
test("schema rejects invalid, malicious and excessive input", () => {
  for (const patch of [
    { budget: -1 },
    { humidity: 101 },
    { hour: 22 },
    { packages: { evil: "shade" } },
    { overrides: { rail: { shade: 2 } } },
    { name: " " },
    { name: "x".repeat(101) },
  ])
    assert.equal(
      scenarioSchema.safeParse({ ...base(), ...patch }).success,
      false,
    );
  assert.ok(scenarioSchema.safeParse(base()).success);
});
test("scenario export freezes defaults and is round-trippable", () => {
  const output = snapshot(base());
  assert.equal(Object.keys(output.scenario.overrides).length, 6);
  assert.equal(output.modelVersion, "1.0.0");
  const parsed = scenarioSchema.parse(
    JSON.parse(JSON.stringify(output)).scenario,
  );
  assert.deepEqual(evaluate(parsed), evaluate(base()));
});
test("CSV neutralizes spreadsheet formula injection and retains traceability", () => {
  const csv = toCsv({ ...base(), name: '=HYPERLINK("bad")' });
  assert.ok(csv.includes("'="));
  assert.ok(csv.includes("Legacy sunlight factor"));
  assert.ok(csv.includes("Existing shade fraction"));
  assert.ok(csv.includes("Exported UTC"));
});
test("effectiveness sensitivity is ordered and reproducible", () => {
  const rs = sensitivity(base());
  assert.ok(rs[0].saved < rs[1].saved);
  assert.ok(rs[1].saved < rs[2].saved);
});
