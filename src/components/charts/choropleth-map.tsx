"use client";

import worldMapJson from "@/data/world-map.json";
import type { MapMetric } from "@/lib/dashboard/config";
import { mapMetricLabels } from "@/lib/dashboard/config";
import { buildAnalystHref } from "@/lib/dashboard/url";
import type { MarketStatus } from "@/lib/data/schema";
import { formatCurrency, formatPercent, statusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

type WorldMap = {
  width: number;
  height: number;
  countries: Array<{ key: string; id: string; name: string; path: string }>;
  markets: Record<
    string,
    { path: string; centroid: [number, number]; bbox: [[number, number], [number, number]] }
  >;
};

export type MapMarket = {
  id: string;
  name: string;
  iso3: string;
  iso2: string;
  regionId: string;
  regionName: string;
  revenue: number;
  growthPct: number;
  marketSharePct: number;
  forecastAttainmentPct: number;
  status: MarketStatus;
};

const world = worldMapJson as unknown as WorldMap;

const labelOffsets: Record<string, [number, number]> = {
  US: [0, 0],
  CA: [0, 2],
  MX: [-2, 4],
  GB: [-18, -8],
  DE: [12, -2],
  FR: [-22, 4],
  ES: [-24, 16],
  IT: [18, 12],
  JP: [10, 4],
  CN: [0, -2],
  IN: [4, 6],
  AU: [0, 4],
  BR: [0, 0],
};

function viewBoxFor(markets: MapMarket[]): { value: string; width: number } {
  if (markets.length >= 10) {
    return { value: `0 0 ${world.width} ${world.height}`, width: world.width };
  }
  const boxes = markets
    .map((market) => world.markets[market.iso3]?.bbox)
    .filter((box): box is [[number, number], [number, number]] => Boolean(box));
  if (boxes.length === 0) {
    return { value: `0 0 ${world.width} ${world.height}`, width: world.width };
  }
  const minX = Math.min(...boxes.map((box) => box[0][0]));
  const minY = Math.min(...boxes.map((box) => box[0][1]));
  const maxX = Math.max(...boxes.map((box) => box[1][0]));
  const maxY = Math.max(...boxes.map((box) => box[1][1]));
  const aspect = world.width / world.height;
  const boxWidth = Math.max(160, (maxX - minX) * 1.35);
  const boxHeight = Math.max(100, (maxY - minY) * 1.35);
  const width = Math.max(boxWidth, boxHeight * aspect);
  const height = width / aspect;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  return {
    value: `${centerX - width / 2} ${centerY - height / 2} ${width} ${height}`,
    width,
  };
}

const metricAccessors: Record<MapMetric, (market: MapMarket) => number> = {
  growthPct: (market) => market.growthPct,
  forecastAttainmentPct: (market) => market.forecastAttainmentPct,
  marketSharePct: (market) => market.marketSharePct,
  revenue: (market) => market.revenue,
};

function formatMetric(metric: MapMetric, value: number): string {
  if (metric === "revenue") return formatCurrency(value, { compact: true });
  if (metric === "growthPct") return formatPercent(value, { signed: true });
  return formatPercent(value);
}

type Bucket = { color: string; opacity: number };

function bucketFor(metric: MapMetric, value: number, max: number): Bucket {
  if (metric === "growthPct") {
    if (value <= -5) return { color: "var(--status-offtrack)", opacity: 1 };
    if (value < 0) return { color: "var(--status-offtrack)", opacity: 0.55 };
    if (value < 5) return { color: "var(--muted-foreground)", opacity: 0.18 };
    if (value <= 10) return { color: "var(--status-ontrack)", opacity: 0.55 };
    return { color: "var(--status-ontrack)", opacity: 1 };
  }
  if (metric === "forecastAttainmentPct") {
    if (value < 95) return { color: "var(--status-offtrack)", opacity: 1 };
    if (value < 99) return { color: "var(--status-offtrack)", opacity: 0.55 };
    if (value <= 102) return { color: "var(--muted-foreground)", opacity: 0.18 };
    if (value <= 105) return { color: "var(--status-ontrack)", opacity: 0.55 };
    return { color: "var(--status-ontrack)", opacity: 1 };
  }
  const ratio = max === 0 ? 0 : value / max;
  if (metric === "marketSharePct") {
    if (value < 10) return { color: "var(--chart-1)", opacity: 0.2 };
    if (value < 20) return { color: "var(--chart-1)", opacity: 0.4 };
    if (value < 30) return { color: "var(--chart-1)", opacity: 0.6 };
    if (value < 40) return { color: "var(--chart-1)", opacity: 0.8 };
    return { color: "var(--chart-1)", opacity: 1 };
  }
  if (ratio < 0.2) return { color: "var(--chart-1)", opacity: 0.2 };
  if (ratio < 0.4) return { color: "var(--chart-1)", opacity: 0.4 };
  if (ratio < 0.6) return { color: "var(--chart-1)", opacity: 0.6 };
  if (ratio < 0.8) return { color: "var(--chart-1)", opacity: 0.8 };
  return { color: "var(--chart-1)", opacity: 1 };
}

function legendItems(metric: MapMetric, max: number): Array<{ label: string; bucket: Bucket }> {
  if (metric === "growthPct") {
    return [
      { label: "≤ −5%", bucket: bucketFor(metric, -6, max) },
      { label: "−5 to 0%", bucket: bucketFor(metric, -1, max) },
      { label: "0 to 5%", bucket: bucketFor(metric, 1, max) },
      { label: "5 to 10%", bucket: bucketFor(metric, 6, max) },
      { label: "> 10%", bucket: bucketFor(metric, 11, max) },
    ];
  }
  if (metric === "forecastAttainmentPct") {
    return [
      { label: "< 95%", bucket: bucketFor(metric, 94, max) },
      { label: "95 to 99%", bucket: bucketFor(metric, 96, max) },
      { label: "99 to 102%", bucket: bucketFor(metric, 100, max) },
      { label: "102 to 105%", bucket: bucketFor(metric, 103, max) },
      { label: "> 105%", bucket: bucketFor(metric, 106, max) },
    ];
  }
  if (metric === "marketSharePct") {
    return [
      { label: "< 10%", bucket: bucketFor(metric, 8, max) },
      { label: "10 to 20%", bucket: bucketFor(metric, 12, max) },
      { label: "20 to 30%", bucket: bucketFor(metric, 22, max) },
      { label: "30 to 40%", bucket: bucketFor(metric, 32, max) },
      { label: "> 40%", bucket: bucketFor(metric, 42, max) },
    ];
  }
  return [
    {
      label: `< ${formatCurrency(max * 0.2, { compact: true })}`,
      bucket: bucketFor(metric, max * 0.1, max),
    },
    {
      label: formatCurrency(max * 0.4, { compact: true }),
      bucket: bucketFor(metric, max * 0.3, max),
    },
    {
      label: formatCurrency(max * 0.6, { compact: true }),
      bucket: bucketFor(metric, max * 0.5, max),
    },
    {
      label: formatCurrency(max * 0.8, { compact: true }),
      bucket: bucketFor(metric, max * 0.7, max),
    },
    { label: `≥ ${formatCurrency(max, { compact: true })}`, bucket: bucketFor(metric, max, max) },
  ];
}

export function ChoroplethMap({
  markets,
  metric,
  selectedMarketId,
  baseParams,
}: {
  markets: MapMarket[];
  metric: MapMetric;
  selectedMarketId?: string;
  baseParams: Record<string, string | undefined>;
}) {
  const accessor = metricAccessors[metric];
  const max = Math.max(...markets.map(accessor), 1);
  const values = new Map(markets.map((market) => [market.id, accessor(market)]));
  const viewBox = viewBoxFor(markets);
  const labelScale = Math.max(0.25, viewBox.width / world.width);
  const labelSize = Math.min(8, Math.max(3.2, viewBox.width * 0.012));

  return (
    <div>
      <figure className="relative overflow-hidden border bg-background">
        <figcaption className="sr-only">
          World map coloured by {mapMetricLabels[metric].toLowerCase()} for {markets.length}{" "}
          markets. Each country label is a link to its market.
        </figcaption>
        <svg viewBox={viewBox.value} className="block h-auto w-full">
          <title>
            {`World map coloured by ${mapMetricLabels[metric].toLowerCase()} for ${markets.length} markets`}
          </title>
          {world.countries.map((country) => (
            <path
              key={country.key}
              d={country.path}
              fill="var(--muted)"
              stroke="var(--background)"
              strokeWidth={0.5}
            />
          ))}
          {markets.map((market) => {
            const shape = world.markets[market.iso3];
            if (!shape) return null;
            const value = values.get(market.id) ?? 0;
            const bucket = bucketFor(metric, value, max);
            const selected = market.id === selectedMarketId;
            return (
              <g key={market.id}>
                <a
                  href={buildAnalystHref(baseParams, {
                    region: market.regionId,
                    market: market.id,
                  })}
                  aria-current={selected ? "page" : undefined}
                  aria-label={`${market.name}: ${mapMetricLabels[metric]} ${formatMetric(metric, value)}. Open market.`}
                  className="map-market cursor-pointer focus-visible:outline-none"
                >
                  <path
                    d={shape.path}
                    fill={bucket.color}
                    fillOpacity={bucket.opacity}
                    stroke={selected ? "var(--foreground)" : "var(--background)"}
                    strokeWidth={selected ? 1.8 : 0.7}
                  >
                    <title>{`${market.name}: ${formatMetric(metric, value)}`}</title>
                  </path>
                </a>
                <text
                  x={shape.centroid[0] + (labelOffsets[market.iso2]?.[0] ?? 0) * labelScale}
                  y={shape.centroid[1] + (labelOffsets[market.iso2]?.[1] ?? 0) * labelScale}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none font-mono font-semibold"
                  fontSize={labelSize}
                  fill="var(--foreground)"
                  stroke="var(--background)"
                  strokeWidth={Math.max(0.5, labelSize * 0.25)}
                  paintOrder="stroke"
                >
                  {market.iso2}
                </text>
              </g>
            );
          })}
        </svg>
      </figure>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t pt-2 font-mono text-[10px] text-muted-foreground">
        <span>{mapMetricLabels[metric]}</span>
        {legendItems(metric, max).map((item) => (
          <span key={item.label} className="flex items-center gap-1">
            <span
              aria-hidden="true"
              className="size-2.5"
              style={{
                backgroundColor: item.bucket.color,
                opacity: item.bucket.opacity,
              }}
            />
            {item.label}
          </span>
        ))}
      </div>

      <details className="mt-2 border-t pt-2">
        <summary className="cursor-pointer font-mono text-[10px] text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          View map data table
        </summary>
        <div className="mt-2 overflow-auto">
          <table className="w-full text-xs">
            <caption className="sr-only">Market values used by the choropleth map</caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="py-1.5 pr-2 text-left font-medium">
                  Market
                </th>
                <th scope="col" className="px-2 py-1.5 text-left font-medium">
                  Region
                </th>
                <th scope="col" className="px-2 py-1.5 text-right font-medium">
                  Growth
                </th>
                <th scope="col" className="px-2 py-1.5 text-right font-medium">
                  Share
                </th>
                <th scope="col" className="px-2 py-1.5 text-right font-medium">
                  Attainment
                </th>
                <th scope="col" className="px-2 py-1.5 text-right font-medium">
                  Revenue
                </th>
                <th scope="col" className="py-1.5 pl-2 text-left font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {markets.map((market) => (
                <tr key={market.id} className="border-b last:border-0">
                  <th scope="row" className="py-1.5 pr-2 text-left font-normal">
                    {market.name}
                    <span className="ml-1 font-mono text-[10px] text-muted-foreground">
                      {market.iso2}
                    </span>
                  </th>
                  <td className="px-2 py-1.5 text-muted-foreground">{market.regionName}</td>
                  <td
                    className={cn(
                      "px-2 py-1.5 text-right font-mono tabular-nums",
                      market.growthPct >= 0 ? "text-status-ontrack" : "text-status-offtrack",
                    )}
                  >
                    {formatPercent(market.growthPct, { signed: true })}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                    {formatPercent(market.marketSharePct)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                    {formatPercent(market.forecastAttainmentPct)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                    {formatCurrency(market.revenue, { compact: true })}
                  </td>
                  <td className="py-1.5 pl-2">{statusLabel(market.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
