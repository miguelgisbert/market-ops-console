# Meridian — Market operations console

Front-end for a commercial operations team that reads portfolio performance and
asks questions about it. Built for the Front-End Engineer take-home assignment.

**Status:** foundation scaffold. The starter pack (`data.json`, `fixtures.json`,
`CONTRACT.md`, reference `/api/chat`) has not been received yet, so the app runs
on a deterministic synthetic dataset and local chat fixtures. The types,
selectors and UI are structured so the real fixtures and SSE contract can replace
them without changing the surfaces.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run typecheck   # next typegen + tsc --noEmit
npm run lint        # eslint
npm run build       # production build
```

## Stack

- **Next.js 16** with the App Router, React 19 and TypeScript in strict mode.
- **Tailwind CSS v4** and **shadcn/ui** (Radix primitives, Nova preset) for
  accessible building blocks and CSS-variable design tokens.
- **Zod** for the dataset contract and, later, form validation.
- **Bricolage Grotesque** for the interface and **IBM Plex Mono** for numbers,
  periods and data labels.
- No charting library yet; charts are the next implementation step.

## What exists today

### Overview (`/`)

- A dense market tape with every market's status, growth and forecast attainment.
- Portfolio KPIs: revenue, growth, attainment and markets at risk.
- Market performance table with reporting-currency and local-currency revenue.
- "Needs attention" panel covering every market that is not on track, using the
  latest anomaly when one exists.

### Analyst workspace (`/analyst`)

- Regional performance and product contribution tables.
- Full market table with status, growth, share and attainment.
- URL-driven drill-down: `/analyst?market=de` selects Germany, changes the KPI
  band and shows recent actual, forecast and prior-year periods as an accessible
  table. The selection survives reload and browser history.
- A Suspense fallback keeps the route partially prerendered instead of blocking
  the whole navigation.

### Assistant (`/assistant`)

- Streaming-style response simulation with a visible in-progress state and a stop
  control.
- AI-generated content is visually and structurally separated from source data.
- Citations for markets, products and periods, each with a link back to the
  relevant analyst view when available.
- Confidence cues (high / medium / low) with an honest explanation.
- Abstention state for questions outside the dataset and an error state for a
  failed stream.
- Suggested questions, keyboard-accessible composer and screen-reader status
  announcements.

## Architecture

```text
src/
  app/
    page.tsx                 executive overview
    analyst/page.tsx         analyst view + URL drill-down
    assistant/page.tsx       assistant surface
    layout.tsx               fonts, metadata, tooltip provider, shell
  components/
    layout/                  top bar, navigation, page shell
    dashboard/               tape, KPI band, market table, status badge
    analyst/                 regional/product tables, selected market panel
    assistant/               chat surface and fixture-based streaming
    ui/                      shadcn primitives
  lib/
    data/
      schema.ts              Zod contract and inferred TypeScript types
      mock.ts                deterministic synthetic dataset (placeholder)
      selectors.ts           portfolio, region, market and product derivations
    chat/fixtures.ts         local question → answer fixtures
    format.ts                Intl currency, percent, compact number and date formatting
```

### Data flow and state

- Dataset and selectors are server-side and synchronous for now. The dataset
  module is the seam for the real `data.json`.
- The overview and analyst views are Server Components. The URL is the source of
  truth for drill-down, so views are shareable and back/forward works.
- The assistant is a Client Component because streaming, stop and composer state
  are interactive. It currently simulates tokens from local fixtures; the
  intended replacement is a typed SSE parser feeding the same message model.
- Server state is not duplicated in the client. When the real data arrives,
  fetch/cache will live behind the data module (TanStack Query or Next caching,
  decided once the starter pack is known).

### Design system

- CSS variables in `src/app/globals.css` define the palette, status colours,
  chart slots and radii; shadcn components consume them.
- Status is never encoded by colour alone: every badge, tape tile and attention
  item includes a label and icon.
- Numbers use tabular mono figures; local-currency values sit beneath the
  reporting-currency value in tables.
- The visual direction is an operations tape rather than a generic card grid:
  hairline structure, a single signal band and dense tables.

## Placeholder data

`src/lib/data/mock.ts` generates 12 markets, 4 regions, 5 products and 24 monthly
periods with a seeded PRNG. It exists to unblock the UI and typing work. It is
deliberately marked as `source: "synthetic"` in the dataset metadata and in the
header. It will be removed or replaced by the provided dataset.

## Next steps

1. Replace the synthetic dataset with the provided `data.json` and validate it
   with the Zod contract.
2. Implement the provided SSE event contract in `/api/chat` and replace the
   local fixture stream with a typed parser, preserving stop, loading, error and
   abstention states.
3. Add the dashboard visualisations: choropleth, radar, time-series, heat map or
   growth-vs-share scatter, each with a table alternative and keyboard support.
4. Add coordinated filtering beyond the current market selection, and reflect
   period/region/product filters in the URL.
5. Add the alert/threshold configurator with Zod validation, optimistic update
   and rollback on failure.
6. Add tests: selector/unit coverage, component tests and one Playwright happy
   path across drill-down and assistant citation.
7. Add observability, CI, deployment and the remaining README sections required
   by the assignment.

## Notes

- The assignment brief is intentionally not committed to the repository.
- The current chat fixtures are local placeholders, not the provided starter
  pack, and are labelled as such in the interface.
