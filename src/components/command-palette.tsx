"use client";

import { Command } from "cmdk";
import { ArrowUpRight, Bell, LayoutDashboard, MessageSquare, Search, Table2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { useEffect, useState } from "react";

type PaletteItem = {
  value: string;
  label: string;
  kind: "Page" | "Market" | "Product";
  href: string;
  hint?: string;
};

const pages: PaletteItem[] = [
  {
    value: "Overview",
    label: "Overview",
    kind: "Page",
    href: "/",
    hint: "Executive view",
  },
  {
    value: "Analyst workspace",
    label: "Analyst workspace",
    kind: "Page",
    href: "/analyst",
    hint: "Deep dive",
  },
  {
    value: "Assistant",
    label: "Assistant",
    kind: "Page",
    href: "/assistant",
    hint: "Streaming chat",
  },
  {
    value: "Alerts",
    label: "Alerts",
    kind: "Page",
    href: "/alerts",
    hint: "Threshold rules",
  },
];

const pageIcons = {
  Overview: LayoutDashboard,
  "Analyst workspace": Table2,
  Assistant: MessageSquare,
  Alerts: Bell,
} as const;

export function CommandPalette({
  markets,
  products,
}: {
  markets: Array<{ id: string; name: string; iso2: string }>;
  products: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

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

  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  function select(item: PaletteItem) {
    setOpen(false);
    router.push(item.href);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open command palette"
          aria-keyshortcuts="Control+K Meta+K"
          className="inline-flex h-8 items-center gap-1.5 border bg-card px-2 text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search aria-hidden="true" className="size-3" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded-sm border bg-muted px-1 font-mono text-[9px] text-muted-foreground md:inline">
            Ctrl K
          </kbd>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/20" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-[14%] left-1/2 z-50 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 border bg-popover shadow-xl focus:outline-none"
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <Command label="Command palette" loop>
            <div className="flex items-center gap-2 border-b px-3">
              <Search aria-hidden="true" className="size-4 text-muted-foreground" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                autoFocus
                placeholder="Jump to a market, product or page…"
                className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded-sm border px-1 font-mono text-[9px] text-muted-foreground">
                Esc
              </kbd>
            </div>
            <Command.List className="max-h-[360px] overflow-y-auto p-1">
              <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
                No matches.
              </Command.Empty>
              <Command.Group
                heading="Pages"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {pages.map((item) => {
                  const Icon = pageIcons[item.value as keyof typeof pageIcons];
                  return (
                    <PaletteRow key={item.value} item={item} onSelect={select}>
                      <Icon aria-hidden="true" className="size-3.5" />
                    </PaletteRow>
                  );
                })}
              </Command.Group>
              <Command.Group
                heading="Markets"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {markets.map((market) => (
                  <PaletteRow
                    key={market.id}
                    item={{
                      value: `Market ${market.name}`,
                      label: market.name,
                      kind: "Market",
                      href: `/analyst?market=${market.id}`,
                      hint: market.iso2,
                    }}
                    onSelect={select}
                  >
                    <span className="font-mono text-[9px] text-muted-foreground">
                      {market.iso2}
                    </span>
                  </PaletteRow>
                ))}
              </Command.Group>
              <Command.Group
                heading="Products"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {products.map((product) => (
                  <PaletteRow
                    key={product.id}
                    item={{
                      value: `Product ${product.name}`,
                      label: product.name,
                      kind: "Product",
                      href: `/analyst?product=${product.id}`,
                      hint: "Product",
                    }}
                    onSelect={select}
                  >
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </PaletteRow>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PaletteRow({
  item,
  onSelect,
  children,
}: {
  item: PaletteItem;
  onSelect: (item: PaletteItem) => void;
  children: React.ReactNode;
}) {
  return (
    <Command.Item
      value={item.value}
      onSelect={() => onSelect(item)}
      className="flex cursor-pointer items-center gap-2 px-2 py-2 text-xs data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
    >
      <span className="grid size-4 shrink-0 place-items-center text-muted-foreground">
        {children}
      </span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.hint ? (
        <span className="shrink-0 font-mono text-[9px] text-muted-foreground">{item.hint}</span>
      ) : null}
    </Command.Item>
  );
}
