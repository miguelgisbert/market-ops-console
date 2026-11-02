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
