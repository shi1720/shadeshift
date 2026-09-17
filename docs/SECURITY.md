# Security and operational boundaries

## Authentication and ownership

The deployed application is a static Vite/React build on Firebase Hosting. Email/password account creation, sign-in, password reset and sign-out use Firebase Authentication. The interface does not require an account for public exploration, calculations or exports.

Saved documents live at `users/{uid}/plans/{uuid}`. Firestore rules require a signed-in, non-anonymous identity whose UID matches that path. Owners can create, read, list and delete their versions; updates are denied. A changed plan is saved as a new document. Other paths are denied by default. There is no custom cookie-authenticated saved-plan endpoint or trusted identity-header proxy.

The Firebase web configuration is delivered to the browser and is not an administrative secret. Authentication tokens and deployed Firestore rules establish user access. Administrative SDKs bypass these rules, so project IAM and service-account credentials require separate protection. Never put administrative credentials in source or browser assets.

## Validation and saved records

The database rules enforce allowed envelope fields, supported model version, UUID shape, name/type/length constraints, a bounded snapshot string and server timestamps. The snapshot JSON is opaque to Firestore rules: they cannot validate its internal scenario or certify that its results are correct. The application parses the snapshot and validates inputs with Zod before use. Calculations use validated scenario inputs rather than trusting uploaded result fields.

Snapshot strings are bounded at 20,000 characters by the rules. The client also checks length. This is not a universal 20 KB byte guarantee. Owners who bypass the interface can store malformed but size-compliant JSON in their own namespace; one invalid document can currently cause their saved-plan listing to fail. It does not grant access to another account. See the precise contract in [Firebase data security](FIREBASE-SECURITY.md).

CSV exports quote fields and neutralize leading spreadsheet formulas. React escapes displayed strings. JSON import rejects incompatible explicit model versions, and saved plans with incompatible versions cannot be opened as the current model. Exports retain resolved assumptions, catalog, model version and results for inspection.

The interface lists the latest 50 saved plans. This is a query limit, **not an enforced per-account storage quota**. Rules do not limit document count or creation rate. Saved versions are not a tamper-proof audit log: an owner can delete a document and create a new one under the same ID.

## Browser and hosting behavior

Sign-in occurs in an in-page dialog; the current scenario remains in React state. The app does not store passwords in plan documents or implement its own password database. Firebase manages authentication/session persistence. Unsaved scenarios are not guaranteed to survive refresh or tab closure; save or export first.

Hosting configuration sets `X-Content-Type-Options`, a restrictive camera/microphone/geolocation Permissions Policy, a referrer policy and same-origin framing. These headers are configured in the repository; verify the actual hosted response after deployment. Do not describe them as a full content-security policy or security certification.

Map tiles are third-party requests. Public data contain historical observations and geographic anchors, not identifiable visitor trajectories. Account email and UID are handled by Firebase Authentication; plan documents contain scenarios under their owner's UID. Users can delete individual plans. Firebase account deletion does not automatically delete Firestore documents, and no complete account/data-erasure workflow is currently implemented.

## Local testing

Use the `demo-shadeshift` Firebase emulators for test accounts and stored fixtures. `npm run dev:emulator` selects loopback Auth/Firestore endpoints. Emulator mode is an explicit local setting, not a production authentication shortcut. The production build must not include an enabled emulator flag.

Rules tests use the actual rules file and simulated authenticated contexts. They check ownership, anonymous denial, cross-user access, immutable versions, invalid envelopes, timestamp forgery and closed paths. Browser tests and production checks have different scopes; consult [release verification](RELEASE.md) for executed results. Emulator success is not proof that the intended rules were deployed to the hosted project.

## Before commercial operations

Verify the deployed Hosting/Auth/Firestore configuration with two accounts and a signed-out browser. Establish monitored quotas, budget alerts, abuse controls, backup/restore procedures, a retention and deletion policy, incident/support ownership and an external security review. Consider App Check, an email-verification requirement and stronger password policy according to the operator's needs. These are not currently asserted as enforced.

The current browser signup form requires eight password characters; that UI check alone is not proof of the Firebase project's server password policy. No rate-limit, availability, penetration-test or production security certification claim is made.
