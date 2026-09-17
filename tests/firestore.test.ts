import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, before, beforeEach, test } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

// Deliberately fixed demo project and loopback host: never touch production.
let env: RulesTestEnvironment;
const id = "00000000-0000-4000-8000-000000000001";
const secondId = "00000000-0000-4000-8000-000000000002";
const path = (uid = "alice", planId = id) => `users/${uid}/plans/${planId}`;
const user = (uid = "alice") =>
  env
    .authenticatedContext(uid, {
      firebase: { sign_in_provider: "password" },
    })
    .firestore();
const validPlan = (overrides: Record<string, unknown> = {}) => ({
  name: "Houston arrival plan",
  modelVersion: "1.0.0",
  snapshotJson: JSON.stringify({ modelVersion: "1.0.0", scenario: {} }),
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  ...overrides,
});

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-shadeshift",
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: await readFile(
        new URL("../firestore.rules", import.meta.url),
        "utf8",
      ),
    },
  });
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    for (const uid of ["alice", "bob", "anonymous-user"]) {
      await setDoc(doc(context.firestore(), path(uid)), {
        ...validPlan(),
        createdAt: Timestamp.fromMillis(1000),
        updatedAt: Timestamp.fromMillis(1000),
      });
    }
  });
});

after(async () => {
  await env?.cleanup();
});

test("owner can create, read, list and delete a saved version", async () => {
  const db = user();
  const target = doc(db, path("alice", secondId));
  await assertSucceeds(setDoc(target, validPlan()));
  const saved = await assertSucceeds(getDoc(target));
  assert.equal(saved.data()?.name, "Houston arrival plan");
  assert.ok(saved.data()?.createdAt instanceof Timestamp);
  assert.ok(saved.data()?.createdAt.isEqual(saved.data()?.updatedAt));
  const plans = await assertSucceeds(
    getDocs(
      query(
        collection(db, "users/alice/plans"),
        orderBy("createdAt", "desc"),
        limit(50),
      ),
    ),
  );
  assert.equal(plans.size, 2);
  await assertSucceeds(deleteDoc(target));
  assert.equal((await getDoc(target)).exists(), false);
});

test("Google authenticated owner is allowed as well as password owner", async () => {
  const db = env
    .authenticatedContext("alice", {
      firebase: { sign_in_provider: "google.com" },
    })
    .firestore();
  await assertSucceeds(getDoc(doc(db, path())));
});

test("unauthenticated visitors cannot read, list, create, update or delete", async () => {
  const db = env.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, path())));
  await assertFails(getDocs(collection(db, "users/alice/plans")));
  await assertFails(setDoc(doc(db, path("alice", secondId)), validPlan()));
  await assertFails(updateDoc(doc(db, path()), { name: "Changed" }));
  await assertFails(deleteDoc(doc(db, path())));
});

test("Firebase anonymous accounts are denied even within their own UID", async () => {
  const db = env
    .authenticatedContext("anonymous-user", {
      firebase: { sign_in_provider: "anonymous" },
    })
    .firestore();
  await assertFails(getDoc(doc(db, path("anonymous-user"))));
  await assertFails(getDocs(collection(db, "users/anonymous-user/plans")));
  await assertFails(
    setDoc(doc(db, path("anonymous-user", secondId)), validPlan()),
  );
  await assertFails(
    updateDoc(doc(db, path("anonymous-user")), { name: "Changed" }),
  );
  await assertFails(deleteDoc(doc(db, path("anonymous-user"))));
});

test("an authenticated user cannot access another UID's plans", async () => {
  const db = user("bob");
  await assertFails(getDoc(doc(db, path("alice"))));
  await assertFails(getDocs(collection(db, "users/alice/plans")));
  await assertFails(setDoc(doc(db, path("alice", secondId)), validPlan()));
  await assertFails(updateDoc(doc(db, path("alice")), { name: "Changed" }));
  await assertFails(deleteDoc(doc(db, path("alice"))));
  await assertSucceeds(getDoc(doc(db, path("bob"))));
});

