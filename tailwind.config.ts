import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand palette (Safety Alert — from 07-DESIGN.md) ──────────────
        "primary-container": "#B32418",         // Deep red – primary buttons, brand
        "on-primary-fixed-variant": "#920503",  // Darker red – hover states
        "primary": "#ffb4a8",                   // Light pink-red (dark mode surface text)
        "primary-fixed": "#ffdad4",
        "primary-fixed-dim": "#ffb4a8",
        "on-primary": "#690000",
        "on-primary-fixed": "#410000",
        "inverse-primary": "#b52619",
        "on-primary-container": "#ffcac2",

        // ── Surface / Background ──────────────────────────────────────────
        "background": "#121413",
        "surface": "#121413",
        "surface-dim": "#121413",
        "surface-bright": "#383a38",
        "surface-charcoal": "#1A1A1C",
        "surface-container-lowest": "#0c0f0e",
        "surface-container-low": "#1a1c1b",
        "surface-container": "#1e201f",
        "surface-container-high": "#282a29",
        "surface-container-highest": "#333534",
        "surface-variant": "#333534",
        "inverse-surface": "#e2e3e1",
        "inverse-on-surface": "#2f3130",

        // ── Text / On-surface ─────────────────────────────────────────────
        "on-surface": "#e2e3e1",
        "on-background": "#e2e3e1",
        "on-surface-variant": "#e3beb8",
        "slate-gray": "#6B6E73",

        // ── Secondary ────────────────────────────────────────────────────
        "secondary": "#c8c6c9",
        "secondary-container": "#47464a",
        "secondary-fixed": "#e4e2e5",
        "secondary-fixed-dim": "#c8c6c9",
        "on-secondary": "#303033",
        "on-secondary-container": "#b6b4b8",
        "on-secondary-fixed": "#1b1b1e",
        "on-secondary-fixed-variant": "#47464a",

        // ── Tertiary (Amber accent) ───────────────────────────────────────
        "tertiary": "#ffb956",                  // Amber – badges, highlights, secondary CTAs
        "tertiary-container": "#815300",
        "tertiary-fixed": "#ffddb5",
        "tertiary-fixed-dim": "#ffb956",
        "on-tertiary": "#452b00",
        "on-tertiary-container": "#ffce8e",
        "on-tertiary-fixed": "#2a1800",
        "on-tertiary-fixed-variant": "#633f00",

        // ── Outline ──────────────────────────────────────────────────────
        "outline": "#aa8984",
        "outline-variant": "#5a403c",

        // ── Error ────────────────────────────────────────────────────────
        "error": "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-error-container": "#ffdad6",

        // ── Semantic status ───────────────────────────────────────────────
        "status-success": "#1E7A46",
        "status-error": "#C6362B",

        // ── Surface tint ─────────────────────────────────────────────────
        "surface-tint": "#ffb4a8",
      },

      fontFamily: {
        "headline-lg": ["var(--font-heading)"],
        "headline-lg-mobile": ["var(--font-heading)"],
        "headline-md": ["var(--font-heading)"],
        "headline-sm": ["var(--font-heading)"],
        "body-lg": ["var(--font-body)"],
        "body-md": ["var(--font-body)"],
        "body-technical": ["var(--font-body)"],
        "label-caps": ["var(--font-body)"],
      },

      fontSize: {
        "headline-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg-mobile": ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        "headline-md": ["32px", { lineHeight: "1.2", fontWeight: "600" }],
        "headline-sm": ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-technical": ["14px", { lineHeight: "1.5", fontWeight: "500" }],
        "label-caps": ["12px", { lineHeight: "1.2", letterSpacing: "0.1em", fontWeight: "700" }],
      },

      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
        card: "12px",
        control: "8px",
      },

      spacing: {
        "bento-gap": "16px",
        "margin-mobile": "16px",
        "margin-desktop": "48px",
        unit: "4px",
        gutter: "24px",
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },

      animation: {
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-in-right": "slideInRight 0.4s ease-out forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s infinite linear",
      },

      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },

      transitionDelay: {
        "100": "100ms",
        "200": "200ms",
        "300": "300ms",
        "400": "400ms",
        "500": "500ms",
      },
    },
  },
  plugins: [],
};

export default config;
