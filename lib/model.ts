/** ShadeShift v1.0: transparent planning model. No epidemiological prediction. */
export const MODEL_VERSION = "1.0.0";
export type PackageId = "none" | "shade" | "water" | "queue" | "complete";
export type Corridor = {
  id: string;
  name: string;
  short: string;
  kind: string;
  coordinates: [number, number][];
  visitors: number;
  walkMinutes: number;
  queueMinutes: number;
  shade: number;
  residentShare: number;
  dailyResidents: number;
  note: string;
};
export type Scenario = {
  name: string;
  budget: number;
  attendance: number;
  temperature: number;
  humidity: number;
  hour: number;
  effectiveness: number;
  residentMinimum: number;
  eventDays: number;
  legacyDays: number;
  legacySunlight: number;
  costOverrides: Partial<Record<PackageId, number>>;
  packages: Record<string, PackageId>;
  overrides: Record<
    string,
    Partial<
      Pick<
        Corridor,
        | "visitors"
        | "walkMinutes"
        | "queueMinutes"
        | "shade"
        | "residentShare"
        | "dailyResidents"
      >
    >
  >;
};
export const packages: Record<
  PackageId,
  {
    name: string;
    cost: number;
    shade: number;
    queueReduction: number;
    waterCapacity: number;
    annualMaintenance: number;
    description: string;
  }
