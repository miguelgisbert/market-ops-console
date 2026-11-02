import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/globals.css";
import "./preview.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "canvas",
      values: [{ name: "canvas", value: "oklch(0.965 0.007 245)" }],
    },
  },
};

export default preview;
