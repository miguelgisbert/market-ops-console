import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MarketSummary } from "@/lib/data/selectors";
import { formatCurrency, formatPercent, formatPeriodLabel } from "@/lib/format";

export function SelectedMarketPanel({
  market,
  period,
  productName,
}: {
  market: MarketSummary;
  period: string;
  productName?: string;
}) {
  const selectedIndex = market.series.findIndex((point) => point.period === period);
  const end = selectedIndex >= 0 ? selectedIndex + 1 : market.series.length;
  const recent = market.series.slice(Math.max(0, end - 8), end);
  const latest = market.series[selectedIndex] ?? market.series[market.series.length - 1];
  const anomaly = market.anomalies[market.anomalies.length - 1];

  return (
    <section aria-labelledby="selected-market-heading" className="min-w-0 border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-4">
        <div>
          <p className="data-label">Selected market{productName ? ` · ${productName}` : ""}</p>
          <h2
            id="selected-market-heading"
            className="mt-1 text-xl font-semibold tracking-[-0.02em]"
          >
            {market.name}
          </h2>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            {market.regionName} · {market.iso3} · {formatPeriodLabel(period)}
          </p>
        </div>
        <StatusBadge status={market.status} />
      </div>

      <dl className="grid grid-cols-2 border-b sm:grid-cols-4 sm:divide-x">
        <div className="border-b px-4 py-3 sm:border-b-0">
          <dt className="data-label">Revenue</dt>
          <dd className="mt-1 font-mono text-lg font-medium tabular-nums">
            {formatCurrency(latest.actual, { compact: true })}
          </dd>
          <dd className="font-mono text-[10px] text-muted-foreground">reporting currency</dd>
        </div>
        <div className="border-b px-4 py-3 sm:border-b-0">
          <dt className="data-label">Growth</dt>
          <dd
            className={`mt-1 font-mono text-lg font-medium tabular-nums ${
              market.growthPct >= 0 ? "text-status-ontrack" : "text-status-offtrack"
            }`}
          >
            {formatPercent(market.growthPct, { signed: true })}
          </dd>
          <dd className="font-mono text-[10px] text-muted-foreground">vs prior year</dd>
        </div>
        <div className="border-b px-4 py-3 sm:border-b-0">
          <dt className="data-label">Market share</dt>
          <dd className="mt-1 font-mono text-lg font-medium tabular-nums">
            {formatPercent(market.marketSharePct)}
          </dd>
          <dd className="font-mono text-[10px] text-muted-foreground">latest snapshot</dd>
        </div>
        <div className="px-4 py-3">
          <dt className="data-label">Attainment</dt>
          <dd className="mt-1 font-mono text-lg font-medium tabular-nums">
            {formatPercent(market.forecastAttainmentPct)}
          </dd>
          <dd className="font-mono text-[10px] text-muted-foreground">actual vs forecast</dd>
        </div>
      </dl>

      {anomaly ? (
        <p className="border-b px-4 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            Anomaly · {formatPeriodLabel(anomaly.period)}
          </span>{" "}
          {anomaly.note}
        </p>
      ) : null}

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
                point.forecast === 0 ? 0 : ((point.actual - point.forecast) / point.forecast) * 100;
              return (
                <TableRow
                  key={point.period}
                  className={point.period === period ? "bg-accent/50" : undefined}
                >
                  <TableCell className="py-1.5 pl-0 font-mono text-xs">
                    {formatPeriodLabel(point.period)}
                  </TableCell>
                  <TableCell className="py-1.5 text-right font-mono text-xs tabular-nums">
                    {formatCurrency(point.actual, { compact: true })}
                  </TableCell>
                  <TableCell className="py-1.5 text-right font-mono text-xs tabular-nums">
                    {formatCurrency(point.forecast, { compact: true })}
                  </TableCell>
                  <TableCell className="py-1.5 text-right font-mono text-xs tabular-nums">
                    {formatCurrency(point.priorYear, { compact: true })}
                  </TableCell>
                  <TableCell
                    className={`py-1.5 pr-0 text-right font-mono text-xs tabular-nums ${
                      variance >= 0 ? "text-status-ontrack" : "text-status-offtrack"
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
