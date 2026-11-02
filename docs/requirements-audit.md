# Requirements audit

Point-by-point review of the provided Front-End Engineer take-home brief against
the current implementation.

Last verified: 2 November 2026  
Live: https://market-ops-console.vercel.app  
Local: http://localhost:3000  
Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`,
`npm run build`, `npm run build-storybook`, `npm audit` (0 vulnerabilities).

## Mandatory requirements

| Requirement                                                 | Status | Evidence                                                                               |
| ----------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------- |
| React 18+ and TypeScript                                    | Done   | React 19, TypeScript strict, no `any`                                                  |
| Next.js App Router or equivalent                            | Done   | Next.js 16 App Router                                                                  |
| End-to-end type safety                                      | Done   | Zod contracts for `data.json`, fixtures and SSE events; inferred types                 |
| Canonical dataset in the provided hierarchy                 | Done   | `src/data/data.json`, 13 markets, 4 regions, 5 products, 1,560 series rows             |
| 24 monthly periods per market/product                       | Done   | Validated from the provided `meta.periods`                                             |
| KPIs: revenue, growth, share, attainment, status, anomalies | Done   | Data contract in `src/lib/data/schema.ts`; no recomputation drift at the latest period |
| Streaming assistant, token-by-token                         | Done   | `src/app/api/chat/route.ts`, SSE parser in `assistant-chat.tsx`                        |
| Clear in-progress state and Stop                            | Done   | Streaming caret, generating status, `AbortController`                                  |
| Evidence citations to markets/products/periods              | Done   | Citations rendered under “Evidence from source data”, resolved to analyst links        |
| Confidence and uncertainty                                  | Done   | High/medium/low cues plus explanatory notes                                            |
| Honest abstention                                           | Done   | Starter-pack `abstain` fixture; “Outside the dataset” state                            |
| Error handling                                              | Done   | Starter-pack `error` fixture; assistant error state                                    |
| AI output vs authoritative data                             | Done   | “AI-generated” badge, separate source-data evidence block, plain-text rendering        |
| Questions listed in the brief                               | Done   | Fixture keywords cover risk, Germany, APAC vs Europe and forecast miss                 |
| Executive overview                                          | Done   | `/` with tape, totals, trend, top movers, risk count and attention list                |
| Analyst deep-dive                                           | Done   | `/analyst` with full metrics, dense tables and every drill path                        |
| Portfolio → region → market → product drill-down            | Done   | Breadcrumb, scope controls and linked rows/citations                                   |
| Choropleth map by KPI with click-to-drill                   | Done   | Custom SVG map, metric selector, market links, automatic zoom                          |
| Radar/spider comparison                                     | Done   | Up to five markets, 0–100 normalised axes, raw-value table                             |
| Time-series actual vs forecast vs prior year                | Done   | Recharts line chart with selected-period reference line and data table                 |
| Additional advanced visualisation                           | Done   | Markets × periods forecast-variance heat map                                           |
| Coordinated views                                           | Done   | Map, scope controls, heat map, tables and period all update the same URL scope         |
| URL shareability and back/forward                           | Done   | Region, market, product, period, metric and comparison in `searchParams`; E2E coverage |
| Accessible chart alternatives                               | Done   | Data tables for map, radar, time-series and trend; heat map is a semantic table        |
| ARIA, keyboard-reachable data points                        | Done   | Map is native SVG links; heat map uses roving tab index and arrow keys                 |
| Never colour as the only signal                             | Done   | Status labels/icons, signed heat-map values, line styles and dash patterns             |
| Currency, compact numbers, percentages, dates               | Done   | Shared deterministic formatters in `src/lib/format.ts`                                 |
| Non-trivial schema-validated form                           | Done   | `/alerts` threshold configurator using Zod                                             |
| Optimistic save and rollback                                | Done   | Pending rule, simulated failure path and rollback                                      |
| README: setup                                               | Done   | `README.md`                                                                            |
| README: architecture and data flow                          | Done   | `README.md`                                                                            |
| README: productionising                                     | Done   | Performance, observability status, resilience, build/serve/cache, CI                   |
| README: approach and decisions                              | Done   | Framework, tokens, streaming, trust, visualisation, state, URL, forms                  |
| README: accessibility                                       | Done   | Covered and next steps                                                                 |
| README: testing                                             | Done   | Unit/component/E2E and deliberate skips                                                |
| README: key decisions, standards, AI usage, next steps      | Done   | `README.md`                                                                            |
| GitHub repository                                           | Done   | https://github.com/miguelgisbert/market-ops-console                                    |
| Live deployment                                             | Done   | https://market-ops-console.vercel.app                                                  |
| Screenshots                                                 | Done   | `docs/screenshots/`                                                                    |

## Optional stretch goals

The brief marks all five as optional; all are implemented.

| Optional item                        | Status | Evidence                                                                                                                           |
| ------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Live mode with timer/stream updates  | Done   | `live=1&tick=n` URL state, deterministic server-derived index, six-second refresh, selection preserved, reduced-motion aware flash |
| Virtualised dense analyst table      | Done   | TanStack Virtual, `/api/facts`, 1,560 rows, ~24 mounted rows, native table semantics                                               |
| Assistant aware of dashboard context | Done   | “Ask about this view” passes region/market/product/period to the assistant; context banner and prompt prefix                       |
| Command palette (cmd-K)              | Done   | Radix Dialog + cmdk, pages/markets/products, keyboard navigation                                                                   |
| Storybook stories                    | Done   | Five stories under `src/stories`, a11y addon, `build-storybook` in CI                                                              |

## Functional checks

- Production build: successful; `/alerts` static, `/`, `/analyst` and `/assistant`
  partial prerender, `/api/chat` and `/api/facts` dynamic.
- SSE API: returns `token` events and a final `done` event; fixture error returns an
  `error` event.
- Assistant: normal, low-confidence, abstain, error and long-response states tested.
- Dashboard: map drill-down, heat-map cell keyboard selection, period changes,
  back/forward, mobile widths, live ticks and virtualised row count tested.
- Form: schema rejection, optimistic success and forced rollback tested.
- Assistant context, command palette navigation and Storybook build tested.
- Axe WCAG 2.0/2.1 A/AA: 0 violations on core pages and command palette.
- Lighthouse live: 93/100/100/100 overview mobile, 88/100/100/100 analyst mobile,
  100/100/100/100 analyst desktop.
- Live deployment: public, no authentication wall, no console errors observed on
  overview and analyst routes.
- English-only UI and code strings checked; no Valencian/Catalan copy remains.

## Efficiency checks

- Fact table validated once at module load and aggregated once into a typed index.
- Repeated market-summary work is passed into portfolio, region, heat-map and
  top-mover selectors instead of recomputed.
- Date formatters are module-level `Intl` instances.
- No server dataset is duplicated into the assistant client; only a small citation
  lookup is passed to the chat island.
- Map geometry is pre-generated, so no d3/topojson code ships to the browser.
- Chart animations are disabled; streaming updates are token-sized and abortable.
- Horizontal mobile overflow is contained at the scroll container; E2E regression
  test added.
- Virtualised table renders only visible rows and lazy-fetches after entering the
  viewport; live simulation updates via the URL tick without mutating canonical data;
  command palette and context lookup stay client-light.
