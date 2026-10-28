import { layoutSettings, scriptRegistry } from "./theme-settings.js";
import { versionAsset } from "./performance.js";
export function getSiteLayout(pageUrl = "/about/") {
  const path = new URL(pageUrl, "https://livingrhea.com").pathname;
  const key =
    path === "/" ? "livingrhea-com" : path.split("/").filter(Boolean)[0];
  const layout = layoutSettings[key] || layoutSettings.about;
  return {
    ...layout,
    scripts: layout.scripts.map((id) => {
      const script = scriptRegistry[id];
      return script.src ? { ...script, src: versionAsset(script.src) } : script;
    }),
  };
}
