"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { ArrowRight, Download, MapPin, Info } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import data from "../public/data/host-climate-2025.json";
import type * as Leaflet from "leaflet";
function AtlasMap({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const element = useRef<HTMLDivElement>(null),
    map = useRef<Leaflet.Map | null>(null),
    layer = useRef<Leaflet.LayerGroup | null>(null),
    L = useRef<typeof Leaflet | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((l) => {
      if (cancelled || !element.current) return;
      L.current = l;
      map.current = l
        .map(element.current, { scrollWheelZoom: false })
        .setView([38.1, -97.3], 4);
      l.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map.current);
      layer.current = l.layerGroup().addTo(map.current);
      setReady(true);
    });
    return () => {
      cancelled = true;
      map.current?.remove();
    };
  }, []);
  useEffect(() => {
    if (!ready || !L.current || !layer.current) return;
    const l = L.current,
      g = layer.current;
    g.clearLayers();
    data.cities.forEach((c) => {
      const marker = l
        .circleMarker([c.latitude, c.longitude], {
          radius: c.id === selected ? 13 : 8,
          color: c.id === selected ? "#102e36" : "white",
          weight: 3,
          fillColor:
            c.medianHeatIndexF >= 95
              ? "#d9633e"
              : c.medianHeatIndexF >= 85
                ? "#dfa253"
                : "#137c6a",
          fillOpacity: 1,
        })
        .addTo(g);
      marker
        .bindTooltip(
          `${c.city}: ${c.medianHeatIndexF.toFixed(1)}°F median heat index`,
        )
        .on("click", () => onSelect(c.id));
    });
  }, [selected, ready, onSelect]);
  return (
    <div
      ref={element}
      className="atlas-map"
      role="region"
      aria-label="Eleven United States World Cup host stadium locations"
    />
  );
}
export default function CityAtlas({ onHouston }: { onHouston: () => void }) {
  const [selected, setSelected] = useState("houston"),
    [sort, setSort] = useState<"medianHeatIndexF" | "p95HeatIndexF">(
      "medianHeatIndexF",
    );
  const city = data.cities.find((c) => c.id === selected)!;
  const ranked = useMemo(
    () => [...data.cities].sort((a, b) => b[sort] - a[sort]),
    [sort],
  );
  return (
    <>
      <div className="context-bar">
        <span>
          <MapPin size={17} />
          11 U.S. host venues
        </span>
        <span>June 1 – July 19, 2025 · 3 pm local</span>
        <span className="tag amber">Historical modeled weather</span>
      </div>
      <div className="atlas-layout">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">CONSISTENT WEATHER SCREENING</span>
              <h2>Heat has more than one pattern.</h2>
            </div>
            <span className="tag">ERA5 · ~25 km grid</span>
          </div>
          <AtlasMap selected={selected} onSelect={setSelected} />
          <div className="map-footer">
            <span>
              <i className="legend-dot" style={{ background: "#137c6a" }} />
              Median &lt;85°F
            </span>
            <span>
              <i className="legend-dot" style={{ background: "#dfa253" }} />
              85–95°F
            </span>
            <span>
              <i className="legend-dot" style={{ background: "#d9633e" }} />
              ≥95°F
            </span>
          </div>
          <div className="atlas-insight">
            <Info size={21} />
            <div>
              <b>Typical heat and extreme afternoons tell different stories.</b>
              <p>
                Houston has the highest median in this sample. Philadelphia has
                the highest 95th percentile. A city’s typical afternoon does not
                describe its hottest event days.
              </p>
            </div>
          </div>
        </section>
        <section className="panel city-detail">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">SELECTED HOST MARKET</span>
              <h2>{city.city}</h2>
            </div>
            <MapPin size={21} />
          </div>
          <div className="detail-body">
            <p className="city-venue">
              {city.venue}
              <span>{city.municipality}</span>
            </p>
            <div className="city-temperature">
              {city.medianHeatIndexF.toFixed(1)}
              <small>°F</small>
            </div>
            <p className="field-help">Median afternoon heat index in shade</p>
            <div className="detail-numbers">
              <div>
                <span>95th percentile</span>
                <b>{city.p95HeatIndexF.toFixed(1)}°F</b>
              </div>
              <div>
                <span>Afternoons ≥90°F</span>
                <b>
                  {city.daysHeatIndexAbove90}
                  <small> / 49</small>
                </b>
              </div>
            </div>
            <div className="note-box">
              <p>
                {city.id === "houston"
                  ? "Houston includes local measured heat observations and an intervention workbench."
                  : "Weather screening only. No local pedestrian demand, shade audit or intervention model is available for this market yet."}
              </p>
            </div>
            {city.id === "houston" && (
              <button className="primary full-width" onClick={onHouston}>
                Open Houston scenario <ArrowRight size={17} />
              </button>
            )}
            <p className="source-note">
              Venue centroid: {city.latitude.toFixed(4)},{" "}
              {city.longitude.toFixed(4)}. Model grid:{" "}
              {city.gridLatitude.toFixed(2)}, {city.gridLongitude.toFixed(2)}.
            </p>
          </div>
        </section>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">
              49 AFTERNOONS, ONE COMPARABLE WINDOW
            </span>
            <h2>{city.city} · daily heat context</h2>
          </div>
          <span className="tag">3 pm local</span>
        </div>
        <div className="atlas-chart">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={city.afternoons.map((d) => ({
                date: d.localTime.slice(5, 10),
                "Heat index": d.heatIndexF,
                "Air temperature":
                  Math.round(((d.temperatureC * 9) / 5 + 32) * 10) / 10,
              }))}
              margin={{ left: 0, right: 30, top: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e4eaea" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={35} />
              <YAxis
                unit="°F"
                domain={["auto", "auto"]}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(v) => `${Number(v).toFixed(1)}°F`} />
              <Legend />
              <Line
                dataKey="Heat index"
                stroke="#087b65"
                dot={false}
                strokeWidth={2.5}
              />
              <Line
                dataKey="Air temperature"
                stroke="#c09152"
                dot={false}
                strokeWidth={1.5}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>Compare host markets</h2>
          <label className="inline-label">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
            >
              <option value="medianHeatIndexF">Median heat index</option>
              <option value="p95HeatIndexF">95th percentile</option>
            </select>
          </label>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Host market / venue municipality</th>
                <th>Median heat index</th>
                <th>95th percentile</th>
                <th>Afternoons ≥90°F</th>
                <th>Local model</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((c) => (
                <tr
                  key={c.id}
                  className={selected === c.id ? "selected-row" : ""}
                >
                  <td>
                    <button
                      className="table-link"
                      onClick={() => setSelected(c.id)}
                    >
                      {c.city}
                      <small>{c.municipality}</small>
                    </button>
                  </td>
                  <td>
                    <div className="heat-bar-cell">
                      <b>{c.medianHeatIndexF.toFixed(1)}°F</b>
                      <span
                        style={{
                          width: `${Math.max(3, (c.medianHeatIndexF - 60) * 2)}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td>{c.p95HeatIndexF.toFixed(1)}°F</td>
                  <td>{c.daysHeatIndexAbove90} / 49</td>
                  <td>
                    <span
                      className={`tag ${c.id === "houston" ? "green-tag" : ""}`}
                    >
                      {c.id === "houston" ? "Houston pilot" : "Context only"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-note">
          These are historical weather comparisons, not city readiness rankings.
          Venue municipalities may differ from host-market names. Sample
          percentile uses nearest rank.
        </p>
      </section>
      <div className="source-banner">
        <Info size={20} />
        <p>
          Open-Meteo / ECMWF ERA5, CC BY 4.0. One 49-day sample in 2025 is not a
          climate normal or a 2026 forecast. Heat index describes shaded,
          light-wind conditions and excludes direct solar radiation.
          Coordinates: Wikimedia. Host identities: organizer source catalog.
        </p>
        <a href="/data/host-climate-2025.json" download>
          <Download size={18} />
          Download data
        </a>
      </div>
    </>
  );
}
