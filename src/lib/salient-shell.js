import { prepareMarkup, versionAsset } from "./performance.js";
// Original Salient page chrome captured once during migration. Builds are offline.
const snapshots = import.meta.glob("../content/shells/*.json", {
  eager: true,
  import: "default",
});
// Styles now live in src/styles/site and are bundled by each Astro route.
// Snapshot styles are historical; the repository-owned CSS is authoritative.
function stripSnapshotStyles(html) {
  return html.replace('https://digitalasset.intuit.com/render/content/dam/intuit/mc-fe/en_us/images/intuit-mc-rewards-text-dark.svg', '/vendor/mailchimp/intuit-mc-rewards-text-dark.svg').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<link\b[^>]*>/gi, tag => /\brel=["']stylesheet["']/i.test(tag) ? '' : tag);
}
export async function getSalientShell(pageUrl = "https://livingrhea.com/") {
  const path = new URL(pageUrl, "https://livingrhea.com").pathname;
  const slug =
    path === "/" ? "livingrhea-com" : path.split("/").filter(Boolean)[0];
  const shell = snapshots[`../content/shells/${slug}.json`];
  if (!shell) throw new Error(`Missing local layout snapshot for ${slug}`);
  return {
    ...shell,
    // A captured About-page shell must not give every blog post About metadata.
    headHtml: stripSnapshotStyles(shell.headHtml).replace(
      /<meta\b[^>]*(?:property|name)=["'](?:og:|twitter:)[^"']*["'][^>]*>/gi,
      "",
    ),
    preContent: await prepareMarkup(stripSnapshotStyles(shell.preContent)),
    postContent: await prepareMarkup(stripSnapshotStyles(shell.postContent)),
    scripts: shell.scripts.filter(s=>s.type!=="application/ld+json" && s.id!=="mcjs" && !(slug === "livingrhea-com" && ["nectar-slider-js", "nectar-slider-js-extra", "nectar_slider_priority-js"].includes(s.id)))
      .map(s=>s.src?{...s,src:versionAsset(s.src.includes("downloads.mailchimp.com/js/mc-validate.js") ? "/vendor/mailchimp/mc-validate-b15aceb04dbf.js" : s.src)}:s),
  };
}
