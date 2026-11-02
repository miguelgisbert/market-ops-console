import type { DataIndex } from "./build";
import { seriesKey } from "./build";
import type { Anomaly, MarketStatus, SeriesPoint } from "./schema";

export type DataScope = {
  regionId?: string;
  marketId?: string;
  productId?: string;
};

export type KpiValue = {
  period: string;
  revenue: number;
  growthPct: number;
  sharePct: number;
  forecastAttainmentPct: number;
  status: MarketStatus;
  anomalies: Anomaly[];
};

export type MarketSummary = {
  id: string;
  name: string;
  iso2: string;
  iso3: string;
  regionId: string;
  regionName: string;
  revenue: number;
  growthPct: number;
  marketSharePct: number;
  forecastAttainmentPct: number;
  status: MarketStatus;
  anomalies: Anomaly[];
  series: SeriesPoint[];
};

export type RegionSummary = {
  id: string;
  name: string;
  revenue: number;
  growthPct: number;
  marketSharePct: number;
  forecastAttainmentPct: number;
  marketsAtRisk: number;
  marketCount: number;
  status: MarketStatus;
  series: SeriesPoint[];
};

export type ProductSummary = {
  id: string;
  name: string;
  revenue: number;
  growthPct: number;
  sharePct: number;
  forecastAttainmentPct: number;
  status: MarketStatus;
  series: SeriesPoint[];
};

export type PortfolioSummary = {
  revenue: number;
  growthPct: number;
  sharePct: number;
  forecastAttainmentPct: number;
  status: MarketStatus;
  marketsAtRisk: number;
  marketsOffTrack: number;
  marketCount: number;
  latestPeriod: string;
  series: SeriesPoint[];
};

export type TopMovers = {
  gainers: MarketSummary[];
  decliners: MarketSummary[];
};

export type HeatmapCell = {
  period: string;
  variancePct: number;
  actual: number;
  forecast: number;
};

export type HeatmapRow = {
  marketId: string;
  name: string;
  iso2: string;
  status: MarketStatus;
  cells: HeatmapCell[];
};

export type RadarEntityKind = "market" | "region";

export type RadarValues = {
  revenue: number;
  growth: number;
  share: number;
  attainment: number;
};

export type RadarEntity = {
  kind: RadarEntityKind;
  id: string;
  name: string;
  raw: RadarValues;
  values: RadarValues;
};

export function resolvePeriod(index: DataIndex, period?: string): string {
  if (period && index.periodIndex.has(period)) return period;
  return index.latestPeriod;
}

export function getPointAt(index: DataIndex, series: SeriesPoint[], period?: string): SeriesPoint {
  const resolved = resolvePeriod(index, period);
  const pointIndex = index.periodIndex.get(resolved) ?? series.length - 1;
  return series[pointIndex] ?? series[series.length - 1];
}

export function getSeriesForScope(index: DataIndex, scope: DataScope): SeriesPoint[] {
  if (scope.marketId && scope.productId) {
    return index.marketProductSeries.get(seriesKey(scope.marketId, scope.productId)) ?? [];
  }
  if (scope.marketId) {
    return index.marketSeries.get(scope.marketId) ?? [];
  }
  if (scope.regionId && scope.productId) {
    return index.regionProductSeries.get(seriesKey(scope.regionId, scope.productId)) ?? [];
  }
  if (scope.regionId) {
    return index.regionSeries.get(scope.regionId) ?? [];
  }
  if (scope.productId) {
    return index.productSeries.get(scope.productId) ?? [];
  }
  return index.portfolioSeries;
}

export function getScopeName(index: DataIndex, scope: DataScope): string {
  if (scope.marketId) {
    return index.marketsById.get(scope.marketId)?.name ?? scope.marketId;
  }
  if (scope.regionId) {
    return index.regionsById.get(scope.regionId)?.name ?? scope.regionId;
  }
  if (scope.productId) {
    return index.productsById.get(scope.productId)?.name ?? scope.productId;
  }
  return "Portfolio";
}

