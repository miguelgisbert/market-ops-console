import type { Dataset, Market, Product, Region, SeriesPoint, SeriesRow } from "./schema";

export type DataIndex = {
  dataset: Dataset;
  periods: string[];
  latestPeriod: string;
  periodIndex: Map<string, number>;
  regionsById: Map<string, Region>;
  marketsById: Map<string, Market>;
  productsById: Map<string, Product>;
  marketsByRegion: Map<string, Market[]>;
  portfolioSeries: SeriesPoint[];
  marketSeries: Map<string, SeriesPoint[]>;
  regionSeries: Map<string, SeriesPoint[]>;
  productSeries: Map<string, SeriesPoint[]>;
  marketProductSeries: Map<string, SeriesPoint[]>;
  regionProductSeries: Map<string, SeriesPoint[]>;
};

export function seriesKey(firstId: string, secondId?: string): string {
  return secondId ? `${firstId}|${secondId}` : firstId;
}

function blankSeries(periods: string[]): SeriesPoint[] {
  return periods.map((period) => ({
    period,
    actual: 0,
    forecast: 0,
    units: 0,
    priorYear: 0,
  }));
}

function addRow(target: SeriesPoint[], index: number, row: SeriesRow): void {
  const point = target[index];
  point.actual += row.actual;
  point.forecast += row.forecast;
  point.units += row.units;
  point.priorYear += row.priorYear;
}

function ensureSeries(store: Map<string, SeriesPoint[]>, key: string, periods: string[]): void {
  if (!store.has(key)) store.set(key, blankSeries(periods));
}

export function createDataIndex(dataset: Dataset): DataIndex {
  const periods = dataset.meta.periods;
  const periodIndex = new Map(periods.map((period, index) => [period, index]));
  const regionsById = new Map(dataset.regions.map((region) => [region.id, region]));
  const marketsById = new Map(dataset.markets.map((market) => [market.id, market]));
  const productsById = new Map(dataset.products.map((product) => [product.id, product]));
  const marketsByRegion = new Map<string, Market[]>();

  for (const market of dataset.markets) {
    if (!regionsById.has(market.regionId)) {
      throw new Error(`Market ${market.id} references missing region ${market.regionId}`);
    }
    const list = marketsByRegion.get(market.regionId) ?? [];
    list.push(market);
    marketsByRegion.set(market.regionId, list);
  }

  const marketSeries = new Map<string, SeriesPoint[]>();
  const regionSeries = new Map<string, SeriesPoint[]>();
  const productSeries = new Map<string, SeriesPoint[]>();
  const marketProductSeries = new Map<string, SeriesPoint[]>();
  const regionProductSeries = new Map<string, SeriesPoint[]>();
  const portfolioSeries = blankSeries(periods);

  for (const market of dataset.markets) {
    ensureSeries(marketSeries, market.id, periods);
    ensureSeries(regionSeries, market.regionId, periods);
  }
  for (const product of dataset.products) {
    ensureSeries(productSeries, product.id, periods);
    for (const region of dataset.regions) {
      ensureSeries(regionProductSeries, seriesKey(region.id, product.id), periods);
    }
    for (const market of dataset.markets) {
      ensureSeries(marketProductSeries, seriesKey(market.id, product.id), periods);
    }
  }

  for (const row of dataset.series) {
    const index = periodIndex.get(row.period);
    if (index === undefined) {
      throw new Error(`Series row references unknown period ${row.period}`);
    }
    const market = marketsById.get(row.marketId);
    if (!market) {
      throw new Error(`Series row references unknown market ${row.marketId}`);
    }
    if (!productsById.has(row.productId)) {
      throw new Error(`Series row references unknown product ${row.productId}`);
    }

    addRow(portfolioSeries, index, row);

    const marketValues = marketSeries.get(market.id);
    const regionValues = regionSeries.get(market.regionId);
    const productValues = productSeries.get(row.productId);
    const marketProductValues = marketProductSeries.get(seriesKey(market.id, row.productId));
    const regionProductValues = regionProductSeries.get(seriesKey(market.regionId, row.productId));

    if (
      !marketValues ||
      !regionValues ||
      !productValues ||
      !marketProductValues ||
      !regionProductValues
    ) {
      throw new Error("Series index was not initialised correctly");
    }

    addRow(marketValues, index, row);
    addRow(regionValues, index, row);
    addRow(productValues, index, row);
    addRow(marketProductValues, index, row);
    addRow(regionProductValues, index, row);
  }

  return {
    dataset,
    periods,
    latestPeriod: dataset.meta.latestPeriod,
    periodIndex,
    regionsById,
    marketsById,
    productsById,
    marketsByRegion,
    portfolioSeries,
    marketSeries,
    regionSeries,
    productSeries,
    marketProductSeries,
    regionProductSeries,
  };
}
