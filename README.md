# Market Ops — Market operations console

A front-end for a commercial operations team that reads portfolio performance and
asks questions about it. Built for the Front-End Engineer take-home assignment
using the provided starter pack.

**Live:** [https://market-ops-console.vercel.app](https://market-ops-console.vercel.app)
**Repo:** [https://github.com/miguelgisbert/market-ops-console](https://github.com/miguelgisbert/market-ops-console)
**Storybook:** [https://market-ops-storybook.vercel.app](https://market-ops-storybook.vercel.app)
**Requirements audit:** [docs/requirements-audit.md](docs/requirements-audit.md)

**Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4,
shadcn/ui, Zod, Recharts, TanStack Virtual, cmdk, Storybook, Biome, Vitest and
Playwright.

## Quick setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint        # Biome lint + format check
npm run typecheck   # next typegen + tsc --noEmit
npm test            # Vitest unit/component tests
npm run test:e2e    # Playwright happy paths (Chrome)
npm run build       # production build
npm run storybook   # Storybook on http://localhost:6006
npm run build-storybook
npm audit           # 0 vulnerabilities
```

## What it does

### Executive overview (`/`)

- Market tape ordered by risk, with status, growth and forecast attainment.
- Portfolio totals, trend against forecast, top movers and markets at risk.
- Dense market table with revenue, growth, share, attainment and status.
- "Needs attention" panel driven by the dataset's statuses and anomaly markers.
- Live mode: simulated server-derived updates every six seconds, with the selected
  URL scope preserved.

### Analyst workspace (`/analyst`)

- Drill-down through portfolio → region → market → product.
- Choropleth map coloured by growth, attainment, share or revenue, with click-to-drill
  and automatic zoom to the selected region.
- Radar comparison of up to five markets across revenue index, growth, share and
  attainment.
- 24-period actual vs forecast vs prior-year time series for the selected scope.
- Forecast-variance heat map (markets × periods), keyboard-navigable with roving
  tab focus; selecting a cell updates the rest of the dashboard.
- Region, product, period and comparison controls, all reflected in the URL.
- Virtualised fact table: 1,560 market × product × period rows, with only visible rows
  mounted.
- Live mode and "Ask about this view" context hand-off to the assistant.
- Accessible data tables behind every visualisation.

### Assistant (`/assistant`)

- Real `POST /api/chat` SSE transport implementing the starter-pack contract.
- Token-by-token rendering, in-progress state, stop via `AbortController`.
- Citations resolved against `data.json` and linked to the analyst view.
- Confidence cues, explicit abstention, error state and long-response handling.
- AI-generated narrative is visually and structurally separate from authoritative
  source data.
- Dashboard context hand-off: the analyst view sends region, market, product and
  period into the assistant, which prefixes the question sent to the fixture backend.

### Command palette (`Ctrl/Cmd + K`)

- Global search for pages, markets and products.
- Radix Dialog + cmdk keyboard navigation and `aria-activedescendant` handling.
- Selecting a market or product navigates directly to the analyst scope.

### Storybook

- Stories for StatusBadge, KpiBand, MarketTape, AlertConfigurator and TimeSeriesChart.
- Accessibility addon enabled.
- `npm run storybook` / `npm run build-storybook`.
- Live static Storybook: https://market-ops-storybook.vercel.app

### Alerts (`/alerts`)

- Non-trivial threshold configurator for growth or forecast attainment.
- Zod schema validation with inline field errors.
- Optimistic save, simulated failure mode, rollback and localStorage persistence.
- Rule list with active/paused state and delete.

## Screenshots

### Portfolio overview

![Portfolio overview](docs/screenshots/overview.png)

### Analyst workspace

![Analyst map and radar](docs/screenshots/analyst.png)

### Command palette

![Command palette](docs/screenshots/command-palette.png)

### Virtualised fact table

![Virtualised fact table](docs/screenshots/analyst-facts.png)

### Time series and heat map

![Analyst time series and heat map](docs/screenshots/analyst-heatmap.png)

### Assistant with citations

![Assistant with citations](docs/screenshots/assistant.png)

### Alert configurator

![Alert configurator](docs/screenshots/alerts.png)

### Mobile

![Mobile overview](docs/screenshots/overview-mobile.png)

## Starter pack alignment

The canonical files from the starter pack are copied to `src/data/`:

- `data.json`: 13 markets, 4 regions, 5 products and 1,560 rows (market × product ×
  24 months). Region and portfolio totals are derived from the fact table.
- `fixtures.json`: served by `src/app/api/chat/route.ts`; first keyword match wins,
  with the provided default fallback.

The provided data and streaming contract are retained at
[`docs/starter-pack-contract.md`](docs/starter-pack-contract.md). The synthetic
dashboard data is no longer used. `src/lib/data/schema.ts` validates the JSON at
module load, including every series row's market, product and period reference.

## Architecture

```text
Browser
├── Server Components
│   ├── overview page          DataIndex + optional live tick
│   ├── analyst page           DataIndex + URL scope + optional live tick
│   ├── assistant page         citation lookup + dashboard context
│   └── app shell              dataset metadata, navigation, command trigger
├── Client islands
│   ├── charts                 Recharts radar/line, custom SVG map/heat map
│   ├── scope controls         URL updates through the App Router
│   ├── live mode              timed URL ticks + server-derived index
│   ├── virtualised table      TanStack Virtual + facts API
│   ├── assistant              fetch + SSE parser + AbortController
│   ├── command palette        cmdk + Radix Dialog
│   └── alert configurator     Zod form, optimistic state, rollback
├── POST /api/chat             fixtures lookup → SSE token/done events
└── GET /api/facts             filtered fact rows for virtualisation
```

```text
src/
  app/
    page.tsx                  executive overview + live mode
    analyst/page.tsx          analyst workspace + virtualised facts + live mode
    assistant/page.tsx        chat surface + dashboard context
    alerts/page.tsx           threshold configurator
    api/chat/route.ts         SSE fixture endpoint
    api/facts/route.ts        filtered fact rows
    error.tsx / not-found.tsx resilience states
  components/
    charts/                   map, radar, time series, heat map, chart panel
    dashboard/                tape, KPI band, tables, trend, scope + live controls
    analyst/                  region/product tables, selected market, virtualised facts
    assistant/                streaming chat + context
    alerts/                   alert form and rule list
    command-palette.tsx       Ctrl/Cmd + K navigation
    form/                     shared Radix select field
    ui/                       shadcn primitives
  lib/
    data/
      schema.ts               Zod data contract and inferred types
      build.ts                immutable DataIndex (aggregations precomputed)
      selectors.ts            portfolio, region, market, product, radar, heatmap
      live.ts                 deterministic live tick simulation
    chat/
      schema.ts               fixtures + SSE event contract
      citations.ts            citation lookup and URL resolution
      context.ts              dashboard → assistant context
    alerts/schema.ts          form schema and threshold predicates
    dashboard/config.ts       map metric + live tick parsing
    dashboard/url.ts          shared analyst URL builder
    format.ts                 deterministic currency/percent/date formatting
  data/
    data.json                 canonical dataset
    fixtures.json             canonical assistant fixtures
    world-map.json            generated SVG paths and country bounds
  stories/                    Storybook stories for core components
.storybook/                   Storybook configuration + a11y addon
scripts/generate-world-map.mjs
```

### Data flow

`data.json` → Zod validation → `createDataIndex` → selectors → Server Components →
props to client visualisations. The index is built once at module load. Every series
is pre-aggregated by market, region, product, market×product and region×product so
dashboard renders do not repeatedly scan the fact table. Live mode derives a new
index from a deterministic tick without mutating the canonical dataset. The
virtualised table fetches a filtered fact payload through `/api/facts`, keeping the
main RSC payload small.

### State boundaries

- **Server/data state:** the immutable validated dataset and precomputed index.
- **URL state:** current region, market, product, period, map metric, radar
  comparison, live toggle/tick and assistant context. This is the source of truth
  for the dashboard, which makes views shareable and keeps back/forward working.
- **Client state:** chart focus/roving tab index, virtualised scroll position, live
  timer, command palette, chat stream/abort controller and alert form state. No
  server dataset is duplicated into client state.

## Approach and decisions

### Framework and styling

Next.js App Router with React Server Components keeps the dataset and aggregation
out of the client bundle. TypeScript strict mode plus Zod-derived types gives one
contract from JSON to UI. shadcn/ui provides accessible primitives, but the visual
system is custom: cool operational palette, Bricolage Grotesque + IBM Plex Mono,
hairline structure, signal tape, squared panels and a dense table-first layout.
Tokens live in `src/app/globals.css` and are consumed by Tailwind/shadcn.

### Streaming

The chat uses the documented SSE contract directly through streaming `fetch` rather
than `EventSource` (which is GET-only). A typed discriminated union parses every
event. `AbortController` powers Stop; tokens are appended incrementally; the final
done event supplies citations and confidence. Malformed/partial streams end in an
explicit error state rather than an invented answer.

### Trust surface

- AI narrative carries an explicit "AI-generated" label.
- Citations are rendered separately under "Evidence from source data", with dataset
  IDs resolved to market/region/product/period labels and analyst links.
- Confidence is qualitative and paired with an explanation, not a fake probability.
- Abstentions say explicitly that nothing was extrapolated.
- Transport failures are labelled as assistant errors, not data conclusions.
- Model output is rendered as text; there is no `dangerouslySetInnerHTML`.

### Data visualisation

- **Map:** custom SVG paths generated at development time from `world-atlas` with
  `d3-geo`; the runtime receives only path data. Links are real SVG anchors, so map
  markets are keyboard reachable. The map zooms to the active region and has a data
  table alternative.
- **Radar:** Recharts, with colour plus dash patterns for each series, a 0–100
  normalised scale and raw values in a table.
- **Time series:** Recharts, dashed/solid distinctions plus a full data table.
- **Heat map:** custom semantic table with roving tabindex, arrow-key navigation and
  signed values in every cell, so colour is never the only signal.
- **Overview trend:** lightweight SVG to avoid shipping a chart library for a
  two-line thumbnail.

### Coordinated views and URL state

The URL carries the drill path and filters. Selecting a country, region, product,
period or heat-map cell produces a URL that the server resolves into a new scope.
All panels read from that scope, so map, radar, time series, tables and KPI band stay
coordinated. The analyst route is partially prerendered: a Suspense fallback provides
a fast shell while `searchParams` resolves the selected scope.

### Live mode

The `Live` control writes `live=1` and an incrementing `tick` into the URL. The server
builds a deterministic derived index where only the latest period's actual/units move
within a small band; historical rows and the canonical JSON stay untouched. The
dashboard reloads that scope every six seconds, preserving region/market/product/
period/comparison. The KPI band receives the tick as an animation key and flashes;
the live dot is disabled under `prefers-reduced-motion`.

### Virtualised table and command palette

TanStack Virtual mounts only the visible fact rows (about 24 of 1,560) using top and
bottom spacer rows in a native semantic table. The command palette uses cmdk for
filtering and active-item keyboard behaviour inside a Radix Dialog, and exposes a
header trigger plus `Ctrl/Cmd + K`.

### Forms

The alert form uses a Zod schema, typed field errors and accessible descriptions.
The optimistic rule is inserted immediately, then confirmed or rolled back after the
simulated save. A deliberate "Simulate save failure" control makes the rollback path
demonstrable and testable.

## Accessibility

Targeted at WCAG 2.1 AA:

- Semantic landmarks, one `h1` per page, skip link, labelled navigation and controls.
- Visible focus styles throughout; map links and heat-map cells are keyboard
  reachable; heat map supports arrow keys, Home and End.
- Text labels and icons accompany every status colour; chart series use line styles
  and dash patterns in addition to colour.
- Every chart has a data-table equivalent through `<details>`; the heat map is itself
  a semantic table with signed values in every cell.
- Screen-reader announcements for chat generation state, form errors and save/rollback.
- Reduced-motion support for the streaming caret, live flash and ping indicator;
  chart animations are disabled.
- Currency, percentages and periods use shared formatters; dates are pinned to UTC.
- No colour-only status signals; status text is always present.
- **Would add with more time:** automated axe checks in CI, a screen-reader pass on
  the full assistant flow, and a forced-colors mode review.

## Testing

```bash
npm test        # Vitest: 6 files, 15 tests
npm run test:e2e
```

Covered:

- Data index/selectors: fact-table totals, canonical statuses, product drill-down,
  heat-map dimensions, top-mover direction, sorted products, radar bounds.
- Live simulation: latest period changes, historical rows stay intact, derived index
  differs per tick.
- Assistant context: scope label/prompt generation and invalid-scope abstention.
- Citation resolution: explicit labels, dataset-ID fallback and generated URLs.
- `StatusBadge`: every status renders text, not just colour.
- Alert configurator: schema rejection, optimistic save and rollback on forced failure.
- Storybook build with the a11y addon.
- Playwright (11 paths): overview → market drill-down → assistant citation; alert
  save and forced rollback; shareable drill path with back/forward; assistant
  abstention and error states; mobile width without horizontal overflow; command
  palette navigation; live updates with preserved scope; assistant dashboard
  context hand-off; virtualised fact table row count; automated axe checks for the
  core pages and command palette.
- Axe (`@axe-core/playwright`, WCAG 2.0/2.1 A/AA): **0 violations** across `/`,
  `/analyst`, a selected market view, `/assistant`, `/alerts` and the open command
  palette.
- Build, typecheck, lint and `npm audit` are clean.

Deliberately skipped for time: visual regression tests, full keyboard traversal E2E
for every chart, Lighthouse budgets in CI, and unit tests for Recharts internals.

## Quality evidence

Lighthouse 12.8.2 against the live Vercel production deployment, Chrome 156,
2 November 2026. Scores can vary with network and CPU throttling.

| Page / profile   | Performance | Accessibility | Best practices | SEO |   LCP |    TBT | CLS |
| ---------------- | ----------: | ------------: | -------------: | --: | ----: | -----: | --: |
| Overview, mobile |          93 |           100 |            100 | 100 | 2.8 s | 170 ms |   0 |
| Analyst, mobile  |          88 |           100 |            100 | 100 | 2.8 s | 330 ms |   0 |
| Analyst, desktop |         100 |           100 |            100 | 100 | 0.6 s |   0 ms |   0 |

The analyst charts are deferred until they approach the viewport, the fact table is
virtualised and lazy-loaded, and the command palette is loaded on first open, so the
initial dashboard route stays light.

## Productionising

- **Performance:** server-rendered data and selectors; client-only interactive islands;
  no chart animation; the 1,560-row fact table is virtualised and lazy-fetches when
  it enters the viewport; live ticks derive a server index instead of mutating
  canonical data; map geometry is pre-generated so no topology library ships to the
  browser. The heaviest client chunks remain Recharts and the map path data.
- **Observability:** not wired to a vendor. The error boundary at
  `src/app/error.tsx` captures render failures. Next steps are web-vitals/RUM
  reporting and an error-tracking vendor such as Sentry.
- **Resilience and hardening:** Zod validation at the data and SSE boundaries;
  explicit error/abstain states; AbortController cleanup; no HTML injection; strict
  TypeScript; deterministic formatters to avoid hydration drift.
- **Build and serving:** `next build` produces static alerts, partially prerendered
  overview/analyst/assistant pages and dynamic `/api/chat` + `/api/facts`; SSE
  responses set `no-cache, no-transform` and disable proxy buffering.
- **CI/CD:** `.github/workflows/ci.yml` runs install, lint, typecheck, unit tests,
  Next build and Storybook build; a second job runs Playwright against a production
  server, including axe checks. Vercel is connected to the repository. Storybook is
  also deployed as a static Vercel project.

## Key decisions and standards

Followed:

- Strict TypeScript, no `any`, Zod schemas and inferred types.
- Immutable data index and pure selectors; no duplicate server data in client state.
- URL as dashboard source of truth; Suspense for request-time scope.
- Accessible tables behind charts; deterministic number formatting for hydration.
- Biome for lint/format, Vitest/Testing Library, Playwright, GitHub Actions.
- Demo data and fixtures stay in the repository; the binary assignment brief does
  not.

Skipped or deferred:

- Real auth/SSO and role-based UI (explicitly out of scope; mock identity only).
- Real LLM/RAG backend (explicitly out of scope).
- Vendor observability until a deployment target is chosen.

## AI-assisted development

AI was used as a pair programmer for scaffolding, refactoring, accessibility checks
and test generation, with the following working rules:

- Read the provided contract and docs first; do not invent backend behaviour.
- Keep the human in charge of product and visual decisions; review every diff.
- Prefer typed interfaces and schema validation over free-form object shapes.
- Run lint, typecheck, unit tests, E2E and build after every substantial change.
- Never ship unreviewed generated code; do not use AI to write the reasoning in this
  README wholesale.

## Known limitations / what I'd do differently with more time

- Replace canned fixture answers with the real model once the backend exists.
- Move alert persistence from localStorage to a real service with retries.
- Use the canonical share snapshot consistently or recompute a documented share
  definition for every period.
- Replace the prompt-prefix context hand-off with a first-class assistant-context
  backend contract.
- Add an accessible scatter/bubble view and a region-vs-region radar mode.
- Add Lighthouse bundle budgets, error tracking and a full axe pass.
- Add a second Storybook interaction-test pass and visual regression coverage.
