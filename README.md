# ShadeShift

**The ticket gets you a seat. It does not get you shade.**

ShadeShift helps event operators decide where a limited budget can reduce time spent in direct sun during outdoor arrivals and queues. It connects historical heat and transit geography to an auditable investment model, with a separate plan for community reuse.

[Open the application](https://shadeshift-city.web.app) · [Source repository](https://github.com/shi1720/shadeshift) · [Release verification](docs/RELEASE.md)

Led by **Shivam Gupta** for the Rice University Urban Sustainability Hackathon, Track 3: Public Health & the Built Environment. Developed with AI-assisted research, implementation and review. Anonymous judging materials are in `submission/`.

## Try it in two minutes

1. Explore without an account. The Houston example spends **$70,000** within a **$75,000** cap and models **23.8%** less direct-sun exposure.
2. Pin a comparison, then choose **Optimize investment**. The catalog optimum models **31.3%** less exposure at the same spend and a **27.4%** community-weighted allocation.
3. Inspect the tradeoff: refill capacity falls from **1,200 to zero**. The objective reduces sun exposure; it does not automatically satisfy every service need.
4. Change queue time, package costs or delivered effectiveness. Compare the result, export it, and inspect annual operations and community reuse.
5. Create an email/password account to save private plans. Sign-in happens in the workbench, preserving the current scenario. Saved plans can be reopened and deleted.

These are scenario calculations, not observed impacts. Historical temperature and heat index provide context and **do not drive the optimizer**.

## What is implemented

- **Houston scenario studio:** six candidate arrival links, measured historical heat, editable demand/queue/shade/cost assumptions, baseline comparison and exact constrained portfolio search.
- **Eleven-host atlas:** consistent historical ERA5 weather screening at the 11 U.S. host venues, including daily series and sample median/95th percentile heat index.
- **Legacy accounting:** independent resident-use assumptions, annual maintenance and repeated queue/refill operations.
- **Private saved plans:** Firebase Authentication with email/password registration, sign-in, password reset and sign-out; Firestore storage restricted to the account's UID by database rules.
- **Portable results:** spreadsheet-safe CSV, versioned JSON with resolved assumptions/catalog/results, validated import, pinned comparison and a printable brief.
- **Evidence register:** source dates, attribution, equations, limitations and downloadable snapshots.

The application is a tested planning demonstration. It has not completed a venue pilot, external security audit or commercial readiness certification. It does not estimate medical outcomes.

## Run locally

Requires Node 22.13+; Python 3 for data reproduction. Firebase emulator tests also require a compatible Java runtime.

```sh
npm ci
npm run dev
```

Open [localhost:5173](http://localhost:5173). The checked-in Firebase web configuration is a public project identifier, not an administrative credential. Without emulator mode, account and saved-plan operations use the configured Firebase project. Use emulators for automated tests and disposable test accounts.

For isolated local authentication and persistence, start two terminals:

```sh
# Terminal 1: local Auth and Firestore, never production
npx firebase emulators:start --only auth,firestore --project demo-shadeshift
```

```sh
# Terminal 2: application connected to those emulators
npm run dev:emulator
```

No paid weather API is needed: attributed evidence snapshots ship with the app. OpenStreetMap basemap tiles need network access; calculations do not depend on tile availability. Unsaved changes live in the current browser session's React state. Save or export before refreshing or closing the page.

## Verify

```sh
npm run typecheck
npm test
npm run data:verify
npm run data:rebuild
npm run build
```

Database authorization tests start and stop a local Firestore emulator:

```sh
npm run test:rules
```

If the emulator is already running, avoid starting another on port 8080:

```sh
node --import tsx --test tests/firestore.test.ts
```

For browser tests, keep Auth/Firestore emulators and `npm run dev:emulator` running, then:

```sh
npx playwright install chromium
npm run test:e2e
```

`PLAYWRIGHT_BASE_URL` can change the browser target. Do not point automated account-creation tests at production unless explicitly conducting an authorized production check. The exact executed checks and their scope are recorded in [release verification](docs/RELEASE.md).

Model tests cover visitor conservation, overlapping intervention effects, shade bounds, exact optimality, infeasible and zero-benefit cases, heat index, costs and portable outputs. Firestore tests cover owner access, cross-account/anonymous denial, immutable saved versions and document validation. Browser tests cover the interactive workflows. Passing software tests does not establish field accuracy.

## Data and method

- **654 measured observations:** H3AT/CAPA/HARC mobile air temperatures near NRG, August 7, 2020, 3–4 pm. Street samples, not current weather or a stadium-wide surface.
- **Official geographic anchors:** Houston METRO static GTFS, retrieved September 18, 2026. Drawn connectors are approximate candidates, not navigation directions.
- **539 modeled weather samples:** 49 afternoons at each of 11 venue locations, June 1–July 19, 2025, 3 pm local. Open-Meteo / ERA5 0.25° grids. One season is not a climate normal or a 2026 forecast.
- **Explicit assumptions:** visitor allocation, dwell, shade, cost, effects and resident use. No private mobility traces or person-level movement data are included.

The six-link model checks up to 5⁶ = 15,625 portfolios, selecting one package per link. It maximizes avoided direct-sun person-minutes subject to an initial budget and a cost-weighted community-use constraint. Water is a separate capacity measure. No language model makes allocation decisions.

`npm run data:rebuild` reproduces the national benchmark offline from checked-in raw responses. `npm run data:refresh` explicitly requests the historical API and is subject to its service terms. See [data sources](docs/DATA_SOURCES.md), [model specification](docs/MODEL.md) and [commercial hypothesis](docs/BUSINESS.md).

## Architecture

```text
Attributed evidence snapshots + validated operator assumptions
                            |
                  Pure TypeScript model
                            |
       Exact search / sensitivity / cost accounting
                            |
           Vite + React + Leaflet + Recharts
                            |
              Firebase Authentication
                            |
    Firestore: users/{authenticated UID}/plans/{UUID}
              owner-only database rules
```

Firebase Hosting serves the static Vite build. The browser accesses Firebase through its SDK; there is no custom saved-plan HTTP API. Firestore rules enforce ownership and the saved-document envelope. Zod validates scenario contents in the application. Details and limitations are in [security boundaries](docs/SECURITY.md).

To deploy to your own project, configure `firebase.web.json`, enable email/password authentication, create Firestore, and update the target project and authorized domains. Deploy Hosting, rules and indexes together. Never deploy with `VITE_USE_FIREBASE_EMULATORS=true` or ship administrative credentials. The repository's `npm run deploy` targets the maintained `shadeshift-city` project and requires authorized Firebase CLI access.

## Files

| Location | Purpose |
|---|---|
| `app/main.tsx`, `app/workbench.tsx` | React entry point and application workflow |
| `app/auth-dialog.tsx`, `lib/firebase.ts` | Account UI and private plan storage |
| `lib/model.ts`, `lib/validation.ts` | Calculations and bounded scenario validation |
| `firestore.rules`, `firebase.json` | Database authorization and Hosting configuration |
| `public/data/`, `scripts/` | Evidence snapshots, reproduction and verification |
| `tests/` | Model, browser and database-rules tests |
| `submission/` | Anonymous narrative, video script, slides and methods brief |
| `docs/` | Methods, sources, business assumptions, security and release record |

## Implementation boundaries

Field deployment must verify actual paths, gates, shade, demand, queue times, wind ratings, accessibility, egress, permissions and supplier costs. The application does not claim avoided illnesses, deaths, carbon savings or unique residents protected. Pricing and adoption remain hypotheses.

Software: MIT. Data and dependencies retain their own licenses. No affiliation or endorsement by FIFA, Rice, METRO, HARC or other named organizations is implied.

## Demo video

Watch the [public narrated demo](https://www.youtube.com/watch?v=Z0P42fXrd1Y), view the [submitted project](https://devpost.com/software/shadeshift), or download the [complete release](https://github.com/shi1720/shadeshift/releases/tag/v1.0.0).

The narrated, captioned demo and its publication metadata are in [submission/video](submission/video). The final MP4 is distributed as a release asset to keep the source checkout small. Its screen recordings show the deployed application, with synthetic standard-voice narration.
