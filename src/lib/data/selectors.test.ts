import { describe, expect, it } from "vitest";
import {
  dataIndex,
  dataset,
  getHeatmapData,
  getKpisForScope,
  getMarketSummaries,
  getPortfolioSummary,
  getProductSummaries,
  getRadarComparison,
  getTopMovers,
} from "@/lib/data";

describe("data selectors", () => {
  it("sums the fact table into the portfolio latest period", () => {
    const expected = dataset.series
      .filter((row) => row.period === dataset.meta.latestPeriod)
      .reduce((sum, row) => sum + row.actual, 0);

    expect(getPortfolioSummary(dataIndex).revenue).toBe(expected);
    expect(dataset.series).toHaveLength(dataset.markets.length * dataset.products.length * 24);
  });

  it("respects the canonical market statuses at the latest period", () => {
    const markets = getMarketSummaries(dataIndex);
    const germany = markets.find((market) => market.id === "de");
    const china = markets.find((market) => market.id === "cn");

    expect(germany?.status).toBe("off_track");
    expect(china?.status).toBe("on_track");
    expect(markets.every((market) => market.series.length === 24)).toBe(true);
  });

  it("drills into a product within a market", () => {
    const row = dataset.series.find(
      (entry) =>
        entry.marketId === "de" && entry.productId === "veltrix" && entry.period === "2026-03",
    );
    const kpis = getKpisForScope(dataIndex, { marketId: "de", productId: "veltrix" }, "2026-03");

    expect(row).toBeDefined();
    expect(kpis.revenue).toBe(row?.actual);
  });

  it("returns a complete heat map matrix", () => {
    const rows = getHeatmapData(dataIndex);
    expect(rows).toHaveLength(dataset.markets.length);
    expect(rows.every((row) => row.cells.length === 24)).toBe(true);
  });

  it("only includes actual gainers and decliners in top movers", () => {
    const movers = getTopMovers(dataIndex, { limit: 10 });
    expect(movers.gainers.every((market) => market.growthPct > 0)).toBe(true);
    expect(movers.decliners.every((market) => market.growthPct < 0)).toBe(true);
    expect(movers.gainers.length).toBeGreaterThan(0);
    expect(movers.decliners.length).toBeGreaterThan(0);
  });

  it("produces sorted product summaries and bounded radar values", () => {
    const products = getProductSummaries(dataIndex);
    expect(products).toHaveLength(dataset.products.length);
    expect(products[0].revenue).toBeGreaterThanOrEqual(products[1].revenue);

    const radar = getRadarComparison(dataIndex, [
      { kind: "market", id: "de" },
      { kind: "market", id: "cn" },
      { kind: "region", id: "eu" },
    ]);
    for (const entity of radar) {
      for (const value of Object.values(entity.values)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
  });
});
