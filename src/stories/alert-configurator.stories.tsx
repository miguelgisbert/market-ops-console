import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AlertConfigurator } from "@/components/alerts/alert-configurator";

const meta = {
  title: "Alerts/Configurator",
  component: AlertConfigurator,
  args: {
    regions: [
      { id: "eu", name: "Europe" },
      { id: "apac", name: "APAC" },
    ],
    markets: [
      {
        id: "de",
        name: "Germany",
        regionId: "eu",
        growthPct: -9.7,
        forecastAttainmentPct: 92.2,
      },
      {
        id: "cn",
        name: "China",
        regionId: "apac",
        growthPct: 18.2,
        forecastAttainmentPct: 106.6,
      },
    ],
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof AlertConfigurator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
