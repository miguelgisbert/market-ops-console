"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Overview" },
  { href: "/analyst", label: "Analyst" },
  { href: "/assistant", label: "Assistant" },
  { href: "/alerts", label: "Alerts" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex h-full items-stretch gap-1">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center px-3 text-sm text-muted-foreground transition-colors hover:text-foreground",
              "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary after:opacity-0 after:transition-opacity",
              active && "font-medium text-foreground after:opacity-100",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
