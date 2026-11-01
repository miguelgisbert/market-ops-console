import {
  type Dataset,
  datasetSchema,
  type KpiSnapshot,
  type MarketStatus,
  type TimeSeriesPoint,
} from "./schema";

const PERIOD_COUNT = 24;
const GENERATION_COUNT = PERIOD_COUNT + 12;

type MarketSeed = {
  id: string;
  name: string;
  iso2: string;
  regionId: string;
  currency: string;
  fxToUsd: number;
  baseRevenueUsd: number;
  performanceBias: number;
  unitPriceUsd: number;
};

type ProductSeed = {
  id: string;
  name: string;
  family: string;
  weight: number;
  unitPriceFactor: number;
};

const marketSeeds: MarketSeed[] = [
  {
    id: "us",
    name: "United States",
    iso2: "US",
    regionId: "north-america",
    currency: "USD",
    fxToUsd: 1,
    baseRevenueUsd: 4_200_000,
    performanceBias: 0.02,
    unitPriceUsd: 640,
  },
  {
    id: "ca",
    name: "Canada",
    iso2: "CA",
    regionId: "north-america",
    currency: "CAD",
    fxToUsd: 0.73,
    baseRevenueUsd: 1_100_000,
    performanceBias: 0.01,
    unitPriceUsd: 590,
  },
  {
    id: "mx",
    name: "Mexico",
    iso2: "MX",
    regionId: "north-america",
    currency: "MXN",
    fxToUsd: 0.058,
    baseRevenueUsd: 700_000,
    performanceBias: -0.01,
    unitPriceUsd: 410,
  },
  {
    id: "gb",
    name: "United Kingdom",
    iso2: "GB",
    regionId: "europe",
    currency: "GBP",
    fxToUsd: 1.27,
    baseRevenueUsd: 1_800_000,
    performanceBias: 0,
    unitPriceUsd: 620,
  },
  {
    id: "de",
    name: "Germany",
    iso2: "DE",
    regionId: "europe",
    currency: "EUR",
    fxToUsd: 1.08,
    baseRevenueUsd: 2_100_000,
    performanceBias: -0.1,
    unitPriceUsd: 650,
  },
  {
    id: "fr",
    name: "France",
    iso2: "FR",
    regionId: "europe",
    currency: "EUR",
    fxToUsd: 1.08,
    baseRevenueUsd: 1_600_000,
    performanceBias: 0.01,
    unitPriceUsd: 630,
  },
  {
    id: "es",
    name: "Spain",
    iso2: "ES",
    regionId: "europe",
    currency: "EUR",
    fxToUsd: 1.08,
    baseRevenueUsd: 900_000,
    performanceBias: -0.06,
    unitPriceUsd: 560,
  },
  {
    id: "jp",
    name: "Japan",
    iso2: "JP",
    regionId: "apac",
    currency: "JPY",
    fxToUsd: 0.0067,
    baseRevenueUsd: 2_400_000,
    performanceBias: -0.05,
    unitPriceUsd: 680,
  },
  {
    id: "au",
    name: "Australia",
    iso2: "AU",
    regionId: "apac",
    currency: "AUD",
    fxToUsd: 0.66,
    baseRevenueUsd: 1_200_000,
    performanceBias: 0.02,
    unitPriceUsd: 610,
  },
  {
    id: "in",
    name: "India",
    iso2: "IN",
    regionId: "apac",
    currency: "INR",
    fxToUsd: 0.012,
    baseRevenueUsd: 800_000,
    performanceBias: 0.05,
    unitPriceUsd: 360,
  },
  {
    id: "br",
    name: "Brazil",
    iso2: "BR",
    regionId: "latam",
    currency: "BRL",
    fxToUsd: 0.18,
    baseRevenueUsd: 900_000,
    performanceBias: -0.02,
    unitPriceUsd: 430,
  },
  {
    id: "ar",
    name: "Argentina",
    iso2: "AR",
    regionId: "latam",
    currency: "ARS",
    fxToUsd: 0.0011,
    baseRevenueUsd: 350_000,
    performanceBias: -0.15,
    unitPriceUsd: 390,
  },
];

