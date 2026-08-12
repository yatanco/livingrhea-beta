// Build-time asset mirror + local image optimizer. Downloads every WordPress-
// hosted asset the site references (theme/plugin CSS + JS, fonts, images) into
// public/, self-hosts Google Fonts, and generates optimized WebP variants of
// raster images with sharp — all so the built site loads nothing from the WP
// origin at runtime.
//
// Why sharp here instead of astro:assets remote optimization: the WP host runs
// bot protection that returns an HTML challenge under bursty traffic. Fetching
// every image through astro:assets at build time (hundreds of extra requests)
// trips it and breaks the build — on Cloudflare Pages too. So we fetch each
// asset exactly once, gently, and optimize locally.
//
// Deps: global fetch (Node 18+) and sharp (already an Astro dependency).

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import sharp from 'sharp';

// --- minimal .env loader (CI sets real env vars) ---
try {
  const env = await readFile(new URL('../.env', import.meta.url), 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {
  /* rely on real environment */
}

const API_URL = process.env.WORDPRESS_API_URL || '';
const WP_ORIGIN = API_URL.replace(/\/wp-json\/.*$/, '') || 'https://livingrhea.com';
const WP_HOST = new URL(WP_ORIGIN).host;
const REST = `${WP_ORIGIN}/wp-json/wp/v2`;
const OUT = new URL('../public/', import.meta.url);
const MAP_FILE = new URL('../src/lib/image-map.json', import.meta.url);
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const MAX_WEBP_WIDTH = 1600;

const PRUNE = ['betterlinks', 'google-site-kit', '/instagram-feed/', '/contact-form-7/', '/swv/', 'wp-emoji'];

const seen = new Set();
const queue = [];
const failures = [];
const converted = new Set(); // pathnames that now have a .webp sibling

const hostEsc = WP_HOST.replace(/[.]/g, '\\.');
const wpUrlRe = new RegExp(`(?:https?:)?//${hostEsc}/[^\\s"'()\\\\]+`, 'g');
const cssUrlRe = /url\(\s*['"]?(?!data:)([^'")]+?)['"]?\s*\)/g;
const cssImportRe = /@import\s+(?:url\()?['"]([^'"]+)['"]/g;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const toLocalStr = (s) => s.replace(new RegExp(`(?:https?:)?//${hostEsc}`, 'g'), '');
const abs = (u) => (u.startsWith('//') ? `https:${u}` : u);
const looksLikeChallenge = (t) =>
  /One moment, please|Just a moment|cf-browser-verification|Checking your browser|__cf_chl/i.test(t);

// Fetch with retry + bot-challenge detection. `kind` = 'buffer' | 'text' | 'json'.
async function fetchResilient(url, kind, tries = 4) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Referer: `${WP_ORIGIN}/` } });
      const ct = res.headers.get('content-type') || '';
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (kind === 'buffer') {
        if (/text\/html/i.test(ct)) throw new Error('challenge (html for asset)');
        return Buffer.from(await res.arrayBuffer());
      }
      const text = await res.text();
      if (looksLikeChallenge(text)) throw new Error('bot challenge');
      if (kind === 'json') return JSON.parse(text);
      return text;
    } catch (e) {
      if (attempt === tries) throw e;
      await sleep(1500 * attempt); // back off; let the challenge clear
    }
  }
}

function enqueue(rawUrl) {
  let url;
  try {
    url = new URL(abs(rawUrl));
  } catch {
    return;
  }
  if (url.host !== WP_HOST) return;
  const path = url.pathname;
  if (!/^\/wp-(content|includes)\//.test(path)) return;
  if (path.endsWith('/')) return; // directory reference, not a file
  if (PRUNE.some((p) => url.href.includes(p) || path.includes(p))) return;
  const key = url.origin + path;
  if (seen.has(key)) return;
  seen.add(key);
  queue.push(url);
}

async function processOne(url) {
  const path = url.pathname;
  const dest = new URL('.' + path, OUT);
  try {
    if (path.endsWith('.css')) {
      const text = await fetchResilient(url.href, 'text');
      for (const re of [cssUrlRe, cssImportRe]) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(text)) !== null) {
          try {
            enqueue(new URL(m[1], url.href).href);
          } catch {
            /* ignore */
          }
        }
      }
      await mkdir(dirname(dest.pathname), { recursive: true });
      await writeFile(dest, toLocalStr(text));
    } else {
      const buf = await fetchResilient(url.href, 'buffer');
      await mkdir(dirname(dest.pathname), { recursive: true });
      await writeFile(dest, buf);
      // Optimize raster images to WebP locally (same basename, .webp ext).
      if (/\.(jpe?g|png)$/i.test(path)) {
        try {
          const webpDest = new URL('.' + path.replace(/\.(jpe?g|png)$/i, '.webp'), OUT);
          await sharp(buf)
            .resize({ width: MAX_WEBP_WIDTH, withoutEnlargement: true })
            .webp({ quality: 78 })
            .toFile(webpDest.pathname);
          converted.add(path);
        } catch {
          /* leave original if conversion fails */
        }
      }
    }
  } catch (e) {
    failures.push(`${url.href} (${e.message})`);
  }
}

