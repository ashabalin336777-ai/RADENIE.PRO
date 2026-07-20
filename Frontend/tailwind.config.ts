import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAF9",
        brand: {
          DEFAULT: "#2C7A7B",
          foreground: "#FAFAF9",
        },
        accent: {
          DEFAULT: "#F687B3",
          foreground: "#FAFAF9",
        },
        foreground: "#292524",
        muted: {
          DEFAULT: "#78716C",
          foreground: "#57534E",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#292524",
        },
        border: "#E7E5E4",
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
