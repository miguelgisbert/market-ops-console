import { z } from "zod";

export const alertScopeSchema = z.enum(["portfolio", "region", "market"]);
export type AlertScope = z.infer<typeof alertScopeSchema>;

export const alertMetricSchema = z.enum(["growthPct", "forecastAttainmentPct"]);
export type AlertMetric = z.infer<typeof alertMetricSchema>;

export const alertOperatorSchema = z.enum(["lt", "lte", "gt", "gte"]);
export type AlertOperator = z.infer<typeof alertOperatorSchema>;

export const alertSeveritySchema = z.enum(["warning", "critical"]);
export type AlertSeverity = z.infer<typeof alertSeveritySchema>;

export const alertDraftSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Give the rule a name of at least 3 characters.")
      .max(60, "Keep the name under 60 characters."),
    scope: alertScopeSchema,
    scopeId: z.string().optional(),
    metric: alertMetricSchema,
    operator: alertOperatorSchema,
    threshold: z.coerce
      .number({ message: "Enter a numeric threshold." })
      .finite("Enter a finite threshold."),
    severity: alertSeveritySchema,
    simulateFailure: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.scope !== "portfolio" && !value.scopeId) {
      context.addIssue({
        code: "custom",
        path: ["scopeId"],
        message: "Choose a region or market for this scope.",
      });
    }
  });
export type AlertDraft = z.infer<typeof alertDraftSchema>;

export const alertRuleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(3).max(60),
  scope: alertScopeSchema,
  scopeId: z.string().optional(),
  metric: alertMetricSchema,
  operator: alertOperatorSchema,
  threshold: z.number().finite(),
  severity: alertSeveritySchema,
  active: z.boolean(),
  createdAt: z.string().min(1),
});
export type AlertRule = z.infer<typeof alertRuleSchema>;

export type AlertRuleWithState = AlertRule & { pending?: boolean };

export const alertMetricLabels: Record<AlertMetric, string> = {
  growthPct: "Growth",
  forecastAttainmentPct: "Forecast attainment",
};

export const alertOperatorLabels: Record<AlertOperator, string> = {
  lt: "is below",
  lte: "is at or below",
  gt: "is above",
  gte: "is at or above",
};

export const alertSeverityLabels: Record<AlertSeverity, string> = {
  warning: "Warning",
  critical: "Critical",
};

export function matchesThreshold(
  value: number,
  operator: AlertOperator,
  threshold: number,
): boolean {
  if (operator === "lt") return value < threshold;
  if (operator === "lte") return value <= threshold;
  if (operator === "gt") return value > threshold;
  return value >= threshold;
}