> = {
  none: {
    name: "No intervention",
    cost: 0,
    shade: 0,
    queueReduction: 0,
    waterCapacity: 0,
    annualMaintenance: 0,
    description: "Retain the baseline.",
  },
  shade: {
    name: "Modular shade",
    cost: 18000,
    shade: 0.35,
    queueReduction: 0,
    waterCapacity: 0,
    annualMaintenance: 1800,
    description:
      "Reusable structures add 35 percentage points of effective route and queue shade.",
  },
  water: {
    name: "Shade + refill hub",
    cost: 26000,
    shade: 0.35,
    queueReduction: 0,
    waterCapacity: 1200,
    annualMaintenance: 3600,
    description:
      "Modular shade plus a refill point, up to 1,200 refills in the arrival window.",
  },
  queue: {
    name: "Queue operations",
    cost: 8000,
    shade: 0,
    queueReduction: 0.4,
    waterCapacity: 0,
    annualMaintenance: 0,
    description:
      "A staffed arrival plan reduces outdoor queue time by an assumed 40%. Event operating cost.",
  },
  complete: {
    name: "Complete cool link",
    cost: 34000,
    shade: 0.35,
    queueReduction: 0.4,
    waterCapacity: 1200,
    annualMaintenance: 3600,
    description:
      "Shade, a refill hub and queue operations. Component costs add without a bundle discount.",
  },
};
export const corridors: Corridor[] = [
  {
    id: "rail",
    name: "Stadium station arrival",
    short: "Stadium station",
    kind: "Transit connector",
    coordinates: [
      [29.685929, -95.403341],
      [29.68595, -95.406],
      [29.6842, -95.4091],
    ],
    visitors: 7200,
    walkMinutes: 12,
    queueMinutes: 8,
    shade: 0.1,
    residentShare: 0.35,
    dailyResidents: 450,
    note: "Origin: METRO GTFS stop 25003. Connector geometry and venue approach are illustrative; validate access with the venue.",
  },
  {
    id: "north",
    name: "North arrival & queue",
    short: "North arrival",
    kind: "Venue queue",
    coordinates: [
      [29.6909, -95.4109],
      [29.6879, -95.4107],
      [29.6861, -95.4105],
    ],
    visitors: 4200,
    walkMinutes: 9,
    queueMinutes: 14,
    shade: 0.08,
    residentShare: 0.15,
    dailyResidents: 180,
    note: "Candidate north approach, approximate geometry. Outdoor queue duration is a planning assumption.",
  },
  {
    id: "rideshare",
    name: "Yellow Lot arrival",
    short: "Yellow Lot",
    kind: "Rideshare connector",
    coordinates: [
      [29.6795, -95.4154],
      [29.6812, -95.4142],
      [29.6823, -95.4128],
    ],
    visitors: 3600,
    walkMinutes: 11,
    queueMinutes: 10,
    shade: 0.05,
    residentShare: 0.1,
    dailyResidents: 120,
    note: "FIFA Houston transport identifies Yellow Lot for rideshare. Candidate connector is not an approved pedestrian route.",
  },
  {
    id: "holly",
    name: "Holly Hall neighborhood link",
    short: "Holly Hall",
    kind: "Community connector",
    coordinates: [
      [29.685342, -95.39901],
      [29.68565, -95.4015],
      [29.685929, -95.403341],
    ],
    visitors: 2200,
    walkMinutes: 10,
    queueMinutes: 5,
    shade: 0.16,
    residentShare: 0.8,
    dailyResidents: 850,
    note: "Origin: METRO GTFS stop 9236. Community share and footfall need field validation.",
  },
  {
    id: "fannin",
    name: "Fannin South approach",
    short: "Fannin South",
    kind: "Transit connector",
    coordinates: [
      [29.673589, -95.402806],
      [29.6782, -95.4032],
      [29.6823, -95.4033],
    ],
    visitors: 1800,
    walkMinutes: 18,
    queueMinutes: 4,
    shade: 0.12,
    residentShare: 0.7,
    dailyResidents: 620,
    note: "Origin: METRO GTFS Fannin South. This is a screening connector, not a routing recommendation; rail is also available.",
  },
  {
    id: "west",
    name: "Kirby west approach",
    short: "Kirby approach",
    kind: "Street connector",
    coordinates: [
      [29.6842, -95.4169],
      [29.6842, -95.4148],
      [29.6845, -95.413],
    ],
    visitors: 3000,
    walkMinutes: 8,
    queueMinutes: 12,
    shade: 0.06,
    residentShare: 0.25,
    dailyResidents: 300,
    note: "Approximate west approach. Verify sidewalks, road crossings, perimeter and accessibility before deployment.",
  },
];
export const defaultScenario: Scenario = {
  name: "Houston · balanced arrival plan",
  budget: 75000,
  attendance: 22000,
  temperature: 94,
  humidity: 55,
  hour: 15,
  effectiveness: 100,
  residentMinimum: 25,
  eventDays: 12,
  legacyDays: 180,
  legacySunlight: 1,
  costOverrides: {},
  packages: {
    rail: "water",
    north: "queue",
    rideshare: "none",
    holly: "shade",
    fannin: "shade",
    west: "none",
  },
  overrides: {},
};
export const sunlight: Record<number, number> = {
  10: 0.7,
  11: 0.8,
  12: 0.9,
  13: 1,
  14: 1,
  15: 1,
  16: 0.9,
  17: 0.75,
  18: 0.55,
  19: 0.3,
  20: 0.05,
};
export function heatIndex(t: number, r: number): number {
  const simple = 0.5 * (t + 61 + (t - 68) * 1.2 + r * 0.094);
  if ((simple + t) / 2 < 80) return (simple + t) / 2;
  let h =
    -42.379 +
    2.04901523 * t +
    10.14333127 * r -
    0.22475541 * t * r -
    0.00683783 * t * t -
    0.05481717 * r * r +
    0.00122874 * t * t * r +
    0.00085282 * t * r * r -
    0.00000199 * t * t * r * r;
  if (r < 13 && t >= 80 && t <= 112)
    h -= ((13 - r) / 4) * Math.sqrt((17 - Math.abs(t - 95)) / 17);
  else if (r > 85 && t >= 80 && t <= 87) h += ((r - 85) / 10) * ((87 - t) / 5);
  return h;
}
export function getCorridors(s: Scenario): Corridor[] {
  return corridors.map((c) => ({ ...c, ...s.overrides[c.id] }));
}
export function corridorResult(c: Corridor, s: Scenario, id: PackageId) {
  const p = {
      ...packages[id],
      cost: s.costOverrides?.[id] ?? packages[id].cost,
    },
    eff = s.effectiveness / 100,
    total = getCorridors(s).reduce((a, c) => a + c.visitors, 0);
  const visitors = total > 0 ? (c.visitors / total) * s.attendance : 0;
  const sun = sunlight[s.hour] ?? 1;
  const base =
    visitors * (c.walkMinutes + c.queueMinutes) * (1 - c.shade) * sun;
  const coverage = Math.min(1, c.shade + p.shade * eff);
  const after =
    visitors *
    (c.walkMinutes + c.queueMinutes * (1 - p.queueReduction * eff)) *
    (1 - coverage) *
    sun;
  const saved = Math.max(0, base - after);
  const legacy =
    c.dailyResidents *
    c.walkMinutes *
    (coverage - c.shade) *
    (s.legacySunlight ?? 1) *
    s.legacyDays;
  return {
    id: c.id,
    visitors,
    base,
    after,
    saved,
    cost: p.cost,
    coverage,
    water: Math.min(visitors, p.waterCapacity),
    residentInvestment: p.cost * c.residentShare,
    legacy,
    maintenance: p.annualMaintenance,
  };
}
export function evaluate(s: Scenario) {
  const rows = getCorridors(s).map((c) => ({
    ...c,
    ...corridorResult(c, s, s.packages[c.id] ?? "none"),
    package: s.packages[c.id] ?? "none",
  }));
  const sum = (
    key:
      | "base"
      | "after"
      | "saved"
      | "cost"
      | "water"
      | "residentInvestment"
      | "legacy"
      | "maintenance",
  ) => rows.reduce((a, c) => a + c[key], 0);
  const base = sum("base"),
    saved = sum("saved"),
    cost = sum("cost"),
    residentInvestment = sum("residentInvestment");
  return {
    rows,
    base,
    after: sum("after"),
    saved,
    cost,
    reduction: base ? (100 * saved) / base : 0,
    water: sum("water"),
    residentInvestment,
    residentPercent: cost ? (residentInvestment / cost) * 100 : 0,
    legacy: sum("legacy"),
    maintenance: sum("maintenance"),
    eventSavings: saved * s.eventDays,
    heatIndex: heatIndex(s.temperature, s.humidity),
    annualCost:
      cost +
      sum("maintenance") +
      rows.reduce(
        (a, c) =>
          a +
          (["queue", "complete"].includes(c.package)
            ? (s.costOverrides?.queue ?? 8000) * (s.eventDays - 1)
            : 0) +
          (["water", "complete"].includes(c.package) ? 500 * s.eventDays : 0),
        0,
      ),
    costPerHour: saved ? cost / (saved / 60) : 0,
    budgetValid: cost <= s.budget,
    equityValid:
      cost === 0
        ? s.residentMinimum === 0
        : (residentInvestment / cost) * 100 + 1e-8 >= s.residentMinimum,
  };
}
/** Exhaustive multiple-choice allocation: 5^6=15,625 portfolios; exact for this finite catalog. */
export function optimize(s: Scenario): {
  packages: Record<string, PackageId>;
  feasible: boolean;
  examined: number;
  noBenefit?: boolean;
} {
  const cs = getCorridors(s),
    ids = Object.keys(packages) as PackageId[];
  const choices = cs.map((c) =>
    ids.map((id) => ({ ...corridorResult(c, s, id), optionId: id })),
  );
  let best = -1,
    bestCost = Infinity,
    bestPlan: Record<string, PackageId> = {},
    examined = 0;
  function search(
    i: number,
    cost: number,
    value: number,
    resident: number,
    plan: Record<string, PackageId>,
  ) {
    if (cost > s.budget) return;
    if (i === cs.length) {
      examined++;
      if (cost === 0 && s.residentMinimum > 0) return;
      if (cost > 0 && (resident / cost) * 100 + 1e-8 < s.residentMinimum)
        return;
      if (
        value > best + 1e-7 ||
        (Math.abs(value - best) < 1e-7 && cost < bestCost)
      ) {
        best = value;
        bestCost = cost;
        bestPlan = { ...plan };
      }
      return;
    }
    for (const p of choices[i]) {
      plan[cs[i].id] = p.optionId;
      search(
        i + 1,
        cost + p.cost,
        value + p.saved,
        resident + p.residentInvestment,
        plan,
      );
    }
  }
  search(0, 0, 0, 0, {});
  return {
    packages: bestPlan,
    feasible: best > 1e-7,
    examined,
    noBenefit: best >= 0 && best <= 1e-7,
  };
}
export function sensitivity(s: Scenario) {
  return [60, 80, 100].map((effectiveness) => ({
    effectiveness,
    ...evaluate({ ...s, effectiveness }),
  }));
}
export function snapshot(s: Scenario) {
  const resolved = {
    ...s,
    legacySunlight: s.legacySunlight ?? 1,
    costOverrides: s.costOverrides ?? {},
    overrides: Object.fromEntries(
      getCorridors(s).map(
        ({
          id,
          visitors,
          walkMinutes,
          queueMinutes,
          shade,
          residentShare,
          dailyResidents,
        }) => [
          id,
          {
            visitors,
            walkMinutes,
            queueMinutes,
            shade,
            residentShare,
            dailyResidents,
          },
        ],
      ),
    ),
  };
  return {
    modelVersion: MODEL_VERSION,
    exportedAt: new Date().toISOString(),
    scenario: resolved,
    packageCatalog: packages,
    sunlightProfile: sunlight,
    evidence: {
      heat: "H3AT 2020-08-07",
      weather: "ERA5 2025-06-01 to 2025-07-19",
      transit: "METRO August2026IVOMS_20260828",
    },
    results: evaluate(s),
  };
}
export function toCsv(s: Scenario): string {
  const r = evaluate(s);
  const esc = (v: unknown) => {
    const raw = String(v);
    const safe =
      typeof v === "string" && /^[\s]*[=+@\-\t\r]/.test(raw) ? "'" + raw : raw;
    return '"' + safe.replace(/"/g, '""') + '"';
  };
  return [
    ["ShadeShift scenario", s.name, "Model", MODEL_VERSION],
    ["Exported UTC", new Date().toISOString()],
    [
      "Data status",
      "Illustrative demand, shade, costs and effects. Observed heat layer is separate.",
    ],
    ["Budget USD", s.budget, "Arrivals", s.attendance, "Hour", s.hour],
    [
      "Temperature F",
      s.temperature,
      "Relative humidity %",
      s.humidity,
      "Delivered effectiveness %",
      s.effectiveness,
    ],
    [
      "Minimum community %",
      s.residentMinimum,
      "Event windows per year",
      s.eventDays,
      "Legacy days",
      s.legacyDays,
      "Legacy sunlight factor",
      s.legacySunlight,
    ],
    [
      "Budget valid",
      r.budgetValid,
      "Community constraint valid",
      r.equityValid,
    ],
    [
      "Corridor",
      "Package",
      "Arrival visitors",
      "Demand weight",
      "Walk min",
      "Queue min",
      "Existing shade fraction",
      "Local-use fraction",
      "Daily residents",
      "Baseline sun person-min",
      "With plan sun person-min",
      "Avoided sun person-min",
      "Initial cost USD",
      "Refill capacity",
    ],
    ...r.rows.map((c) => [
      c.name,
      packages[c.package].name,
      Math.round(c.visitors),
      getCorridors(s).find((x) => x.id === c.id)!.visitors,
      c.walkMinutes,
      c.queueMinutes,
      c.shade,
      c.residentShare,
      c.dailyResidents,
      Math.round(c.base),
      Math.round(c.after),
      Math.round(c.saved),
      c.cost,
      c.water,
    ]),
    [
      "Model description",
      "people * (walk + queue) * unshaded fraction * sunlight factor",
    ],
    [
      "Limitations",
      "Not a clinical risk estimate. No field validation. Historical temperature does not drive optimization. Costs exclude tax, permitting, site works and contingency.",
    ],
    [
      "Full reproducibility",
      "Use the accompanying scenario JSON snapshot and the tagged model source.",
    ],
  ]
    .map((row) => row.map(esc).join(","))
    .join("\r\n");
}
