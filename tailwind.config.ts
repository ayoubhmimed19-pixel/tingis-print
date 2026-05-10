import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#16a9ea",
          light: "#4fc3f7",
          dark: "#0b86c7",
        },
        secondary: {
          DEFAULT: "#fbdc0d",
          light: "#fde960",
          dark: "#d4b800",
        },
        dark: {
          DEFAULT: "#0a0a0a",
          100: "#111827",
          200: "#1f2937",
          300: "#374151",
        },
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "sans-serif"],
        sans: ["var(--font-cairo)", "sans-serif"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(22,169,234,0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(22,169,234,0.8)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
