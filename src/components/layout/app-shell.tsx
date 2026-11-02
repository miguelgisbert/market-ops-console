import { Database } from "lucide-react";
import Link from "next/link";
import { dataset } from "@/lib/data";
import { formatPeriodLabel } from "@/lib/format";
import { AppNav } from "./app-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const latestPeriod = dataset.meta.latestPeriod;

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only z-50 bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
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
              <span className="block text-[15px] font-semibold tracking-[-0.01em]">Meridian</span>
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
              <Database aria-hidden="true" className="size-3" />
              Canonical data
            </span>
            <span className="border px-2 py-1 font-mono text-[10px] text-foreground">
              {formatPeriodLabel(latestPeriod)}
            </span>
            <span
              role="img"
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

      <main
        id="main-content"
        className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 lg:px-8 lg:py-8"
      >
        {children}
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 px-4 py-4 font-mono text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>
            © 2026 MGO ·{" "}
            <a
              href="https://miguelgisbert.dev"
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              miguelgisbert.dev
            </a>
          </span>
          <span>
            Canonical dataset · {dataset.markets.length} markets · {dataset.products.length}{" "}
            products
          </span>
        </div>
      </footer>
    </div>
  );
}
