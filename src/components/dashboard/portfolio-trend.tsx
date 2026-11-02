import type { SeriesPoint } from "@/lib/data/schema";
import { formatCurrency, formatPeriodLabel } from "@/lib/format";

const WIDTH = 620;
const HEIGHT = 150;
const PAD = 8;

function pointsFor(
  series: SeriesPoint[],
  accessor: (point: SeriesPoint) => number,
  min: number,
  max: number,
): string {
  return series
    .map((point, index) => {
      const x = PAD + (index / Math.max(1, series.length - 1)) * (WIDTH - PAD * 2);
      const ratio = max === min ? 0.5 : (accessor(point) - min) / (max - min);
      const y = HEIGHT - PAD - ratio * (HEIGHT - PAD * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function PortfolioTrend({ series }: { series: SeriesPoint[] }) {
  const values = series.flatMap((point) => [point.actual, point.forecast]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const actualPoints = pointsFor(series, (point) => point.actual, min, max);
  const forecastPoints = pointsFor(series, (point) => point.forecast, min, max);

  return (
    <div>
      <div
        className="relative"
        role="img"
        aria-label="Portfolio actual revenue against forecast over the last 24 periods"
      >
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" aria-hidden="true">
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={PAD}
              x2={WIDTH - PAD}
              y1={PAD + ratio * (HEIGHT - PAD * 2)}
              y2={PAD + ratio * (HEIGHT - PAD * 2)}
              stroke="var(--border)"
              strokeDasharray="2 5"
            />
          ))}
          <polyline
            points={forecastPoints}
            fill="none"
            stroke="var(--chart-3)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <polyline points={actualPoints} fill="none" stroke="var(--chart-1)" strokeWidth={2} />
        </svg>
      </div>
      <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
        <span>{formatPeriodLabel(series[0]?.period ?? "")}</span>
        <span className="flex gap-3">
          <span className="flex items-center gap-1">
            <span aria-hidden="true" className="h-0.5 w-3 bg-chart-1" />
            Actual
          </span>
          <span className="flex items-center gap-1">
            <span aria-hidden="true" className="h-0.5 w-3 border-t border-dashed border-chart-3" />
            Forecast
          </span>
        </span>
        <span>{formatPeriodLabel(series[series.length - 1]?.period ?? "")}</span>
      </div>
      <details className="mt-2 border-t pt-2">
        <summary className="cursor-pointer font-mono text-[10px] text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          View trend data
        </summary>
        <div className="mt-2 max-h-52 overflow-auto">
          <table className="w-full text-xs">
            <caption className="sr-only">Portfolio actual and forecast revenue</caption>
            <thead className="sticky top-0 bg-card">
              <tr className="border-b">
                <th scope="col" className="py-1.5 pr-2 text-left font-medium">
                  Period
                </th>
                <th scope="col" className="px-2 py-1.5 text-right font-medium">
                  Actual
                </th>
                <th scope="col" className="py-1.5 pl-2 text-right font-medium">
                  Forecast
                </th>
              </tr>
            </thead>
            <tbody>
              {series.map((point) => (
                <tr key={point.period} className="border-b last:border-0">
                  <th
                    scope="row"
                    className="py-1.5 pr-2 text-left font-mono font-normal text-muted-foreground"
                  >
                    {formatPeriodLabel(point.period)}
                  </th>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                    {formatCurrency(point.actual, { compact: true })}
                  </td>
                  <td className="py-1.5 pl-2 text-right font-mono tabular-nums">
                    {formatCurrency(point.forecast, { compact: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
