import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductSummary } from "@/lib/data/selectors";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductTable({
  products,
  selectedProductId,
  baseParams = {},
}: {
  products: ProductSummary[];
  selectedProductId?: string;
  baseParams?: Record<string, string | undefined>;
}) {
  return (
    <section aria-labelledby="product-table-heading" className="min-w-0 border bg-card">
      <div className="border-b px-4 py-3">
        <h2 id="product-table-heading" className="text-sm font-semibold">
          Product contribution
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Share is within the current scope, selected period.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/35">
            <TableHead className="pl-4">Product</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Growth</TableHead>
            <TableHead className="text-right">Attainment</TableHead>
            <TableHead className="text-right">Share</TableHead>
            <TableHead className="pr-4">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className={cn(product.id === selectedProductId && "bg-accent/50")}
            >
              <TableCell className="pl-4">
                <Link
                  href={hrefForProduct(product.id, baseParams)}
                  aria-current={product.id === selectedProductId ? "true" : undefined}
                  className="font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {product.name}
                </Link>
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatCurrency(product.revenue, { compact: true })}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-mono tabular-nums",
                  product.growthPct >= 0 ? "text-status-ontrack" : "text-status-offtrack",
                )}
              >
                {formatPercent(product.growthPct, { signed: true })}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatPercent(product.forecastAttainmentPct)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatPercent(product.sharePct)}
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

function hrefForProduct(productId: string, baseParams: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  if (baseParams.region) params.set("region", baseParams.region);
  if (baseParams.market) params.set("market", baseParams.market);
  if (baseParams.period) params.set("period", baseParams.period);
  if (baseParams.metric) params.set("metric", baseParams.metric);
  if (baseParams.compare) params.set("compare", baseParams.compare);
  params.set("product", productId);
  return `/analyst?${params.toString()}`;
}
