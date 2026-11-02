import { z } from "zod";
import rawFixtures from "@/data/fixtures.json";
import { type ChatEvent, type Fixture, fixturesFileSchema } from "@/lib/chat/schema";

const fixtures = fixturesFileSchema.parse(rawFixtures);

const requestSchema = z.object({
  question: z.string().min(1).max(2_000),
});

function pickFixture(question: string): Fixture {
  const normalized = question.toLowerCase();
  const match = fixtures.fixtures.find((fixture) =>
    (fixture.keywords ?? []).some((keyword) => normalized.includes(keyword)),
  );
  return match ?? fixtures.default;
}

function encodeEvent(event: ChatEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "A question between 1 and 2,000 characters is required." },
      { status: 400 },
    );
  }

  const fixture = pickFixture(parsed.data.question);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      if (request.signal.aborted) {
        controller.close();
        return;
      }

      if (fixture.kind === "error") {
        controller.enqueue(
          encodeEvent({
            type: "error",
            message: fixture.error ?? "The assistant service is unavailable.",
          }),
        );
        controller.close();
        return;
      }

      const tokens = fixture.answer.text.match(/\S+\s*/g) ?? [];

      for (const value of tokens) {
        if (request.signal.aborted) break;
        controller.enqueue(encodeEvent({ type: "token", value }));
        await new Promise((resolve) => setTimeout(resolve, 35));
      }

      if (!request.signal.aborted) {
        controller.enqueue(
          encodeEvent({
            type: "done",
            kind: fixture.kind,
            citations: fixture.answer.citations,
            confidence: fixture.answer.confidence,
          }),
        );
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
