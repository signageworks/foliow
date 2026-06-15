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
        background: "#0a0a0a",
        surface: "#141414",
        "surface-2": "#1e1e1e",
        border: "#2a2a2a",
        "border-hover": "#3a3a3a",
        muted: "#6b6b6b",
        "muted-foreground": "#a3a3a3",
        foreground: "#f5f5f5",
        accent: {
          DEFAULT: "#ff5a1f",
          hover: "#e84d16",
          muted: "#ff5a1f26",
          foreground: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        shimmer: "shimmer 1.5s infinite linear",
      },
    },
  },
  plugins: [],
};

export default config;
