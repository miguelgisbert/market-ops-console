import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("drills into a market and verifies an assistant citation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Portfolio overview" })).toBeVisible();

  await page.locator('a[href="/analyst?market=de"]').first().click();
  await expect(page).toHaveURL(/market=de/);
  await expect(page.getByRole("heading", { name: "Germany", level: 1 })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Actual vs forecast vs prior year · Germany/ }),
  ).toBeVisible();

  await page.goto("/assistant");
  await page
    .getByRole("button", { name: "Which markets are at risk this quarter, and why?" })
    .click();
  await expect(page.getByText("Three markets stand out as at risk.")).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByText("High confidence")).toBeVisible();
  await expect(page.getByRole("link", { name: "Germany, latest period" })).toHaveAttribute(
    "href",
    /market=de/,
  );
});

test("saves an alert optimistically and rolls back a forced failure", async ({ page }) => {
  await page.goto("/alerts");

  await page.getByLabel("Rule name").fill("Europe growth floor");
  await page.getByRole("button", { name: "Save rule" }).click();
  await expect(page.getByText("Europe growth floor")).toBeVisible();
  await expect(page.getByText(/^Pending$/)).toHaveCount(0);
  await expect(page.getByLabel("Rule name")).toHaveValue("");

  await page.getByLabel("Rule name").fill("Rollback rule");
  await page.getByLabel(/Simulate save failure/).check();
  await page.getByRole("button", { name: "Save rule" }).click();

  await expect(
    page.getByText("The alert service rejected the request. Your change was rolled back."),
  ).toBeVisible();
  await expect(page.getByText("Rollback rule")).toHaveCount(0);
});

test("keeps the drill path shareable and supports back/forward", async ({ page }) => {
  await page.goto("/analyst");
  await page.locator('a[aria-label^="Germany:"]').click();

  await expect(page).toHaveURL(/market=de/);
  await expect(page.getByRole("heading", { name: "Germany", level: 1 })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/analyst$/);
  await expect(page.getByRole("heading", { name: "Portfolio", level: 1 })).toBeVisible();

  await page.goForward();
  await expect(page).toHaveURL(/market=de/);
});

test("handles assistant abstention and error states", async ({ page }) => {
  await page.goto("/assistant");

  await page.getByLabel("Ask a question about the portfolio").fill("What will sales be next year?");
  await page.getByRole("button", { name: "Ask" }).click();
  await expect(page.getByText("Outside the dataset. No answer was invented.")).toBeVisible();

  await page.getByLabel("Ask a question about the portfolio").fill("force error");
  await page.getByRole("button", { name: "Ask" }).click();
  await expect(page.getByText(/Simulated upstream failure/)).toBeVisible();
  await expect(page.getByText("Assistant error")).toBeVisible();
});

test("stays within the mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const path of [
    "/",
    "/analyst",
    "/analyst?region=eu&market=de&period=2026-03",
    "/assistant",
    "/alerts",
  ]) {
    await page.goto(path);
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflows, path).toBe(false);
  }
});

test("opens the command palette and jumps to a market", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();

  await page.getByPlaceholder("Jump to a market, product or page…").fill("Germany");
  await page.getByRole("option", { name: /Germany/ }).click();
  await expect(page).toHaveURL(/market=de/);
  await expect(page.getByRole("heading", { name: "Germany", level: 1 })).toBeVisible();
});

test("streams live updates without losing the selected scope", async ({ page }) => {
  await page.goto("/analyst?region=eu&market=de&period=2026-05");
  await page.getByRole("button", { name: "Go live" }).click();

  await expect(page).toHaveURL(/live=1&tick=1/);
  await expect(page).toHaveURL(/tick=2/, { timeout: 10_000 });
  await expect(page.getByRole("heading", { name: "Germany", level: 1 })).toBeVisible();
  await expect(page.getByText("Live ·", { exact: false })).toBeVisible();
});

test("carries the dashboard scope into the assistant", async ({ page }) => {
  await page.goto("/analyst?region=eu&market=de&period=2026-05");
  await page.getByRole("link", { name: "Ask about this view" }).click();

  await expect(page).toHaveURL(/assistant\?region=eu&market=de&period=2026-05/);
  await expect(page.getByText("Dashboard context")).toBeVisible();
  await expect(page.getByText("Germany · May 2026")).toBeVisible();

  await page.getByRole("button", { name: "What is driving this view?" }).click();
  await expect(page.getByText(/Germany's revenue fell in early 2026/)).toBeVisible({
    timeout: 10_000,
  });
});

test("virtualises the full fact table", async ({ page }) => {
  await page.goto("/analyst");
  await page.getByRole("heading", { name: "Virtualised fact table" }).scrollIntoViewIfNeeded();
  const table = page.getByRole("table", { name: /Virtualised fact table/ });
  await expect(table).toHaveAttribute("aria-rowcount", "1561");
  await expect(page.getByText(/^Mounted /)).toBeVisible();
});

test("has no automated WCAG A/AA violations on core pages", async ({ page }) => {
  for (const path of [
    "/",
    "/analyst",
    "/analyst?region=eu&market=de&period=2026-03",
    "/assistant",
    "/alerts",
  ]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();

    expect(
      results.violations.map((violation) => ({
        id: violation.id,
        nodes: violation.nodes.map((node) => node.target),
      })),
      path,
    ).toEqual([]);
  }
});

test("has no automated WCAG A/AA violations in the command palette", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(
    results.violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
});
