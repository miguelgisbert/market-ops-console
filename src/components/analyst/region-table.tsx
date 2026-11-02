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
import type { RegionSummary } from "@/lib/data/selectors";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export function RegionTable({
  regions,
  selectedRegionId,
  baseParams = {},
}: {
  regions: RegionSummary[];
  selectedRegionId?: string;
  baseParams?: Record<string, string | undefined>;
}) {
  return (
    <section aria-labelledby="region-table-heading" className="min-w-0 border bg-card">
      <div className="border-b px-4 py-3">
        <h2 id="region-table-heading" className="text-sm font-semibold">
          Regional performance
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Reporting-currency totals for the selected period.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/35">
            <TableHead className="pl-4">Region</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Growth</TableHead>
            <TableHead className="text-right">Attainment</TableHead>
            <TableHead className="text-right">Markets at risk</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {regions.map((region) => (
            <TableRow
              key={region.id}
              className={cn(region.id === selectedRegionId && "bg-accent/50")}
            >
              <TableCell className="pl-4">
                <Link
                  href={buildAnalystHref(baseParams, { region: region.id, market: undefined })}
                  aria-current={region.id === selectedRegionId ? "true" : undefined}
                  className="font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {region.name}
                </Link>
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatCurrency(region.revenue, { compact: true })}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-mono tabular-nums",
                  region.growthPct >= 0 ? "text-status-ontrack" : "text-status-offtrack",
                )}
              >
                {formatPercent(region.growthPct, { signed: true })}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatPercent(region.forecastAttainmentPct)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {region.marketsAtRisk} of {region.marketCount}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
