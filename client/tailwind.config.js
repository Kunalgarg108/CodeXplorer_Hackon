/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#000814",
        deep: "#010d1e",
        indigo: "#001533",
        cobalt: "#00215e",
        paper: "#ffffff",
        fog: "#ccced0",
        mist: "#999ca1",
        steel: "#11263b",
        signal: "#1c6cff",
        "tag-coral": "#ff4433",
        "tag-lime": "#00cc4b",
        "tag-tangerine": "#ff8833",
        "tag-pink": "#ff33aa",
        "tag-violet": "#9019e6",
        "tag-sunflower": "#ffcc02",
        "tag-sky": "#00acfe",
        "tag-ember": "#ea687c",
        "tag-olive": "#94ae43",
        "tag-slate": "#5c6f8a",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1c6cff",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#010d1e",
          foreground: "#ccced0",
        },
        destructive: {
          DEFAULT: "#ff4433",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#001533",
          foreground: "#999ca1",
        },
        accent: {
          DEFAULT: "#00215e",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#010d1e",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#010d1e",
          foreground: "#ffffff",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
        body: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        btn: "16px",
        card: "24px",
        tag: "20px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        neo: "rgba(255,255,255,0.08) 4px 4px 8px 0px inset, rgba(255,255,255,0.16) 4px 4px 16px -4px inset, rgba(0,0,0,0.2) -4px -4px 16px -4px inset",
        "neo-glow": "rgba(38,113,217,0.08) 0px 0px 12px 0px inset, rgba(0,0,0,0.32) 0px -4px 8px 0px inset",
        "neo-pressed": "rgba(0,0,0,0.2) -4px -4px 16px -4px inset",
      },
      maxWidth: {
        page: "1200px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
