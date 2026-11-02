import { z } from "zod";
import { periodSchema } from "@/lib/data/schema";

export const confidenceSchema = z.enum(["high", "medium", "low"]);
export type Confidence = z.infer<typeof confidenceSchema>;

export const answerKindSchema = z.enum(["normal", "low_confidence", "abstain", "error"]);
export type AnswerKind = z.infer<typeof answerKindSchema>;

export const citationSchema = z
  .object({
    marketId: z.string().min(1).optional(),
    regionId: z.string().min(1).optional(),
    productId: z.string().min(1).optional(),
    period: periodSchema.optional(),
    label: z.string().min(1).optional(),
  })
  .refine(
    (citation) =>
      citation.marketId !== undefined ||
      citation.regionId !== undefined ||
      citation.productId !== undefined ||
      citation.period !== undefined,
    "A citation needs at least one dataset reference",
  );
export type Citation = z.infer<typeof citationSchema>;

export const fixtureSchema = z.object({
  id: z.string().min(1),
  keywords: z.array(z.string().min(1)).optional(),
  kind: answerKindSchema,
  answer: z.object({
    text: z.string(),
    citations: z.array(citationSchema),
    confidence: confidenceSchema,
  }),
  error: z.string().min(1).optional(),
});
export type Fixture = z.infer<typeof fixtureSchema>;

export const fixturesFileSchema = z.object({
  note: z.string().optional(),
  default: fixtureSchema,
  fixtures: z.array(fixtureSchema).min(1),
});
export type FixturesFile = z.infer<typeof fixturesFileSchema>;

export const tokenEventSchema = z.object({
  type: z.literal("token"),
  value: z.string(),
});

export const doneEventSchema = z.object({
  type: z.literal("done"),
  kind: answerKindSchema,
  citations: z.array(citationSchema),
  confidence: confidenceSchema,
});

export const errorEventSchema = z.object({
  type: z.literal("error"),
  message: z.string().min(1),
});

export const chatEventSchema = z.discriminatedUnion("type", [
  tokenEventSchema,
  doneEventSchema,
  errorEventSchema,
]);
export type ChatEvent = z.infer<typeof chatEventSchema>;
export type DoneEvent = z.infer<typeof doneEventSchema>;
