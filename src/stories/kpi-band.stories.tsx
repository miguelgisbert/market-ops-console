import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { KpiBand, type KpiMetric } from "@/components/dashboard/kpi-band";

const metrics: KpiMetric[] = [
  {
    label: "Portfolio revenue",
    value: "$22.9M",
    detail: "May 2026, all markets",
  },
  {
    label: "Growth vs prior year",
    value: "+7.3%",
    detail: "Like-for-like, reporting currency",
    tone: "positive",
  },
  {
    label: "Forecast attainment",
    value: "100.4%",
    detail: "Actual revenue against plan",
    tone: "positive",
  },
  {
    label: "Markets at risk",
    value: "6 of 13",
    detail: "2 off track",
    tone: "warning",
  },
];

const meta = {
  title: "Dashboard/KPI band",
  component: KpiBand,
  args: { metrics },
  parameters: { layout: "padded" },
} satisfies Meta<typeof KpiBand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