test("saved versions cannot be modified by update, overwrite or merge", async () => {
  const target = doc(user(), path());
  await assertFails(updateDoc(target, { name: "Renamed" }));
  await assertFails(
    updateDoc(target, { snapshotJson: "{}", updatedAt: serverTimestamp() }),
  );
  await assertFails(setDoc(target, validPlan()));
  await assertFails(setDoc(target, { name: "Merged" }, { merge: true }));
});

test("document IDs must be UUID-shaped", async () => {
  for (const badId of [
    "arbitrary",
    "alice",
    "00000000000040008000000000000001",
    `${secondId}x`,
  ]) {
    await assertFails(setDoc(doc(user(), path("alice", badId)), validPlan()));
  }
});

test("the required field set is exact", async () => {
  await assertFails(
    setDoc(
      doc(user(), path("alice", secondId)),
      validPlan({ ownerId: "alice" }),
    ),
  );
  for (const key of Object.keys(validPlan())) {
    const plan: Record<string, unknown> = validPlan();
    delete plan[key];
    await assertFails(setDoc(doc(user(), path("alice", secondId)), plan));
  }
});

test("name must be a nonblank string of at most 100 characters", async () => {
  for (const name of [
    "",
    "   ",
    "\t\n",
    "x".repeat(101),
    12,
    null,
    [],
    { value: "name" },
  ]) {
    await assertFails(
      setDoc(doc(user(), path("alice", secondId)), validPlan({ name })),
    );
  }
  await assertSucceeds(
    setDoc(
      doc(user(), path("alice", secondId)),
      validPlan({ name: "x".repeat(100) }),
    ),
  );
});

test("model version must be the exact supported string", async () => {
  for (const modelVersion of ["", "1.0.1", "2.0.0", 1, null]) {
    await assertFails(
      setDoc(doc(user(), path("alice", secondId)), validPlan({ modelVersion })),
    );
  }
});

test("snapshot must be a nonempty bounded string", async () => {
  for (const snapshotJson of ["", "x".repeat(20001), {}, [], 123, null]) {
    await assertFails(
      setDoc(doc(user(), path("alice", secondId)), validPlan({ snapshotJson })),
    );
  }
  await assertSucceeds(
    setDoc(
      doc(user(), path("alice", secondId)),
      validPlan({ snapshotJson: "x".repeat(20000) }),
    ),
  );
});

test("opaque JSON is not semantically trusted by the database rules", async () => {
  // The application must parse and validate on load. Rules only enforce the envelope.
  await assertSucceeds(
    setDoc(
      doc(user(), path("alice", secondId)),
      validPlan({ snapshotJson: "not json" }),
    ),
  );
});

test("both timestamps must be server-generated, correctly typed and current", async () => {
  for (const key of ["createdAt", "updatedAt"]) {
    for (const value of [
      "2026-09-18",
      1,
      null,
      Timestamp.fromMillis(1000),
      Timestamp.fromMillis(4102444800000),
    ]) {
      await assertFails(
        setDoc(
          doc(user(), path("alice", secondId)),
          validPlan({ [key]: value }),
        ),
      );
    }
  }
});

test("unrelated documents and nested subcollections remain closed", async () => {
  const db = user();
  for (const otherPath of [
    "users/alice",
    "plans/public",
    `users/alice/plans/${id}/notes/note`,
  ]) {
    await assertFails(setDoc(doc(db, otherPath), validPlan()));
    await assertFails(getDoc(doc(db, otherPath)));
  }
  await assertFails(getDocs(collection(db, "users")));
  await assertFails(getDocs(collectionGroup(db, "plans")));
});

test("a batch containing a cross-user write fails atomically", async () => {
  const db = user();
  const batch = writeBatch(db);
  batch.set(doc(db, path("alice", secondId)), validPlan());
  batch.set(doc(db, path("bob", secondId)), validPlan());
  await assertFails(batch.commit());
  assert.equal(
    (await getDoc(doc(db, path("alice", secondId)))).exists(),
    false,
  );
});
