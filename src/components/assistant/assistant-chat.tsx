"use client";

import { CircleAlert, Database, Send, Sparkles, Square } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type CitationLookup, type ResolvedCitation, resolveCitation } from "@/lib/chat/citations";
import {
  type AnswerKind,
  type Citation,
  type Confidence,
  chatEventSchema,
} from "@/lib/chat/schema";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "streaming" | "complete" | "stopped" | "error";
  citations?: Citation[];
  confidence?: Confidence;
  kind?: AnswerKind;
  error?: string;
};

const suggestedQuestions = [
  "Which markets are at risk this quarter, and why?",
  "Why did Germany's revenue dip?",
  "Compare APAC and Europe on growth and forecast attainment",
  "What's driving the portfolio's forecast miss?",
  "Give me a full portfolio summary",
  "What will sales be next year?",
];

const confidenceStyles: Record<Confidence, { label: string; bars: number; className: string }> = {
  high: {
    label: "High confidence",
    bars: 3,
    className: "text-status-ontrack",
  },
  medium: {
    label: "Medium confidence",
    bars: 2,
    className: "text-status-atrisk",
  },
  low: {
    label: "Low confidence",
    bars: 1,
    className: "text-status-offtrack",
  },
};

function confidenceNote(confidence: Confidence, kind?: AnswerKind): string {
  if (kind === "abstain") {
    return "The requested period or fact is outside the dataset. No number was extrapolated.";
  }
  if (confidence === "high") {
    return "Based on complete figures in the canonical dataset, with no causal claim added.";
  }
  if (confidence === "medium") {
    return "The underlying figures are complete; the answer includes interpretation or judgement.";
  }
  return "Treat this as directional. The dataset may not support a precise answer.";
}

export function AssistantChat({ lookup }: { lookup: CitationLookup }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const lastMessageId = messages.at(-1)?.id;

  useEffect(() => {
    if (!lastMessageId) return;
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lastMessageId]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  function patchMessage(id: string, patch: Partial<ChatMessage>) {
    setMessages((current) =>
      current.map((message) => (message.id === id ? { ...message, ...patch } : message)),
    );
  }

  function stopStream() {
    if (streamingId === null) return;
    abortRef.current?.abort();
    patchMessage(streamingId, { status: "stopped" });
    setStreamingId(null);
    setAnnouncement("Generation stopped.");
  }

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || streamingId !== null) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      status: "complete",
    };
    const assistantId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      status: "streaming",
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput("");
    setStreamingId(assistantId);
    setAnnouncement("Assistant is generating a response.");

    const controller = new AbortController();
    abortRef.current = controller;
    const decoder = new TextDecoder();
    let buffer = "";
    let sawDone = false;
    let sawError = false;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        let message = "The assistant request failed. Try again.";
        try {
          const payload: unknown = await response.json();
          if (
            typeof payload === "object" &&
            payload !== null &&
            "error" in payload &&
            typeof payload.error === "string"
          ) {
            message = payload.error;
          }
        } catch {
          message = "The assistant request failed. Try again.";
        }
        throw new Error(message);
      }

      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const rawEvent = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          const dataLine = rawEvent.split("\n").find((line) => line.startsWith("data: "));

          if (dataLine) {
            let payload: unknown;
            try {
              payload = JSON.parse(dataLine.slice(6));
            } catch {
              payload = null;
            }
            const parsed = chatEventSchema.safeParse(payload);
            if (parsed.success) {
              if (parsed.data.type === "token") {
                const token = parsed.data.value;
                setMessages((current) =>
                  current.map((message) =>
                    message.id === assistantId
                      ? { ...message, content: message.content + token }
                      : message,
                  ),
                );
              } else if (parsed.data.type === "done") {
                sawDone = true;
                patchMessage(assistantId, {
                  status: "complete",
                  citations: parsed.data.citations,
                  confidence: parsed.data.confidence,
                  kind: parsed.data.kind,
                });
              } else {
                sawError = true;
                patchMessage(assistantId, {
                  status: "error",
                  error: parsed.data.message,
                  kind: "error",
                });
              }
            }
          }

          boundary = buffer.indexOf("\n\n");
        }
      }

      if (!controller.signal.aborted && !sawDone && !sawError) {
        patchMessage(assistantId, {
          status: "error",
          error: "The stream ended before the final evidence event arrived.",
          kind: "error",
        });
      }

      if (!controller.signal.aborted) {
        setAnnouncement(
          sawError
            ? "Assistant response failed."
            : "Assistant response complete. Citations and confidence are available.",
        );
      }
    } catch (error) {
      if (controller.signal.aborted) {
        patchMessage(assistantId, { status: "stopped" });
        setAnnouncement("Generation stopped.");
      } else {
        patchMessage(assistantId, {
          status: "error",
          error: error instanceof Error ? error.message : "The assistant request failed.",
          kind: "error",
        });
        setAnnouncement("Assistant response failed.");
      }
    } finally {
      if (!controller.signal.aborted) {
        abortRef.current = null;
        setStreamingId(null);
      }
    }
  }

  return (
    <section aria-labelledby="assistant-heading" className="border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <div>
          <h2 id="assistant-heading" className="text-sm font-semibold">
            Portfolio assistant
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Streamed by the provided fixture endpoint. Every answer cites its evidence.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 border border-primary/25 bg-primary/5 px-2 py-1 font-mono text-[10px] text-primary">
          <Sparkles aria-hidden="true" className="size-3" />
          AI surface
        </span>
      </div>

      <section
        className="min-h-[360px] max-h-[58vh] overflow-y-auto px-4 py-5"
        aria-label="Conversation"
      >
        {messages.length === 0 ? (
          <div className="mx-auto flex max-w-xl flex-col items-center py-8 text-center">
            <span
              aria-hidden="true"
              className="grid size-10 place-items-center rounded-sm border border-primary/25 bg-primary/5 text-primary"
            >
              <Sparkles className="size-4" />
            </span>
            <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em]">
              Ask the portfolio a question
            </h3>
            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
              The assistant reads the starter-pack fixtures. It will say when a question falls
              outside the dataset.
            </p>
            <div className="mt-5 grid w-full gap-2 sm:grid-cols-2">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => ask(question)}
                  className="border bg-background px-3 py-2.5 text-left text-xs leading-relaxed transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ol className="space-y-5">
            {messages.map((message) =>
              message.role === "user" ? (
                <li key={message.id} className="flex justify-end">
                  <p className="max-w-[85%] border bg-secondary px-3 py-2 text-sm leading-relaxed">
                    {message.content}
                  </p>
                </li>
              ) : (
                <li key={message.id}>
                  <AssistantMessage message={message} lookup={lookup} />
                </li>
              ),
            )}
          </ol>
        )}
        <div ref={endRef} />
      </section>

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <form
        className="border-t bg-background/60 px-3 py-3"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(input);
        }}
      >
        <div className="flex items-center gap-2">
          <label htmlFor="assistant-question" className="sr-only">
            Ask a question about the portfolio
          </label>
          <input
            id="assistant-question"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about a market, product or period"
            className="h-9 min-w-0 flex-1 border bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
          {streamingId ? (
            <button
              type="button"
              onClick={stopStream}
              className="inline-flex h-9 items-center gap-1.5 border px-3 text-xs font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Square aria-hidden="true" className="size-3 fill-current" />
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="inline-flex h-9 items-center gap-1.5 bg-primary px-3 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Send aria-hidden="true" className="size-3.5" />
              Ask
            </button>
          )}
        </div>
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">
          POST /api/chat · Server-Sent Events · fixture-backed mock
        </p>
      </form>
    </section>
  );
}

