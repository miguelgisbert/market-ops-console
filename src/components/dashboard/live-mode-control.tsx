"use client";

import { Radio } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { cn } from "@/lib/utils";

export function LiveModeControl({
  path,
  baseQuery,
  live,
  tick,
}: {
  path: string;
  baseQuery: string;
  live: boolean;
  tick: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function hrefFor(nextLive: boolean): string {
    const params = new URLSearchParams(baseQuery);
    if (nextLive) {
      params.set("live", "1");
      params.set("tick", "1");
    } else {
      params.delete("live");
      params.delete("tick");
    }
    const query = params.toString();
    return query ? `${path}?${query}` : path;
  }

  useEffect(() => {
    if (!live) return;
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(baseQuery);
      params.set("live", "1");
      params.set("tick", String(tick + 1));
      startTransition(() => {
        router.replace(`${path}?${params.toString()}`, { scroll: false });
      });
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [baseQuery, live, path, router, tick]);

  return (
    <button
      type="button"
      aria-pressed={live}
      aria-busy={pending}
      title={live ? "Pause simulated live updates" : "Start simulated live updates"}
      onClick={() =>
        startTransition(() => {
          router.push(hrefFor(!live), { scroll: false });
        })
      }
      className={cn(
        "inline-flex h-9 items-center gap-1.5 border px-2.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        live
          ? "border-status-ontrack/40 bg-status-ontrack/8 text-status-ontrack"
          : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <span className="relative flex size-2 items-center justify-center">
        <Radio aria-hidden="true" className="size-3" />
        {live ? (
          <span className="absolute inset-0 animate-ping rounded-full bg-status-ontrack/30 motion-reduce:animate-none" />
        ) : null}
      </span>
      {live ? `Live · ${tick}` : "Go live"}
    </button>
  );
}
