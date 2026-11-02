"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { CircleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { formatCurrency, formatPercent, formatPeriodLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

const factRowSchema = z.object({
  marketId: z.string(),
  marketName: z.string(),
  productId: z.string(),
  productName: z.string(),
  period: z.string(),
  actual: z.number(),
  forecast: z.number(),
  units: z.number(),
  priorYear: z.number(),
});

const factsResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  rows: z.array(factRowSchema),
});

type FactRow = z.infer<typeof factRowSchema>;

const ROW_HEIGHT = 34;
const COLUMNS = 8;

export function VirtualizedFactTable({
  regionId,
  marketId,
  productId,
  tick,
}: {
  regionId?: string;
  marketId?: string;
  productId?: string;
  tick?: string;
}) {
  const [rows, setRows] = useState<FactRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [activated, setActivated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  const params = new URLSearchParams();
  if (regionId) params.set("region", regionId);
  if (marketId) params.set("market", marketId);
  if (productId) params.set("product", productId);
  if (tick) params.set("tick", tick);
  const query = params.toString();
  const requestUrl = `/api/facts${query ? `?${query}` : ""}${
    reloadKey ? `${query ? "&" : "?"}retry=${reloadKey}` : ""
  }`;

  useEffect(() => {
    if (activated) return;
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setActivated(true);
          observer.disconnect();
        }
      },
      { rootMargin: "320px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [activated]);

  useEffect(() => {
    if (!activated) return;
    const controller = new AbortController();
    if (hasLoadedRef.current) setUpdating(true);
    else setLoading(true);
    setError(null);

    fetch(requestUrl, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("The fact table could not be loaded.");
        return factsResponseSchema.parse(await response.json());
      })
      .then((payload) => {
        setRows(payload.rows);
        setTotal(payload.total);
        hasLoadedRef.current = true;
        setLoading(false);
        setUpdating(false);
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "The fact table could not be loaded.");
        setLoading(false);
        setUpdating(false);
      });

    return () => controller.abort();
  }, [activated, requestUrl]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const paddingTop = virtualRows[0]?.start ?? 0;
  const paddingBottom =
    virtualizer.getTotalSize() - (virtualRows[virtualRows.length - 1]?.end ?? 0);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="fact-table-heading"
      className="min-w-0 border bg-card"
    >
      <div className="flex flex-wrap items-end justify-between gap-2 border-b px-4 py-3">
        <div>
          <h2 id="fact-table-heading" className="text-sm font-semibold">
            Virtualised fact table
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Market × product × period rows, newest first. Only visible rows are mounted.
          </p>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          {updating ? "Updating…" : `${total.toLocaleString("en-US")} rows`}
        </span>
      </div>

      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-destructive">
          <span className="flex items-center gap-1.5">
            <CircleAlert aria-hidden="true" className="size-3.5" />
            {error}
          </span>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="border px-2 py-1 font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-px px-4 py-3" role="status" aria-label="Loading fact table">
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-7 bg-muted/60" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">
          No fact rows match the current scope.
        </p>
      ) : (
        <div ref={scrollRef} className="h-[420px] overflow-auto [contain:layout]">
          <table
            className="w-full min-w-[940px] border-collapse text-[11px]"
            aria-rowcount={total + 1}
            aria-colcount={COLUMNS}
          >
            <caption className="sr-only">
              Virtualised fact table of market, product and period revenue.
            </caption>
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b">
                {[
                  "Market",
                  "Product",
                  "Period",
                  "Actual",
                  "Forecast",
                  "Variance",
                  "Units",
                  "Prior year",
                ].map((label, index) => (
                  <th
                    key={label}
                    scope="col"
                    className={cn(
                      "px-2 py-2 font-mono text-[10px] font-medium text-muted-foreground",
                      index >= 3 ? "text-right" : "text-left",
                    )}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paddingTop > 0 ? (
                <tr>
                  <td colSpan={COLUMNS} style={{ height: paddingTop }} />
                </tr>
              ) : null}
              {virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index];
                if (!row) return null;
                const variance =
                  row.forecast === 0 ? 0 : ((row.actual - row.forecast) / row.forecast) * 100;
                return (
                  <tr
                    key={virtualRow.key}
                    aria-rowindex={virtualRow.index + 2}
                    className="border-b"
                    style={{ height: ROW_HEIGHT }}
                  >
                    <td className="max-w-40 truncate px-2 py-1.5">{row.marketName}</td>
                    <td className="max-w-36 truncate px-2 py-1.5">{row.productName}</td>
                    <td className="px-2 py-1.5 text-muted-foreground">
                      {formatPeriodLabel(row.period)}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                      {formatCurrency(row.actual, { compact: true })}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                      {formatCurrency(row.forecast, { compact: true })}
                    </td>
                    <td
                      className={cn(
                        "px-2 py-1.5 text-right font-mono tabular-nums",
                        variance >= 0 ? "text-status-ontrack" : "text-status-offtrack",
                      )}
                    >
                      {formatPercent(variance, { signed: true })}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                      {row.units.toLocaleString("en-US")}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                      {formatCurrency(row.priorYear, { compact: true })}
                    </td>
                  </tr>
                );
              })}
              {paddingBottom > 0 ? (
                <tr>
                  <td colSpan={COLUMNS} style={{ height: paddingBottom }} />
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t px-4 py-2 font-mono text-[10px] text-muted-foreground">
        {rows.length > 0
          ? `Mounted ${virtualRows.length} of ${rows.length.toLocaleString("en-US")} rows`
          : "Waiting for rows…"}
      </div>
    </section>
  );
}
