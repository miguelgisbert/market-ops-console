import { formatPeriodLabel } from "@/lib/format";
import type { Citation } from "./schema";

export type CitationLookup = {
  markets: Record<string, { name: string; iso2: string; regionId: string }>;
  regions: Record<string, string>;
  products: Record<string, string>;
  latestPeriod: string;
};

export type ResolvedCitation = {
  key: string;
  label: string;
  secondary: string;
  hasExplicitLabel: boolean;
  href?: string;
};

export function resolveCitation(citation: Citation, lookup: CitationLookup): ResolvedCitation {
  const params = new URLSearchParams();
  const parts: string[] = [];

  const market = citation.marketId ? lookup.markets[citation.marketId] : undefined;
  const region = citation.regionId ? lookup.regions[citation.regionId] : undefined;
  const product = citation.productId ? lookup.products[citation.productId] : undefined;

  if (citation.marketId) params.set("market", citation.marketId);
  if (citation.regionId) params.set("region", citation.regionId);
  if (citation.productId) params.set("product", citation.productId);
  if (citation.period) params.set("period", citation.period);

  if (market) parts.push(market.name);
  if (region) parts.push(region);
  if (product) parts.push(product);
  if (citation.period) parts.push(formatPeriodLabel(citation.period));

  const query = params.toString();
  return {
    key: [citation.marketId, citation.regionId, citation.productId, citation.period, citation.label]
      .filter(Boolean)
      .join("-"),
    label: citation.label ?? parts[0] ?? "Dataset reference",
    secondary: parts.join(" · "),
    hasExplicitLabel: citation.label !== undefined,
    href: query ? `/analyst?${query}` : undefined,
  };
}

export function createCitationLookup(params: {
  markets: Array<{ id: string; name: string; iso2: string; regionId: string }>;
  regions: Array<{ id: string; name: string }>;
  products: Array<{ id: string; name: string }>;
  latestPeriod: string;
}): CitationLookup {
  return {
    markets: Object.fromEntries(
      params.markets.map((market) => [
        market.id,
        { name: market.name, iso2: market.iso2, regionId: market.regionId },
      ]),
    ),
    regions: Object.fromEntries(params.regions.map((region) => [region.id, region.name])),
    products: Object.fromEntries(params.products.map((product) => [product.id, product.name])),
    latestPeriod: params.latestPeriod,
  };
}
