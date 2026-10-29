import { defineConfig } from "astro/config";
export default defineConfig({
  site: "https://livingrhea.com",
  output: "static",
  trailingSlash: "always",
  // The whole design system is small, so every page ships its CSS inline:
  // no render-blocking stylesheet request.
  build: { inlineStylesheets: "always" },
});
