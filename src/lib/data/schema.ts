import { z } from "zod";

export const marketStatusSchema = z.enum(["on-track", "at-risk", "off-track"]);
export type MarketStatus = z.infer<typeof marketStatusSchema>;

export const anomalyKindSchema = z.enum([
  "revenue-drop",
  "forecast-miss",
  "share-loss",
  "spike",
]);
export type AnomalyKind = z.infer<typeof anomalyKindSchema>;

export const anomalySchema = z.object({
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  kind: anomalyKindSchema,
  severity: z.enum(["low", "medium", "high"]),
  note: z.string().min(1),
});
export type Anomaly = z.infer<typeof anomalySchema>;

export const timeSeriesPointSchema = z.object({
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  revenue: z.number().nonnegative(),
  units: z.number().nonnegative(),
  forecast: z.number().nonnegative(),
  priorYear: z.number().nonnegative(),
});
export type TimeSeriesPoint = z.infer<typeof timeSeriesPointSchema>;

export const kpiSnapshotSchema = z.object({
  revenue: z.number().nonnegative(),
  growthPct: z.number(),
  marketSharePct: z.number().min(0).max(100),
  forecastAttainmentPct: z.number().nonnegative(),
  status: marketStatusSchema,
  anomalies: z.array(anomalySchema),
});
export type KpiSnapshot = z.infer<typeof kpiSnapshotSchema>;

export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  family: z.string().min(1),
});
export type Product = z.infer<typeof productSchema>;

export const productMarketSchema = z.object({
  productId: z.string().min(1),
  series: z.array(timeSeriesPointSchema).min(1),
  kpis: kpiSnapshotSchema,
});
export type ProductMarket = z.infer<typeof productMarketSchema>;

export const marketSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  iso2: z.string().length(2),
  regionId: z.string().min(1),
  currency: z.string().length(3),
  fxToUsd: z.number().positive(),
  series: z.array(timeSeriesPointSchema).min(1),
  kpis: kpiSnapshotSchema,
  products: z.array(productMarketSchema).min(1),
});
export type Market = z.infer<typeof marketSchema>;

export const regionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  marketIds: z.array(z.string().min(1)).min(1),
});
export type Region = z.infer<typeof regionSchema>;

export const datasetMetadataSchema = z.object({
  title: z.string().min(1),
  source: z.enum(["synthetic", "starter-pack"]),
  reportingCurrency: z.literal("USD"),
  generatedAt: z.iso.datetime(),
  periods: z.array(z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)).min(1),
});
export type DatasetMetadata = z.infer<typeof datasetMetadataSchema>;

export const datasetSchema = z.object({
  metadata: datasetMetadataSchema,
  regions: z.array(regionSchema).min(1),
  products: z.array(productSchema).min(1),
  markets: z.array(marketSchema).min(1),
});
export type Dataset = z.infer<typeof datasetSchema>;
