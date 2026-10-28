import { optimizeStyles, prepareMarkup, versionAsset } from "./performance.js";
// Original Salient page chrome captured once during migration. Builds are offline.
const snapshots = import.meta.glob("../content/shells/*.json", {
  eager: true,
  import: "default",
});
export async function getSalientShell(pageUrl = "https://livingrhea.com/") {
  const path = new URL(pageUrl, "https://livingrhea.com").pathname;
  const slug =
    path === "/" ? "livingrhea-com" : path.split("/").filter(Boolean)[0];
  const shell = snapshots[`../content/shells/${slug}.json`];
  if (!shell) throw new Error(`Missing local layout snapshot for ${slug}`);
  return {
    ...shell,
    // A captured About-page shell must not give every blog post About metadata.
    headHtml: optimizeStyles(shell.headHtml).replace(
      /<meta\b[^>]*(?:property|name)=["'](?:og:|twitter:)[^"']*["'][^>]*>/gi,
      "",
    ),
    preContent: await prepareMarkup(optimizeStyles(shell.preContent)),
    postContent: await prepareMarkup(optimizeStyles(shell.postContent)),
    scripts: shell.scripts.filter(s=>s.type!=="application/ld+json")
      .map(s=>s.src?{...s,src:versionAsset(s.src)}:s),
  };
}
