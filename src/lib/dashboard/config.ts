import { z } from "zod";
import type { MarketStatus } from "@/lib/data/schema";

export const mapMetricSchema = z.enum([
  "growthPct",
  "forecastAttainmentPct",
  "marketSharePct",
  "revenue",
]);
export type MapMetric = z.infer<typeof mapMetricSchema>;

export const mapMetricLabels: Record<MapMetric, string> = {
  growthPct: "Growth",
  forecastAttainmentPct: "Forecast attainment",
  marketSharePct: "Market share",
  revenue: "Revenue",
};

export const marketStatusOptions: Array<{ value: MarketStatus; label: string }> = [
  { value: "on_track", label: "On track" },
  { value: "at_risk", label: "At risk" },
  { value: "off_track", label: "Off track" },
];
