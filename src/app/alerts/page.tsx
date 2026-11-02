import { AlertConfigurator } from "@/components/alerts/alert-configurator";
import { dataIndex, dataset, getMarketSummaries } from "@/lib/data";
import { formatPeriodLabel } from "@/lib/format";

export const metadata = {
  title: "Alerts",
};

export default function AlertsPage() {
  const markets = getMarketSummaries(dataIndex);

  return (
    <div className="space-y-7">
      <header className="border-b pb-5">
        <p className="font-mono text-[11px] text-muted-foreground">Portfolio / Alerts</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] md:text-[38px]">
          Threshold configurator
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Flag a market or region when growth or forecast attainment crosses a threshold. The form
          validates with Zod, applies the change optimistically and rolls back if the save fails.
        </p>
      </header>

      <div className="grid gap-4 border bg-card px-4 py-3 sm:grid-cols-3">
        <div>
          <p className="data-label">Evaluation period</p>
          <p className="mt-1 font-mono text-lg font-medium">
            {formatPeriodLabel(dataset.meta.latestPeriod)}
          </p>
        </div>
        <div>
          <p className="data-label">Markets in scope</p>
          <p className="mt-1 font-mono text-lg font-medium">{dataset.markets.length}</p>
        </div>
        <div>
          <p className="data-label">Persistence</p>
          <p className="mt-1 text-xs text-muted-foreground">
            localStorage after a simulated save; no real backend.
          </p>
        </div>
      </div>

      <AlertConfigurator
        regions={dataset.regions}
        markets={markets.map((market) => ({
          id: market.id,
          name: market.name,
          regionId: market.regionId,
          growthPct: market.growthPct,
          forecastAttainmentPct: market.forecastAttainmentPct,
        }))}
      />
    </div>
  );
}
