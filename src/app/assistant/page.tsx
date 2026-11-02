import { Database, Sparkles } from "lucide-react";
import { AssistantChat } from "@/components/assistant/assistant-chat";
import { createCitationLookup } from "@/lib/chat/citations";
import { dataset } from "@/lib/data";

export const metadata = {
  title: "Assistant",
};

export default function AssistantPage() {
  const lookup = createCitationLookup({
    markets: dataset.markets.map((market) => ({
      id: market.id,
      name: market.name,
      iso2: market.iso2,
      regionId: market.regionId,
    })),
    regions: dataset.regions,
    products: dataset.products,
    latestPeriod: dataset.meta.latestPeriod,
  });

  return (
    <div className="space-y-7">
      <header className="border-b pb-5">
        <p className="font-mono text-[11px] text-muted-foreground">Portfolio / Assistant</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] md:text-[38px]">
          Ask the portfolio
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A streaming assistant over the same market data as the dashboard. Answers mark what is
          AI-generated, cite the evidence used and admit when the dataset cannot answer.
        </p>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(300px,1fr)]">
        <AssistantChat lookup={lookup} />

        <aside className="space-y-4">
          <section className="border bg-card">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Trust model</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                The line between generated text and source data.
              </p>
            </div>
            <div className="divide-y">
              <div className="flex gap-3 px-4 py-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-sm border border-primary/25 bg-primary/5 text-primary"
                >
                  <Sparkles className="size-3.5" />
                </span>
                <div>
                  <p className="text-xs font-medium">AI-generated</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    Narrative, interpretation and suggested focus. Never treated as an authoritative
                    number.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 px-4 py-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-sm border bg-background text-foreground"
                >
                  <Database className="size-3.5" />
                </span>
                <div>
                  <p className="text-xs font-medium">Source data</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    Citations resolve against the canonical dataset and link to the market, product
                    and period used.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="border bg-card">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Confidence cues</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Qualitative, not a probability score.
              </p>
            </div>
            <dl className="divide-y text-[11px]">
              <div className="flex items-start gap-3 px-4 py-2.5">
                <dt className="w-16 shrink-0 font-mono text-status-ontrack">High</dt>
                <dd className="text-muted-foreground">
                  Complete data, deterministic comparison, no causal claim.
                </dd>
              </div>
              <div className="flex items-start gap-3 px-4 py-2.5">
                <dt className="w-16 shrink-0 font-mono text-status-atrisk">Medium</dt>
                <dd className="text-muted-foreground">
                  Data is complete, but the answer includes judgement or strategic weighting.
                </dd>
              </div>
              <div className="flex items-start gap-3 px-4 py-2.5">
                <dt className="w-16 shrink-0 font-mono text-status-offtrack">Low</dt>
                <dd className="text-muted-foreground">
                  The cause or requested period is not in the dataset. The answer says so.
                </dd>
              </div>
            </dl>
          </section>

          <section className="border border-dashed px-4 py-3">
            <h2 className="text-xs font-semibold">Streaming contract</h2>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              POST /api/chat returns Server-Sent Events: token events followed by a done event with
              citations and confidence. An error event replaces the tokens when the mock service
              fails. Stop aborts the fetch.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
