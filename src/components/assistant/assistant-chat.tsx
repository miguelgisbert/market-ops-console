"use client";

import { CircleAlert, Database, Send, Sparkles, Square } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  type ChatFixture,
  type Confidence,
  findFixture,
  suggestedQuestions,
} from "@/lib/chat/fixtures";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  fixture?: ChatFixture;
  streaming?: boolean;
  stopped?: boolean;
};

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

export function AssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const timerRef = useRef<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const lastMessageId = messages.at(-1)?.id;

  useEffect(() => {
    if (!lastMessageId) return;
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lastMessageId]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, []);

  function stopStream() {
    if (streamingId === null) return;
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setMessages((current) =>
      current.map((message) =>
        message.id === streamingId ? { ...message, streaming: false, stopped: true } : message,
      ),
    );
    setStreamingId(null);
    setAnnouncement("Generation stopped.");
  }

  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || streamingId !== null) return;

    const fixture = findFixture(trimmed);
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    const assistantId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      fixture,
      streaming: true,
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput("");
    setStreamingId(assistantId);
    setAnnouncement("Assistant is generating a response.");

    const tokens = fixture.answer.split(/(\s+)/);
    let index = 0;

    timerRef.current = window.setInterval(() => {
      index = Math.min(tokens.length, index + 2);
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? { ...message, content: tokens.slice(0, index).join("") }
            : message,
        ),
      );

      if (index >= tokens.length) {
        if (timerRef.current !== null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setStreamingId(null);
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId ? { ...message, streaming: false } : message,
          ),
        );
        setAnnouncement(
          fixture.kind === "error"
            ? "Assistant response failed."
            : "Assistant response complete. Citations and confidence are available.",
        );
      }
    }, 24);
  }

  return (
    <section aria-labelledby="assistant-heading" className="border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <div>
          <h2 id="assistant-heading" className="text-sm font-semibold">
            Portfolio assistant
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Answers cite the markets, products and periods used.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 border border-primary/25 bg-primary/5 px-2 py-1 font-mono text-[10px] text-primary">
          <Sparkles aria-hidden="true" className="size-3" />
          AI surface
        </span>
      </div>

      <section
        className="max-h-[58vh] min-h-[340px] overflow-y-auto px-4 py-5"
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
              The assistant can read market, product and period metrics. It will say when a question
              falls outside the dataset.
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
                  <AssistantMessage message={message} />
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
          ask(input);
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
          Demo fixtures · Replace with the provided SSE contract when available
        </p>
      </form>
    </section>
  );
}

function AssistantMessage({ message }: { message: ChatMessage }) {
  const fixture = message.fixture;
  if (!fixture) return null;

  const confidence = confidenceStyles[fixture.confidence];
  const isError = fixture.kind === "error";

  return (
    <article
      className={cn("border-l-2 pl-4", isError ? "border-l-destructive" : "border-l-primary")}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium">Meridian assistant</span>
        <span className="inline-flex items-center gap-1 border border-primary/25 bg-primary/5 px-1.5 py-0.5 font-mono text-[10px] text-primary">
          <Sparkles aria-hidden="true" className="size-2.5" />
          AI-generated
        </span>
        {!message.streaming && fixture.kind !== "abstention" ? (
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

      {fixture.kind === "abstention" && !message.streaming ? (
        <p className="mt-3 flex items-center gap-1.5 border border-status-atrisk/35 bg-status-atrisk/8 px-2 py-1.5 text-[11px] text-status-atrisk">
          <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" />
          Outside the dataset. No answer was invented.
        </p>
      ) : null}

      {isError && !message.streaming ? (
        <p
          role="alert"
          className="mt-3 flex items-center gap-1.5 border border-destructive/35 bg-destructive/5 px-2 py-1.5 text-[11px] text-destructive"
        >
          <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" />
          The response stream failed. No data conclusion is available.
        </p>
      ) : null}

      <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
        {message.content}
        {message.streaming ? (
          <span
            aria-hidden="true"
            className="ml-1 inline-block h-3.5 w-1.5 animate-pulse bg-primary align-middle motion-reduce:animate-none"
          />
        ) : null}
      </div>

      {message.streaming ? (
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">Generating response…</p>
      ) : null}

      {message.stopped ? (
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">
          Generation stopped by user.
        </p>
      ) : null}

      {!message.streaming && fixture.citations.length > 0 ? (
        <div className="mt-4 border-t pt-3">
          <p className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
            <Database aria-hidden="true" className="size-3" />
            Evidence from source data
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {fixture.citations.map((citation) => (
              <li key={`${citation.kind}-${citation.label}`}>
                {citation.href ? (
                  <Link
                    href={citation.href}
                    className="inline-flex items-center gap-1 border bg-background px-1.5 py-1 font-mono text-[10px] text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {citation.label}
                    {citation.note ? (
                      <span className="text-muted-foreground">· {citation.note}</span>
                    ) : null}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 border bg-background px-1.5 py-1 font-mono text-[10px] text-foreground">
                    {citation.label}
                    {citation.note ? (
                      <span className="text-muted-foreground">· {citation.note}</span>
                    ) : null}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            {fixture.confidenceNote}
          </p>
        </div>
      ) : null}
    </article>
  );
}
