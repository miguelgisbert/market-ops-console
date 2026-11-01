const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const fullCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCurrency(
  value: number,
  currency = "USD",
  options: { compact?: boolean } = {},
): string {
  if (currency === "USD") {
    return options.compact ? compactCurrency.format(value) : fullCurrency.format(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: options.compact ? "compact" : "standard",
    maximumFractionDigits: options.compact ? 1 : 0,
  }).format(value);
}

export function formatCompactNumber(value: number): string {
  return compactNumber.format(value);
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

export function statusLabel(status: "on-track" | "at-risk" | "off-track"): string {
  if (status === "on-track") return "On track";
  if (status === "at-risk") return "At risk";
  return "Off track";
}
