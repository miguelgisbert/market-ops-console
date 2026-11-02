"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { type MapMetric, mapMetricLabels } from "@/lib/dashboard/config";
import { formatPeriodLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string; regionId?: string };

export type ScopeState = {
  region?: string;
  market?: string;
  product?: string;
  period?: string;
  metric?: MapMetric;
  compare?: string;
};

export function ScopeControls({
  regions,
  markets,
  products,
  periods,
  current,
}: {
  regions: Option[];
  markets: Option[];
  products: Option[];
  periods: string[];
  current: ScopeState;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function navigate(next: ScopeState) {
    const params = new URLSearchParams();
    if (next.region) params.set("region", next.region);
    if (next.market) params.set("market", next.market);
    if (next.product) params.set("product", next.product);
    if (next.period) params.set("period", next.period);
    if (next.metric) params.set("metric", next.metric);
    if (next.compare) params.set("compare", next.compare);
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/analyst?${query}` : "/analyst", { scroll: false });
    });
  }

  const availableMarkets = current.region
    ? markets.filter((market) => market.regionId === current.region)
    : markets;

  return (
    <section
      aria-label="Dashboard scope"
      aria-busy={pending}
      className="flex flex-wrap items-end gap-3 border bg-card px-4 py-3"
    >
      <Field label="Region" htmlFor="scope-region">
        <select
          id="scope-region"
          value={current.region ?? ""}
          onChange={(event) =>
            navigate({
              ...current,
              region: event.target.value || undefined,
              market: undefined,
            })
          }
          className={selectClass}
        >
          <option value="">All regions</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Market" htmlFor="scope-market">
        <select
          id="scope-market"
          value={current.market ?? ""}
          onChange={(event) => {
            const marketId = event.target.value;
            const market = markets.find((entry) => entry.id === marketId);
            navigate({
              ...current,
              market: marketId || undefined,
              region: market?.regionId ?? current.region,
            });
          }}
          className={selectClass}
        >
          <option value="">All markets</option>
          {availableMarkets.map((market) => (
            <option key={market.id} value={market.id}>
              {market.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Product" htmlFor="scope-product">
        <select
          id="scope-product"
          value={current.product ?? ""}
          onChange={(event) =>
            navigate({
              ...current,
              product: event.target.value || undefined,
            })
          }
          className={selectClass}
        >
          <option value="">All products</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Period" htmlFor="scope-period">
        <select
          id="scope-period"
          value={current.period ?? periods[periods.length - 1] ?? ""}
          onChange={(event) =>
            navigate({
              ...current,
              period: event.target.value || undefined,
            })
          }
          className={selectClass}
        >
          {periods.map((period) => (
            <option key={period} value={period}>
              {formatPeriodLabel(period)}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Map metric" htmlFor="scope-metric">
        <select
          id="scope-metric"
          value={current.metric ?? "growthPct"}
          onChange={(event) =>
            navigate({
              ...current,
              metric: event.target.value as MapMetric,
            })
          }
          className={selectClass}
        >
          {Object.entries(mapMetricLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>

      <button
        type="button"
        onClick={() => startTransition(() => router.push("/analyst", { scroll: false }))}
        className="ml-auto inline-flex h-9 items-center gap-1.5 border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RotateCcw aria-hidden="true" className="size-3" />
        Reset scope
      </button>
      {pending ? (
        <span className="font-mono text-[10px] text-muted-foreground" role="status">
          Updating views…
        </span>
      ) : null}
    </section>
  );
}

const selectClass =
  "h-8 w-full min-w-36 border bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-32")}>
      <label htmlFor={htmlFor} className="data-label mb-1 block">
        {label}
      </label>
      {children}
    </div>
  );
}
