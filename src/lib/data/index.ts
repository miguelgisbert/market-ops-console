import { mockDataset } from "./mock";
import type { Dataset } from "./schema";

export function getDataset(): Dataset {
  return mockDataset;
}

export * from "./schema";
export * from "./selectors";
