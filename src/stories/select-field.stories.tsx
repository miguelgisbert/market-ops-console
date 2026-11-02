import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { SelectField } from "@/components/form/select-field";

function SelectFieldDemo() {
  const [value, setValue] = useState("eu");
  return (
    <SelectField
      id="story-region"
      label="Region"
      value={value}
      options={[
        { value: "na", label: "North America" },
        { value: "eu", label: "Europe" },
        { value: "apac", label: "APAC" },
      ]}
      onValueChange={setValue}
      className="w-56"
    />
  );
}

const meta = {
  title: "Forms/Select field",
  component: SelectField,
  tags: ["autodocs"],
  args: {
    id: "story-region",
    label: "Region",
    value: "eu",
    options: [
      { value: "na", label: "North America" },
      { value: "eu", label: "Europe" },
      { value: "apac", label: "APAC" },
    ],
    onValueChange: () => undefined,
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof SelectField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <SelectFieldDemo />,
};
