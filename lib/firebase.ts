import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import config from "../firebase.web.json";
import { Scenario, snapshot, MODEL_VERSION } from "./model";
import { scenarioSchema } from "./validation";
const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";
const app = initializeApp(
  useEmulators
    ? {
        ...config,
        projectId: "demo-shadeshift",
        apiKey: "demo-key",
        authDomain: "localhost",
      }
    : config,
);
export const auth = getAuth(app);
export const db = getFirestore(app);
if (useEmulators) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}
export type SavedPlan = {
  id: string;
  name: string;
  modelVersion: string;
  scenario: Scenario;
  updated_at: string;
};
function plansPath() {
  const user = auth.currentUser;
  if (!user || user.isAnonymous)
    throw new Error("Sign in to manage private saved plans.");
  return collection(db, "users", user.uid, "plans");
}
export async function listPlans(): Promise<SavedPlan[]> {
  const docs = await getDocs(
    query(plansPath(), orderBy("updatedAt", "desc"), limit(50)),
  );
  return docs.docs.map((d) => {
    const data = d.data();
    const envelope = JSON.parse(data.snapshotJson);
    const parsed = scenarioSchema.safeParse(envelope.scenario);
    if (!parsed.success)
      throw new Error(
        "A saved plan has invalid inputs. Export your current work and contact support.",
      );
    return {
      id: d.id,
      name: data.name,
      modelVersion: data.modelVersion,
      scenario: parsed.data,
      updated_at:
        data.updatedAt?.toDate().toISOString() ?? new Date().toISOString(),
    };
  });
}
export async function persistPlan(scenario: Scenario) {
  const parsed = scenarioSchema.parse(scenario);
  const json = JSON.stringify(snapshot(parsed));
  if (json.length > 20000)
    throw new Error("Plan exceeds the 20 KB limit. Export it as JSON.");
  const plan = doc(plansPath(), crypto.randomUUID());
  await setDoc(plan, {
    name: parsed.name,
    modelVersion: MODEL_VERSION,
    snapshotJson: json,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return plan.id;
}
export async function deletePlan(id: string) {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error("Invalid plan ID.");
  await deleteDoc(doc(plansPath(), id));
}
