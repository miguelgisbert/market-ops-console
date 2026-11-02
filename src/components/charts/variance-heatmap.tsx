"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { buildAnalystHref } from "@/lib/dashboard/url";
import type { HeatmapRow } from "@/lib/data/selectors";
import { formatPercent, formatPeriodLabel, formatPeriodShort, statusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

type FocusCell = { row: number; column: number };

function bucketClass(variance: number): string {
  if (variance <= -15) return "bg-status-offtrack text-background";
  if (variance <= -5) return "bg-status-offtrack/55 text-foreground";
  if (variance < -1) return "bg-status-offtrack/25 text-foreground";
  if (variance <= 1) return "bg-muted text-muted-foreground";
  if (variance <= 5) return "bg-status-ontrack/25 text-foreground";
  if (variance <= 15) return "bg-status-ontrack/55 text-foreground";
  return "bg-status-ontrack text-background";
}

export function VarianceHeatmap({
  rows,
  periods,
  selectedPeriod,
  selectedMarketId,
  baseParams,
}: {
  rows: HeatmapRow[];
  periods: string[];
  selectedPeriod: string;
  selectedMarketId?: string;
  baseParams: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const selectedColumn = Math.max(0, periods.indexOf(selectedPeriod));
  const initialRow = Math.max(
    0,
    rows.findIndex((row) => row.marketId === selectedMarketId),
  );
  const [focus, setFocus] = useState<FocusCell>({
    row: initialRow,
    column: selectedColumn,
  });
  const cellRefs = useRef(new Map<string, HTMLButtonElement>());

  function focusCell(row: number, column: number) {
    const key = `${row}:${column}`;
    setFocus({ row, column });
    requestAnimationFrame(() => cellRefs.current.get(key)?.focus());
  }

  function selectCell(row: HeatmapRow, period: string) {
    router.push(buildAnalystHref(baseParams, { market: row.marketId, period }), { scroll: false });
  }

  function onKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    rowIndex: number,
    columnIndex: number,
  ) {
    let nextRow = rowIndex;
    let nextColumn = columnIndex;

    if (event.key === "ArrowRight") nextColumn = Math.min(periods.length - 1, columnIndex + 1);
    else if (event.key === "ArrowLeft") nextColumn = Math.max(0, columnIndex - 1);
    else if (event.key === "ArrowDown") nextRow = Math.min(rows.length - 1, rowIndex + 1);
    else if (event.key === "ArrowUp") nextRow = Math.max(0, rowIndex - 1);
    else if (event.key === "Home") nextColumn = 0;
    else if (event.key === "End") nextColumn = periods.length - 1;
    else return;

    event.preventDefault();
    focusCell(nextRow, nextColumn);
  }

  return (
    <div>
      <div className="overflow-x-auto [contain:layout]">
        <table className="min-w-[980px] w-full border-separate border-spacing-0 text-xs">
          <caption className="sr-only">
            Forecast variance heat map by market and period. Each cell shows the signed percentage
            difference between actual and forecast.
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 border-b bg-card px-2 py-2 text-left font-medium"
              >
                Market
              </th>
              {periods.map((period, columnIndex) => (
                <th
                  key={period}
                  scope="col"
                  className={cn(
                    "border-b px-0.5 py-2 text-center font-mono text-[9px] font-medium text-muted-foreground",
                    period === selectedPeriod && "bg-accent/60 text-foreground",
                  )}
                >
                  <span aria-hidden="true">
                    {columnIndex % 3 === 0 ? formatPeriodShort(period) : ""}
                  </span>
                  <span className="sr-only">{formatPeriodLabel(period)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.marketId}>
                <th
                  scope="row"
                  className={cn(
                    "sticky left-0 z-10 border-b bg-card px-2 py-1 text-left font-normal",
                    row.marketId === selectedMarketId && "bg-accent/60",
                  )}
                >
                  <span className="flex items-center gap-1.5 whitespace-nowrap">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        row.status === "on_track" && "bg-status-ontrack",
                        row.status === "at_risk" && "bg-status-atrisk",
                        row.status === "off_track" && "bg-status-offtrack",
                      )}
                    />
                    <span className="font-mono text-[10px]">{row.iso2}</span>
                    <span>{row.name}</span>
                    <span className="sr-only">, {statusLabel(row.status)}</span>
                  </span>
                </th>
                {row.cells.map((cell, columnIndex) => {
                  const isFocused = focus.row === rowIndex && focus.column === columnIndex;
                  const isSelected =
                    row.marketId === selectedMarketId && cell.period === selectedPeriod;
                  return (
                    <td key={cell.period} className="border-b p-0.5">
                      <button
                        type="button"
                        ref={(element) => {
                          const key = `${rowIndex}:${columnIndex}`;
                          if (element) cellRefs.current.set(key, element);
                          else cellRefs.current.delete(key);
                        }}
                        tabIndex={isFocused ? 0 : -1}
                        aria-current={isSelected ? "true" : undefined}
                        aria-label={`${row.name}, ${formatPeriodLabel(cell.period)}, variance ${formatPercent(cell.variancePct, { signed: true })}`}
                        title={`${row.name} · ${formatPeriodLabel(cell.period)} · actual ${formatPercent((cell.actual / cell.forecast) * 100)} of forecast`}
                        onKeyDown={(event) => onKeyDown(event, rowIndex, columnIndex)}
                        onClick={() => selectCell(row, cell.period)}
                        className={cn(
                          "block h-6 w-full min-w-7 cursor-pointer px-0.5 text-center font-mono text-[9px] tabular-nums transition-[box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                          bucketClass(cell.variancePct),
                          isSelected && "ring-2 ring-foreground ring-inset",
                        )}
                      >
                        {cell.variancePct.toFixed(0)}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-2 font-mono text-[10px] text-muted-foreground">
        <span>Variance vs forecast</span>
        <span className="flex items-center gap-1">
          <span aria-hidden="true" className="size-2.5 bg-status-offtrack" /> ≤ −15%
        </span>
        <span className="flex items-center gap-1">
          <span aria-hidden="true" className="size-2.5 bg-status-offtrack/55" /> −15 to −5%
        </span>
        <span className="flex items-center gap-1">
          <span aria-hidden="true" className="size-2.5 bg-muted" /> ±1%
        </span>
        <span className="flex items-center gap-1">
          <span aria-hidden="true" className="size-2.5 bg-status-ontrack/55" /> 5 to 15%
        </span>
        <span className="flex items-center gap-1">
          <span aria-hidden="true" className="size-2.5 bg-status-ontrack" /> ≥ 15%
        </span>
        <span className="ml-auto">Arrow keys move between cells · Enter selects</span>
      </div>
    </div>
  );
}
