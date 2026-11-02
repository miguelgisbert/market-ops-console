import { cn } from "@/lib/utils";

export type KpiMetric = {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "positive" | "negative" | "warning";
};

const toneStyles = {
  default: "text-foreground",
  positive: "text-status-ontrack",
  negative: "text-status-offtrack",
  warning: "text-status-atrisk",
};

export function KpiBand({ metrics }: { metrics: KpiMetric[] }) {
  return (
    <section
      aria-label="Portfolio summary"
      className="grid divide-y border bg-card sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
    >
      {metrics.map((metric) => (
        <div key={metric.label} className="px-4 py-4">
          <p className="data-label">{metric.label}</p>
          <p
            className={cn(
              "mt-2 font-mono text-2xl font-medium tracking-[-0.04em] tabular-nums md:text-[28px]",
              toneStyles[metric.tone ?? "default"],
            )}
          >
            {metric.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
        </div>
      ))}
    </section>
  );
}
