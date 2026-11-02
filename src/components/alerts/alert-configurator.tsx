"use client";

import { CircleAlert, Plus, Trash2 } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { SelectField } from "@/components/form/select-field";
import {
  type AlertDraft,
  type AlertMetric,
  type AlertOperator,
  type AlertRule,
  type AlertRuleWithState,
  type AlertScope,
  type AlertSeverity,
  alertDraftSchema,
  alertMetricLabels,
  alertOperatorLabels,
  alertRuleSchema,
  alertSeverityLabels,
  matchesThreshold,
} from "@/lib/alerts/schema";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "meridian:alert-rules";

export type AlertMarketOption = {
  id: string;
  name: string;
  regionId: string;
  growthPct: number;
  forecastAttainmentPct: number;
};

export type AlertRegionOption = {
  id: string;
  name: string;
};

const emptyDraft: AlertDraft = {
  name: "",
  scope: "portfolio",
  scopeId: undefined,
  metric: "growthPct",
  operator: "lt",
  threshold: -5,
  severity: "warning",
  simulateFailure: false,
};

async function saveRule(rule: AlertRule, simulateFailure: boolean): Promise<AlertRule> {
  await new Promise((resolve) => setTimeout(resolve, 650));
  if (simulateFailure) {
    throw new Error("The alert service rejected the request. Your change was rolled back.");
  }
  return rule;
}

