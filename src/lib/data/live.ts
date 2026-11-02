import { createDataIndex, type DataIndex } from "./build";
import type { Dataset } from "./schema";

function hashString(input: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function createLiveDataset(dataset: Dataset, tick: number): Dataset {
  const latestPeriod = dataset.meta.latestPeriod;

  return {
    ...dataset,
    series: dataset.series.map((row) => {
      if (row.period !== latestPeriod) return row;
      const random = mulberry32(hashString(`${row.marketId}:${row.productId}:${tick}`));
      const factor = 1 + (random() - 0.5) * 0.025;
      return {
        ...row,
        actual: Math.max(0, Math.round(row.actual * factor)),
        units: Math.max(0, Math.round(row.units * factor)),
      };
    }),
  };
}

export function createLiveDataIndex(dataset: Dataset, tick: number): DataIndex {
  return createDataIndex(createLiveDataset(dataset, tick));
}
