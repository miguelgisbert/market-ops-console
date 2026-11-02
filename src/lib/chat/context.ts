import type { DataIndex } from "@/lib/data/build";
import { periodSchema } from "@/lib/data/schema";
import { formatPeriodLabel } from "@/lib/format";

export type AssistantContext = {
  label: string;
  prompt: string;
  clearHref: string;
};

export function buildAssistantContext(
  index: DataIndex,
  params: {
    region?: string;
    market?: string;
    product?: string;
    period?: string;
  },
): AssistantContext | null {
  const market = params.market ? index.marketsById.get(params.market) : undefined;
  const regionId = market?.regionId ?? params.region;
  const region = regionId ? index.regionsById.get(regionId) : undefined;
  const product = params.product ? index.productsById.get(params.product) : undefined;
  const parsedPeriod = params.period ? periodSchema.safeParse(params.period) : null;
  const period = parsedPeriod?.success ? parsedPeriod.data : undefined;

  const parts = [
    market?.name ?? region?.name,
    product?.name,
    period ? formatPeriodLabel(period) : undefined,
  ].filter((part): part is string => Boolean(part));

  if (parts.length === 0) return null;

  return {
    label: parts.join(" · "),
    prompt: `This question is about ${parts.join(", ")}.`,
    clearHref: "/assistant",
  };
}