function safeDivide(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

function deriveStatus(attainment: number, growth: number): MarketStatus {
  if (attainment <= 92 || growth <= -4.5) return "off_track";
  if (attainment < 100 || growth < 2.1) return "at_risk";
  return "on_track";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getShareForScope(
  index: DataIndex,
  scope: DataScope,
  period: string,
  actual: number,
): number {
  if (scope.marketId && !scope.productId) {
    const market = index.marketsById.get(scope.marketId);
    if (!market) return 0;
    if (period === index.latestPeriod) return market.kpis.sharePct;
    const region = index.regionSeries.get(market.regionId);
    const regionPoint = region ? getPointAt(index, region, period) : undefined;
    return safeDivide(actual, regionPoint?.actual ?? 0) * 100;
  }

  if (scope.marketId && scope.productId) {
    const marketSeries = index.marketSeries.get(scope.marketId);
    const marketPoint = marketSeries ? getPointAt(index, marketSeries, period) : undefined;
    return safeDivide(actual, marketPoint?.actual ?? 0) * 100;
  }

  if (scope.regionId && !scope.marketId && !scope.productId) {
    const regionMarkets = index.marketsByRegion.get(scope.regionId) ?? [];
    const weighted = regionMarkets.reduce(
      (accumulator, market) => {
        const marketSeries = index.marketSeries.get(market.id);
        const point = marketSeries ? getPointAt(index, marketSeries, period) : undefined;
        return {
          share: accumulator.share + market.kpis.sharePct * (point?.actual ?? 0),
          revenue: accumulator.revenue + (point?.actual ?? 0),
        };
      },
      { share: 0, revenue: 0 },
    );
    return safeDivide(weighted.share, weighted.revenue);
  }

  if (scope.regionId && scope.productId) {
    const regionSeries = index.regionSeries.get(scope.regionId);
    const regionPoint = regionSeries ? getPointAt(index, regionSeries, period) : undefined;
    return safeDivide(actual, regionPoint?.actual ?? 0) * 100;
  }

  if (scope.productId) {
    const portfolioPoint = getPointAt(index, index.portfolioSeries, period);
    return safeDivide(actual, portfolioPoint.actual) * 100;
  }

  return 100;
}

export function getKpisForScope(index: DataIndex, scope: DataScope, period?: string): KpiValue {
  const resolved = resolvePeriod(index, period);
  const series = getSeriesForScope(index, scope);
  const point = getPointAt(index, series, resolved);
  const growthPct =
    point.priorYear === 0 ? 0 : ((point.actual - point.priorYear) / point.priorYear) * 100;
  const forecastAttainmentPct = point.forecast === 0 ? 0 : (point.actual / point.forecast) * 100;

  const market =
    scope.marketId && !scope.productId ? index.marketsById.get(scope.marketId) : undefined;

  return {
    period: resolved,
    revenue: point.actual,
    growthPct,
    sharePct: getShareForScope(index, scope, resolved, point.actual),
    forecastAttainmentPct,
    status:
      market && resolved === index.latestPeriod
        ? market.kpis.status
        : deriveStatus(forecastAttainmentPct, growthPct),
    anomalies: market ? market.kpis.anomalies : [],
  };
}

export function getMarketSummaries(
  index: DataIndex,
  params: {
    period?: string;
    regionId?: string;
    productId?: string;
  } = {},
): MarketSummary[] {
  const period = resolvePeriod(index, params.period);

  return index.dataset.markets
    .filter((market) => !params.regionId || market.regionId === params.regionId)
    .map((market) => {
      const scope: DataScope = {
        marketId: market.id,
        productId: params.productId,
      };
      const series = getSeriesForScope(index, scope);
      const kpis = getKpisForScope(index, scope, period);
      const region = index.regionsById.get(market.regionId);
      return {
        id: market.id,
        name: market.name,
        iso2: market.iso2,
        iso3: market.iso3,
        regionId: market.regionId,
        regionName: region?.name ?? market.regionId,
        revenue: kpis.revenue,
        growthPct: kpis.growthPct,
        marketSharePct: kpis.sharePct,
        forecastAttainmentPct: kpis.forecastAttainmentPct,
        status: kpis.status,
        anomalies: kpis.anomalies,
        series,
      };
    })
    .sort((left, right) => {
      const risk = statusRank(right.status) - statusRank(left.status);
      return risk !== 0 ? risk : right.revenue - left.revenue;
    });
}

export function getRegionSummaries(
  index: DataIndex,
  params: { period?: string; productId?: string } = {},
): RegionSummary[] {
  const period = resolvePeriod(index, params.period);
  const markets = getMarketSummaries(index, {
    period,
    productId: params.productId,
  });

  return index.dataset.regions.map((region) => {
    const scope: DataScope = { regionId: region.id, productId: params.productId };
    const series = getSeriesForScope(index, scope);
    const kpis = getKpisForScope(index, scope, period);
    const regionMarkets = markets.filter((market) => market.regionId === region.id);
    return {
      id: region.id,
      name: region.name,
      revenue: kpis.revenue,
      growthPct: kpis.growthPct,
      marketSharePct: kpis.sharePct,
      forecastAttainmentPct: kpis.forecastAttainmentPct,
      marketsAtRisk: regionMarkets.filter((market) => market.status !== "on_track").length,
      marketCount: regionMarkets.length,
      status: kpis.status,
      series,
    };
  });
}

export function getProductSummaries(
  index: DataIndex,
  params: { period?: string; regionId?: string; marketId?: string } = {},
): ProductSummary[] {
  const period = resolvePeriod(index, params.period);
  const scopeBase: DataScope = {
    regionId: params.regionId,
    marketId: params.marketId,
  };
  const baseSeries = getSeriesForScope(index, scopeBase);
  const basePoint = getPointAt(index, baseSeries, period);

  return index.dataset.products
    .map((product) => {
      const scope: DataScope = { ...scopeBase, productId: product.id };
      const series = getSeriesForScope(index, scope);
      const kpis = getKpisForScope(index, scope, period);
      return {
        id: product.id,
        name: product.name,
        revenue: kpis.revenue,
        growthPct: kpis.growthPct,
        sharePct: safeDivide(kpis.revenue, basePoint.actual) * 100,
        forecastAttainmentPct: kpis.forecastAttainmentPct,
        status: kpis.status,
        series,
      };
    })
    .sort((left, right) => right.revenue - left.revenue);
}

export function getPortfolioSummary(
  index: DataIndex,
  params: { period?: string; productId?: string } = {},
): PortfolioSummary {
  const period = resolvePeriod(index, params.period);
  const scope: DataScope = { productId: params.productId };
  const series = getSeriesForScope(index, scope);
  const kpis = getKpisForScope(index, scope, period);
  const markets = getMarketSummaries(index, {
    period,
    productId: params.productId,
  });

  return {
    revenue: kpis.revenue,
    growthPct: kpis.growthPct,
    sharePct: kpis.sharePct,
    forecastAttainmentPct: kpis.forecastAttainmentPct,
    status: kpis.status,
    marketsAtRisk: markets.filter((market) => market.status !== "on_track").length,
    marketsOffTrack: markets.filter((market) => market.status === "off_track").length,
    marketCount: markets.length,
    latestPeriod: period,
    series,
  };
}

export function getTopMovers(
  index: DataIndex,
  params: { period?: string; regionId?: string; productId?: string; limit?: number } = {},
): TopMovers {
  const limit = params.limit ?? 3;
  const markets = getMarketSummaries(index, params);
  return {
    gainers: markets
      .filter((market) => market.growthPct > 0)
      .sort((a, b) => b.growthPct - a.growthPct)
      .slice(0, limit),
    decliners: markets
      .filter((market) => market.growthPct < 0)
      .sort((a, b) => a.growthPct - b.growthPct)
      .slice(0, limit),
  };
}

export function getHeatmapData(
  index: DataIndex,
  params: { regionId?: string; productId?: string } = {},
): HeatmapRow[] {
  const markets = getMarketSummaries(index, params);

  return markets.map((market) => ({
    marketId: market.id,
    name: market.name,
    iso2: market.iso2,
    status: market.status,
    cells: market.series.map((point) => ({
      period: point.period,
      actual: point.actual,
      forecast: point.forecast,
      variancePct:
        point.forecast === 0 ? 0 : ((point.actual - point.forecast) / point.forecast) * 100,
    })),
  }));
}

export function getRadarComparison(
  index: DataIndex,
  entities: Array<{ kind: RadarEntityKind; id: string }>,
  period?: string,
): RadarEntity[] {
  const resolved = resolvePeriod(index, period);
  const rows = entities.map((entity) => {
    const scope: DataScope =
      entity.kind === "market" ? { marketId: entity.id } : { regionId: entity.id };
    const kpis = getKpisForScope(index, scope, resolved);
    return {
      kind: entity.kind,
      id: entity.id,
      name: getScopeName(index, scope),
      raw: {
        revenue: kpis.revenue,
        growth: kpis.growthPct,
        share: kpis.sharePct,
        attainment: kpis.forecastAttainmentPct,
      },
    };
  });

  const maxRevenue = Math.max(...rows.map((row) => row.raw.revenue), 1);

  return rows.map((row) => ({
    ...row,
    values: {
      revenue: clamp((row.raw.revenue / maxRevenue) * 100, 0, 100),
      growth: clamp(((row.raw.growth + 15) / 40) * 100, 0, 100),
      share: clamp(row.raw.share, 0, 100),
      attainment: clamp(((row.raw.attainment - 80) / 30) * 100, 0, 100),
    },
  }));
}

export function statusRank(status: MarketStatus): number {
  if (status === "off_track") return 2;
  if (status === "at_risk") return 1;
  return 0;
}
