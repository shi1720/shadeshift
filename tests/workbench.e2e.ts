import { test, expect } from "@playwright/test";
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
  await page
    .locator("input[type=file]")
    .setInputFiles({
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
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from("{}"),
    });
  await expect(page.getByRole("status")).toContainText(
    "not a valid ShadeShift",
  );
  await expect(page.locator("#budget")).toHaveValue("49000");
});
test("sign-in preserves customized draft, durable save reload and deletion", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("[data-ready=true]")).toBeVisible();
  await page.locator("#budget").fill("68000");
  await page.getByRole("button", { name: "Save plan", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#budget")).toHaveValue("68000");
  const name = "E2E " + Date.now();
  await page.getByLabel("Plan name").fill(name);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save plan" })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Plan saved to your account",
  );
  await page.reload();
  await page.getByRole("button", { name: "Saved plans", exact: true }).click();
  await expect(page.getByRole("heading", { name })).toBeVisible();
  const card = page.locator(".saved-card").filter({ hasText: name });
  await card.getByRole("button", { name: "Open plan" }).click();
  await expect(page.locator("#budget")).toHaveValue("68000");
  await page.getByRole("button", { name: "Saved plans", exact: true }).click();
  await page.getByRole("button", { name: `Delete ${name}` }).click();
  await expect(page.getByRole("heading", { name })).toHaveCount(0);
});
test("API rejects anonymous requests, cross-origin writes and invalid inputs", async ({
  page,
  request,
}) => {
  expect((await request.get("/api/plans")).status()).toBe(401);
  expect(
    (await request.post("/api/plans", { data: defaultScenario })).status(),
  ).toBe(401);
  await page.goto("/signin-with-chatgpt?return_to=%2F");
  const result = await page.evaluate(async (scenario) => {
    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...scenario, budget: -1 }),
    });
    return res.status;
  }, defaultScenario);
  expect(result).toBe(400);
  const cross = await page.request.post("/api/plans", {
    headers: { Origin: "https://invalid.example" },
    data: defaultScenario,
  });
  expect(cross.status()).toBe(403);
  const oversized = await page.request.post("/api/plans", {
    headers: {
      Origin: "http://localhost:5173",
      "Content-Type": "application/json",
    },
    data: "x".repeat(21000),
  });
  expect(oversized.status()).toBe(413);
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
