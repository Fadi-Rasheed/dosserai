const background = "#ffffff";
const foreground = "#222222";
const surface = "#f7f7f7";
const mutedInk = "#717171";
const brand = "#222222";
const destructive = "#c13515";
const line = "#dddddd";
const field = "#b0b0b0";
const ring = "#22222259";

const config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background,
        foreground,
        card: {
          DEFAULT: background,
          foreground,
        },
        popover: {
          DEFAULT: background,
          foreground,
        },
        primary: {
          DEFAULT: brand,
          foreground: background,
        },
        secondary: {
          DEFAULT: surface,
          foreground,
        },
        muted: {
          DEFAULT: surface,
          foreground: mutedInk,
        },
        accent: {
          DEFAULT: surface,
          foreground,
        },
        brand,
        destructive,
        border: line,
        input: field,
        ring,
        chart: {
          1: "#222222",
          2: "#525252",
          3: "#717171",
          4: "#b0b0b0",
          5: "#dddddd",
        },
        sidebar: {
          DEFAULT: background,
          foreground,
          primary: brand,
          "primary-foreground": background,
          accent: surface,
          "accent-foreground": foreground,
          border: line,
          ring,
        },
      },
      borderRadius: {
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        lift: "0 6px 20px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        search: "0 16px 40px rgba(0,0,0,0.12), 0 3px 12px rgba(0,0,0,0.04)",
      },
    },
  },
};

export default config;
