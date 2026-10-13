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
        background: "#F8FAFC",
        foreground: "#0F172A",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        primary: {
          DEFAULT: "#2563EB",
          foreground: "#FFFFFF",
          hover: "#1D4ED8",
          deep: "#1D4ED8",
          light: "#EFF6FF",
          tint: "#DBEAFE",
        },
        success: {
          DEFAULT: "#10B981",
          foreground: "#FFFFFF",
          light: "#ECFDF5",
        },
        secondary: {
          DEFAULT: "#F1F5F9",
          foreground: "#0F172A",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#EFF6FF",
          foreground: "#1D4ED8",
        },
        border: "#E2E8F0",
        input: "#E2E8F0",
        ring: "#2563EB",
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        button: "0 2px 8px -1px rgba(37, 99, 235, 0.35)",
        "button-hover": "0 4px 14px -1px rgba(37, 99, 235, 0.45)",
        card: "0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        "card-hover": "0 10px 25px -4px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.03)",
        "glow-blue": "0 0 24px -4px rgba(37, 99, 235, 0.16)",
        "command-palette": "0 20px 40px -10px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
