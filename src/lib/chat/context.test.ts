import { describe, expect, it } from "vitest";
import { buildAssistantContext } from "@/lib/chat/context";
import { dataIndex } from "@/lib/data";

describe("assistant dashboard context", () => {
  it("builds a prompt and label from the selected scope", () => {
    const context = buildAssistantContext(dataIndex, {
      market: "de",
      period: "2026-05",
    });

    expect(context?.label).toContain("Germany");
    expect(context?.label).toContain("May 2026");
    expect(context?.prompt).toContain("Germany");
    expect(context?.clearHref).toBe("/assistant");
  });

  it("returns null when no valid scope is provided", () => {
    expect(buildAssistantContext(dataIndex, {})).toBeNull();
    expect(buildAssistantContext(dataIndex, { market: "missing" })).toBeNull();
  });
});
