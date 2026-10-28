import { defineConfig } from "astro/config";
import criticalCss from "./integrations/critical-css.mjs";
export default defineConfig({
  integrations: [criticalCss()],
  site: "https://livingrhea.com",
  output: "static",
  trailingSlash: "always",
});
