# Security and operational boundaries

## Identity and ownership

Sites dispatch initiates ChatGPT authentication and supplies authenticated user headers. The app trusts those headers only behind that dispatcher. A publicly accessible direct Worker with forgeable headers would be an unsafe deployment. Do not reuse the Worker on another host without replacing the trust boundary.

Every saved-plan GET/POST/DELETE checks identity on the server. Queries use prepared bindings and owner filters. The browser never supplies an owner ID. All plan responses use Cache-Control: no-store. Mutations require an exact same-origin Origin header. D1 stores an immutable scenario snapshot, not credentials.

Local Vite sign-in is a development convenience only, guarded by localhost/loopback checks. It strips incoming authenticated-user headers. It is not a production authentication implementation.

## Input and output

Strict Zod validation bounds numbers, keys and string length, rejects non-finite inputs, and requires positive demand weight when attendance is positive. JSON requests have a 20 KB body-size check. CSV escapes quotes and neutralizes leading spreadsheet-formula text. React escapes displayed names. SQL never interpolates scenario values.

A transient sessionStorage draft preserves a customized scenario through a top-level authentication redirect and expires after one hour. Saved plans use D1. The draft is removed after restoration. Plan downloads remain under the user's control.

## Verification scope

Local automated checks cover anonymous API rejection, invalid inputs, cross-origin writes, oversized bodies, save/reload/delete and keyboard workflows. They do not prove the platform's identity-header stripping or cross-account isolation. Hosted auth boundary checks must be recorded separately after deployment.

## Before commercial operations

Add account-level throttling, atomic plan quotas, paginated plans, retention policy, tested D1 backups/restoration, support procedures, operational monitoring and an external security review. Current 50-plan quota uses count-then-insert and can be exceeded by concurrent requests. This is a capacity limitation, not authorization to access another account.

The endpoint reads the body before applying its 20 KB check; platform request limits remain relevant. Data storage errors preserve the current client scenario and provide an export fallback. No credentials belong in source, examples, browser storage or logs.

## Privacy

The public application uses no individual mobility traces. Stored plans are private to the signed-in platform identity. Email/display name is shown from the authentication context; it is not copied into the plan table. Users may delete their saved plans. Infrastructure providers may retain their own operational logs under their policies.
