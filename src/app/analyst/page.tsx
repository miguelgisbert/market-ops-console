import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ProductTable } from "@/components/analyst/product-table";
import { RegionTable } from "@/components/analyst/region-table";
import { SelectedMarketPanel } from "@/components/analyst/selected-market-panel";
import { ChartPanel } from "@/components/charts/chart-panel";
import { ChoroplethMap } from "@/components/charts/choropleth-map";
import { RadarComparison } from "@/components/charts/radar-comparison";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { VarianceHeatmap } from "@/components/charts/variance-heatmap";
import { ComparePicker } from "@/components/dashboard/compare-picker";
import { KpiBand, type KpiMetric } from "@/components/dashboard/kpi-band";
import { MarketTable } from "@/components/dashboard/market-table";
import { ScopeControls } from "@/components/dashboard/scope-controls";
import { type MapMetric, mapMetricLabels, mapMetricSchema } from "@/lib/dashboard/config";
import {
  type DataScope,
  dataIndex,
  dataset,
  getHeatmapData,
  getKpisForScope,
  getMarketSummaries,
  getProductSummaries,
  getRadarComparison,
  getRegionSummaries,
  getSeriesForScope,
  resolvePeriod,
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
  const period = resolvePeriod(
    dataIndex,
    typeof params.period === "string" ? params.period : undefined,
  );
  const marketParam = typeof params.market === "string" ? params.market : undefined;
  const marketRecord = marketParam ? dataIndex.marketsById.get(marketParam) : undefined;
  const regionParam = typeof params.region === "string" ? params.region : undefined;
  const regionId =
    marketRecord?.regionId ??
    (regionParam && dataIndex.regionsById.has(regionParam) ? regionParam : undefined);
  const productId =
    typeof params.product === "string" && dataIndex.productsById.has(params.product)
      ? params.product
      : undefined;
  const parsedMetric = mapMetricSchema.safeParse(params.metric);
  const metric: MapMetric = parsedMetric.success ? parsedMetric.data : "growthPct";

  const markets = getMarketSummaries(dataIndex, { period, regionId, productId });
  const selectedMarket = marketRecord
    ? markets.find((market) => market.id === marketRecord.id)
    : undefined;
  const regions = getRegionSummaries(dataIndex, { period, productId });
  const selectedRegion = regionId ? dataIndex.regionsById.get(regionId) : undefined;
  const products = getProductSummaries(dataIndex, {
    period,
    regionId,
    marketId: selectedMarket?.id,
  });
  const selectedProduct = productId ? dataIndex.productsById.get(productId) : undefined;

  const scope: DataScope = {
    regionId,
    marketId: selectedMarket?.id,
    productId,
  };
  const scopeKpis = getKpisForScope(dataIndex, scope, period);
  const scopeSeries = getSeriesForScope(dataIndex, scope);
  const scopeName = buildScopeName(
    selectedMarket?.name ?? selectedRegion?.name,
    selectedProduct?.name,
  );
  const periodLabel = formatPeriodLabel(period);

  const compareRaw = typeof params.compare === "string" ? params.compare : "";
  const allMarkets = getMarketSummaries(dataIndex, { period });
  const defaultCompare = defaultCompareIds(allMarkets);
  const compareIds = (
    compareRaw
      ? compareRaw
          .split(",")
          .filter((id) => dataIndex.marketsById.has(id))
          .slice(0, 5)
      : defaultCompare
  ).filter((id, index, list) => list.indexOf(id) === index);
  const radarEntities = getRadarComparison(
    dataIndex,
    compareIds.map((id) => ({ kind: "market" as const, id })),
    period,
  );

  const baseParams: Record<string, string | undefined> = {
    region: regionId,
    market: selectedMarket?.id,
    product: productId,
    period,
    metric,
    compare: compareRaw || undefined,
  };
  const chartParams: Record<string, string | undefined> = {
    region: regionId,
    product: productId,
    period,
    metric,
    compare: compareRaw || undefined,
  };

  const marketsAtRisk = markets.filter((market) => market.status !== "on_track").length;
  const metrics: KpiMetric[] = [
    {
      label: "Revenue",
      value: formatCurrency(scopeKpis.revenue, { compact: true }),
      detail: `${scopeName}, ${periodLabel}`,
    },
    {
      label: "Growth",
      value: formatPercent(scopeKpis.growthPct, { signed: true }),
      detail: "vs prior year",
      tone: scopeKpis.growthPct >= 0 ? "positive" : "negative",
    },
    {
      label: "Forecast attainment",
      value: formatPercent(scopeKpis.forecastAttainmentPct),
      detail: "actual against plan",
      tone: scopeKpis.forecastAttainmentPct >= 100 ? "positive" : "warning",
    },
    selectedMarket || productId
      ? {
          label: "Market share",
          value: formatPercent(scopeKpis.sharePct),
          detail: selectedMarket
            ? productId
              ? `of ${selectedMarket.name}`
              : "latest snapshot"
            : "of selected scope",
        }
      : {
          label: "Markets at risk",
          value: `${marketsAtRisk} of ${markets.length}`,
          detail: `${markets.filter((market) => market.status === "off_track").length} off track`,
          tone: marketsAtRisk > 0 ? "warning" : "positive",
        },
  ];

  const mapMarkets = markets.map((market) => ({
    id: market.id,
    name: market.name,
    iso3: market.iso3,
    iso2: market.iso2,
    regionId: market.regionId,
    regionName: market.regionName,
    revenue: market.revenue,
    growthPct: market.growthPct,
    marketSharePct: market.marketSharePct,
    forecastAttainmentPct: market.forecastAttainmentPct,
    status: market.status,
  }));

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Breadcrumbs
            period={period}
            metric={metric}
            regionId={regionId}
            regionName={selectedRegion?.name}
            marketId={selectedMarket?.id}
            marketName={selectedMarket?.name}
            productId={productId}
            productName={selectedProduct?.name}
          />
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] md:text-[38px]">
            {scopeName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {selectedProduct
              ? `${selectedProduct.name} performance within the current scope, ${periodLabel}.`
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

      <ScopeControls
        regions={dataset.regions}
        markets={dataset.markets.map((market) => ({
          id: market.id,
          name: market.name,
          regionId: market.regionId,
        }))}
        products={dataset.products}
        periods={dataset.meta.periods}
        current={{
          region: regionId,
          market: selectedMarket?.id,
          product: productId,
          period,
          metric,
          compare: compareRaw || undefined,
        }}
      />

      <KpiBand metrics={metrics} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,1fr)]">
        <ChartPanel
          id="map-heading"
          title={`Market map · ${mapMetricLabels[metric]}`}
          description="Select a country to drill in. Use the scope controls to change the metric."
        >
          <ChoroplethMap
            markets={mapMarkets}
            metric={metric}
            selectedMarketId={selectedMarket?.id}
            baseParams={chartParams}
          />
        </ChartPanel>

        <ChartPanel
          id="radar-heading"
          title="Market comparison"
          description="Revenue index, growth, share and attainment on a 0–100 scale."
          action={
            <span className="font-mono text-[10px] text-muted-foreground">
              {radarEntities.length} selected
            </span>
          }
        >
          <ComparePicker
            options={allMarkets.map((market) => ({
              id: market.id,
              name: market.name,
              iso2: market.iso2,
              status: market.status,
            }))}
            selected={compareIds}
            baseParams={{
              region: regionId,
              market: selectedMarket?.id,
              product: productId,
              period,
              metric,
            }}
          />
          <div className="mt-3">
            <RadarComparison entities={radarEntities} />
          </div>
        </ChartPanel>
      </div>

      <ChartPanel
        id="timeseries-heading"
        title={`Actual vs forecast vs prior year · ${scopeName}`}
        description={`Monthly revenue through ${periodLabel}.`}
      >
        <TimeSeriesChart data={scopeSeries} entityName={scopeName} selectedPeriod={period} />
      </ChartPanel>

      {selectedMarket ? (
        <SelectedMarketPanel
          market={selectedMarket}
          period={period}
          productName={selectedProduct?.name}
        />
      ) : null}

      <ChartPanel
        id="heatmap-heading"
        title="Forecast variance heat map"
        description="Markets × periods. Signed variance against forecast; select a cell to focus the other views."
      >
        <VarianceHeatmap
          rows={getHeatmapData(dataIndex, { regionId, productId })}
          periods={dataset.meta.periods}
          selectedPeriod={period}
          selectedMarketId={selectedMarket?.id}
          baseParams={chartParams}
        />
      </ChartPanel>

      <div className="grid gap-6 xl:grid-cols-2">
        <RegionTable regions={regions} selectedRegionId={regionId} baseParams={chartParams} />
        <ProductTable products={products} selectedProductId={productId} baseParams={baseParams} />
      </div>

      <MarketTable
        markets={markets}
        selectedMarketId={selectedMarket?.id}
        baseParams={chartParams}
      />
    </div>
  );
}

