import type { MarketSummary } from "@/lib/data";
import {
  formatCurrency,
  formatPercent,
  formatPeriodLabel,
} from "@/lib/format";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/dashboard/status-badge";

export function SelectedMarketPanel({ market }: { market: MarketSummary }) {
  const recent = market.series.slice(-8);

  return (
    <section aria-labelledby="selected-market-heading" className="border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-4">
        <div>
          <p className="data-label">Selected market</p>
          <h2
            id="selected-market-heading"
            className="mt-1 text-xl font-semibold tracking-[-0.02em]"
          >
            {market.name}
          </h2>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            {market.regionName} · {market.iso2} · {market.currency}
          </p>
        </div>
        <StatusBadge status={market.status} />
      </div>

      <dl className="grid grid-cols-2 border-b sm:grid-cols-4 sm:divide-x">
        <div className="border-b px-4 py-3 sm:border-b-0">
          <dt className="data-label">Revenue</dt>
          <dd className="mt-1 font-mono text-lg font-medium tabular-nums">
            {formatCurrency(market.revenueLocal, market.currency, {
              compact: true,
            })}
          </dd>
          <dd className="font-mono text-[10px] text-muted-foreground">
            {formatCurrency(market.revenueUsd, "USD", { compact: true })} USD
          </dd>
        </div>
        <div className="border-b px-4 py-3 sm:border-b-0">
          <dt className="data-label">Growth</dt>
          <dd
            className={`mt-1 font-mono text-lg font-medium tabular-nums ${
              market.growthPct >= 0
                ? "text-status-ontrack"
                : "text-status-offtrack"
            }`}
          >
            {formatPercent(market.growthPct, { signed: true })}
          </dd>
          <dd className="font-mono text-[10px] text-muted-foreground">
            vs prior year
          </dd>
        </div>
        <div className="border-b px-4 py-3 sm:border-b-0">
          <dt className="data-label">Regional share</dt>
          <dd className="mt-1 font-mono text-lg font-medium tabular-nums">
            {formatPercent(market.marketSharePct)}
          </dd>
          <dd className="font-mono text-[10px] text-muted-foreground">
            of {market.regionName}
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="data-label">Attainment</dt>
          <dd className="mt-1 font-mono text-lg font-medium tabular-nums">
            {formatPercent(market.forecastAttainmentPct)}
          </dd>
          <dd className="font-mono text-[10px] text-muted-foreground">
            actual vs forecast
          </dd>
        </div>
      </dl>

      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold">Recent periods</h3>
        <Table className="mt-2">
          <TableCaption className="sr-only">
            Recent actual, forecast and prior-year revenue for {market.name}.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="h-8 pl-0">Period</TableHead>
              <TableHead className="h-8 text-right">Actual</TableHead>
              <TableHead className="h-8 text-right">Forecast</TableHead>
              <TableHead className="h-8 text-right">Prior year</TableHead>
              <TableHead className="h-8 pr-0 text-right">Variance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((point) => {
              const variance =
                ((point.revenue - point.forecast) / point.forecast) * 100;
              return (
                <TableRow key={point.period}>
                  <TableCell className="py-1.5 pl-0 font-mono text-xs">
                    {formatPeriodLabel(point.period)}
                  </TableCell>
                  <TableCell className="py-1.5 text-right font-mono text-xs tabular-nums">
                    {formatCurrency(point.revenue, market.currency, {
                      compact: true,
                    })}
                  </TableCell>
                  <TableCell className="py-1.5 text-right font-mono text-xs tabular-nums">
                    {formatCurrency(point.forecast, market.currency, {
                      compact: true,
                    })}
                  </TableCell>
                  <TableCell className="py-1.5 text-right font-mono text-xs tabular-nums">
                    {formatCurrency(point.priorYear, market.currency, {
                      compact: true,
                    })}
                  </TableCell>
                  <TableCell
                    className={`py-1.5 pr-0 text-right font-mono text-xs tabular-nums ${
                      variance >= 0
                        ? "text-status-ontrack"
                        : "text-status-offtrack"
                    }`}
                  >
                    {formatPercent(variance, { signed: true })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
