import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { type AttentionItem, AttentionList } from "@/components/dashboard/attention-list";
import { KpiBand, type KpiMetric } from "@/components/dashboard/kpi-band";
import { MarketTable } from "@/components/dashboard/market-table";
import { MarketTape } from "@/components/dashboard/market-tape";
import { PortfolioTrend } from "@/components/dashboard/portfolio-trend";
import { TopMovers } from "@/components/dashboard/top-movers";
import {
  dataIndex,
  getMarketSummaries,
  getPortfolioSummary,
  getTopMovers,
  statusRank,
} from "@/lib/data";
import { formatCurrency, formatPercent, formatPeriodLabel } from "@/lib/format";

export default function OverviewPage() {
  const markets = getMarketSummaries(dataIndex);
  const portfolio = getPortfolioSummary(dataIndex);
  const movers = getTopMovers(dataIndex, { limit: 3 });
  const periodLabel = formatPeriodLabel(portfolio.latestPeriod);

  const attention: AttentionItem[] = markets
    .filter((market) => market.status !== "on_track")
    .map((market) => {
      const anomaly = market.anomalies[market.anomalies.length - 1];
      return {
        id: market.id,
        name: market.name,
        regionName: market.regionName,
        status: market.status,
        period: anomaly?.period ?? portfolio.latestPeriod,
        note:
          anomaly?.note ??
          `Revenue landed ${formatPercent(market.forecastAttainmentPct)} of forecast, with growth of ${formatPercent(market.growthPct, { signed: true })} against the prior year.`,
      };
    })
    .sort((left, right) => {
      const risk = statusRank(right.status) - statusRank(left.status);
      return risk !== 0 ? risk : right.period.localeCompare(left.period);
    })
    .slice(0, 5);

  const metrics: KpiMetric[] = [
    {
      label: "Portfolio revenue",
      value: formatCurrency(portfolio.revenue, { compact: true }),
      detail: `${periodLabel}, all markets`,
    },
    {
      label: "Growth vs prior year",
      value: formatPercent(portfolio.growthPct, { signed: true }),
      detail: "Like-for-like, reporting currency",
      tone: portfolio.growthPct >= 0 ? "positive" : "negative",
    },
    {
      label: "Forecast attainment",
      value: formatPercent(portfolio.forecastAttainmentPct),
      detail: "Actual revenue against plan",
      tone: portfolio.forecastAttainmentPct >= 100 ? "positive" : "warning",
    },
    {
      label: "Markets at risk",
      value: `${portfolio.marketsAtRisk} of ${portfolio.marketCount}`,
      detail: `${portfolio.marketsOffTrack} off track`,
      tone: portfolio.marketsAtRisk > 0 ? "warning" : "positive",
    },
  ];

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[11px] text-muted-foreground">
            Portfolio / All regions / {periodLabel}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] md:text-[38px]">
            Portfolio overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Thirteen markets, five products, one view of where the portfolio is winning and where
            the forecast is slipping.
          </p>
        </div>
        <div className="flex shrink-0 items-stretch border bg-card">
          <span
            aria-current="page"
            className="border-r bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
          >
            Executive view
          </span>
          <Link
            href="/analyst"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Analyst view
            <ArrowUpRight aria-hidden="true" className="size-3" />
          </Link>
        </div>
      </header>

      <MarketTape markets={markets} />

      <KpiBand metrics={metrics} />

      <div className="grid gap-6 xl:grid-cols-2">
        <section aria-labelledby="portfolio-trend-heading" className="border bg-card">
          <div className="border-b px-4 py-3">
            <h2 id="portfolio-trend-heading" className="text-sm font-semibold">
              Portfolio trajectory
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Actual against forecast, last 24 periods.
            </p>
          </div>
          <div className="px-4 py-4">
            <PortfolioTrend series={portfolio.series} />
          </div>
        </section>
        <TopMovers
          gainers={movers.gainers}
          decliners={movers.decliners}
          period={portfolio.latestPeriod}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
        <MarketTable markets={markets} />
        <AttentionList items={attention} />
      </div>
    </div>
  );
}
