import {
  ExternalLink,
  Download,
  Info,
  Database,
  SlidersHorizontal,
  Calculator,
} from "lucide-react";
import { packages, MODEL_VERSION } from "../lib/model";
const sources = [
  {
    tag: "OBSERVED",
    name: "Houston street temperatures",
    detail:
      "654 mobile-sensor samples near NRG. August 7, 2020, 3–4 pm. Air temperature, not heat index. Observations range from 93.2°F to 96.62°F.",
    publisher: "CAPA / HARC / Houston Harris Heat Action Team",
    url: "https://www.arcgis.com/home/item.html?id=d8dd6004e1ab4dccbfb36a5992f480bc",
    file: "/data/houston-heat-2020.geojson",
    limit:
      "A historical street survey with uneven spatial coverage. No observations inside the stadium or inference of current conditions.",
  },
  {
    tag: "GEOGRAPHY",
    name: "Official Houston transit stops",
    detail:
      "METRO GTFS stop coordinates, including Stadium Park / Astrodome, Holly Hall and Fannin South. Retrieved September 18, 2026.",
    publisher: "Metropolitan Transit Authority of Harris County",
    url: "https://api-portal.ridemetro.org/",
    file: "/data/houston-transit-source.json",
    limit:
      "Static stop locations. The drawn candidate connectors are approximate and do not establish walkability, access permissions or match-day gate availability.",
  },
  {
    tag: "MODELED WEATHER",
    name: "Eleven host venue benchmarks",
    detail:
      "49 daily samples per venue at 3 pm local, June 1–July 19, 2025. ERA5 0.25° modeled temperature and humidity via Open-Meteo. Derived NWS heat index.",
    publisher: "Open-Meteo / ECMWF ERA5 / Copernicus",
    url: "https://open-meteo.com/en/docs/historical-weather-api",
    file: "/data/host-climate-2025.json",
    limit:
      "~25 km grid context, not street-scale measurements. One prior summer is not a climatology. p95 is a sample percentile, not a confidence bound.",
  },
  {
    tag: "REFERENCE",
    name: "Organizer data catalog & venues",
    detail:
      "Host-market identities from the organizers’ public spatial source catalog. Approximate venue centroids from Wikimedia coordinate records.",
    publisher: "HoustonSI / Wikimedia",
    url: "https://github.com/HoustonSI/WorldCupUSSpatialData101",
    file: "/data/host-venues.json",
    limit:
      "The source catalog links downstream datasets, whose licenses still apply. No proprietary visitor or person-level movement data are used.",
  },
];
export default function Evidence() {
  return (
    <>
      <div className="evidence-intro">
        <div>
          <Database size={25} />
          <h2>Observed</h2>
          <p>Historic street temperatures and published geographic anchors.</p>
        </div>
        <div>
          <SlidersHorizontal size={25} />
          <h2>Assumed</h2>
          <p>
            Visitor counts, dwell time, existing shade, local use, costs and
            intervention performance.
          </p>
        </div>
        <div>
          <Calculator size={25} />
          <h2>Calculated</h2>
          <p>
            Exposure accounting, portfolio allocation and scenario comparisons.
          </p>
        </div>
      </div>
      <section className="panel model-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">MODEL {MODEL_VERSION}</span>
            <h2>Simple enough to audit. Explicit enough to challenge.</h2>
          </div>
        </div>
        <div className="formula">
          <span>Direct-sun person-minutes</span>
          <b>arrivals × (walk + queue) × unshaded fraction × sunlight factor</b>
        </div>
        <div className="method-columns">
          <div>
            <h3>Baseline and intervention</h3>
            <p>
              Each visitor is allocated to one candidate link using normalized
              demand weights. Added shade reduces the unshaded fraction, capped
              at 100%. Queue operations shorten only queue duration. The
              combined intervention applies both changes before counting avoided
              exposure.
            </p>
            <p>
              Sunlight factor varies from 0.05 at 8 pm to 1.0 at 1–3 pm. It is a
              screening assumption, not a solar-position model. The same factor
              applies to baseline and intervention. Resident legacy uses a
              separate editable sunlight factor, default 1.0.
            </p>
          </div>
          <div>
            <h3>Optimization</h3>
            <p>
              Exhaustive enumeration checks up to 5⁶ = 15,625 portfolios.
              Exactly one option may be selected per link. The objective
              maximizes avoided direct-sun person-minutes subject to budget and
              minimum community allocation.
            </p>
            <p>
              Community allocation = sum of cost × assumed local-use share,
              divided by total selected cost. It is a planning preference, not a
              census vulnerability score. Ties favor lower cost.
            </p>
          </div>
          <div>
            <h3>Weather and water</h3>
            <p>
              NWS heat index provides shaded weather context. Neither the
              historical heat layer nor the heat index enters the allocation
              objective. No reduction in ambient temperature, clinical risk or
              medical events is inferred.
            </p>
            <p>
              A refill hub reports up to 1,200 refills per arrival window,
              capped by the link’s arrivals. Water does not reduce calculated
              sun exposure. The optimizer may omit water because its objective
              counts sun exposure only.
            </p>
          </div>
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>Intervention catalog</h2>
          <span className="tag amber">
            Planning allowances · validate with suppliers
          </span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Package</th>
                <th>Initial allowance</th>
                <th>Added shade</th>
                <th>Queue reduction</th>
                <th>Refill capacity</th>
                <th>Annual upkeep</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(packages).map(([id, p]) => (
                <tr key={id}>
                  <td>{p.name}</td>
                  <td>${p.cost.toLocaleString()}</td>
                  <td>{Math.round(p.shade * 100)} percentage points</td>
                  <td>{Math.round(p.queueReduction * 100)}%</td>
                  <td>{p.waterCapacity.toLocaleString()}</td>
                  <td>${p.annualMaintenance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-note">
          Queue staffing allowance repeats at $8,000 per event arrival window.
          Shade and hub allowances are reusable assets. Refill operations add
          $500 per hub per event window. Costs exclude tax, permits, site works,
          financing and contingencies. Package allowances are editable and apply
          to every link. Delivered effectiveness scales added shade and queue
          improvement together.
        </p>
      </section>
      <div className="sources-heading">
        <h2>Source register</h2>
        <span>Retrieved September 18, 2026</span>
      </div>
      <div className="source-grid">
        {sources.map((s) => (
          <article className="panel source-card" key={s.name}>
            <span className="tag">{s.tag}</span>
            <h3>{s.name}</h3>
            <p>{s.detail}</p>
            <small>{s.publisher}</small>
            <div className="source-limitation">
              <Info size={15} />
              <p>{s.limit}</p>
            </div>
            <div className="button-row">
              <a href={s.url} target="_blank" rel="noreferrer">
                Source <ExternalLink size={13} />
              </a>
              <a href={s.file} download>
                Snapshot <Download size={13} />
              </a>
            </div>
          </article>
        ))}
      </div>
      <section className="panel limitations">
        <div className="panel-heading">
          <h2>What this release establishes</h2>
        </div>
        <div className="method-columns">
          <div>
            <h3>Software verification</h3>
            <p>
              Deterministic calculations, constrained search, saved private
              scenarios, reproducible exports and interactive comparisons. See
              the repository verification record for exact executed checks.
            </p>
          </div>
          <div>
            <h3>What needs field validation</h3>
            <p>
              Pedestrian counts, actual path geometry, shade at the arrival
              hour, queue response, supplier costs, wind loading, accessible
              egress and resident reuse. No customer pilot or measured
              operational impact has occurred.
            </p>
          </div>
          <div>
            <h3>Commercial deployment</h3>
            <p>
              Public data retain attribution and service terms. Open-Meteo’s
              free API is for noncommercial use; a commercial integration needs
              a paid service or self-hosting. This app uses attributed snapshots
              and makes no live weather calls.
            </p>
          </div>
        </div>
      </section>
      <div className="source-banner">
        <Info size={20} />
        <p>
          Use this workbench for planning and discussion. For event safety
          decisions, use current conditions, qualified operational review and
          official guidance. Heat index is not WBGT.
        </p>
        <a
          href="https://www.weather.gov/safety/heat-index"
          target="_blank"
          rel="noreferrer"
        >
          NWS guidance <ExternalLink size={16} />
        </a>
      </div>
    </>
  );
}
