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
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        flare: {
          blue: "#2860E8",
          "blue-hover": "#1d4ed8",
          "blue-light": "#EBF1FD",
          navy: "#172033",
          "navy-dark": "#0F1523",
          bg: "#FFFFFF",
          surface: "#F3F6FA",
          text: "#111111",
          muted: "#556275",
          border: "#D5DCE6",
          "border-dark": "#232F47",
        },
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2860E8",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#172033",
        },
      },
      borderRadius: {
        DEFAULT: "4px",
        sm: "2px",
        md: "4px",
        lg: "6px",
        xl: "8px",
        "2xl": "12px",
      },
      boxShadow: {
        flare: "0 2px 8px rgba(23, 32, 51, 0.06)",
        "flare-elevated": "0 8px 24px rgba(23, 32, 51, 0.08)",
        button: "0 2px 10px rgba(40, 96, 232, 0.25)",
        "button-hover": "0 4px 16px rgba(40, 96, 232, 0.35)",
        subtle: "0 1px 3px rgba(0, 0, 0, 0.04)",
        card: "0 1px 3px rgba(23, 32, 51, 0.05)",
        "card-hover": "0 6px 18px rgba(23, 32, 51, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