function buildScopeName(entityName?: string, productName?: string): string {
  if (entityName && productName) return `${entityName} · ${productName}`;
  return entityName ?? productName ?? "Portfolio";
}

function defaultCompareIds(markets: ReturnType<typeof getMarketSummaries>): string[] {
  const risky = markets.filter((market) => market.status !== "on_track");
  const pool = risky.length >= 3 ? risky : markets;
  return pool.slice(0, 3).map((market) => market.id);
}

function Breadcrumbs({
  period,
  metric,
  regionId,
  regionName,
  marketId,
  marketName,
  productId,
  productName,
}: {
  period: string;
  metric: MapMetric;
  regionId?: string;
  regionName?: string;
  marketId?: string;
  marketName?: string;
  productId?: string;
  productName?: string;
}) {
  const base = new URLSearchParams({ period, metric });
  const regionParams = new URLSearchParams(base);
  if (regionId) regionParams.set("region", regionId);
  const marketParams = new URLSearchParams(regionParams);
  if (marketId) marketParams.set("market", marketId);
  const productParams = new URLSearchParams(marketParams);
  if (productId) productParams.set("product", productId);

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 font-mono text-[11px] text-muted-foreground">
        <li>
          <Link
            href={`/analyst?${base.toString()}`}
            className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Portfolio
          </Link>
        </li>
        {regionId ? (
          <>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/analyst?${regionParams.toString()}`}
                className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {regionName}
              </Link>
            </li>
          </>
        ) : null}
        {marketId ? (
          <>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/analyst?${marketParams.toString()}`}
                aria-current={!productId ? "page" : undefined}
                className="text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {marketName}
              </Link>
            </li>
          </>
        ) : null}
        {productId ? (
          <>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/analyst?${productParams.toString()}`}
                aria-current="page"
                className="text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {productName}
              </Link>
            </li>
          </>
        ) : null}
      </ol>
    </nav>
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
      <div className="h-16 border bg-card" />
      <div className="grid border sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="border-b px-4 py-4 lg:border-b-0 lg:border-r">
            <div className="h-2.5 w-24 bg-muted" />
            <div className="mt-3 h-7 w-28 bg-muted" />
            <div className="mt-2 h-2.5 w-32 bg-muted" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,1fr)]">
        <div className="h-[420px] border bg-card" />
        <div className="h-[420px] border bg-card" />
      </div>
      <div className="h-80 border bg-card" />
      <div className="h-96 border bg-card" />
    </div>
  );
}
