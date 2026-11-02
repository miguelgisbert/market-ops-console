import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProductTable } from "@/components/analyst/product-table";
import type { ProductSummary } from "@/lib/data/selectors";

const products: ProductSummary[] = [
  {
    id: "veltrix",
    name: "Veltrix",
    revenue: 7_900_000,
    growthPct: 6.8,
    sharePct: 34.5,
    forecastAttainmentPct: 100.8,
    status: "on_track",
    series: [],
  },
  {
    id: "nuvora",
    name: "Nuvora",
    revenue: 5_500_000,
    growthPct: 8.2,
    sharePct: 24.1,
    forecastAttainmentPct: 100.2,
    status: "on_track",
    series: [],
  },
  {
    id: "zephyra",
    name: "Zephyra",
    revenue: 2_000_000,
    growthPct: -1.2,
    sharePct: 8.6,
    forecastAttainmentPct: 97.9,
    status: "at_risk",
    series: [],
  },
];

const meta = {
  title: "Dashboard/Product table",
  component: ProductTable,
  args: { products, selectedProductId: "veltrix" },
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof ProductTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
