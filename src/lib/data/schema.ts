import { z } from "zod";

export const periodSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use a YYYY-MM period");

export const marketStatusSchema = z.enum(["on_track", "at_risk", "off_track"]);
export type MarketStatus = z.infer<typeof marketStatusSchema>;

export const anomalySchema = z.object({
  period: periodSchema,
  type: z.string().min(1),
  note: z.string().min(1),
});
export type Anomaly = z.infer<typeof anomalySchema>;

export const marketKpisSchema = z.object({
  revenue: z.number().nonnegative(),
  growthPct: z.number(),
  sharePct: z.number().min(0).max(100),
  forecastAttainmentPct: z.number().nonnegative(),
  status: marketStatusSchema,
  anomalies: z.array(anomalySchema),
});
export type MarketKpis = z.infer<typeof marketKpisSchema>;

export const regionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});
export type Region = z.infer<typeof regionSchema>;

export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});
export type Product = z.infer<typeof productSchema>;

export const marketSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  iso3: z.string().length(3),
  iso2: z.string().length(2),
  regionId: z.string().min(1),
  kpis: marketKpisSchema,
});
export type Market = z.infer<typeof marketSchema>;

export const seriesRowSchema = z.object({
  marketId: z.string().min(1),
  productId: z.string().min(1),
  period: periodSchema,
  actual: z.number().nonnegative(),
  forecast: z.number().nonnegative(),
  units: z.number().nonnegative(),
  priorYear: z.number().nonnegative(),
});
export type SeriesRow = z.infer<typeof seriesRowSchema>;

export const datasetMetaSchema = z.object({
  currency: z.string().length(3),
  periods: z.array(periodSchema).min(1),
  latestPeriod: periodSchema,
  generatedAt: z.string().min(1),
});
export type DatasetMeta = z.infer<typeof datasetMetaSchema>;

export const datasetSchema = z.object({
  meta: datasetMetaSchema,
  regions: z.array(regionSchema).min(1),
  products: z.array(productSchema).min(1),
  markets: z.array(marketSchema).min(1),
  series: z.array(seriesRowSchema).min(1),
});
export type Dataset = z.infer<typeof datasetSchema>;

export const seriesPointSchema = z.object({
  period: periodSchema,
  actual: z.number().nonnegative(),
  forecast: z.number().nonnegative(),
  units: z.number().nonnegative(),
  priorYear: z.number().nonnegative(),
});
export type SeriesPoint = z.infer<typeof seriesPointSchema>;
