import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { imageMetadata } from 'astro/assets/utils';

// These integrations have no corresponding UI in the static render. Fonts are
// served once by the native stylesheet; the second FontAwesome copy is identical.
export const unusedStyleIds = new Set([
  'wp-theme-css', 'wp-components-css', 'wp-preferences-css', 'wp-commands-css',
  'wp-notices-css', 'wp-block-editor-css', 'dashicons-css', 'wp-block-code-css',
  'jetpack-block-podcast-episode-css', 'jetpack-forms-layout-css',
  'jetpack-block-paypal-payment-buttons-css', 'mediaelement-css', 'wp-mediaelement-css',
  'contact-form-7-css', 'nectar-cf7-css', 'wpforms-modern-base-css',
  'wpforms-pro-modern-base-css', 'nectar-wpforms-css', 'font-awesome-css',
  'fancybox-css', 'popup-maker-block-library-style-css',
  'redux-google-fonts-salient_redux-css', 'uaf_client_css-css',
]);
const deferredStyleIds = new Set([
  'nectar-element-testimonial-css', 'nectar-element-cascading-images-css',
  'nectar-widget-posts-css', 'popup-maker-site-css', 'fancyBox-css',
  'wpcom-text-widget-styles-css', 'main-styles-non-critical-css',
]);

const versions = new Map();
export function versionAsset(src) {
  if (!src?.startsWith('/') || src.startsWith('//')) return src;
  const url = new URL(src, 'https://livingrhea.com');
  const path = decodeURIComponent(url.pathname);
  if (!/^\/wp-(content|includes)\//.test(path)) return src;
  if (!versions.has(path)) {
    try { versions.set(path, createHash('sha256').update(readFileSync(join(process.cwd(), 'public', path))).digest('hex').slice(0, 12)); }
    catch { versions.set(path, null); }
  }
  if (!versions.get(path)) return src;
  url.searchParams.set('asset', versions.get(path));
  return url.pathname + url.search;
}

export function optimizeStyles(html) {
  return html.replace(/<link\b[^>]*>/gi, (tag) => {
    const $ = load(tag, null, false); const link = $('link');
    if (link.attr('rel') !== 'stylesheet') return tag;
    const id = link.attr('id');
    if (unusedStyleIds.has(id)) return '';
    const href = link.attr('href');
    const versioned = versionAsset(href);
    if (versioned !== href) link.attr('href', versioned);
    if (!deferredStyleIds.has(id)) return link.prop('outerHTML');
    link.attr('rel', 'preload').attr('as', 'style')
      .attr('onload', "this.onload=null;this.rel='stylesheet'");
    return link.prop('outerHTML') + `<noscript>${link.clone().attr("rel", "stylesheet").removeAttr("as").removeAttr("onload").prop("outerHTML")}</noscript>`;
  }).replace(/@font-face\s*\{([^}]+)\}/gi, (_, body) =>
    `@font-face{font-display:swap;${body.replace(/font-display\s*:[^;]+;/gi, '')}}`);
}

const metadata = new Map();
async function dimensions(src) {
  const url = new URL(src, 'https://livingrhea.com');
  if (url.origin !== 'https://livingrhea.com' || !url.pathname.startsWith('/wp-') && !url.pathname.startsWith('/fonts/')) return null;
  const path = decodeURIComponent(url.pathname);
  if (path.includes('..')) return null;
  if (!metadata.has(path)) metadata.set(path, (async () => {
    try { return await imageMetadata(await readFile(join(process.cwd(), 'public', path)), path); }
    catch { return null; }
  })());
  return metadata.get(path);
}

// Update just the affected tags, not the surrounding exported layout markup.
export async function prepareMarkup(html, { lazyBackgrounds = false } = {}) {
  const tags = [...new Set(html.match(/<img\b[^>]*>/gi) || [])];
  for (const tag of tags) {
    const $ = load(tag, null, false); const img = $('img');
    if (img.attr('width') && img.attr('height')) continue;
    const src = img.attr('src'); if (!src) continue;
    const size = await dimensions(src); if (!size) continue;
    const width = Number(img.attr('width')); const height = Number(img.attr('height'));
    if (img.attr('width') && !width || img.attr('height') && !height) continue;
    img.attr('width', width || (height ? Math.round(height * size.width / size.height) : size.width));
    img.attr('height', height || (width ? Math.round(width * size.height / size.width) : size.height));
    html = html.replaceAll(tag, img.prop('outerHTML'));
  }
  html = html.replace(/<div\b[^>]*class=["'][^"']*\bnectar-cta\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, (block) => {
    const $ = load(block, null, false);
    const label = $('.nectar-cta .text').first().text().replace(/\s+/g, ' ').trim();
    if (!label) return block;
    $('.nectar-cta a.link_text').each((_, node) => {
      const link = $(node); if (!link.attr('aria-label')) link.attr('aria-label', label);
      if (link.attr('href')?.startsWith('/')) link.removeAttr('role');
    });
    return $.html();
  });
  if (!lazyBackgrounds) return html;
  let seenHero = false;
  const fallbacks = new Map();
  html = html.replace(/<div\b[^>]*>/gi, tag => {
    const $ = load(tag, null, false); const node = $('div').first();
    const style = node.attr('style') || '';
    const backgrounds = [...style.matchAll(/background-image\s*:\s*([^;]+)/gi)];
    if (!backgrounds.length) return tag;
    const background = backgrounds.at(-1)[1].trim();
    if (!background.includes('/wp-content/uploads/') && !background.includes('/_astro/')) return tag;
    if (node.hasClass('image-bg') || !seenHero) { seenHero = true; return tag; }
    const key = createHash('sha256').update(background).digest('hex').slice(0, 12);
    node.attr('data-perf-background', background).attr('data-perf-bg', key);
    node.attr('style', style.replace(/background-image\s*:\s*[^;]+;?/gi, ''));
    fallbacks.set(key, background);
    const updated = node.prop('outerHTML');
    return updated.slice(0, updated.indexOf('>') + 1);
  });
  if (fallbacks.size) html += '<noscript><style>' + [...fallbacks].map(([key, value]) =>
    `[data-perf-bg="${key}"]{background-image:${value} !important;}`
  ).join('') + '</style></noscript>';
  return html;
}
