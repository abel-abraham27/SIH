import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f131c",
        surface: {
          DEFAULT: "#181c28",
          subtle: "#1f2434",
          border: "#2b3248",
          hover: "#282f44",
        },
        brand: {
          primary: "#8083ff",
          indigo: "#c0c1ff",
          violet: "#d0bcff",
          cyan: "#4cd7f6",
          purple: "#571bc1",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      animation: {
        'glow': 'glow 3s infinite alternate',
        'pulse-subtle': 'pulse-subtle 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(128, 131, 255, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(76, 215, 246, 0.4)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
