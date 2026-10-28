// Local content reader. Preserves the exported WordPress record shape so the
// existing faithful Astro templates keep their original appearance. No API calls.

import { toLocal } from "./wp-url.js";
import imageMap from "./image-map.json";
import linkFixes from "../../migration/link-fixes.json";

// Set of image paths (lowercased) the mirror has an optimized .webp sibling
// for. These files are already local; no mirror step is needed during builds.
const webpSet = new Set(imageMap.map((p) => p.toLowerCase()));

// Rewrite jpg/png references to their optimized .webp copy where one exists.
function preferWebp(html) {
  return html.replace(
    /(\/wp-(?:content|includes)\/[^"'\s)?]+)\.(jpe?g|png)/gi,
    (m, base, ext) =>
      webpSet.has(`${base}.${ext}`.toLowerCase()) ? `${base}.webp` : m,
  );
}

// Salient's CTA button (.nectar-cta) renders the visible label in a sibling
// <span class="text"> while the actual <a class="link_text"> holds only an
// arrow — so the link has no accessible name. Give it an aria-label from the
// sibling label ("Links must have discernible text").
function labelCtaLinks(html) {
  return html.replace(
    /(<span class="text">\s*([^<]*?)\s*<\/span>\s*<span class="link_wrap"[^>]*>\s*<a\s+)(class="link_text")/gi,
    (m, pre, label, cls) =>
      label ? `${pre}aria-label="${label.replace(/"/g, "&quot;")}" ${cls}` : m,
  );
}

// Make an entity self-contained: localize every WP asset URL to its mirrored
// /public copy, then prefer the optimized WebP variant. Nothing loads from the
// WP origin at runtime.
function localizeEntity(entity) {
  if (!entity || typeof entity !== "object") return entity;
  if (entity.content?.rendered)
    entity.content.rendered = labelCtaLinks(
      preferWebp(toLocal(entity.content.rendered)),
    );
  if (entity.content?.rendered) {
    for (const fix of linkFixes)
      entity.content.rendered = entity.content.rendered
        .replaceAll(`href="${fix.from}"`, `href="${fix.to}"`)
        .replaceAll(`href='${fix.from}'`, `href='${fix.to}'`);
    entity.content.rendered = entity.content.rendered.replace(
      /<a\b[^>]*href=["'][^"']*nextgen-attach_to_post[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi,
      "$1",
    );
  }
  if (typeof entity.wpb_custom_css === "string")
    entity.wpb_custom_css = toLocal(entity.wpb_custom_css);
  const media = entity._embedded?.["wp:featuredmedia"]?.[0];
  if (media?.source_url)
    media.source_url = preferWebp(toLocal(media.source_url));
  return entity;
}

// Historical API-shaped records, exported once. Normal builds use only local files.
const pageFiles = import.meta.glob("../content/pages/*.json", {
  eager: true,
  import: "default",
});
const postFiles = import.meta.glob("../content/posts/*.json", {
  eager: true,
  import: "default",
});
const pages = Object.values(pageFiles).map(localizeEntity);
const posts = Object.values(postFiles)
  .map(localizeEntity)
  .sort((a, b) => b.date.localeCompare(a.date));
export async function getPageBySlug(slug) {
  return pages.find((page) => page.slug === slug) ?? null;
}
export async function getAllPages() {
  return pages;
}
export async function getAllPosts() {
  return posts;
}
export async function getPostBySlug(slug) {
  return posts.find((post) => post.slug === slug) ?? null;
}

// Helper: pull the featured image URL out of the _embedded payload. It has
// already been optimized (or localized as fallback) by localizeEntity above.
export function featuredImage(entity) {
  return entity?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;
}

// Helper: the earliest content image (CSS background OR <img>) — the likely
// above-the-fold LCP element. Preloading it (see Base.astro) fixes the slow
// LCP caused by Salient applying hero images as CSS backgrounds, which the
// browser otherwise discovers only after the CSS chain resolves.
export function heroImage(entity) {
  const html = entity?.content?.rendered || "";
  const m = html.match(
    /(?:background-image:\s*url\(['"]?|<img[^>]*\bsrc=["'])(\/wp-content\/uploads\/[^"')]+\.(?:webp|jpe?g|png))/i,
  );
  return m ? m[1] : null;
}
