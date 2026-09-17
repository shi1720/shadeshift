# Testing ShadeShift

Open https://shadeshift-city.web.app in a current desktop or mobile browser. No API key, payment or sign-in is needed for the complete scenario demo.

1. In Scenario studio, the default Houston plan shows 23.8% modeled exposure reduction, $70,000 investment and 1,200 refills per arrival window.
2. Click Pin comparison, then Optimize investment. At the default $75,000 cap and 25% community minimum, the result is 31.3% modeled reduction at $70,000. Refill capacity becomes zero. Compare this tradeoff with the pinned plan.
3. Move Delivered effectiveness to 60%. The fixed optimized plan shows 18.8% reduction. Restore 100%.
4. Select a numbered link, expand Edit this link's assumptions, and change walking/queue time or demand. Results update. Package cost allowances are editable too.
5. Open Host city atlas, sort by 95th-percentile heat index and select Philadelphia. Its historical benchmark is 107.8°F. The atlas covers 11 venues and explicitly separates weather screening from local readiness.
6. Open Evidence & method for equations, source dates and limitations. Open Legacy & delivery to change event count and resident reuse assumptions and see the operating cost implications.
7. Export a reproducible JSON plan. Change an input, import the downloaded JSON, and verify restoration. CSV exports include formula-safe text. Print via the Export menu or your browser.
8. For optional cloud persistence, click Sign in to save plans, choose Create an account, and use your own email with an 8-character or longer password. No shared credentials are required. Save a named plan, reload, open Saved plans and load it. Sign out and sign back in to verify persistence. Delete the test plan from Saved plans when finished.
9. Use Reset example to return to the starting scenario. Reset affects the active draft, not previously saved versions.

## What the numbers mean

All demand, dwell, shade, costs and effectiveness are editable planning assumptions. Historical heat observations and weather benchmarks are labeled with their dates. Direct-sun person-minutes are an operational exposure proxy, not a prediction of illness or temperature change. Field validation remains future work.

## Verified release checks

- 20 model/schema regression tests passed.
- 15 Firestore security test groups passed, including cross-account denial and malformed writes.
- 7 browser workflows passed with real Firebase Auth and Firestore emulators.
- 6 public browser workflows passed against Firebase Hosting.
- A separate hosted test verified account creation, save/load after reload, sign-out/sign-in and deletion, with no browser page errors. Its disposable account and plans were removed.
- 654 measured heat points and 539 venue-afternoon weather rows were verified and the pinned weather benchmark rebuilt offline.

Reproduction commands and guarded hosted smoke-test instructions are in the public source repository. Basemap tiles require network access; numerical planning uses the bundled evidence snapshots.
