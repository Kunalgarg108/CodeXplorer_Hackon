/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
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
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Copilot Money tokens
        canvas: "#000814",
        "deep-surface": "#010d1e",
        "indigo-surface": "#001533",
        "cobalt-surface": "#00215e",
        "paper-white": "#ffffff",
        fog: "#ccced0",
        mist: "#999ca1",
        "steel-border": "#11263b",
        "signal-blue": "#1c6cff",
        "tag-coral": "#ff4433",
        "tag-lime": "#00cc4b",
        "tag-tangerine": "#ff8833",
        "tag-hot-pink": "#ff33aa",
        "tag-violet": "#9019e6",
        "tag-sunflower": "#ffcc02",
        "tag-sky": "#00acfe",
        "tag-ember": "#ea687c",
        "tag-olive": "#94ae43",
        "tag-slate": "#5c6f8a",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 4s ease-in-out infinite",
        "shimmer": "shimmer 1.5s ease-in-out infinite",
      },
      boxShadow: {
        neomorphic: "rgba(255,255,255,0.16) 4px 4px 16px -4px inset, rgba(0,0,0,0.2) -4px -4px 16px -4px inset, rgba(255,255,255,0.08) 4px 4px 8px 0px inset",
        glow: "rgba(38,113,217,0.08) 0px 0px 12px 0px inset, rgba(0,0,0,0.32) 0px -4px 8px 0px inset",
        "signal-glow": "0 0 24px rgba(28,108,255,0.3)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}