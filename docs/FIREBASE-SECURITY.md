# Firebase data security

Firestore accepts saved plans only at `users/{uid}/plans/{uuid}`. An authenticated, non-anonymous Firebase user can read, list, create and delete documents under their own UID. Every update is denied, including replacement writes and merge writes. A changed scenario must be saved under a new UUID. All other document paths are closed. No public sharing or collaborator role is implied.

## Saved document contract

Exactly these five fields are permitted:

| Field          | Database-enforced requirement                             |
| -------------- | --------------------------------------------------------- |
| `name`         | Nonblank string, 1–100 characters; single-line plan names |
| `modelVersion` | Exactly `"1.0.0"`                                         |
| `snapshotJson` | Nonempty string, at most 20,000 characters                |
| `createdAt`    | Timestamp equal to the write's `request.time`             |
| `updatedAt`    | Timestamp equal to the write's `request.time`             |

Use `crypto.randomUUID()` for document IDs and Firestore `serverTimestamp()` for both timestamps. The rules validate UUID shape, not the origin or uniqueness of the random generator. Do not add a client-controlled `ownerId`; ownership comes from the authenticated token and document path.

The JSON string is an opaque, size-bounded payload. Firestore rules cannot parse or validate its internal scenario schema. A permitted document is **not proof of a valid model result**: the application must parse and validate it against the supported snapshot/scenario schema before applying it, and compute outputs from validated inputs. Do not execute or insert user strings as HTML. The field limits are string-character limits, not byte limits. Firestore's own document byte limit still applies.

The immutability policy prevents updates to an existing document. Owners can deliberately delete a document and later create a new one using the same ID. This is user-controlled version storage, not tamper-proof auditing or regulated record retention.

## Emulator verification

The test suite uses the actual `firestore.rules` file and `@firebase/rules-unit-testing`, with a fixed nonproduction project `demo-shadeshift` and loopback emulator `127.0.0.1:8080`. It never points to a production database. A running Firestore emulator and a compatible Java runtime are required.

With the emulator already running:

```sh
node --import tsx --test tests/firestore.test.ts
```

Or let the Firebase CLI start and stop it (assuming `firebase.json` maps `firestore.rules` and port 8080):

```sh
npx firebase emulators:exec --only firestore --project demo-shadeshift \
  "node --import tsx --test tests/firestore.test.ts"
```

Tests cover owner CRUD, supported identity providers, unauthenticated and anonymous denial, cross-user isolation, immutable versions, exact keys, every required field, invalid types and bounds, timestamp forgery, unexpected paths, collection-group queries and atomic batch rejection. They explicitly document that opaque JSON validity is an application concern. Test setup alone bypasses rules to seed fixtures; tested client operations do not.

## Deployment and operational boundary

Deploy the rules alongside the application, explicitly to the intended Firebase project. Firebase configuration/API keys shipped to browsers identify a project; they are not administrative credentials. Firestore rules, Firebase Authentication and authorized domains are the access boundary. Never ship service-account keys, Admin SDK credentials or emulator connection settings in a production bundle.

Server/Admin SDK access bypasses these rules and must be controlled by IAM. The design does not provide rate limiting, per-user document-count quotas, an email-verification requirement, abuse prevention or backup policy. Enable appropriate quotas/alerts and consider Firebase App Check before a public commercial launch. Account deletion must separately delete retained plan documents; deleting a Firebase Auth account does not perform that data cleanup automatically.

Official references: [field and type validation](https://firebase.google.com/docs/firestore/security/rules-fields), [authentication conditions and server access](https://firebase.google.com/docs/firestore/security/rules-conditions), [emulator rules testing](https://firebase.google.com/docs/rules/unit-tests).
