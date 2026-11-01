import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ProductTable } from "@/components/analyst/product-table";
import { RegionTable } from "@/components/analyst/region-table";
import { SelectedMarketPanel } from "@/components/analyst/selected-market-panel";
import { KpiBand, type KpiMetric } from "@/components/dashboard/kpi-band";
import { MarketTable } from "@/components/dashboard/market-table";
import {
  getDataset,
  getMarketSummaries,
  getPortfolioSummary,
  getProductSummaries,
  getRegionSummaries,
} from "@/lib/data";
import { formatCurrency, formatPercent, formatPeriodLabel } from "@/lib/format";

export const metadata = {
  title: "Analyst",
};

export default function AnalystPage({ searchParams }: PageProps<"/analyst">) {
  return (
    <Suspense fallback={<AnalystFallback />}>
      <AnalystContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AnalystContent({
  searchParams,
}: {
  searchParams: PageProps<"/analyst">["searchParams"];
}) {
  const params = await searchParams;
  const marketParam = params.market;
  const marketId = typeof marketParam === "string" ? marketParam : null;

  const dataset = getDataset();
  const markets = getMarketSummaries(dataset);
  const selectedMarket = marketId ? markets.find((market) => market.id === marketId) : undefined;
  const portfolio = getPortfolioSummary(dataset);
  const regions = getRegionSummaries(dataset);
  const products = getProductSummaries(dataset);

  const metrics: KpiMetric[] = selectedMarket
    ? [
        {
          label: "Market revenue",
          value: formatCurrency(selectedMarket.revenueUsd, "USD", {
            compact: true,
          }),
          detail: `${formatCurrency(selectedMarket.revenueLocal, selectedMarket.currency, { compact: true })} local`,
        },
        {
          label: "Growth",
          value: formatPercent(selectedMarket.growthPct, { signed: true }),
          detail: "vs prior year",
          tone: selectedMarket.growthPct >= 0 ? "positive" : "negative",
        },
        {
          label: "Regional share",
          value: formatPercent(selectedMarket.marketSharePct),
          detail: `of ${selectedMarket.regionName}`,
        },
        {
          label: "Attainment",
          value: formatPercent(selectedMarket.forecastAttainmentPct),
          detail: "of forecast",
          tone: selectedMarket.forecastAttainmentPct >= 98 ? "positive" : "warning",
        },
      ]
    : [
        {
          label: "Portfolio revenue",
          value: formatCurrency(portfolio.revenueUsd, "USD", { compact: true }),
          detail: formatPeriodLabel(portfolio.latestPeriod),
        },
        {
          label: "Growth",
          value: formatPercent(portfolio.growthPct, { signed: true }),
          detail: "vs prior year",
          tone: portfolio.growthPct >= 0 ? "positive" : "negative",
        },
        {
          label: "Attainment",
          value: formatPercent(portfolio.forecastAttainmentPct),
          detail: "of forecast",
          tone: portfolio.forecastAttainmentPct >= 98 ? "positive" : "warning",
        },
        {
          label: "Exceptions",
          value: `${portfolio.marketsAtRisk}`,
          detail: `of ${portfolio.marketCount} markets`,
          tone: portfolio.marketsAtRisk > 0 ? "warning" : "positive",
        },
      ];

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[11px] text-muted-foreground">
            Portfolio / {selectedMarket ? selectedMarket.name : "Analyst view"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] md:text-[38px]">
            {selectedMarket ? selectedMarket.name : "Analyst workspace"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {selectedMarket
              ? "Market-level detail with recent actuals, forecast and regional context."
              : "Full metrics, product contribution and every market in the portfolio."}
          </p>
        </div>
        <div className="flex shrink-0 items-stretch border bg-card">
          <Link
            href="/"
            className="flex items-center gap-1.5 border-r px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft aria-hidden="true" className="size-3" />
            Executive view
          </Link>
          <span
            aria-current="page"
            className="flex items-center gap-1.5 bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
          >
            Analyst view
            <ArrowUpRight aria-hidden="true" className="size-3" />
          </span>
        </div>
      </header>

      <KpiBand metrics={metrics} />

      {selectedMarket ? <SelectedMarketPanel market={selectedMarket} /> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <RegionTable regions={regions} />
        <ProductTable products={products} />
      </div>

      <MarketTable markets={markets} />
    </div>
  );
}

function AnalystFallback() {
  return (
    <div
      className="space-y-7"
      role="status"
      aria-busy="true"
      aria-label="Loading analyst workspace"
    >
      <header className="border-b pb-5">
        <div className="h-3 w-48 bg-muted" />
        <div className="mt-3 h-9 w-80 bg-muted" />
        <div className="mt-3 h-3 w-full max-w-xl bg-muted" />
      </header>
      <div className="grid border sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="border-b px-4 py-4 lg:border-b-0 lg:border-r">
            <div className="h-2.5 w-24 bg-muted" />
            <div className="mt-3 h-7 w-28 bg-muted" />
            <div className="mt-2 h-2.5 w-32 bg-muted" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-72 border bg-card" />
        <div className="h-72 border bg-card" />
      </div>
      <div className="h-96 border bg-card" />
    </div>
  );
}
