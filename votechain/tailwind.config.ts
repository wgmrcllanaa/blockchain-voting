import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        au: {
          blue: "#003087",
          "blue-dark": "#001f5c",
          "blue-mid": "#0047bb",
          gold: "#FFB81C",
          "gold-light": "#FFCF5C",
        },
      },
      fontFamily: {
        heading: ["Cormorant Garamond", "serif"],
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
