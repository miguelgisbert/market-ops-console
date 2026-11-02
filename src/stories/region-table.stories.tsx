import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RegionTable } from "@/components/analyst/region-table";
import type { RegionSummary } from "@/lib/data/selectors";

const regions: RegionSummary[] = [
  {
    id: "na",
    name: "North America",
    revenue: 4_379_989,
    growthPct: 10.2,
    marketSharePct: 18.5,
    forecastAttainmentPct: 101,
    marketsAtRisk: 0,
    marketCount: 2,
    status: "on_track",
    series: [],
  },
  {
    id: "eu",
    name: "Europe",
    revenue: 7_053_381,
    growthPct: 1.7,
    marketSharePct: 15.4,
    forecastAttainmentPct: 95.4,
    marketsAtRisk: 5,
    marketCount: 5,
    status: "at_risk",
    series: [],
  },
];

const meta = {
  title: "Dashboard/Region table",
  component: RegionTable,
  args: { regions, selectedRegionId: "eu" },
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof RegionTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
