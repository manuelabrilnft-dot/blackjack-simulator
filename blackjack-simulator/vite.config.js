import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base` keeps asset paths correct when the build is served from a
// GitHub Pages project URL such as /blackjack-simulator/.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
