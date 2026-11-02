import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MarketTable } from "@/components/dashboard/market-table";
import type { MarketSummary } from "@/lib/data/selectors";

const markets: MarketSummary[] = [
  {
    id: "de",
    name: "Germany",
    iso2: "DE",
    iso3: "DEU",
    regionId: "eu",
    regionName: "Europe",
    revenue: 1_676_586,
    growthPct: -9.7,
    marketSharePct: 8.9,
    forecastAttainmentPct: 92.2,
    status: "off_track",
    anomalies: [],
    series: [],
  },
  {
    id: "gb",
    name: "United Kingdom",
    iso2: "GB",
    iso3: "GBR",
    regionId: "eu",
    regionName: "Europe",
    revenue: 2_068_012,
    growthPct: 8.8,
    marketSharePct: 14,
    forecastAttainmentPct: 94.6,
    status: "at_risk",
    anomalies: [],
    series: [],
  },
  {
    id: "cn",
    name: "China",
    iso2: "CN",
    iso3: "CHN",
    regionId: "apac",
    regionName: "APAC",
    revenue: 3_776_883,
    growthPct: 18.2,
    marketSharePct: 37.2,
    forecastAttainmentPct: 106.6,
    status: "on_track",
    anomalies: [],
    series: [],
  },
];

const meta = {
  title: "Dashboard/Market table",
  component: MarketTable,
  args: { markets, selectedMarketId: "de" },
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof MarketTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
