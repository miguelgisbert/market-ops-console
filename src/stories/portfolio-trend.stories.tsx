import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PortfolioTrend } from "@/components/dashboard/portfolio-trend";
import type { SeriesPoint } from "@/lib/data/schema";

const series: SeriesPoint[] = Array.from({ length: 12 }, (_, index) => ({
  period: `2025-${String(index + 1).padStart(2, "0")}`,
  actual: 20_000_000 + index * 280_000,
  forecast: 20_100_000 + index * 260_000,
  units: 40_000 + index * 300,
  priorYear: 19_000_000 + index * 250_000,
}));

const meta = {
  title: "Dashboard/Portfolio trend",
  component: PortfolioTrend,
  args: { series },
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof PortfolioTrend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
