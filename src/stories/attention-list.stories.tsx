import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AttentionList } from "@/components/dashboard/attention-list";

const items = [
  {
    id: "de",
    name: "Germany",
    regionName: "Europe",
    status: "off_track" as const,
    period: "2026-03",
    note: "Revenue fell 27% versus the prior month.",
  },
  {
    id: "it",
    name: "Italy",
    regionName: "Europe",
    status: "at_risk" as const,
    period: "2026-05",
    note: "Revenue landed 93.8% of forecast, with growth of +0.3%.",
  },
];

const meta = {
  title: "Dashboard/Attention list",
  component: AttentionList,
  args: { items },
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof AttentionList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
