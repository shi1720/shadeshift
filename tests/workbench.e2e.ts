import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { defaultScenario } from "../lib/model";
test("anonymous studio optimizes and exposes constraints, sensitivity and comparison", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("[data-ready=true]")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Make the last mile cooler." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pin comparison" }).click();
  await page.getByRole("button", { name: "Optimize investment" }).click();
  await expect(page.locator(".metric-feature strong")).toHaveText("31.3%");
  await expect(page.getByRole("status")).toContainText(
    "Best direct-sun reduction",
  );
  await expect(page.locator(".comparison")).toContainText("23.8%");
  await page.locator("#effectiveness").fill("0");
  await page.getByRole("button", { name: "Optimize investment" }).click();
  await expect(page.getByRole("status")).toContainText(
    "No intervention provides",
  );
  await page.locator("#effectiveness").fill("100");
  await page.locator("#budget").fill("1000");
  await page.getByRole("button", { name: "Optimize investment" }).click();
  await expect(page.getByRole("status")).toContainText("No plan meets");
  expect(errors).toEqual([]);
});
test("cross-city atlas has eleven real markets and market selection works", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("[data-ready=true]")).toBeVisible();
  await page
    .getByRole("button", { name: "Host city atlas", exact: true })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(11);
  await page
    .getByRole("button", { name: "Philadelphia Philadelphia, PA" })
    .click();
  await expect(page.locator(".city-detail")).toContainText("107.8°F");
  await expect(page.locator(".city-detail")).toContainText(
    "Weather screening only",
  );
  await page.getByRole("combobox").selectOption("p95HeatIndexF");
  await expect(page.locator("tbody tr").first()).toContainText("Philadelphia");
});
test("download includes frozen data and supports a validated import", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("[data-ready=true]")).toBeVisible();
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: "Reproducible plan (.json)" }).click();
  const d = await event;
  expect(d.suggestedFilename()).toBe("shadeshift-scenario.json");
  const path = await d.path();
  expect(path).not.toBeNull();
  const exported = JSON.parse(await readFile(path!, "utf8"));
  expect(exported.modelVersion).toBe("1.0.0");
  expect(Object.keys(exported.scenario.overrides)).toHaveLength(6);
  await page.locator("input[type=file]").setInputFiles({
    name: "valid.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        scenario: {
          ...defaultScenario,
          name: "Imported test",
          budget: 49000,
        },
      }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("Scenario imported");
  await expect(page.locator("#budget")).toHaveValue("49000");
  await page.locator("input[type=file]").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from("{}"),
  });
  await expect(page.getByRole("status")).toContainText(
    "not a valid ShadeShift",
  );
  await expect(page.locator("#budget")).toHaveValue("49000");
});
test("Firebase sign-in modal preserves draft and exposes account recovery", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("[data-ready=true]")).toBeVisible();
  await page.locator("#budget").fill("68000");
  await page.getByRole("button", { name: "Save plan", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  await expect(dialog.getByLabel("Email address")).toBeFocused();
  await expect(page.locator("#budget")).toHaveValue("68000");
  await dialog
    .getByRole("button", { name: "New here? Create an account" })
    .click();
  await expect(
    dialog.getByRole("heading", { name: "Create your workspace." }),
  ).toBeVisible();
  await expect(dialog.getByLabel("Password", { exact: true })).toHaveAttribute(
    "minlength",
    "8",
  );
  await dialog.getByRole("button", { name: "Forgot password?" }).click();
  await expect(
    dialog.getByRole("heading", { name: "Reset your password." }),
  ).toBeVisible();
  await expect(dialog.getByLabel("Password", { exact: true })).toHaveCount(0);
  await expect(
    dialog.getByRole("button", { name: "Send reset link" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.locator("#budget")).toHaveValue("68000");
  await expect(
    page.getByRole("button", { name: "Save plan", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Saved plans", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Your plans, available across sessions.",
    }),
  ).toBeVisible();
  await expect(page.locator(".saved-card")).toHaveCount(0);
});

async function protectProductionServices(page: Page) {
  // Account tests may only reach local emulators, even if Vite was misconfigured.
  await page.route(
    /https:\/\/(?:identitytoolkit|securetoken|firestore)\.googleapis\.com\//,
    (route) => route.abort(),
  );
}

async function createEmulatorAccount(
  page: Page,
  email: string,
  password: string,
) {
  await page.getByRole("button", { name: "Save plan", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("button", { name: "New here? Create an account" })
    .click();
  await dialog.getByLabel("Email address").fill(email);
  await dialog.getByLabel("Password", { exact: true }).fill(password);
  await dialog
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Save an accountable plan." }),
  ).toBeVisible();
}

test("Firebase emulator account lifecycle preserves private saved plans across sessions", async ({
  page,
  browser,
  baseURL,
}) => {
  test.skip(
    process.env.FIREBASE_E2E_EMULATORS !== "true",
    "Requires local Auth/Firestore emulators and VITE_USE_FIREBASE_EMULATORS=true.",
  );
  test.setTimeout(60000);
  await protectProductionServices(page);
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const email = `alice-${suffix}@example.test`;
  const password = "ShadeShift-E2E-47!";
  const name = `E2E plan ${suffix}`;
  await page.goto("/");
  await expect(page.locator("[data-ready=true]")).toBeVisible();
  await page.locator("#budget").fill("68000");
  await createEmulatorAccount(page, email, password);
  await expect(page.locator("#budget")).toHaveValue("68000");
  await page.getByLabel("Plan name").fill(name);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save plan", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Plan saved to your account",
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Sign out", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Saved plans", exact: true }).click();
  const card = page.locator(".saved-card").filter({ hasText: name });
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "Open plan" }).click();
  await expect(page.locator("#budget")).toHaveValue("68000");
  await expect(page.getByRole("status")).toContainText("Saved plan loaded");

  // A separate browser context and account must not list Alice's saved plan.
  const other = await browser.newContext({ baseURL });
  try {
    const bob = await other.newPage();
    await protectProductionServices(bob);
    await bob.goto("/");
    await expect(bob.locator("[data-ready=true]")).toBeVisible();
    await createEmulatorAccount(bob, `bob-${suffix}@example.test`, password);
    await bob.getByRole("button", { name: "Close save dialog" }).click();
    await bob.getByRole("button", { name: "Saved plans", exact: true }).click();
    await expect(
      bob.getByRole("heading", {
        name: "Your first plan starts in the studio.",
      }),
    ).toBeVisible();
    await expect(bob.locator(".saved-card")).toHaveCount(0);
    await bob.getByRole("button", { name: "Sign out", exact: true }).click();
  } finally {
    await other.close();
  }

  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Signed out");
  await page.getByRole("button", { name: "Saved plans", exact: true }).click();
  await expect(page.locator(".saved-card")).toHaveCount(0);
  await page.getByRole("button", { name: "Sign in to your account" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Email address").fill(email);
  await dialog
    .getByLabel("Password", { exact: true })
    .fill("Wrong-password-12!");
  await dialog.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("Could not sign in");
  await dialog.getByLabel("Password", { exact: true }).fill(password);
  await dialog.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Save an accountable plan." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close save dialog" }).click();
  await page.getByRole("button", { name: "Saved plans", exact: true }).click();
  await expect(card).toBeVisible();
  await page.getByRole("button", { name: `Delete ${name}` }).click();
  await expect(card).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("Plan deleted");
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
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
});
test("mobile screens fit and navigation works", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("[data-ready=true]")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page
    .getByRole("button", { name: "Legacy & delivery", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Build for the next 1,000 days." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("dialog has keyboard containment and escape dismissal", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("[data-ready=true]")).toBeVisible();
  await page.getByRole("button", { name: "Demo guide" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "Explore the studio" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Demo guide" })).toBeFocused();
});
