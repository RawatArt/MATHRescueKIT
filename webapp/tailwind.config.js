/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "var(--black)",
        panel: "var(--panel)",
        panel2: "var(--panel2)",
        steel: "var(--steel)",
        edge: "var(--edge)",
        amber: "var(--amber)",
        ink: "var(--ink)",
        mute: "var(--mute)",
        light: "var(--light)",
      },
      fontFamily: {
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
        body: ['Sarabun', '"Noto Sans Thai"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
