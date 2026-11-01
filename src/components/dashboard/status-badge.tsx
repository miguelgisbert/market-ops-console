import { CheckCircle2, CircleAlert, OctagonX } from "lucide-react";
import type { MarketStatus } from "@/lib/data";
import { statusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

const statusStyles: Record<
  MarketStatus,
  { className: string; icon: typeof CheckCircle2 }
> = {
  "on-track": {
    className: "border-status-ontrack/35 bg-status-ontrack/8 text-status-ontrack",
    icon: CheckCircle2,
  },
  "at-risk": {
    className: "border-status-atrisk/40 bg-status-atrisk/10 text-status-atrisk",
    icon: CircleAlert,
  },
  "off-track": {
    className: "border-status-offtrack/40 bg-status-offtrack/10 text-status-offtrack",
    icon: OctagonX,
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: MarketStatus;
  className?: string;
}) {
  const style = statusStyles[status];
  const Icon = style.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] font-medium",
        style.className,
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3" />
      {statusLabel(status)}
    </span>
  );
}