function readRules(): AlertRule[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = alertRuleSchema.array().safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

function writeRules(rules: AlertRule[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  } catch {
    return;
  }
}

export function AlertConfigurator({
  markets,
  regions,
}: {
  markets: AlertMarketOption[];
  regions: AlertRegionOption[];
}) {
  const formId = useId();
  const [draft, setDraft] = useState<AlertDraft>(emptyDraft);
  const [errors, setErrors] = useState<Partial<Record<keyof AlertDraft, string>>>({});
  const [rules, setRules] = useState<AlertRuleWithState[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    setRules(readRules());
  }, []);

  const candidateMarkets =
    draft.scope === "market"
      ? markets.filter((market) => market.id === draft.scopeId)
      : draft.scope === "region"
        ? markets.filter((market) => market.regionId === draft.scopeId)
        : markets;
  const previewCount = candidateMarkets.filter((market) =>
    matchesThreshold(market[draft.metric], draft.operator, draft.threshold),
  ).length;

  function update<K extends keyof AlertDraft>(key: K, value: AlertDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSaveError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = alertDraftSchema.safeParse(draft);
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof AlertDraft, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !nextErrors[key as keyof AlertDraft]) {
          nextErrors[key as keyof AlertDraft] = issue.message;
        }
      }
      setErrors(nextErrors);
      setAnnouncement("The alert rule has validation errors.");
      return;
    }

    const { simulateFailure, ...values } = parsed.data;
    const optimistic: AlertRuleWithState = {
      ...values,
      id: `pending-${crypto.randomUUID()}`,
      active: true,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    const previous = rules;

    setRules([optimistic, ...rules]);
    setSaving(true);
    setSaveError(null);
    setAnnouncement("Saving alert rule…");

    try {
      const saved = await saveRule(optimistic, simulateFailure);
      const committed = { ...saved, pending: false };
      const next = [committed, ...previous];
      setRules(next);
      writeRules(next);
      setDraft(emptyDraft);
      setErrors({});
      setAnnouncement("Alert rule saved.");
    } catch (error) {
      setRules(previous);
      setSaveError(error instanceof Error ? error.message : "The alert rule could not be saved.");
      setAnnouncement("Save failed. The optimistic change was rolled back.");
    } finally {
      setSaving(false);
    }
  }

  function toggleRule(id: string) {
    const next = rules.map((rule) => (rule.id === id ? { ...rule, active: !rule.active } : rule));
    setRules(next);
    writeRules(next.filter((rule) => !rule.pending));
  }

  function removeRule(id: string) {
    const next = rules.filter((rule) => rule.id !== id);
    setRules(next);
    writeRules(next.filter((rule) => !rule.pending));
  }

  function scopeLabel(rule: AlertRuleWithState): string {
    if (rule.scope === "portfolio") return "Portfolio";
    if (rule.scope === "region") {
      return regions.find((region) => region.id === rule.scopeId)?.name ?? "Region";
    }
    return markets.find((market) => market.id === rule.scopeId)?.name ?? "Market";
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
      <section aria-labelledby="alert-form-heading" className="border bg-card">
        <div className="border-b px-4 py-3">
          <h2 id="alert-form-heading" className="text-sm font-semibold">
            New alert rule
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Rules are validated with Zod and saved optimistically.
          </p>
        </div>
        <form className="space-y-4 px-4 py-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor={`${formId}-name`} className="data-label mb-1 block">
              Rule name
            </label>
            <input
              id={`${formId}-name`}
              value={draft.name}
              onChange={(event) => update("name", event.target.value)}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? `${formId}-name-error` : undefined}
              placeholder="e.g. Europe growth floor"
              className={inputClass}
            />
            <FieldError id={`${formId}-name-error`}>{errors.name}</FieldError>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              id={`${formId}-scope`}
              label="Scope"
              value={draft.scope}
              options={[
                { value: "portfolio", label: "Portfolio" },
                { value: "region", label: "Region" },
                { value: "market", label: "Market" },
              ]}
              onValueChange={(value) => {
                update("scope", value as AlertScope);
                update("scopeId", undefined);
              }}
            />

            {draft.scope !== "portfolio" ? (
              <div>
                <SelectField
                  id={`${formId}-scope-id`}
                  label={draft.scope === "region" ? "Region" : "Market"}
                  value={draft.scopeId}
                  placeholder={`Select ${draft.scope}`}
                  options={(draft.scope === "region" ? regions : markets).map((option) => ({
                    value: option.id,
                    label: option.name,
                  }))}
                  onValueChange={(value) => update("scopeId", value)}
                  invalid={Boolean(errors.scopeId)}
                  describedBy={errors.scopeId ? `${formId}-scope-error` : undefined}
                />
                <FieldError id={`${formId}-scope-error`}>{errors.scopeId}</FieldError>
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <SelectField
              id={`${formId}-metric`}
              label="Metric"
              value={draft.metric}
              options={Object.entries(alertMetricLabels).map(([value, label]) => ({
                value,
                label,
              }))}
              onValueChange={(value) => update("metric", value as AlertMetric)}
            />
            <SelectField
              id={`${formId}-operator`}
              label="Condition"
              value={draft.operator}
              options={Object.entries(alertOperatorLabels).map(([value, label]) => ({
                value,
                label,
              }))}
              onValueChange={(value) => update("operator", value as AlertOperator)}
            />
            <div>
              <label htmlFor={`${formId}-threshold`} className="data-label mb-1 block">
                Threshold (%)
              </label>
              <input
                id={`${formId}-threshold`}
                type="number"
                step="0.1"
                value={Number.isNaN(draft.threshold) ? "" : draft.threshold}
                onChange={(event) => update("threshold", Number(event.target.value))}
                aria-invalid={errors.threshold ? true : undefined}
                aria-describedby={errors.threshold ? `${formId}-threshold-error` : undefined}
                className={inputClass}
              />
              <FieldError id={`${formId}-threshold-error`}>{errors.threshold}</FieldError>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              id={`${formId}-severity`}
              label="Severity"
              value={draft.severity}
              options={Object.entries(alertSeverityLabels).map(([value, label]) => ({
                value,
                label,
              }))}
              onValueChange={(value) => update("severity", value as AlertSeverity)}
            />
            <label className="flex items-start gap-2 self-end border px-3 py-2 text-xs">
              <input
                type="checkbox"
                checked={draft.simulateFailure}
                onChange={(event) => update("simulateFailure", event.target.checked)}
                className="mt-0.5 accent-primary"
              />
              <span>
                Simulate save failure
                <span className="mt-0.5 block text-[10px] text-muted-foreground">
                  Demo rollback path; fails after the optimistic update.
                </span>
              </span>
            </label>
          </div>

          <p className="border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Preview: <span className="font-mono text-foreground">{previewCount}</span>{" "}
            {previewCount === 1 ? "market matches" : "markets match"} this condition.
          </p>

          {saveError ? (
            <p
              role="alert"
              className="flex items-center gap-1.5 border border-destructive/35 bg-destructive/5 px-2 py-1.5 text-[11px] text-destructive"
            >
              <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" />
              {saveError}
            </p>
          ) : null}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-9 items-center gap-1.5 bg-primary px-3 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Plus aria-hidden="true" className="size-3.5" />
              {saving ? "Saving…" : "Save rule"}
            </button>
            <p className="font-mono text-[10px] text-muted-foreground">
              Persisted to localStorage after success
            </p>
          </div>
        </form>
      </section>

      <section aria-labelledby="alert-list-heading" className="border bg-card">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <div>
            <h2 id="alert-list-heading" className="text-sm font-semibold">
              Active rules
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Optimistic entries show a pending state.
            </p>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            {rules.length} {rules.length === 1 ? "rule" : "rules"}
          </span>
        </div>
        <div aria-live="polite" className="sr-only">
          {announcement}
        </div>
        {rules.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted-foreground">
            No alert rules yet. Create one to flag a market or region below a threshold.
          </p>
        ) : (
          <ul className="divide-y">
            {rules.map((rule) => (
              <li key={rule.id} className={cn("px-4 py-3", rule.pending && "opacity-60")}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-medium">
                      {rule.name}
                      {rule.pending ? (
                        <span className="border px-1 py-0.5 font-mono text-[9px] text-muted-foreground">
                          Pending
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {scopeLabel(rule)} · {alertMetricLabels[rule.metric]}{" "}
                      {alertOperatorLabels[rule.operator]}{" "}
                      <span className="font-mono">{formatPercent(rule.threshold)}</span>
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 border px-1.5 py-0.5 font-mono text-[9px]",
                      rule.severity === "critical"
                        ? "border-status-offtrack/40 bg-status-offtrack/10 text-status-offtrack"
                        : "border-status-atrisk/40 bg-status-atrisk/10 text-status-atrisk",
                    )}
                  >
                    {alertSeverityLabels[rule.severity]}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={rule.active}
                      disabled={rule.pending}
                      onChange={() => toggleRule(rule.id)}
                      className="accent-primary"
                    />
                    {rule.active ? "Active" : "Paused"}
                  </label>
                  <button
                    type="button"
                    onClick={() => removeRule(rule.id)}
                    disabled={rule.pending}
                    className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                    aria-label={`Delete ${rule.name}`}
                  >
                    <Trash2 aria-hidden="true" className="size-3" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const inputClass =
  "h-9 w-full border bg-background px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive";

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1 text-[11px] text-destructive">
      {children}
    </p>
  );
}
