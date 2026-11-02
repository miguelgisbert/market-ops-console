import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import type { SeriesPoint } from "@/lib/data/schema";

const data: SeriesPoint[] = [
  {
    period: "2024-06",
    actual: 19_800_000,
    forecast: 19_900_000,
    units: 40_000,
    priorYear: 18_700_000,
  },
  {
    period: "2024-07",
    actual: 20_100_000,
    forecast: 20_000_000,
    units: 41_000,
    priorYear: 19_100_000,
  },
  {
    period: "2024-08",
    actual: 21_200_000,
    forecast: 21_000_000,
    units: 42_500,
    priorYear: 20_000_000,
  },
  {
    period: "2024-09",
    actual: 21_000_000,
    forecast: 21_200_000,
    units: 42_000,
    priorYear: 20_300_000,
  },
  {
    period: "2024-10",
    actual: 20_400_000,
    forecast: 20_600_000,
    units: 41_000,
    priorYear: 20_100_000,
  },
  {
    period: "2024-11",
    actual: 21_600_000,
    forecast: 21_700_000,
    units: 43_000,
    priorYear: 20_400_000,
  },
];

const meta = {
  title: "Charts/Time series",
  tags: ["autodocs"],
  component: TimeSeriesChart,
  args: {
    data,
    entityName: "Portfolio",
    selectedPeriod: "2024-11",
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof TimeSeriesChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
