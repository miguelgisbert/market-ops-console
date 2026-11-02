import rawData from "@/data/data.json";
import { createDataIndex } from "./build";
import { type Dataset, datasetSchema } from "./schema";

export const dataset: Dataset = datasetSchema.parse(rawData);
export const dataIndex = createDataIndex(dataset);

export * from "./build";
export * from "./schema";
export * from "./selectors";
