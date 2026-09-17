"use client";
import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import { evaluate, Scenario, packages } from "../lib/model";
type Heat = {
  geometry: { coordinates: [number, number] };
  properties: { temperatureF: number; localTime: string };
};
export default function CorridorMap({
  scenario,
  selected,
  onSelect,
  showHeat,
}: {
  scenario: Scenario;
  selected: string;
  onSelect: (id: string) => void;
  showHeat: boolean;
}) {
  const element = useRef<HTMLDivElement>(null),
    map = useRef<Leaflet.Map | null>(null),
    L = useRef<typeof Leaflet | null>(null),
    layer = useRef<Leaflet.LayerGroup | null>(null),
    heat = useRef<Leaflet.LayerGroup | null>(null);
  const [ready, setReady] = useState(false),
    [heatError, setHeatError] = useState(false),
    [tilesMissing, setTilesMissing] = useState(false);
  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      if (cancelled || !element.current) return;
      L.current = mod;
      const m = mod
        .map(element.current, { zoomControl: false, scrollWheelZoom: false })
        .setView([29.6849, -95.4074], 14);
      map.current = m;
      mod.control.zoom({ position: "bottomright" }).addTo(m);
      mod.control.scale({ imperial: false, position: "bottomleft" }).addTo(m);
      const tiles = mod
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        })
        .addTo(m);
      tiles.on("tileerror", () => setTilesMissing(true));
      tiles.on("tileload", () => setTilesMissing(false));
      layer.current = mod.layerGroup().addTo(m);
      heat.current = mod.layerGroup();
      setReady(true);
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, []);
  useEffect(() => {
    if (!ready || !L.current || !map.current || !layer.current) return;
    const l = L.current,
      g = layer.current;
    g.clearLayers();
    evaluate(scenario).rows.forEach((c, i) => {
      const color = c.package === "none" ? "#e38155" : "#087c67";
      l.polyline(c.coordinates, {
        color: "#fff",
        weight: selected === c.id ? 13 : 10,
        opacity: 0.95,
      }).addTo(g);
      const line = l
        .polyline(c.coordinates, {
          color,
          weight: selected === c.id ? 7 : 5,
          opacity: 0.95,
          dashArray: c.package === "none" ? "7 6" : undefined,
        })
        .addTo(g);
      line.on("click", () => onSelect(c.id));
      line.bindTooltip(`${c.name} · ${packages[c.package].name}`, {
        sticky: true,
      });
      l.marker(c.coordinates[0], {
        icon: l.divIcon({
          className: "map-number-wrap",
          html: `<span class="map-number ${selected === c.id ? "selected" : ""}" style="background:${color}">${i + 1}</span>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        }),
      })
        .addTo(g)
        .on("click", () => onSelect(c.id));
    });
    l.marker([29.6847, -95.4107], {
      icon: l.divIcon({
        className: "venue-label",
        html: "<span>NRG STADIUM</span>",
        iconSize: [125, 24],
        iconAnchor: [62, 12],
      }),
    }).addTo(g);
  }, [ready, scenario, selected, onSelect]);
  useEffect(() => {
    if (!ready || !map.current || !heat.current || !L.current) return;
    const m = map.current,
      h = heat.current,
      l = L.current;
    let cancelled = false;
    if (showHeat) {
      h.addTo(m);
      if (h.getLayers().length === 0)
        fetch("/data/houston-heat-2020.geojson")
          .then((r) => {
            if (!r.ok) throw Error();
            return r.json() as Promise<{ features: Heat[] }>;
          })
          .then((data) => {
            if (cancelled) return;
            data.features.forEach((f: Heat) => {
              const t = f.properties.temperatureF;
              l.circleMarker(
                [f.geometry.coordinates[1], f.geometry.coordinates[0]],
                {
                  radius: 3,
                  stroke: false,
                  fillOpacity: 0.7,
                  fillColor:
                    t > 95.5 ? "#ae3d39" : t > 94.5 ? "#de7745" : "#e8b863",
                },
              )
                .bindTooltip(
                  `${t.toFixed(1)}°F · ${f.properties.localTime} · historical air temperature`,
                )
                .addTo(h);
            });
          })
          .catch(() => setHeatError(true));
    } else m.removeLayer(h);
    return () => {
      cancelled = true;
    };
  }, [ready, showHeat]);
  return (
    <div className="map-shell">
      <div
        ref={element}
        className="map-canvas"
        role="region"
        aria-label="Houston candidate intervention connectors and optional historical temperature observations"
      />
      {!ready && <div className="map-loading">Loading geographic view…</div>}
      <div className="map-note">
        Candidate connectors · approximate, not navigation
      </div>
      {showHeat && (
        <div className="heat-legend">
          <b>Measured air temperature</b>
          <span>Aug 7, 2020 · 3–4 pm</span>
          <div className="heat-gradient" />
          <div className="between">
            <span>93.2°F</span>
            <span>96.6°F</span>
          </div>
        </div>
      )}
      {(heatError || tilesMissing) && (
        <div className="map-error">
          {heatError
            ? "Historical observations could not load."
            : "Basemap unavailable. Connector coordinates remain visible."}
        </div>
      )}
    </div>
  );
}
