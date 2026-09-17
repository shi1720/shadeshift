/** Explicit production smoke test. Creates and deletes one disposable QA account.
 * Run only when authorized: RUN_HOSTED_SMOKE=true node tests/hosted-smoke.mjs
 * Credentials/tokens stay in memory; no traces or authenticated screenshots.
 */
import { chromium, expect } from "@playwright/test";
import { randomUUID, randomBytes } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";

if (process.env.RUN_HOSTED_SMOKE !== "true") {
  throw new Error("Production account testing requires RUN_HOSTED_SMOKE=true.");
}
const baseURL = "https://shadeshift-city.web.app";
const config = JSON.parse(
  await readFile(new URL("../firebase.web.json", import.meta.url), "utf8"),
);
if (config.projectId !== "shadeshift-city")
  throw new Error("Unexpected Firebase project.");
const directory =
  process.env.HOSTED_SMOKE_OUTPUT ?? "/tmp/shadeshift-hosted-qa";
await mkdir(directory, { recursive: true });
const email = `qa-${randomUUID()}@example.invalid`;
const password = `Qa-${randomBytes(24).toString("base64url")}!7`;
const planName = `Disposable QA ${randomUUID().slice(0, 8)}`;
const results = {
  url: baseURL,
  startedAt: new Date().toISOString(),
  steps: [],
  cleanup: {},
  errors: [],
};
let idToken = "",
  uid = "";
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
page.setDefaultTimeout(15000);
expect.configure({ timeout: 10000 });
const check = (name) => results.steps.push({ name, passed: true });
const redact = (value) =>
  [email, password, idToken]
    .filter(Boolean)
    .reduce((s, secret) => s.replaceAll(secret, "[redacted]"), String(value));
const rememberAuth = async (response) => {
  const body = await response.json();
  if (!response.ok() || !body.idToken || !body.localId)
    throw new Error(`Authentication response failed (${response.status()}).`);
  idToken = body.idToken;
  uid = body.localId;
};
page.on("pageerror", (error) => results.errors.push(redact(error.message)));

async function settleVisuals() {
  await page.locator(".leaflet-tile-loaded").first().waitFor();
  await page.waitForFunction(() =>
    [...document.querySelectorAll("img.leaflet-tile")].every(
      (image) => image.complete,
    ),
  );
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        let last = "",
          stable = 0,
          frames = 0;
        const frame = () => {
          const shape = [
            ...document.querySelectorAll(".recharts-bar-rectangle path"),
          ]
            .map((path) => path.getAttribute("d"))
            .join("|");
          stable = shape && shape === last ? stable + 1 : 0;
          last = shape;
          if (stable >= 15 || frames++ > 300) resolve();
          else requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      }),
  );
}

try {
  await page.goto(baseURL);
  await expect(page.locator("[data-ready=true]")).toBeVisible();
  await settleVisuals();
  await page.screenshot({ path: `${directory}/desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("heading", { name: "Make the last mile cooler." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await settleVisuals();
  await page.screenshot({ path: `${directory}/mobile.png`, fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  check("Public desktop and mobile render without horizontal overflow");
  await page.locator("#budget").fill("68000");
  await page.getByRole("button", { name: "Save plan", exact: true }).click();
  let dialog = page.getByRole("dialog");
  await dialog
    .getByRole("button", { name: "New here? Create an account" })
    .click();
  await dialog.getByLabel("Email address").fill(email);
  await dialog.getByLabel("Password", { exact: true }).fill(password);
  const createdResponse = page.waitForResponse(
    (r) =>
      r.url().includes("identitytoolkit.googleapis.com") &&
      r.url().includes("accounts:signUp"),
  );
  await dialog
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await rememberAuth(await createdResponse);
  await expect(
    page.getByRole("heading", { name: "Save an accountable plan." }),
  ).toBeVisible();
  check("Hosted Firebase account creation preserves current draft");
  await expect(page.locator("#budget")).toHaveValue("68000");
  await page.getByLabel("Plan name").fill(planName);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save plan", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Plan saved to your account",
  );
  check("Firestore save accepted by deployed rules");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Sign out", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Saved plans", exact: true }).click();
  const card = page.locator(".saved-card").filter({ hasText: planName });
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "Open plan" }).click();
  await expect(page.locator("#budget")).toHaveValue("68000");
  check("Auth session and saved inputs survive reload and reopen");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Signed out");
  await page.getByRole("button", { name: "Saved plans", exact: true }).click();
  await expect(page.locator(".saved-card")).toHaveCount(0);
  await page.getByRole("button", { name: "Sign in to your account" }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Email address").fill(email);
  await dialog.getByLabel("Password", { exact: true }).fill(password);
  const signinResponse = page.waitForResponse(
    (r) =>
      r.url().includes("identitytoolkit.googleapis.com") &&
      r.url().includes("accounts:signInWithPassword"),
  );
  await dialog.getByRole("button", { name: "Sign in", exact: true }).click();
  await rememberAuth(await signinResponse);
  await expect(
    page.getByRole("heading", { name: "Save an accountable plan." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close save dialog" }).click();
  await page.getByRole("button", { name: "Saved plans", exact: true }).click();
  await expect(card).toBeVisible();
  check("Sign-out hides private plans and password sign-in restores access");
  await page.getByRole("button", { name: `Delete ${planName}` }).click();
  await expect(card).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Sign out", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Saved plans", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Your first plan starts in the studio.",
    }),
  ).toBeVisible();
  check("Deletion remains durable after reload");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Signed out");
  expect(results.errors).toEqual([]);
} catch (error) {
  results.errors.push(redact(error.message));
  process.exitCode = 1;
} finally {
  // REST calls use only the newly created account's own ID token, never Admin access.
  if (uid && idToken) {
    try {
      const prefix = `projects/${config.projectId}/databases/(default)/documents/users/${uid}/plans/`;
      const url = `https://firestore.googleapis.com/v1/${prefix.slice(0, -1)}`;
      const headers = { Authorization: `Bearer ${idToken}` };
      const listed = await fetch(url, { headers });
      if (!listed.ok)
        throw new Error(`QA plan cleanup listing failed (${listed.status}).`);
      const body = await listed.json();
      if (body.nextPageToken)
        throw new Error(
          "Unexpected QA document pagination; refusing broad cleanup.",
        );
      for (const plan of body.documents ?? []) {
        if (
          !plan.name.startsWith(prefix) ||
          plan.name.slice(prefix.length).includes("/")
        )
          throw new Error("Cleanup path mismatch.");
        const deleted = await fetch(
          `https://firestore.googleapis.com/v1/${plan.name}`,
          { method: "DELETE", headers },
        );
        if (!deleted.ok)
          throw new Error(`QA plan cleanup failed (${deleted.status}).`);
      }
      results.cleanup.plansRemoved = true;
      const deletedAccount = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${config.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        },
      );
      if (!deletedAccount.ok)
        throw new Error(
          `QA account cleanup failed (${deletedAccount.status}).`,
        );
      results.cleanup.accountRemoved = true;
    } catch (error) {
      results.errors.push(redact(error.message));
      process.exitCode = 1;
    }
  }
  await browser.close();
  results.finishedAt = new Date().toISOString();
  await writeFile(
    `${directory}/results.json`,
    JSON.stringify(results, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        passed: results.steps.length,
        errors: results.errors,
        cleanup: results.cleanup,
        artifacts: directory,
      },
      null,
      2,
    ),
  );
}
