import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { MarketStatus } from "@/lib/data";
import { formatPeriodLabel } from "@/lib/format";
import { StatusBadge } from "./status-badge";

export type AttentionItem = {
  id: string;
  name: string;
  regionName: string;
  status: MarketStatus;
  period: string;
  note: string;
};

export function AttentionList({ items }: { items: AttentionItem[] }) {
  return (
    <section aria-labelledby="attention-heading" className="border bg-card">
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 id="attention-heading" className="text-sm font-semibold">
            Needs attention
          </h2>
          <span className="font-mono text-[10px] text-muted-foreground">
            {items.length} {items.length === 1 ? "exception" : "exceptions"}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Latest anomalies, highest severity first.
        </p>
      </div>
      {items.length === 0 ? (
        <p className="px-4 py-8 text-sm text-muted-foreground">
          No material exceptions in the latest period.
        </p>
      ) : (
        <ol className="divide-y">
          {items.map((item) => (
            <li key={`${item.id}-${item.period}`} className="group px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/analyst?market=${item.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.name}
                    <ArrowUpRight aria-hidden="true" className="size-3 text-muted-foreground" />
                  </Link>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {item.regionName} · {formatPeriodLabel(item.period)}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.note}</p>
            </li>
          ))}
        </ol>
      )}
      <div className="border-t px-4 py-3">
        <Link
          href="/assistant"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Ask the assistant about these exceptions
          <ArrowUpRight aria-hidden="true" className="size-3" />
        </Link>
      </div>
    </section>
  );
}
