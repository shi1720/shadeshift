import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { heatIndex } from "../lib/model";
const read = (p: string) =>
  JSON.parse(
    readFileSync(new URL("../public/data/" + p, import.meta.url), "utf8"),
  );
const heat = read("houston-heat-2020.geojson");
assert.equal(heat.features.length, 654);
for (const f of heat.features) {
  assert.equal(f.geometry.type, "Point");
  assert.ok(
    f.geometry.coordinates[0] < -95.39 && f.geometry.coordinates[0] > -95.431,
  );
  assert.ok(
    f.properties.temperatureF >= 93.2 && f.properties.temperatureF <= 96.62,
  );
}
const weather = read("host-climate-2025.json");
assert.equal(weather.cities.length, 11);
assert.equal(new Set(weather.cities.map((c: { id: string }) => c.id)).size, 11);
for (const c of weather.cities) {
  assert.equal(c.afternoons.length, 49);
  const values: number[] = [];
  for (const row of c.afternoons) {
    assert.ok(row.localTime.endsWith("T15:00"));
    const hi = heatIndex((row.temperatureC * 9) / 5 + 32, row.relativeHumidity);
    assert.ok(Math.abs(hi - row.heatIndexF) <= 0.0051);
    values.push(row.heatIndexF);
  }
  values.sort((a, b) => a - b);
  assert.ok(Math.abs(values[24] - c.medianHeatIndexF) <= 0.051);
  assert.ok(Math.abs(values[46] - c.p95HeatIndexF) <= 0.051);
  assert.equal(values.filter((v) => v >= 90).length, c.daysHeatIndexAbove90);
}
console.log(
  "Validated 654 historical points and 539 venue-afternoons, including all heat-index recomputations and summary percentiles.",
);
