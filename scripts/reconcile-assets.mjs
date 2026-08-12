// Post-build safety net. The seed-based mirror can miss assets (lazy-loaded
// carousel images, or fetches lost to the WP host's intermittent bot
// challenge). This reads the ACTUAL built HTML/CSS in dist/, finds every
// referenced /wp-content and /wp-includes asset that isn't present, and fetches
// it from WP — so the deployed site never 404s on a local asset reference.
//
// Runs as npm "postbuild". Idempotent; gentle (only fetches what's missing).

import { readFile, writeFile, mkdir, readdir, stat, access } from 'node:fs/promises';
import { dirname } from 'node:path';
import sharp from 'sharp';

const API_URL = process.env.WORDPRESS_API_URL || '';
const WP_ORIGIN = API_URL.replace(/\/wp-json\/.*$/, '') || 'https://livingrhea.com';
const DIST = new URL('../dist/', import.meta.url);
const PUBLIC = new URL('../public/', import.meta.url);
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0 Safari/537.36';
// Greedy so multi-dot filenames keep their real extension (jquery.min.js, not
// jquery.min). Excludes ? so query strings aren't captured.
const REF_RE = /\/wp-(?:content|includes)\/[^"'\s)?]+\.[a-z0-9]{2,5}/gi;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const exists = (p) => access(p).then(() => true).catch(() => false);

async function walk(dir, out = []) {
  for (const name of await readdir(dir)) {
    const full = new URL(name + '', dir.href.endsWith('/') ? dir : dir + '/');
    const s = await stat(full);
    if (s.isDirectory()) await walk(new URL(name + '/', dir), out);
    else if (/\.(html|css)$/i.test(name)) out.push(full);
  }
  return out;
}

async function fetchBuffer(url, tries = 4) {
  for (let a = 1; a <= tries; a++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Referer: `${WP_ORIGIN}/` } });
      const ct = res.headers.get('content-type') || '';
      // Genuine 404 (asset deleted on WP) — don't retry, it won't appear.
      if (res.status === 404) throw new Error('HTTP 404');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (/text\/html/i.test(ct)) throw new Error('bot challenge');
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (a === tries || /HTTP 404/.test(e.message)) throw e;
      await sleep(1500 * a);
    }
  }
}

async function main() {
  const files = await walk(DIST);
  const refs = new Set();
  for (const f of files) {
    const text = await readFile(f, 'utf8');
    for (const m of text.matchAll(REF_RE)) refs.add(m[0].split('?')[0]);
  }

  const missing = [];
  for (const path of refs) if (!(await exists(new URL('.' + path, DIST).pathname))) missing.push(path);

  if (!missing.length) {
    console.log('✓ reconcile: all referenced WP assets present.');
    return;
  }
  console.log(`reconcile: ${missing.length} referenced asset(s) missing — fetching…`);

  let fixed = 0;
  const failed = [];
  for (const path of missing) {
    try {
      let buf;
      if (path.endsWith('.webp')) {
        // We rewrote a jpg/png to .webp but the variant is absent — fetch the
        // original and convert.
        let origBuf, ok = false;
        for (const ext of ['jpg', 'jpeg', 'png']) {
          try {
            origBuf = await fetchBuffer(`${WP_ORIGIN}${path.replace(/\.webp$/, '.' + ext)}`);
            ok = true;
            break;
          } catch {
            /* try next ext */
          }
        }
        if (!ok) throw new Error('no source for webp');
        buf = await sharp(origBuf).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
      } else {
        buf = await fetchBuffer(`${WP_ORIGIN}${path}`);
      }
      for (const base of [DIST, PUBLIC]) {
        const dest = new URL('.' + path, base);
        await mkdir(dirname(dest.pathname), { recursive: true });
        await writeFile(dest, buf);
      }
      fixed++;
    } catch (e) {
      failed.push(`${path} (${e.message})`);
    }
  }

  console.log(`✓ reconcile: fetched ${fixed}/${missing.length} missing asset(s).`);

  // Anything STILL missing is 404 on WP itself (deleted media / ungenerated
  // size variants). Strip those dead references from the built HTML so there
  // are no broken-image icons, and report which routes were affected.
  const stillMissing = [];
  for (const p of refs) if (!(await exists(new URL('.' + p, DIST).pathname))) stillMissing.push(p);
  const brokenByRoute = {};
  if (stillMissing.length) {
    const missSet = new Set(stillMissing);
    // Extract the /wp-.../file.ext path portion from any URL value (handles
    // root-relative, livingrhea.com and www.livingrhea.com absolute forms).
    const pathOf = (v) => (v.match(/\/wp-(?:content|includes)\/[^"'\s)?]+\.[a-z0-9]{2,5}/i) || [])[0];
    const isDead = (v) => {
      const p = pathOf(v);
      return p && missSet.has(p);
    };

    for (const f of files) {
      const before = await readFile(f, 'utf8');
      const stripped = new Set();
      const html = before.replace(/<img\b[^>]*>/gi, (tag) => {
        // Drop the whole <img> if its actual source is dead (broken icon).
        for (const attr of ['src', 'data-src', 'data-lazy-src']) {
          const m = tag.match(new RegExp(`\\b${attr}="([^"]*)"`, 'i'));
          if (m && isDead(m[1])) {
            stripped.add(pathOf(m[1]));
            return '';
          }
        }
        // Otherwise prune only the dead srcset candidates, keeping the image.
        return tag.replace(/\bsrcset="([^"]*)"/i, (sm, val) => {
          const kept = val
            .split(',')
            .map((s) => s.trim())
            .filter((c) => {
              if (isDead(c)) {
                stripped.add(pathOf(c));
                return false;
              }
              return true;
            });
          return kept.length ? `srcset="${kept.join(', ')}"` : '';
        });
      });

      if (html !== before) {
        await writeFile(f, html);
        const route = f.pathname.replace(DIST.pathname, '/').replace(/index\.html$/, '');
        brokenByRoute[route] = [...stripped];
      }
    }
    const routes = Object.keys(brokenByRoute);
    console.log(`✓ reconcile: stripped dead refs (404 on WP) from ${routes.length} page(s).`);
    await writeFile(
      new URL('../BROKEN-ASSETS-REPORT.md', import.meta.url),
      brokenReport(brokenByRoute),
    );
    console.log('  → wrote BROKEN-ASSETS-REPORT.md');
  }

  if (failed.length) {
    console.warn(`! reconcile could not fetch ${failed.length} (stripped from HTML).`);
  }
}

function brokenReport(byRoute) {
  const lines = [
    '# Broken-asset report',
    '',
    'These images are **404 on WordPress itself** (deleted NextGen gallery media',
    'or size variants WP never generated) — they are already broken on the live',
    'site. The build strips the dead references so no broken-image icons show.',
    'To truly fix, re-upload the images in wp-admin (or edit the posts to remove',
    'the galleries), then rebuild.',
    '',
  ];
  for (const [route, paths] of Object.entries(byRoute).sort((a, b) => b[1].length - a[1].length)) {
    lines.push(`## ${route}  (${paths.length})`);
    for (const p of paths.sort()) lines.push(`- \`${p}\``);
    lines.push('');
  }
  return lines.join('\n');
}

main().catch((e) => {
  console.error('reconcile failed:', e);
  process.exit(1);
});
