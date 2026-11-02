"use client";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { RadarEntity } from "@/lib/data/selectors";
import { formatCurrency, formatPercent } from "@/lib/format";

const axes = [
  { key: "revenue", label: "Revenue index" },
  { key: "growth", label: "Growth" },
  { key: "share", label: "Market share" },
  { key: "attainment", label: "Attainment" },
] as const;

const colors = [
  "var(--chart-1)",
  "var(--chart-4)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-5)",
] as const;

const dashPatterns: Array<string | undefined> = [undefined, "5 3", "2 2", "7 2 2 2", "1 3"];

export function RadarComparison({ entities }: { entities: RadarEntity[] }) {
  const chartData = axes.map((axis) => {
    const row: Record<string, string | number> = { metric: axis.label };
    for (const entity of entities) {
      row[`${entity.kind}:${entity.id}`] = entity.values[axis.key];
    }
    return row;
  });

  return (
    <div>
      <div
        className="h-[320px] w-full"
        role="img"
        aria-label={`Radar comparison of ${entities.map((entity) => entity.name).join(", ")} across revenue, growth, share and attainment`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} outerRadius="72%">
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            {entities.map((entity, index) => (
              <Radar
                key={`${entity.kind}:${entity.id}`}
                name={entity.name}
                dataKey={`${entity.kind}:${entity.id}`}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.08}
                strokeWidth={1.8}
                strokeDasharray={dashPatterns[index % dashPatterns.length]}
                isAnimationActive={false}
              />
            ))}
            <Tooltip
              formatter={(value, name) => [Number(value).toFixed(0), String(name)]}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 2,
                fontSize: 11,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <details className="mt-3 border-t pt-2">
        <summary className="cursor-pointer font-mono text-[10px] text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          View data table
        </summary>
        <div className="mt-2 overflow-auto">
          <table className="w-full text-xs">
            <caption className="sr-only">Raw KPI comparison for the selected entities</caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="py-1.5 pr-2 text-left font-medium">
                  Entity
                </th>
                <th scope="col" className="px-2 py-1.5 text-right font-medium">
                  Revenue
                </th>
                <th scope="col" className="px-2 py-1.5 text-right font-medium">
                  Growth
                </th>
                <th scope="col" className="px-2 py-1.5 text-right font-medium">
                  Share
                </th>
                <th scope="col" className="py-1.5 pl-2 text-right font-medium">
                  Attainment
                </th>
              </tr>
            </thead>
            <tbody>
              {entities.map((entity) => (
                <tr key={`${entity.kind}:${entity.id}`} className="border-b last:border-0">
                  <th scope="row" className="py-1.5 pr-2 text-left font-normal">
                    {entity.name}
                  </th>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                    {formatCurrency(entity.raw.revenue, { compact: true })}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                    {formatPercent(entity.raw.growth, { signed: true })}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                    {formatPercent(entity.raw.share)}
                  </td>
                  <td className="py-1.5 pl-2 text-right font-mono tabular-nums">
                    {formatPercent(entity.raw.attainment)}
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
