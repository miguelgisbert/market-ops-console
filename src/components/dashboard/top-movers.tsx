import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { MarketSummary } from "@/lib/data/selectors";
import { formatCurrency, formatPercent, formatPeriodLabel } from "@/lib/format";

export function TopMovers({
  gainers,
  decliners,
  period,
}: {
  gainers: MarketSummary[];
  decliners: MarketSummary[];
  period: string;
}) {
  return (
    <section aria-labelledby="top-movers-heading" className="min-w-0 border bg-card">
      <div className="border-b px-4 py-3">
        <h2 id="top-movers-heading" className="text-sm font-semibold">
          Top movers
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Year-on-year growth, {formatPeriodLabel(period)}.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 sm:divide-x">
        <MoverList
          title="Fastest growing"
          markets={gainers}
          icon={<ArrowUpRight aria-hidden="true" className="size-3.5" />}
        />
        <MoverList
          title="Sharpest declines"
          markets={decliners}
          icon={<ArrowDownRight aria-hidden="true" className="size-3.5" />}
        />
      </div>
    </section>
  );
}

function MoverList({
  title,
  markets,
  icon,
}: {
  title: string;
  markets: MarketSummary[];
  icon: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3">
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        {icon}
        {title}
      </p>
      {markets.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">No markets in this direction.</p>
      ) : null}
      <ol className="mt-2 space-y-2">
        {markets.map((market, index) => (
          <li key={market.id} className="flex items-baseline justify-between gap-3">
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="w-3 font-mono text-[10px] text-muted-foreground">{index + 1}</span>
              <Link
                href={`/analyst?market=${market.id}`}
                className="truncate text-xs font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {market.name}
              </Link>
            </span>
            <span className="flex shrink-0 items-baseline gap-2">
              <span className="font-mono text-[10px] text-muted-foreground">
                {formatCurrency(market.revenue, { compact: true })}
              </span>
              <span
                className={`w-12 text-right font-mono text-xs tabular-nums ${
                  market.growthPct >= 0 ? "text-status-ontrack" : "text-status-offtrack"
                }`}
              >
                {formatPercent(market.growthPct, { signed: true })}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