async function drainQueue() {
  const CONCURRENCY = 5;
  let done = 0;
  async function worker() {
    while (queue.length) {
      await processOne(queue.shift());
      if (++done % 25 === 0) process.stdout.write(`  …mirrored ${done}\n`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return done;
}

async function mirrorGoogleFonts(homeHtml) {
  const link = homeHtml.match(/https:\/\/fonts\.googleapis\.com\/css[^"'>]+/);
  if (!link) return;
  const cssUrl = link[0].replace(/&#0?38;/g, '&').replace(/&amp;/g, '&');
  try {
    let css = await fetchResilient(cssUrl, 'text');
    const gstatic = [...new Set([...css.matchAll(/https:\/\/fonts\.gstatic\.com\/[^\s"')]+/g)].map((m) => m[0]))];
    for (const g of gstatic) {
      const dest = new URL('.' + '/vendor/gstatic' + new URL(g).pathname, OUT);
      await mkdir(dirname(dest.pathname), { recursive: true });
      await writeFile(dest, await fetchResilient(g, 'buffer'));
    }
    css = css.replace(/https:\/\/fonts\.gstatic\.com/g, '/vendor/gstatic');
    const dest = new URL('./vendor/google-fonts.css', OUT);
    await mkdir(dirname(dest.pathname), { recursive: true });
    await writeFile(dest, css);
    console.log(`✓ Google Fonts self-hosted (${gstatic.length} files)`);
  } catch (e) {
    console.warn(`! Google Fonts mirror failed (${e.message}); keeping CDN link.`);
  }
}

async function main() {
  console.log(`Mirroring WP assets from ${WP_ORIGIN} → public/`);

  // Seed failures are non-fatal: the mirrored assets are committed to the repo,
  // so if the WP host's bot-challenge blocks discovery, the build falls back to
  // the committed copies instead of failing.
  let homeHtml = '';
  try {
    homeHtml = await fetchResilient(`${WP_ORIGIN}/`, 'text');
    for (const m of homeHtml.matchAll(wpUrlRe)) enqueue(m[0]);
  } catch (e) {
    console.warn(`! home seed failed (${e.message}); using committed assets.`);
  }

  const pageLinks = [];
  for (const type of ['pages', 'posts']) {
    try {
      const items = await fetchResilient(
        `${REST}/${type}?per_page=100&_fields=content,wpb_custom_css,link`,
        'json',
      );
      for (const it of items) {
        const blob = (it?.content?.rendered || '') + '\n' + (it?.wpb_custom_css || '');
        for (const m of blob.matchAll(wpUrlRe)) enqueue(m[0]);
        if (type === 'pages' && it?.link) pageLinks.push(it.link);
      }
    } catch (e) {
      console.warn(`! ${type} seed failed (${e.message}); using committed assets.`);
    }
  }

  // Each page's live HTML — pages conditionally enqueue element CSS/JS + the
  // per-page shell's images/backgrounds.
  for (const link of pageLinks) {
    try {
      const html = await fetchResilient(link, 'text');
      for (const m of html.matchAll(wpUrlRe)) enqueue(m[0]);
    } catch {
      /* skip */
    }
  }

  // Featured images (from _embedded) aren't in content — mirror them too.
  for (const type of ['pages', 'posts']) {
    try {
      const items = await fetchResilient(`${REST}/${type}?per_page=100&_embed=wp:featuredmedia`, 'json');
      for (const it of items) {
        const src = it?._embedded?.['wp:featuredmedia']?.[0]?.source_url;
        if (src) enqueue(src);
      }
    } catch {
      /* skip */
    }
  }

  console.log(`Queued ${queue.length} assets. Downloading (concurrency 5)…`);
  const count = await drainQueue();
  await mirrorGoogleFonts(homeHtml);

  // Manifest of images that have a .webp sibling, consumed by src/lib/wordpress.js.
  await writeFile(MAP_FILE, JSON.stringify([...converted].sort(), null, 0));

  console.log(`✓ Mirrored ${count} assets; optimized ${converted.size} images → WebP.`);
  if (failures.length) {
    console.warn(`! ${failures.length} asset(s) failed:`);
    for (const f of failures.slice(0, 15)) console.warn(`   - ${f}`);
  }
}

main().catch((e) => {
  console.error('Asset mirror failed:', e);
  process.exit(1);
});