const productSeeds: ProductSeed[] = [
  { id: "atlas", name: "Atlas Core", family: "Platform", weight: 0.32, unitPriceFactor: 1.15 },
  {
    id: "beacon",
    name: "Beacon Cloud",
    family: "Infrastructure",
    weight: 0.24,
    unitPriceFactor: 1.05,
  },
  { id: "cascade", name: "Cascade Suite", family: "Workflow", weight: 0.18, unitPriceFactor: 0.95 },
  {
    id: "drift",
    name: "Drift Analytics",
    family: "Intelligence",
    weight: 0.15,
    unitPriceFactor: 0.82,
  },
  { id: "ember", name: "Ember Edge", family: "Infrastructure", weight: 0.11, unitPriceFactor: 0.7 },
];

const regions = [
  { id: "north-america", name: "North America", marketIds: ["us", "ca", "mx"] },
  { id: "europe", name: "Europe", marketIds: ["gb", "de", "fr", "es"] },
  { id: "apac", name: "APAC", marketIds: ["jp", "au", "in"] },
  { id: "latam", name: "LATAM", marketIds: ["br", "ar"] },
];

const periods = buildPeriods();

function buildPeriods(): string[] {
  const result: string[] = [];
  const startYear = 2023;
  const startMonth = 10;
  for (let index = 0; index < GENERATION_COUNT; index += 1) {
    const absoluteMonth = startMonth + index;
    const year = startYear + Math.floor(absoluteMonth / 12);
    const month = (absoluteMonth % 12) + 1;
    result.push(`${year}-${String(month).padStart(2, "0")}`);
  }
  return result;
}

