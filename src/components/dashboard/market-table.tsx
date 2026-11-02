import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buildAnalystHref } from "@/lib/dashboard/url";
import type { MarketSummary } from "@/lib/data/selectors";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";

export function MarketTable({
  markets,
  selectedMarketId,
  baseParams = {},
}: {
  markets: MarketSummary[];
  selectedMarketId?: string;
  baseParams?: Record<string, string | undefined>;
}) {
  return (
    <section aria-labelledby="market-table-heading" className="min-w-0 border bg-card">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b px-4 py-3">
        <div>
          <h2 id="market-table-heading" className="text-sm font-semibold">
            Market performance
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Latest-period KPIs in reporting currency.
          </p>
        </div>
        <span className="data-label">{markets.length} markets</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/35">
            <TableHead className="pl-4">Market</TableHead>
            <TableHead>Region</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Growth</TableHead>
            <TableHead className="text-right">Share</TableHead>
            <TableHead className="text-right">Attainment</TableHead>
            <TableHead className="pr-4">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {markets.map((market) => (
            <TableRow
              key={market.id}
              className={cn(market.id === selectedMarketId && "bg-accent/50")}
            >
              <TableCell className="pl-4">
                <Link
                  href={buildAnalystHref(baseParams, { market: market.id })}
                  aria-current={market.id === selectedMarketId ? "true" : undefined}
                  className="font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {market.name}
                </Link>
                <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                  {market.iso2}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{market.regionName}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatCurrency(market.revenue, { compact: true })}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-mono tabular-nums",
                  market.growthPct >= 0 ? "text-status-ontrack" : "text-status-offtrack",
                )}
              >
                {formatPercent(market.growthPct, { signed: true })}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatPercent(market.marketSharePct)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatPercent(market.forecastAttainmentPct)}
              </TableCell>
              <TableCell className="pr-4">
                <StatusBadge status={market.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
