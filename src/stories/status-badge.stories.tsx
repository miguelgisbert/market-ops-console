import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatusBadge } from "@/components/dashboard/status-badge";

const meta = {
  title: "Dashboard/Status badge",
  component: StatusBadge,
  args: { status: "on_track" },
  argTypes: {
    status: {
      control: "select",
      options: ["on_track", "at_risk", "off_track"],
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnTrack: Story = {};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="on_track" />
      <StatusBadge status="at_risk" />
      <StatusBadge status="off_track" />
    </div>
  ),
};
