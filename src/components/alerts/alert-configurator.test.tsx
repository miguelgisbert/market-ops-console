import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AlertConfigurator } from "./alert-configurator";

const markets = [
  {
    id: "de",
    name: "Germany",
    regionId: "eu",
    growthPct: -9.7,
    forecastAttainmentPct: 92,
  },
  {
    id: "cn",
    name: "China",
    regionId: "apac",
    growthPct: 18.2,
    forecastAttainmentPct: 106,
  },
];

const regions = [
  { id: "eu", name: "Europe" },
  { id: "apac", name: "APAC" },
];

describe("AlertConfigurator", () => {
  it("validates the schema before saving", async () => {
    const user = userEvent.setup();
    render(<AlertConfigurator markets={markets} regions={regions} />);

    await user.click(screen.getByRole("button", { name: "Save rule" }));

    expect(screen.getByText("Give the rule a name of at least 3 characters.")).toBeInTheDocument();
    expect(screen.queryAllByText("Pending")).toHaveLength(0);
  });

  it("applies an optimistic rule and rolls it back on failure", async () => {
    const user = userEvent.setup();
    render(<AlertConfigurator markets={markets} regions={regions} />);

    await user.type(screen.getByLabelText("Rule name"), "Europe growth floor");
    await user.click(screen.getByRole("button", { name: "Save rule" }));

    expect(await screen.findByText("Europe growth floor")).toBeInTheDocument();
    expect(await screen.findByText("Alert rule saved.")).toBeInTheDocument();
    expect(screen.queryByText("Pending")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Rule name"), "Rollback rule");
    await user.click(screen.getByLabelText(/Simulate save failure/));
    await user.click(screen.getByRole("button", { name: "Save rule" }));

    expect(
      await screen.findByText(
        "The alert service rejected the request. Your change was rolled back.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Rollback rule")).not.toBeInTheDocument();
  }, 10_000);
});
