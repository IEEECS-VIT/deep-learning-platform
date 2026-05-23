import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      spacing: {
        "1.75": "0.4375rem",
        "4.5": "1.125rem",
        "8.5": "2.125rem",
        "13": "3.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
