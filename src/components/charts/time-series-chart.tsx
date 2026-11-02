"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SeriesPoint } from "@/lib/data/schema";
import { formatCurrency, formatPercent, formatPeriodAxis, formatPeriodLabel } from "@/lib/format";

const seriesColors = {
  actual: "var(--chart-1)",
  forecast: "var(--chart-3)",
  priorYear: "var(--chart-2)",
} as const;

export function TimeSeriesChart({
  data,
  entityName,
  selectedPeriod,
}: {
  data: SeriesPoint[];
  entityName: string;
  selectedPeriod?: string;
}) {
  const chartData = data.map((point) => ({
    ...point,
    label: formatPeriodLabel(point.period),
  }));
  const values = data.flatMap((point) => [point.actual, point.forecast, point.priorYear]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max(1, (max - min) * 0.08);
  const domain: [number, number] = [Math.floor(min - padding), Math.ceil(max + padding)];

  return (
    <div>
      <div
        className="h-[300px] w-full"
        role="img"
        aria-label={`Revenue trend for ${entityName}: actual, forecast and prior year`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              tickFormatter={(value) => formatPeriodAxis(String(value))}
              interval="preserveStartEnd"
              minTickGap={24}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              tickFormatter={(value) => formatCurrency(Number(value), { compact: true })}
              axisLine={false}
              tickLine={false}
              width={54}
              domain={domain}
            />
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(Number(value), { compact: true }),
                String(name),
              ]}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 2,
                fontSize: 11,
              }}
              labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
              labelFormatter={(value) => formatPeriodLabel(String(value))}
            />
            <Legend
              verticalAlign="top"
              height={28}
              iconType="plainline"
              wrapperStyle={{ fontSize: 11 }}
            />
            {selectedPeriod ? (
              <ReferenceLine
                x={selectedPeriod}
                stroke="var(--foreground)"
                strokeDasharray="3 3"
                strokeOpacity={0.55}
              />
            ) : null}
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke={seriesColors.actual}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Forecast"
              stroke={seriesColors.forecast}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="priorYear"
              name="Prior year"
              stroke={seriesColors.priorYear}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <details className="mt-3 border-t pt-2">
        <summary className="cursor-pointer font-mono text-[10px] text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          View data table
        </summary>
        <div className="mt-2 max-h-64 overflow-auto">
          <table className="w-full text-xs">
            <caption className="sr-only">
              Actual, forecast and prior-year revenue for {entityName}
            </caption>
            <thead className="sticky top-0 bg-card">
              <tr className="border-b">
                <th scope="col" className="py-1.5 pr-2 text-left font-medium">
                  Period
                </th>
                <th scope="col" className="px-2 py-1.5 text-right font-medium">
                  Actual
                </th>
                <th scope="col" className="px-2 py-1.5 text-right font-medium">
                  Forecast
                </th>
                <th scope="col" className="px-2 py-1.5 text-right font-medium">
                  Prior year
                </th>
                <th scope="col" className="py-1.5 pl-2 text-right font-medium">
                  Variance
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((point) => {
                const variance =
                  point.forecast === 0
                    ? 0
                    : ((point.actual - point.forecast) / point.forecast) * 100;
                return (
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
                    <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                      {formatCurrency(point.forecast, { compact: true })}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                      {formatCurrency(point.priorYear, { compact: true })}
                    </td>
                    <td
                      className={`py-1.5 pl-2 text-right font-mono tabular-nums ${
                        variance >= 0 ? "text-status-ontrack" : "text-status-offtrack"
                      }`}
                    >
                      {formatPercent(variance, { signed: true })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
