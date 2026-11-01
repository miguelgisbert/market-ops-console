import Link from "next/link";
import { AppNav } from "./app-nav";
import { getDataset } from "@/lib/data";
import { formatPeriodLabel } from "@/lib/format";

export function AppShell({ children }: { children: React.ReactNode }) {
  const dataset = getDataset();
  const latestPeriod = dataset.metadata.periods[dataset.metadata.periods.length - 1];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-stretch gap-5 px-4 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-sm bg-primary font-mono text-sm font-semibold text-primary-foreground"
            >
              M
            </span>
            <span className="leading-none">
              <span className="block text-[15px] font-semibold tracking-[-0.01em]">
                Meridian
              </span>
              <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
                Market operations
              </span>
            </span>
          </Link>

          <div className="hidden sm:block">
            <AppNav />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-1.5 border px-2 py-1 font-mono text-[10px] text-muted-foreground md:inline-flex">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-status-ontrack"
              />
              {dataset.metadata.source === "synthetic" ? "Demo data" : "Starter pack"}
            </span>
            <span className="border px-2 py-1 font-mono text-[10px] text-foreground">
              {formatPeriodLabel(latestPeriod)}
            </span>
            <span
              aria-label="Signed in as Miguel"
              className="grid size-8 place-items-center rounded-full border bg-card font-mono text-[10px] font-medium"
            >
              MG
            </span>
          </div>
        </div>
        <div className="border-t sm:hidden">
          <div className="mx-auto flex h-11 max-w-[1600px] items-stretch px-4">
            <AppNav />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 lg:px-8 lg:py-8">
        {children}
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-1 px-4 py-4 font-mono text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>Meridian market operations console</span>
          <span>
            Synthetic dataset · {dataset.markets.length} markets · {dataset.products.length}{" "}
            products
          </span>
        </div>
      </footer>
    </div>
  );
}
