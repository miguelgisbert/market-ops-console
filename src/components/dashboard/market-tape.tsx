import Link from "next/link";
import type { MarketSummary } from "@/lib/data";
import { formatPercent, statusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

const statusRail = {
  "on-track": "bg-status-ontrack",
  "at-risk": "bg-status-atrisk",
  "off-track": "bg-status-offtrack",
} as const;

const statusText = {
  "on-track": "text-status-ontrack",
  "at-risk": "text-status-atrisk",
  "off-track": "text-status-offtrack",
} as const;

export function MarketTape({ markets }: { markets: MarketSummary[] }) {
  return (
    <section aria-labelledby="market-tape-heading">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="market-tape-heading" className="text-sm font-semibold">
            Market tape
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Latest period, ordered by risk. Select a market to inspect it.
          </p>
        </div>
        <p className="data-label">Attainment vs forecast</p>
      </div>
      <ol className="grid grid-cols-2 border-l border-t sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {markets.map((market) => (
          <li key={market.id} className="border-r border-b bg-card">
            <Link
              href={`/analyst?market=${market.id}`}
              className="group relative block h-full px-3 pb-3 pt-4 transition-colors hover:bg-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            >
              <span
                aria-hidden="true"
                className={cn("absolute inset-x-0 top-0 h-[3px]", statusRail[market.status])}
              />
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-medium">{market.iso2}</span>
                <span
                  className={cn(
                    "font-mono text-[10px] tabular-nums",
                    market.growthPct >= 0 ? "text-status-ontrack" : "text-status-offtrack",
                  )}
                >
                  {formatPercent(market.growthPct, { signed: true })}
                </span>
              </div>
              <p className="mt-1 truncate text-sm font-medium">{market.name}</p>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span className="font-mono text-lg font-medium tracking-[-0.04em] tabular-nums">
                  {formatPercent(market.forecastAttainmentPct)}
                </span>
                <span className="text-[10px] text-muted-foreground">of plan</span>
              </div>
              <div aria-hidden="true" className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full", statusRail[market.status])}
                  style={{
                    width: `${Math.min(100, Math.max(0, market.forecastAttainmentPct))}%`,
                  }}
                />
              </div>
              <p
                className={cn(
                  "mt-2 flex items-center gap-1.5 text-[10px]",
                  statusText[market.status],
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn("size-1.5 rounded-full", statusRail[market.status])}
                />
                {statusLabel(market.status)}
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
