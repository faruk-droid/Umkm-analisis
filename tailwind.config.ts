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
        // Flat UI Classic Palette (2018 Aesthetic)
        flat: {
          turquoise: "#1abc9c",
          greensea: "#16a085",
          emerald: "#2ecc71",
          nephritis: "#27ae60",
          peterriver: "#3498db",
          belizehole: "#2980b9",
          amethyst: "#9b59b6",
          wisteria: "#8e44ad",
          wetasphalt: "#34495e",
          midnightblue: "#2c3e50",
          sunflower: "#f1c40f",
          orange: "#f39c12",
          carrot: "#e67e22",
          pumpkin: "#d35400",
          alizarin: "#e74c3c",
          pomegranate: "#c0392b",
          clouds: "#ecf0f1",
          silver: "#bdc3c7",
          concrete: "#95a5a6",
          asbestos: "#7f8c8d",
        },
        brand: {
          50: "#e8f8f5",
          100: "#d1f2eb",
          200: "#a3e4d7",
          300: "#76d7c4",
          400: "#48c9b0",
          500: "#1abc9c", // Flat Turquoise
          600: "#16a085", // Flat Green Sea
          700: "#117a65",
          800: "#0e6252",
          900: "#0b4d40",
        },
      },
      borderRadius: {
        // Flat UI 2018 preferred neat, modest corner radiuses (4px to 8px)
        none: "0",
        sm: "3px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
        xl: "10px",
        "2xl": "12px",
        full: "9999px",
      },
      boxShadow: {
        // Flat 2.0: Subtle, crisp elevations without heavy blurs
        flat: "0 2px 0 rgba(0, 0, 0, 0.05)",
        "flat-md": "0 3px 0 rgba(0, 0, 0, 0.08)",
        "flat-btn": "0 3px 0 rgba(0, 0, 0, 0.15)",
        "flat-card": "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
