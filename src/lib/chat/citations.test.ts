import { describe, expect, it } from "vitest";
import { createCitationLookup, resolveCitation } from "@/lib/chat/citations";

const lookup = createCitationLookup({
  markets: [
    { id: "de", name: "Germany", iso2: "DE", regionId: "eu" },
    { id: "it", name: "Italy", iso2: "IT", regionId: "eu" },
  ],
  regions: [{ id: "eu", name: "Europe" }],
  products: [{ id: "veltrix", name: "Veltrix" }],
  latestPeriod: "2026-05",
});

describe("citation resolution", () => {
  it("links a market and period citation to the analyst view", () => {
    const resolved = resolveCitation(
      { marketId: "de", period: "2026-03", label: "Germany, March dip" },
      lookup,
    );

    expect(resolved.hasExplicitLabel).toBe(true);
    expect(resolved.label).toBe("Germany, March dip");
    expect(resolved.href).toContain("market=de");
    expect(resolved.href).toContain("period=2026-03");
  });

  it("resolves citations without an explicit label from dataset ids", () => {
    const resolved = resolveCitation({ regionId: "eu", productId: "veltrix" }, lookup);
    expect(resolved.hasExplicitLabel).toBe(false);
    expect(resolved.secondary).toContain("Europe");
    expect(resolved.secondary).toContain("Veltrix");
    expect(resolved.href).toContain("region=eu");
    expect(resolved.href).toContain("product=veltrix");
  });
});
