# ShadeShift

**The ticket gets you a seat. It does not get you shade.**

ShadeShift helps event operators decide where a limited budget can reduce outdoor arrival and queue exposure. It connects real historical heat and transit geography to an auditable intervention model, with a plan for community reuse.

A project led by **Shivam Gupta** for the Rice University Urban Sustainability Hackathon, Track 3: Public Health & the Built Environment. Developed with AI-assisted research, implementation and review. Anonymous judging materials are separate in `submission/`.

## What works

- **Houston scenario studio:** six candidate arrival links, historical measured heat layer, editable demand/queue/shade/cost inputs, baseline comparison and an exact constrained portfolio search.
- **Eleven-host atlas:** consistent ERA5 historical weather screening at the 11 U.S. host venues, including daily series, median and 95th percentile heat index.
- **Legacy model:** distinct resident-use assumptions, annual upkeep and repeated operating allowances.
- **Private saved plans:** ChatGPT sign-in, server-side ownership checks, durable D1 persistence, load and delete. Anonymous exploration remains available when the deployment audience is public.
- **Reproducible exports:** spreadsheet-safe CSV, versioned JSON containing resolved inputs, catalog and results, validated import, and a printable decision brief.
- **Evidence register:** sources, dates, licenses, equations, limitations and downloads.

The prototype is implemented as a deployable application, with tested workflows. It has not undergone an operational venue pilot, external security audit, or commercial readiness certification. Do not use modeled benefits as measured health outcomes.

## Demonstration in two minutes

1. Open the studio. The example spends **$70,000** within a **$75,000** cap and models **23.8%** less direct-sun exposure.
2. Pin a comparison and click **Optimize investment**. The finite catalog optimum models **31.3%** less exposure at the same spend and a **27.4%** community-weighted allocation.
3. Note the tradeoff: optimized refill capacity becomes **zero**, compared with **1,200 refills per arrival window** in the example. Water is a separate service need, not a reduction in sunlight.
4. Reduce effectiveness, edit a queue duration or package cost, and recalculate.
5. Export the inputs/results. Sign in to save the plan, then inspect annual costs and community reuse.

These figures are scenario calculations, not observed impacts. Historical temperature is context and **does not drive the optimizer**.

## Run locally

Requires Node 22.13+ and Python 3 for the offline data pipeline.

```bash
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_ancient_pepper_potts.sql
npm run dev
```

Open the local URL printed by the server. Apply the migration only once to each fresh local database. For subsequent schema changes, generate new migrations with `npm run db:generate`; never rewrite applied migrations.

The Vite development server provides **local-only mock sign-in** on localhost. It strips incoming identity headers and uses an explicit local test cookie. It is not included in the production Worker. Hosted authentication is provided by Sites dispatch. Do not deploy the generated Worker behind an arbitrary untrusted proxy: see [security boundaries](docs/SECURITY.md).

No paid API key is required to run the application. The weather/heat evidence ships as attributed snapshots. Map tiles load from OpenStreetMap and need network connectivity. All calculations continue to work if map tiles are unavailable.

## Verify

```bash
npm run typecheck
npm test
npm run data:verify
npm run data:rebuild
npx playwright install chromium
# With npm run dev already serving http://localhost:5173:
npm run test:e2e
npm run build
```

Model tests check conservation, overlap, shade bounds, exact optimality against an independent enumerator, infeasible constraints, zero-benefit cases, heat index, annual costs, source snapshots and safe exports. Browser tests exercise the full save/load/delete flow, sign-in draft recovery, comparisons, atlas, file round trips, responsive layout, keyboard dialogs and API rejection paths.

## Data and methods

- **654 real observations:** H3AT/CAPA/HARC mobile air temperatures near NRG, August 7, 2020, 3–4 pm. Street samples, not current weather or a stadium-wide surface.
- **Official geographic anchors:** Houston METRO static GTFS, retrieved September 18, 2026. Drawn connectors are approximate candidate links, not navigation directions.
- **539 weather samples:** 49 afternoons at each of 11 venue locations, June 1–July 19, 2025, 3 pm local. Open-Meteo / ERA5 consistent 0.25° model grids.
- **Assumptions:** visitor allocation, dwell times, shade, costs, effects and resident use are editable. No private mobility or person-level data are included.

`npm run data:rebuild` rebuilds the national benchmark **offline from checked-in raw responses**, from any working directory. `npm run data:refresh` explicitly requests the historical weather API; educational/noncommercial service terms apply. See [source register](docs/DATA_SOURCES.md), [model specification](docs/MODEL.md), and [commercial case](docs/BUSINESS.md).

## Architecture

```text
Public evidence snapshots + validated operator assumptions
                       |
               Pure TypeScript model
                       |
    Exact portfolio search / sensitivity / cost accounting
                       |
        React + Leaflet + Recharts workbench
                       |
       Same-origin authenticated /api/plans
                       |
       Sites identity -> owner-filtered Cloudflare D1
```

Vinext builds the React/TypeScript app into a Cloudflare-compatible Worker. Sites handles hosting and authentication. No language model makes allocation decisions. The small search space makes a deterministic auditable method more useful.

## Project layout

- `lib/model.ts` — equations, portfolio search, immutable export snapshots
- `lib/validation.ts` — bounded input validation
- `app/` — scenario studio, atlas, evidence, API
- `db/` and `drizzle/` — schema and append-only migrations
- `public/data/` — evidence and demonstration scenario snapshots
- `scripts/` — data reproduction and verification
- `tests/` — model and browser regression checks
- `submission/` — anonymous narrative, video script, slides and PDF brief
- `docs/` — methods, source register, business case, security and release notes

## Responsible implementation

A field pilot must verify routes, current gates, shade, demand, dwell, wind ratings, accessibility, egress, permissions and supplier costs. Heat index is a shaded weather indicator, not WBGT. This application does not estimate avoided illness, deaths, carbon savings, or unique residents protected. Commercial pricing and adoption remain hypotheses.

Software: MIT. Data and dependencies retain their own licenses. No affiliation or endorsement by FIFA, Rice, METRO, HARC or other named organizations is implied.
