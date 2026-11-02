import type { MarketStatus } from "@/lib/data/schema";

const fullCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function compact(value: number): string {
  const sign = value < 0 ? "−" : "";
  const absolute = Math.abs(value);
  const units = [
    { threshold: 1_000_000_000, suffix: "B" },
    { threshold: 1_000_000, suffix: "M" },
    { threshold: 1_000, suffix: "K" },
  ];
  for (const unit of units) {
    if (absolute >= unit.threshold) {
      const scaled = absolute / unit.threshold;
      const digits = scaled >= 100 ? 0 : 1;
      return `${sign}${scaled.toFixed(digits)}${unit.suffix}`;
    }
  }
  return `${sign}${absolute.toFixed(0)}`;
}

export function formatCurrency(
  value: number,
  options: { compact?: boolean; currency?: string } = {},
): string {
  if (options.compact) {
    return `${value < 0 ? "−" : ""}$${compact(Math.abs(value))}`;
  }

  if (options.currency && options.currency !== "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: options.currency,
      maximumFractionDigits: 0,
    }).format(value);
  }

  return fullCurrency.format(value);
}

export function formatCompactNumber(value: number): string {
  return compact(Math.abs(value));
}

export function formatPercent(
  value: number,
  options: { signed?: boolean; digits?: number } = {},
): string {
  const { signed = false, digits = 1 } = options;
  const formatted = `${Math.abs(value).toFixed(digits)}%`;
  if (!signed || value === 0) return formatted;
  return `${value > 0 ? "+" : "−"}${formatted}`;
}

export function formatPeriodLabel(period: string): string {
  const [year, month] = period.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function formatPeriodShort(period: string): string {
  const [, month] = period.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2026, month - 1, 1)));
}

export function formatPeriodAxis(period: string): string {
  const [year, month] = period.split("-").map(Number);
  if (month === 1) return `${formatPeriodShort(period)} '${String(year).slice(2)}`;
  return formatPeriodShort(period);
}

export function statusLabel(status: MarketStatus): string {
  if (status === "on_track") return "On track";
  if (status === "at_risk") return "At risk";
  return "Off track";
}
