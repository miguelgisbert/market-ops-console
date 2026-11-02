import { describe, expect, it } from "vitest";
import { createLiveDataIndex, createLiveDataset, dataIndex, dataset } from "@/lib/data";

describe("live data simulation", () => {
  it("changes the latest period without rewriting historical rows", () => {
    const liveDataset = createLiveDataset(dataset, 7);
    const latestPeriod = dataset.meta.latestPeriod;
    const baseLatest = dataset.series.filter((row) => row.period === latestPeriod);
    const liveLatest = liveDataset.series.filter((row) => row.period === latestPeriod);
    const baseHistory = dataset.series.filter((row) => row.period !== latestPeriod);
    const liveHistory = liveDataset.series.filter((row) => row.period !== latestPeriod);

    expect(liveLatest.some((row, index) => row.actual !== baseLatest[index]?.actual)).toBe(true);
    expect(liveHistory).toEqual(baseHistory);
    expect(liveDataset.series).toHaveLength(dataset.series.length);
  });

  it("produces a usable derived index that differs by tick", () => {
    const first = createLiveDataIndex(dataset, 1);
    const second = createLiveDataIndex(dataset, 2);
    const firstGermany = first.marketSeries.get("de")?.at(-1)?.actual;
    const secondGermany = second.marketSeries.get("de")?.at(-1)?.actual;

    expect(firstGermany).toBeDefined();
    expect(secondGermany).toBeDefined();
    expect(firstGermany).not.toBe(dataIndex.marketSeries.get("de")?.at(-1)?.actual);
    expect(firstGermany).not.toBe(secondGermany);
  });
});
