"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { MapMetric } from "@/lib/dashboard/config";
import type { SeriesPoint } from "@/lib/data/schema";
import type { HeatmapRow, RadarEntity } from "@/lib/data/selectors";
import type { MapMarket } from "./choropleth-map";

const ChoroplethMap = dynamic(
  () => import("./choropleth-map").then((module) => module.ChoroplethMap),
  { ssr: false, loading: () => <ChartSkeleton heightClass="h-[320px]" /> },
);

const RadarComparison = dynamic(
  () => import("./radar-comparison").then((module) => module.RadarComparison),
  { ssr: false, loading: () => <ChartSkeleton heightClass="h-[360px]" /> },
);

const TimeSeriesChart = dynamic(
  () => import("./time-series-chart").then((module) => module.TimeSeriesChart),
  { ssr: false, loading: () => <ChartSkeleton heightClass="h-[340px]" /> },
);

const VarianceHeatmap = dynamic(
  () => import("./variance-heatmap").then((module) => module.VarianceHeatmap),
  { ssr: false, loading: () => <ChartSkeleton heightClass="h-[360px]" /> },
);

function ChartSkeleton({ heightClass }: { heightClass: string }) {
  return (
    <div
      className={`${heightClass} w-full animate-pulse bg-muted/40 motion-reduce:animate-none`}
      role="status"
      aria-label="Loading visualisation"
    />
  );
}

function useInView<T extends HTMLElement>(): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  return [ref, visible];
}

export function DeferredChoroplethMap(props: {
  markets: MapMarket[];
  metric: MapMetric;
  selectedMarketId?: string;
  baseParams: Record<string, string | undefined>;
}) {
  const [ref, visible] = useInView<HTMLDivElement>();
  return (
    <div ref={ref}>
      {visible ? <ChoroplethMap {...props} /> : <ChartSkeleton heightClass="h-[320px]" />}
    </div>
  );
}

export function DeferredRadarComparison({ entities }: { entities: RadarEntity[] }) {
  const [ref, visible] = useInView<HTMLDivElement>();
  return (
    <div ref={ref}>
      {visible ? (
        <RadarComparison entities={entities} />
      ) : (
        <ChartSkeleton heightClass="h-[360px]" />
      )}
    </div>
  );
}

export function DeferredTimeSeriesChart(props: {
  data: SeriesPoint[];
  entityName: string;
  selectedPeriod?: string;
}) {
  const [ref, visible] = useInView<HTMLDivElement>();
  return (
    <div ref={ref}>
      {visible ? <TimeSeriesChart {...props} /> : <ChartSkeleton heightClass="h-[340px]" />}
    </div>
  );
}

export function DeferredVarianceHeatmap(props: {
  rows: HeatmapRow[];
  periods: string[];
  selectedPeriod: string;
  selectedMarketId?: string;
  baseParams: Record<string, string | undefined>;
}) {
  const [ref, visible] = useInView<HTMLDivElement>();
  return (
    <div ref={ref}>
      {visible ? <VarianceHeatmap {...props} /> : <ChartSkeleton heightClass="h-[360px]" />}
    </div>
  );
}
