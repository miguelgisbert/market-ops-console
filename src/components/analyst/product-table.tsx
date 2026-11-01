import type { ProductSummary } from "@/lib/data";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/dashboard/status-badge";

export function ProductTable({ products }: { products: ProductSummary[] }) {
  return (
    <section aria-labelledby="product-table-heading" className="border bg-card">
      <div className="border-b px-4 py-3">
        <h2 id="product-table-heading" className="text-sm font-semibold">
          Product contribution
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          All markets combined, latest period.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/35">
            <TableHead className="pl-4">Product</TableHead>
            <TableHead>Family</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Growth</TableHead>
            <TableHead className="text-right">Attainment</TableHead>
            <TableHead className="text-right">Portfolio share</TableHead>
            <TableHead className="pr-4">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="pl-4 font-medium">{product.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {product.family}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatCurrency(product.revenueUsd, "USD", { compact: true })}
              </TableCell>
              <TableCell
                className={`text-right font-mono tabular-nums ${
                  product.growthPct >= 0
                    ? "text-status-ontrack"
                    : "text-status-offtrack"
                }`}
              >
                {formatPercent(product.growthPct, { signed: true })}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatPercent(product.forecastAttainmentPct)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatPercent(product.portfolioSharePct)}
              </TableCell>
              <TableCell className="pr-4">
                <StatusBadge status={product.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
