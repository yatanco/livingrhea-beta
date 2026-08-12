// Thin wrapper around the WordPress REST API (wp-json/wp/v2).
// Runs at BUILD time only (Astro static output) — the live site never
// calls WordPress directly, so the WP box doesn't need to handle
// production traffic, only the build step and wp-admin logins.

import { toLocal } from './wp-url.js';
import imageMap from './image-map.json';

// Falls back to the production CMS so the build never hard-crashes if the env
// var is unset (matches scripts/mirror-wp-assets.mjs and src/lib/wp-url.js).
// Set WORDPRESS_API_URL in the environment to point at the CMS (e.g. the
// cms.livingrhea.com subdomain after cutover).
const API_URL =
  import.meta.env.WORDPRESS_API_URL ||
  process.env.WORDPRESS_API_URL ||
  'https://livingrhea.com/wp-json/wp/v2';

// Set of image paths (lowercased) the mirror has an optimized .webp sibling
// for (see scripts/mirror-wp-assets.mjs). We swap those references to WebP.
const webpSet = new Set(imageMap.map((p) => p.toLowerCase()));

// Rewrite jpg/png references to their optimized .webp copy where one exists.
function preferWebp(html) {
  return html.replace(/(\/wp-(?:content|includes)\/[^"'\s)?]+)\.(jpe?g|png)/gi, (m, base, ext) =>
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
      label ? `${pre}aria-label="${label.replace(/"/g, '&quot;')}" ${cls}` : m,
  );
}

// Make an entity self-contained: localize every WP asset URL to its mirrored
// /public copy, then prefer the optimized WebP variant. Nothing loads from the
// WP origin at runtime.
function localizeEntity(entity) {
  if (!entity || typeof entity !== 'object') return entity;
  if (entity.content?.rendered)
    entity.content.rendered = labelCtaLinks(preferWebp(toLocal(entity.content.rendered)));
  if (typeof entity.wpb_custom_css === 'string') entity.wpb_custom_css = toLocal(entity.wpb_custom_css);
  const media = entity._embedded?.['wp:featuredmedia']?.[0];
  if (media?.source_url) media.source_url = preferWebp(toLocal(media.source_url));
  return entity;
}

async function wpFetch(path, tries = 4) {
  // The WP host runs bot protection that can return an HTML challenge instead
  // of JSON under load. Retry with backoff so the build survives it.
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(`${API_URL}${path}`);
      if (!res.ok) throw new Error(`WP API error ${res.status} for ${path}`);
      const text = await res.text();
      if (/One moment, please|Just a moment|__cf_chl|Checking your browser/i.test(text)) {
        throw new Error('WP bot-challenge response');
      }
      const data = JSON.parse(text);
      if (Array.isArray(data)) data.forEach(localizeEntity);
      else localizeEntity(data);
      return data;
    } catch (e) {
      if (attempt === tries) throw e;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

// Pages (About, Coaching, Himalayan Breathwork, Music, Press, Contact, Home)
export async function getPageBySlug(slug) {
  const pages = await wpFetch(`/pages?slug=${slug}&_embed`);
  return pages[0] ?? null;
}

export async function getAllPages() {
  return wpFetch(`/pages?per_page=100&_embed`);
}

// Blog posts
export async function getAllPosts() {
  return wpFetch(`/posts?per_page=100&_embed`);
}

export async function getPostBySlug(slug) {
  const posts = await wpFetch(`/posts?slug=${slug}&_embed`);
  return posts[0] ?? null;
}

// Helper: pull the featured image URL out of the _embedded payload. It has
// already been optimized (or localized as fallback) by localizeEntity above.
export function featuredImage(entity) {
  return entity?._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;
}

// Helper: the earliest content image (CSS background OR <img>) — the likely
// above-the-fold LCP element. Preloading it (see Base.astro) fixes the slow
// LCP caused by Salient applying hero images as CSS backgrounds, which the
// browser otherwise discovers only after the CSS chain resolves.
export function heroImage(entity) {
  const html = entity?.content?.rendered || '';
  const m = html.match(
    /(?:background-image:\s*url\(['"]?|<img[^>]*\bsrc=["'])(\/wp-content\/uploads\/[^"')]+\.(?:webp|jpe?g|png))/i,
  );
  return m ? m[1] : null;
}
