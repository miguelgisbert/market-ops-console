"use client";

import { Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CommandPaletteDialog = dynamic(
  () => import("./command-palette").then((module) => module.CommandPaletteDialog),
  { ssr: false, loading: () => null },
);

export function CommandPaletteLauncher({
  markets,
  products,
}: {
  markets: Array<{ id: string; name: string; iso2: string }>;
  products: Array<{ id: string; name: string }>;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Open command palette"
        aria-keyshortcuts="Control+K Meta+K"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-1.5 border bg-card px-2 text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Search aria-hidden="true" className="size-3" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded-sm border bg-muted px-1 font-mono text-[9px] text-muted-foreground md:inline">
          Ctrl K
        </kbd>
      </button>
      {open ? (
        <CommandPaletteDialog
          open={open}
          onOpenChange={setOpen}
          markets={markets}
          products={products}
        />
      ) : null}
    </>
  );
}
