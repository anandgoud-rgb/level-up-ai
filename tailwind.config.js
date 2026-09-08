/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12203A",
        inkSoft: "#4A5A75",
        paper: "#EEF2F7",
        line: "#D8E0EA",
        volt: "#2C4BFF",
        voltDeep: "#1B33C4",
        marigold: "#FFB627",
        mint: "#17BE8B",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 18px 40px -20px rgba(18, 32, 58, 0.45)",
        lift: "0 2px 0 0 #12203A",
      },
    },
  },
  plugins: [],
};
