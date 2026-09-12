import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#161512",
          light: "#FAF9F6",
        },
        surface: {
          DEFAULT: "#1C1B17",
          elevated: "#24221E",
          hover: "#2D2A25",
          subtle: "#161512",
        },
        border: {
          DEFAULT: "#2B2924",
          subtle: "#2B2924",
          strong: "#3D3A33",
          light: "#E7E3DA",
        },
        content: {
          primary: "#F2F0EA",
          secondary: "#A6A29A",
          muted: "#6E6A62",
          dark: "#1A1815",
        },
        brand: {
          DEFAULT: "#FF5A1F",
          hover: "#E04B14",
          subtle: "rgba(255, 90, 31, 0.12)",
        },
        status: {
          success: "#0B6E4F",
          successBg: "rgba(11, 110, 79, 0.15)",
          critical: "#D9402B",
          criticalBg: "rgba(217, 64, 43, 0.15)",
          warning: "#D97706",
          warningBg: "rgba(217, 119, 6, 0.15)",
          neutral: "#6E6A62",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "monospace"],
      },
      borderRadius: {
        card: "8px",
        btn: "6px",
        badge: "9999px",
      },
    },
  },
  plugins: [],
};
export default config;
