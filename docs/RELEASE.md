# Release verification

ShadeShift 1.0.0, September 18, 2026.

Application: [shadeshift-city.web.app](https://shadeshift-city.web.app). Source: [shi1720/shadeshift](https://github.com/shi1720/shadeshift).

## Current deployment architecture

Vite builds the React/TypeScript application to static assets. Firebase Hosting serves them. Firebase Authentication provides email/password accounts and password reset. The Firebase client SDK persists versioned plans in Firestore under the authenticated UID. Firestore rules enforce owner-only access and immutable saved versions.

The checked-in rules permit the current model version, validate the document envelope and deny unrelated paths. They cannot parse the JSON scenario payload. See [security boundaries](SECURITY.md) and [rules test contract](FIREBASE-SECURITY.md).

## Confirmed analytical verification

- Twenty model/schema regression tests passed during independent review.
- 654 measured heat points and 539 weather rows were verified, including recomputed heat indices and summary percentiles.
- The historical weather benchmark was rebuilt offline from repository snapshots.
- Independent enumeration confirmed optimizer agreement across 234,375 portfolios over 15 budget/community-constraint combinations.
- Desktop studio, atlas and 390-pixel mobile screenshots were visually inspected.
- The eight-slide pitch and five-page methods brief were rendered and inspected during artifact review.

Review findings led to versioned input/result snapshots, spreadsheet-safe CSV, separate legacy sunlight assumptions, zero-benefit handling, refill operating allowances and improved keyboard dialogs. In-page Firebase sign-in preserves the active scenario without an authentication redirect.

## Firebase verification scope

The migrated Firebase release has completed:

- **15 Firestore security test groups passed** using the database emulator and the deployed-rule source. Coverage includes ownership, anonymous/cross-account denial, immutable versions and document validation.
- **Seven browser workflows passed** against local Firebase Auth and Firestore emulators. These include account creation, customized-plan save/reload/open/delete, account isolation, sign-out, wrong-password rejection and subsequent sign-in, alongside public workbench checks.
- **Firebase Hosting deployment succeeded** at [shadeshift-city.web.app](https://shadeshift-city.web.app). Firebase email/password authentication was enabled through the official deployment tooling.

These are the migrated suites. Six hosted public-browser tests and a separate real-account save/load/delete smoke test also passed, as recorded below. Cross-account denial was tested against the same rules in the emulator. Password-reset email delivery was not tested against a real inbox. Run the current suites using the README instructions.

Tests establish software behavior within their scope, not real-world predictive accuracy, security certification or commercial readiness.

## Demonstration results

The default scenario has 22,000 illustrative arrivals and 409,260 baseline direct-sun person-minutes. Its $70,000 portfolio models 23.8% avoided exposure and 1,200 refills per arrival window. Under a $75,000 cap and a 25% community-weighted minimum, optimization models 31.3% avoided exposure at $70,000 with zero refill capacity. At 60% delivered effectiveness, that optimized portfolio models 18.8% avoided exposure.

The default first-year allowance is **$171,200**, including recurring queue and refill operations and maintenance. These figures are model outputs, not delivered benefits or supplier quotations.

## Known limits

Houston demand and intervention effects remain illustrative. Other venues have historical weather screening only. Connectors are approximate, not approved routes. No field pilot, revenue or clinical outcome is claimed. The public basemap depends on network access. Commercial operation requires field validation, monitored service costs, backups, abuse controls, support and appropriate data/map service terms.

The saved-plan interface shows the latest 50 records; this is not an enforced storage quota. Firebase account deletion does not automatically remove plan documents. Data retention, complete account deletion and external security review remain deployment work.

## Hosted verification record

The Firebase release passed all six public Playwright workflows and a separate real-account smoke test: create account, save a plan, reload and open the exact inputs, sign out, sign back in, delete the plan and confirm deletion after reload. No browser page errors occurred. The disposable test plan and account were removed. Desktop and 390-pixel mobile views were inspected with map tiles and charts loaded.

Production dependency audit reports no known vulnerabilities at verification time. This is a dependency advisory check, not a security certification.
