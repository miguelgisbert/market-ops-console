import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RegionSummary } from "@/lib/data";
import { formatCurrency, formatPercent } from "@/lib/format";

export function RegionTable({ regions }: { regions: RegionSummary[] }) {
  return (
    <section aria-labelledby="region-table-heading" className="border bg-card">
      <div className="border-b px-4 py-3">
        <h2 id="region-table-heading" className="text-sm font-semibold">
          Regional performance
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Reporting-currency totals, latest period.
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
            <TableRow key={region.id}>
              <TableCell className="pl-4 font-medium">{region.name}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatCurrency(region.revenueUsd, "USD", { compact: true })}
              </TableCell>
              <TableCell
                className={`text-right font-mono tabular-nums ${
                  region.growthPct >= 0 ? "text-status-ontrack" : "text-status-offtrack"
                }`}
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
