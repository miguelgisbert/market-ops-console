export function buildAnalystHref(
  baseParams: Record<string, string | undefined>,
  overrides: Record<string, string | undefined> = {},
  path = "/analyst",
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...baseParams, ...overrides })) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}
