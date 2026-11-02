"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { MarketStatus } from "@/lib/data/schema";
import { statusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export type CompareOption = {
  id: string;
  name: string;
  iso2: string;
  status: MarketStatus;
};

export function ComparePicker({
  options,
  selected,
  baseParams,
}: {
  options: CompareOption[];
  selected: string[];
  baseParams: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function update(next: string[]) {
    const params = new URLSearchParams();
    if (baseParams.region) params.set("region", baseParams.region);
    if (baseParams.market) params.set("market", baseParams.market);
    if (baseParams.product) params.set("product", baseParams.product);
    if (baseParams.period) params.set("period", baseParams.period);
    if (baseParams.metric) params.set("metric", baseParams.metric);
    if (next.length > 0) params.set("compare", next.join(","));
    startTransition(() => {
      router.push(`/analyst?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div aria-busy={pending}>
      <p className="mb-2 font-mono text-[10px] text-muted-foreground">
        Select up to five markets to compare
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = selected.includes(option.id);
          const disabled = !active && selected.length >= 5;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              disabled={disabled}
              onClick={() =>
                update(
                  active ? selected.filter((id) => id !== option.id) : [...selected, option.id],
                )
              }
              className={cn(
                "inline-flex items-center gap-1.5 border px-1.5 py-1 font-mono text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40",
                active
                  ? "border-primary bg-primary/8 text-foreground"
                  : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-1.5 rounded-full",
                  option.status === "on_track" && "bg-status-ontrack",
                  option.status === "at_risk" && "bg-status-atrisk",
                  option.status === "off_track" && "bg-status-offtrack",
                )}
              />
              {option.iso2}
              <span className="sr-only">
                {option.name}, {statusLabel(option.status)}
              </span>
            </button>
          );
        })}
      </div>
      {selected.length > 0 ? (
        <button
          type="button"
          onClick={() => update([])}
          className="mt-2 font-mono text-[10px] text-muted-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Reset comparison
        </button>
      ) : null}
    </div>
  );
}