function AssistantMessage({ message, lookup }: { message: ChatMessage; lookup: CitationLookup }) {
  const confidence = message.confidence ? confidenceStyles[message.confidence] : undefined;
  const citations: ResolvedCitation[] =
    message.citations?.map((citation) => resolveCitation(citation, lookup)) ?? [];
  const isError = message.status === "error";

  return (
    <article className="border-t border-border/70 pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium">Market Ops assistant</span>
        {isError ? (
          <span className="inline-flex items-center gap-1 border border-destructive/35 bg-destructive/5 px-1.5 py-0.5 font-mono text-[10px] text-destructive">
            <CircleAlert aria-hidden="true" className="size-2.5" />
            Assistant error
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 border border-primary/25 bg-primary/5 px-1.5 py-0.5 font-mono text-[10px] text-primary">
            <Sparkles aria-hidden="true" className="size-2.5" />
            AI-generated
          </span>
        )}
        {message.status === "complete" && confidence && message.kind !== "abstain" ? (
          <span
            className={cn(
              "ml-auto inline-flex items-center gap-1.5 font-mono text-[10px]",
              confidence.className,
            )}
          >
            <span aria-hidden="true" className="flex gap-0.5">
              {[1, 2, 3].map((bar) => (
                <span
                  key={bar}
                  className={cn(
                    "block h-2.5 w-0.5 rounded-full bg-current",
                    bar > confidence.bars && "opacity-25",
                  )}
                />
              ))}
            </span>
            {confidence.label}
          </span>
        ) : null}
      </div>

      {message.kind === "abstain" && message.status === "complete" ? (
        <p className="mt-3 flex items-center gap-1.5 border border-status-atrisk/35 bg-status-atrisk/8 px-2 py-1.5 text-[11px] text-status-atrisk">
          <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" />
          Outside the dataset. No answer was invented.
        </p>
      ) : null}

      {isError ? (
        <p
          role="alert"
          className="mt-3 flex items-center gap-1.5 border border-destructive/35 bg-destructive/5 px-2 py-1.5 text-[11px] text-destructive"
        >
          <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" />
          {message.error ?? "The response stream failed."}
        </p>
      ) : null}

      <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
        {message.content}
        {message.status === "streaming" ? (
          <span
            aria-hidden="true"
            className="ml-1 inline-block h-3.5 w-1.5 animate-pulse bg-primary align-middle motion-reduce:animate-none"
          />
        ) : null}
      </div>

      {message.status === "streaming" ? (
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">Generating response…</p>
      ) : null}

      {message.status === "stopped" ? (
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">
          Generation stopped by user.
        </p>
      ) : null}

      {message.status === "complete" && message.confidence ? (
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          {confidenceNote(message.confidence, message.kind)}
        </p>
      ) : null}

      {message.status === "complete" && citations.length > 0 ? (
        <div className="mt-4 border-t pt-3">
          <p className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
            <Database aria-hidden="true" className="size-3" />
            Evidence from source data
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {citations.map((citation) => (
              <li key={citation.key}>
                {citation.href ? (
                  <Link
                    href={citation.href}
                    title={citation.secondary || undefined}
                    className="inline-flex items-center gap-1 border bg-background px-1.5 py-1 font-mono text-[10px] text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {citation.hasExplicitLabel ? citation.label : citation.secondary}
                  </Link>
                ) : (
                  <span
                    title={citation.secondary || undefined}
                    className="inline-flex items-center gap-1 border bg-background px-1.5 py-1 font-mono text-[10px] text-foreground"
                  >
                    {citation.hasExplicitLabel ? citation.label : citation.secondary}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
