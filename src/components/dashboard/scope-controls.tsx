"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { SelectField } from "@/components/form/select-field";
import { type MapMetric, mapMetricLabels } from "@/lib/dashboard/config";
import { formatPeriodLabel } from "@/lib/format";

type Option = { id: string; name: string; regionId?: string };

export type ScopeState = {
  region?: string;
  market?: string;
  product?: string;
  period?: string;
  metric?: MapMetric;
  compare?: string;
  live?: string;
  tick?: string;
};

const allValue = "__all__";

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
    if (next.live === "1") {
      params.set("live", "1");
      if (next.tick) params.set("tick", next.tick);
    }
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
      <SelectField
        id="scope-region"
        label="Region"
        value={current.region ?? allValue}
        options={[
          { value: allValue, label: "All regions" },
          ...regions.map((region) => ({ value: region.id, label: region.name })),
        ]}
        onValueChange={(value) =>
          navigate({
            ...current,
            region: value === allValue ? undefined : value,
            market: undefined,
          })
        }
        className="w-36"
      />

      <SelectField
        id="scope-market"
        label="Market"
        value={current.market ?? allValue}
        options={[
          { value: allValue, label: "All markets" },
          ...availableMarkets.map((market) => ({
            value: market.id,
            label: market.name,
          })),
        ]}
        onValueChange={(value) => {
          const market = markets.find((entry) => entry.id === value);
          navigate({
            ...current,
            market: value === allValue ? undefined : value,
            region: market?.regionId ?? current.region,
          });
        }}
        className="w-36"
      />

      <SelectField
        id="scope-product"
        label="Product"
        value={current.product ?? allValue}
        options={[
          { value: allValue, label: "All products" },
          ...products.map((product) => ({ value: product.id, label: product.name })),
        ]}
        onValueChange={(value) =>
          navigate({
            ...current,
            product: value === allValue ? undefined : value,
          })
        }
        className="w-36"
      />

      <SelectField
        id="scope-period"
        label="Period"
        value={current.period ?? periods[periods.length - 1]}
        options={periods.map((period) => ({
          value: period,
          label: formatPeriodLabel(period),
        }))}
        onValueChange={(value) =>
          navigate({
            ...current,
            period: value || undefined,
          })
        }
        className="w-36"
      />

      <SelectField
        id="scope-metric"
        label="Map metric"
        value={current.metric ?? "growthPct"}
        options={Object.entries(mapMetricLabels).map(([value, label]) => ({
          value,
          label,
        }))}
        onValueChange={(value) =>
          navigate({
            ...current,
            metric: value as MapMetric,
          })
        }
        className="w-40"
      />

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