function hashString(input: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function seasonalFactor(period: string, phase: number, amplitude: number): number {
  const month = Number(period.slice(5, 7));
  return 1 + amplitude * Math.sin(((month + phase) / 12) * Math.PI * 2);
}

function statusFor(attainment: number, growth: number): MarketStatus {
  if (attainment < 92 || growth < -8) return "off-track";
  if (attainment < 99 || growth < -2) return "at-risk";
  return "on-track";
}

function round(value: number): number {
  return Math.round(value);
}

function buildSeries(
  market: MarketSeed,
  product: ProductSeed,
  marketRandom: () => number,
): TimeSeriesPoint[] {
  const random = mulberry32(hashString(`${market.id}:${product.id}`));
  const trend = 0.003 + random() * 0.008;
  const amplitude = 0.035 + random() * 0.07;
  const phase = Math.floor(random() * 12);
  const baseLocal = (market.baseRevenueUsd * product.weight) / market.fxToUsd;
  const expectedNoise = 0.03 + marketRandom() * 0.025;

  const generated = periods.map((period, index) => {
    const expected = baseLocal * (1 + trend) ** index * seasonalFactor(period, phase, amplitude);
    const noise = (random() - 0.5) * 2 * expectedNoise;
    const isRecent = period >= "2026-05";
    const bias = isRecent ? market.performanceBias : 0;
    const actual = Math.max(0, expected * (1 + noise + bias));
    return {
      period,
      expected,
      actual,
    };
  });

  return generated.slice(-PERIOD_COUNT).map((point, index) => {
    const absoluteIndex = generated.length - PERIOD_COUNT + index;
    const prior = generated[absoluteIndex - 12];
    const forecast = point.expected;
    return {
      period: point.period,
      revenue: round(point.actual),
      units: round(point.actual / (market.unitPriceUsd * product.unitPriceFactor * market.fxToUsd)),
      forecast: round(forecast),
      priorYear: round(prior?.actual ?? point.actual / 1.04),
    };
  });
}

function buildKpis(series: TimeSeriesPoint[], shareBase: number): KpiSnapshot {
  const latest = series[series.length - 1];
  const growthPct = ((latest.revenue - latest.priorYear) / latest.priorYear) * 100;
  const forecastAttainmentPct = (latest.revenue / latest.forecast) * 100;
  const anomalies = series
    .filter((point) => {
      const attainment = (point.revenue / point.forecast) * 100;
      const growth = ((point.revenue - point.priorYear) / point.priorYear) * 100;
      return attainment < 89 || growth < -10;
    })
    .slice(-3)
    .map((point) => {
      const attainment = (point.revenue / point.forecast) * 100;
      const growth = ((point.revenue - point.priorYear) / point.priorYear) * 100;
      const miss = Math.max(0, 100 - attainment);
      return {
        period: point.period,
        kind: attainment < 89 ? ("forecast-miss" as const) : ("revenue-drop" as const),
        severity:
          miss > 14 || growth < -18
            ? ("high" as const)
            : miss > 8
              ? ("medium" as const)
              : ("low" as const),
        note:
          attainment < 89
            ? `Revenue landed ${miss.toFixed(0)}% below forecast, with prior-year growth at ${growth.toFixed(1)}%.`
            : `Revenue fell ${Math.abs(growth).toFixed(1)}% against the prior year.`,
      };
    });

  return {
    revenue: latest.revenue,
    growthPct: Number(growthPct.toFixed(1)),
    marketSharePct: Number(shareBase.toFixed(1)),
    forecastAttainmentPct: Number(forecastAttainmentPct.toFixed(1)),
    status: statusFor(forecastAttainmentPct, growthPct),
    anomalies,
  };
}

function sumSeries(seriesList: TimeSeriesPoint[][]): TimeSeriesPoint[] {
  return seriesList[0].map((point, index) => {
    const samePeriod = seriesList.map((series) => series[index]);
    return {
      period: point.period,
      revenue: samePeriod.reduce((total, current) => total + current.revenue, 0),
      units: samePeriod.reduce((total, current) => total + current.units, 0),
      forecast: samePeriod.reduce((total, current) => total + current.forecast, 0),
      priorYear: samePeriod.reduce((total, current) => total + current.priorYear, 0),
    };
  });
}

export function buildMockDataset(): Dataset {
  const markets = marketSeeds.map((marketSeed) => {
    const marketRandom = mulberry32(hashString(marketSeed.id));
    const productSeries = productSeeds.map((productSeed) => ({
      productId: productSeed.id,
      series: buildSeries(marketSeed, productSeed, marketRandom),
    }));
    const marketSeries = sumSeries(productSeries.map((product) => product.series));
    const latestRevenue = marketSeries[marketSeries.length - 1].revenue;
    const products = productSeries.map((product) => ({
      productId: product.productId,
      series: product.series,
      kpis: buildKpis(
        product.series,
        (product.series[product.series.length - 1].revenue / latestRevenue) * 100,
      ),
    }));
    return {
      id: marketSeed.id,
      name: marketSeed.name,
      iso2: marketSeed.iso2,
      regionId: marketSeed.regionId,
      currency: marketSeed.currency,
      fxToUsd: marketSeed.fxToUsd,
      series: marketSeries,
      kpis: buildKpis(marketSeries, 0),
      products,
    };
  });

  const regionRevenue = regions.map((region) => {
    const total = markets
      .filter((market) => market.regionId === region.id)
      .reduce(
        (sum, market) => sum + market.series[market.series.length - 1].revenue * market.fxToUsd,
        0,
      );
    return { regionId: region.id, total };
  });

  const marketsWithShare = markets.map((market) => {
    const region = regionRevenue.find((entry) => entry.regionId === market.regionId);
    const marketRevenueUsd = market.kpis.revenue * market.fxToUsd;
    const regionalShare = region ? (marketRevenueUsd / region.total) * 100 : 0;
    return {
      ...market,
      kpis: {
        ...market.kpis,
        marketSharePct: Number(regionalShare.toFixed(1)),
      },
    };
  });

  const metadata = {
    title: "Meridian portfolio — synthetic market operations dataset",
    source: "synthetic" as const,
    reportingCurrency: "USD" as const,
    generatedAt: "2026-11-01T00:00:00.000Z",
    periods: periods.slice(-PERIOD_COUNT),
  };

  return datasetSchema.parse({
    metadata,
    regions,
    products: productSeeds.map(({ id, name, family }) => ({ id, name, family })),
    markets: marketsWithShare,
  });
}

export const mockDataset = buildMockDataset();
