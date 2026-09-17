# Release verification

ShadeShift 1.0.0, 2026-09-18.

## Executed locally

- TypeScript typecheck passed.
- 20 model/regression tests passed.
- Seven Playwright browser workflows passed: allocation/comparison/sensitivity, atlas, exports/imports, sign-in draft recovery with D1 save/reload/delete, API rejection cases, mobile layout, keyboard dialog containment/Escape/focus restoration.
- 654 measured heat points and 539 weather rows verified; every derived heat index and sample percentile recomputed.
- Offline weather benchmark rebuild succeeded from repository snapshots.
- Desktop studio, national atlas, legacy and 390px mobile screens inspected.
- Editable eight-slide pitch and five-page methods brief rendered and visually inspected by artifact reviewer.

The browser suite uses local-only mock authentication. Hosted authentication and deployment status are recorded after publication. Tests establish software behavior, not real-world predictive validity or commercial readiness.

Independent source review checked exact optimizer agreement across 234,375 portfolios before fixes, then reran model/data checks after fixes. Findings led to draft recovery, versioned snapshots, safe CSV, independent legacy timing, zero-benefit behavior, refill operating cost and keyboard improvements. Internal simulated scores are not external judging results and are not used as marketing claims.

## Known limits

Houston demand/effects remain illustrative. Other venues have weather screening only. Drawn connectors are approximate. No field pilot, customer revenue or clinical outcomes. OSM basemap needs network connectivity. Commercial-scale use needs reviewed hosting/auth boundaries, backups, monitoring, support and appropriate data/map service terms.
