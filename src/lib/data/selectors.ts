import type { Dataset, Market, MarketStatus, TimeSeriesPoint } from "./schema";

export type MarketSummary = {
  id: string;
  name: string;
  iso2: string;
  regionId: string;
  regionName: string;
  currency: string;
  revenueLocal: number;
  revenueUsd: number;
  growthPct: number;
  marketSharePct: number;
  forecastAttainmentPct: number;
  status: MarketStatus;
  series: TimeSeriesPoint[];
};

export type RegionSummary = {
  id: string;
  name: string;
  revenueUsd: number;
  growthPct: number;
  forecastAttainmentPct: number;
  marketsAtRisk: number;
  marketCount: number;
};

export type PortfolioSummary = {
  revenueUsd: number;
  growthPct: number;
  forecastAttainmentPct: number;
  marketsAtRisk: number;
  marketsOffTrack: number;
  marketCount: number;
  latestPeriod: string;
};

export type ProductSummary = {
  id: string;
  name: string;
  family: string;
  revenueUsd: number;
  growthPct: number;
  forecastAttainmentPct: number;
  portfolioSharePct: number;
  status: MarketStatus;
};

function latestPoint(market: Market): TimeSeriesPoint {
  return market.series[market.series.length - 1];
}

function statusRank(status: MarketStatus): number {
  if (status === "off-track") return 2;
  if (status === "at-risk") return 1;
  return 0;
}

export function getMarketSummaries(dataset: Dataset): MarketSummary[] {
  const regions = new Map(dataset.regions.map((region) => [region.id, region.name]));
  return dataset.markets
    .map((market) => {
      const point = latestPoint(market);
      return {
        id: market.id,
        name: market.name,
        iso2: market.iso2,
        regionId: market.regionId,
        regionName: regions.get(market.regionId) ?? market.regionId,
        currency: market.currency,
        revenueLocal: point.revenue,
        revenueUsd: point.revenue * market.fxToUsd,
        growthPct: market.kpis.growthPct,
        marketSharePct: market.kpis.marketSharePct,
        forecastAttainmentPct: market.kpis.forecastAttainmentPct,
        status: market.kpis.status,
        series: market.series,
      };
    })
    .sort((left, right) => {
      const risk = statusRank(right.status) - statusRank(left.status);
      return risk !== 0 ? risk : right.revenueUsd - left.revenueUsd;
    });
}

export function getPortfolioSummary(dataset: Dataset): PortfolioSummary {
  const totals = dataset.markets.reduce(
    (accumulator, market) => {
      const point = latestPoint(market);
      return {
        revenueUsd: accumulator.revenueUsd + point.revenue * market.fxToUsd,
        forecastUsd: accumulator.forecastUsd + point.forecast * market.fxToUsd,
        priorYearUsd: accumulator.priorYearUsd + point.priorYear * market.fxToUsd,
      };
    },
    { revenueUsd: 0, forecastUsd: 0, priorYearUsd: 0 },
  );

  return {
    revenueUsd: totals.revenueUsd,
    growthPct: ((totals.revenueUsd - totals.priorYearUsd) / totals.priorYearUsd) * 100,
    forecastAttainmentPct: (totals.revenueUsd / totals.forecastUsd) * 100,
    marketsAtRisk: dataset.markets.filter((market) => market.kpis.status !== "on-track")
      .length,
    marketsOffTrack: dataset.markets.filter(
      (market) => market.kpis.status === "off-track",
    ).length,
    marketCount: dataset.markets.length,
    latestPeriod: dataset.metadata.periods[dataset.metadata.periods.length - 1],
  };
}

export function getRegionSummaries(dataset: Dataset): RegionSummary[] {
  const markets = getMarketSummaries(dataset);
  return dataset.regions.map((region) => {
    const regionMarkets = markets.filter((market) => market.regionId === region.id);
    const revenueUsd = regionMarkets.reduce(
      (total, market) => total + market.revenueUsd,
      0,
    );
    const forecastUsd = dataset.markets
      .filter((market) => market.regionId === region.id)
      .reduce(
        (total, market) => total + latestPoint(market).forecast * market.fxToUsd,
        0,
      );
    const priorYearUsd = dataset.markets
      .filter((market) => market.regionId === region.id)
      .reduce(
        (total, market) => total + latestPoint(market).priorYear * market.fxToUsd,
        0,
      );
    return {
      id: region.id,
      name: region.name,
      revenueUsd,
      growthPct: ((revenueUsd - priorYearUsd) / priorYearUsd) * 100,
      forecastAttainmentPct: (revenueUsd / forecastUsd) * 100,
      marketsAtRisk: regionMarkets.filter((market) => market.status !== "on-track")
        .length,
      marketCount: regionMarkets.length,
    };
  });
}

export function getProductSummaries(dataset: Dataset): ProductSummary[] {
  const portfolioUsd = dataset.markets.reduce(
    (total, market) => total + latestPoint(market).revenue * market.fxToUsd,
    0,
  );

  return dataset.products
    .map((product) => {
      const productTotals = dataset.markets.reduce(
        (accumulator, market) => {
          const productMarket = market.products.find(
            (entry) => entry.productId === product.id,
          );
          if (!productMarket) return accumulator;
          const point = productMarket.series[productMarket.series.length - 1];
          return {
            revenueUsd: accumulator.revenueUsd + point.revenue * market.fxToUsd,
            forecastUsd: accumulator.forecastUsd + point.forecast * market.fxToUsd,
            priorYearUsd: accumulator.priorYearUsd + point.priorYear * market.fxToUsd,
          };
        },
        { revenueUsd: 0, forecastUsd: 0, priorYearUsd: 0 },
      );

      const growthPct =
        ((productTotals.revenueUsd - productTotals.priorYearUsd) /
          productTotals.priorYearUsd) *
        100;
      const attainment =
        (productTotals.revenueUsd / productTotals.forecastUsd) * 100;

      return {
        id: product.id,
        name: product.name,
        family: product.family,
        revenueUsd: productTotals.revenueUsd,
        growthPct,
        forecastAttainmentPct: attainment,
        portfolioSharePct: (productTotals.revenueUsd / portfolioUsd) * 100,
        status: productStatus(attainment, growthPct),
      };
    })
    .sort((left, right) => right.revenueUsd - left.revenueUsd);
}

function productStatus(attainment: number, growth: number): MarketStatus {
  if (attainment < 92 || growth < -8) return "off-track";
  if (attainment < 99 || growth < -2) return "at-risk";
  return "on-track";
}

export function getLatestPeriod(dataset: Dataset): string {
  return dataset.metadata.periods[dataset.metadata.periods.length - 1];
}
