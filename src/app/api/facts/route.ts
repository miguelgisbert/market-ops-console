import { dataset } from "@/lib/data";
import { createLiveDataset } from "@/lib/data/live";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const regionId = url.searchParams.get("region");
  const marketId = url.searchParams.get("market");
  const productId = url.searchParams.get("product");
  const tickValue = Number.parseInt(url.searchParams.get("tick") ?? "", 10);
  const activeDataset =
    Number.isFinite(tickValue) && tickValue > 0 ? createLiveDataset(dataset, tickValue) : dataset;

  const markets = new Map(dataset.markets.map((market) => [market.id, market]));
  const products = new Map(dataset.products.map((product) => [product.id, product]));

  const rows = activeDataset.series
    .filter((row) => {
      const market = markets.get(row.marketId);
      if (!market) return false;
      if (regionId && market.regionId !== regionId) return false;
      if (marketId && row.marketId !== marketId) return false;
      if (productId && row.productId !== productId) return false;
      return true;
    })
    .map((row) => ({
      marketId: row.marketId,
      marketName: markets.get(row.marketId)?.name ?? row.marketId,
      productId: row.productId,
      productName: products.get(row.productId)?.name ?? row.productId,
      period: row.period,
      actual: row.actual,
      forecast: row.forecast,
      units: row.units,
      priorYear: row.priorYear,
    }))
    .sort((left, right) => {
      const period = right.period.localeCompare(left.period);
      if (period !== 0) return period;
      const market = left.marketName.localeCompare(right.marketName);
      if (market !== 0) return market;
      return left.productName.localeCompare(right.productName);
    });

  return Response.json({ total: rows.length, rows }, { headers: { "Cache-Control": "no-store" } });
}
