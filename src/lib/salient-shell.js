// Build-time capture of the Salient theme "shell" (header, footer, mobile
// slide-out menu, body classes, CSS and the full ordered JS stack) from the
// live WordPress site, so the headless Astro pages can reproduce the live
// chrome that the REST content field does NOT include.
//
// This is the "faithful port" approach: we serve WordPress's own markup +
// scripts around REST-sourced content. All WP URLs are localized to
// root-relative paths served from /public (mirrored by scripts/
// mirror-wp-assets.mjs), so nothing loads from the WP origin at runtime.
//
// The shell is fetched once per build from SHELL_SOURCE_URL and cached in
// module scope, then split at known, verified-unique structural markers.

import { WP_ORIGIN, WP_HOST, GOOGLE_FONTS_LOCAL, toLocal } from './wp-url.js';

// The home page renders the most complete set of Salient's conditionally
// enqueued assets, so we use it as the canonical shell source.
const SHELL_SOURCE_URL = `${WP_ORIGIN}/`;

// Scripts/plugins that require a live WP backend or an external service that
// no longer applies to the static site — dropped so they don't error or phone
// home at runtime. (Their assets are also skipped by the mirror.)
const SCRIPT_PRUNE = [
  'betterlinks', // link-click tracking → WP ajax
  'google-site-kit', // analytics glue
  'instagram-feed', // Smash Balloon feed → WP ajax (replaced by a hosted widget, MIGRATION-TODO #3)
  'sbi_scripts',
  'contact-form-7', // CF7 → WP admin-ajax (contact uses Formspree instead)
  '/swv/',
];

// Pull every <script>…</script> out of a chunk of HTML, in document order.
// Returns the HTML with scripts removed plus the ordered script descriptors.
function extractScripts(html) {
  const scripts = [];
  const without = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (_m, attrs, code) => {
    const srcMatch = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    const typeMatch = attrs.match(/\btype\s*=\s*["']([^"']+)["']/i);
    const idMatch = attrs.match(/\bid\s*=\s*["']([^"']+)["']/i);
    scripts.push({
      src: srcMatch ? srcMatch[1] : null,
      type: typeMatch ? typeMatch[1] : null,
      id: idMatch ? idMatch[1] : null,
      async: /\basync\b/i.test(attrs),
      defer: /\bdefer\b/i.test(attrs),
      code: srcMatch ? '' : code,
    });
    return '';
  });
  return { without, scripts };
}

// Parse the raw `class="…" data-x="…" …` of the <body> tag into an
// attributes object Astro can spread onto its own <body>.
function parseAttrs(attrString) {
  const attrs = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g;
  let m;
  while ((m = re.exec(attrString)) !== null) {
    const name = m[1];
    const value = m[2] ?? m[3] ?? '';
    attrs[name] = value;
  }
  return attrs;
}

// WordPress-only <head> autodiscovery links that are meaningless (and dead) on
// the static site: RSD/EditURI, XML-RPC, WP REST link, shortlink, oEmbed
// endpoints, the WP feeds (we ship our own /blog/rss.xml), and w.org
// dns-prefetch. Removing them avoids broken-link/crawler noise.
function stripWpHeadCruft(head) {
  return head
    .replace(/<link[^>]*rel=["']EditURI["'][^>]*>/gi, '')
    .replace(/<link[^>]*rel=["']https:\/\/api\.w\.org\/["'][^>]*>/gi, '')
    .replace(/<link[^>]*rel=["']shortlink["'][^>]*>/gi, '')
    .replace(/<link[^>]*rel=["']pingback["'][^>]*>/gi, '')
    .replace(/<link[^>]*rel=["']wlwmanifest["'][^>]*>/gi, '')
    .replace(/<link[^>]*rel=["']dns-prefetch["'][^>]*>/gi, '')
    // oEmbed + wp-json + RSS feed autodiscovery (rel="alternate", various types)
    .replace(
      /<link[^>]*type=["'](?:application\/json(?:\+oembed)?|text\/xml\+oembed|application\/rss\+xml)["'][^>]*>/gi,
      '',
    );
}

// One shell per source URL. Each WP page has its own header treatment (the
// home page's header is transparent to overlay the hero; interior pages use a
// solid header), body classes, and per-page CSS — so we capture each page's
// OWN shell rather than forcing the home page's onto everything.
const cache = new Map();

export async function getSalientShell(pageUrl = SHELL_SOURCE_URL) {
  if (cache.has(pageUrl)) return cache.get(pageUrl);

  const res = await fetch(pageUrl);
  if (!res.ok) {
    throw new Error(
      `Salient shell fetch failed: ${res.status} ${pageUrl}. ` +
        `The faithful-port layout needs the live WP page to build.`,
    );
  }
  const doc = await res.text();

  // --- <head> ------------------------------------------------------------
  const headInner = doc.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
  const { without: headNoScripts, scripts: headScripts } = extractScripts(headInner);
  let headHtml = headNoScripts
    // Astro owns these — drop the live copies to avoid duplicates/conflicts.
    .replace(/<title[\s\S]*?<\/title>/i, '')
    .replace(/<meta[^>]*charset[^>]*>/i, '')
    .replace(/<meta[^>]*name=["']viewport["'][^>]*>/i, '')
    .replace(/<meta[^>]*name=["']description["'][^>]*>/i, '')
    .replace(/<meta[^>]*name=["']robots["'][^>]*>/i, '')
    .replace(/<link[^>]*rel=["']canonical["'][^>]*>/i, '')
    // Per-page WPBakery CSS is injected per page (see Base.astro headCss),
    // so strip the home page's copy to avoid it leaking onto other pages.
    .replace(/<style[^>]*data-type=["']vc_shortcodes-custom-css["'][^>]*>[\s\S]*?<\/style>/i, '')
    // Point the Google Fonts <link> at our self-hosted copy.
    .replace(/https:\/\/fonts\.googleapis\.com\/css[^"'>]+/i, GOOGLE_FONTS_LOCAL);
  headHtml = stripWpHeadCruft(headHtml);
  headHtml = toLocal(headHtml);
  // Non-critical CSS is deferred in the postbuild pass (scripts/
  // reconcile-assets.mjs), which sees the whole document (some styles are
  // enqueued in the body, not the head).

  // --- <body> ------------------------------------------------------------
  const bodyOpen = doc.match(/<body([^>]*)>/i);
  const bodyAttrs = parseAttrs(bodyOpen?.[1] ?? '');
  const bodyInnerRaw = doc.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';
  const { without: bodyNoScripts, scripts: bodyScripts } = extractScripts(bodyInnerRaw);

  // Split the (scripts-stripped) body at the content region. Everything before
  // the main-content .row is chrome (skip-link, off-canvas wraps, header, and
  // the content wrappers); the footer onward is the rest of the chrome.
  const mainMarker = bodyNoScripts.indexOf('container main-content" role="main"');
  const rowOpenIdx = bodyNoScripts.indexOf('<div class="row"', mainMarker);
  const rowOpenEnd = bodyNoScripts.indexOf('>', rowOpenIdx) + 1;
  const footerIdx = bodyNoScripts.indexOf('<div id="footer-outer"');

  if (mainMarker === -1 || rowOpenIdx === -1 || footerIdx === -1) {
    throw new Error(
      `Salient shell: could not locate content boundaries in ${pageUrl}. ` +
        `Use a standard WP page URL (posts/archives use a different template).`,
    );
  }

  // preContent ends right after `<div class="row">`; slot content goes next.
  const preContent = toLocal(bodyNoScripts.slice(0, rowOpenEnd));
  // After the slot we close .row/.main-content/.container-wrap, then the live
  // footer + slide-out menu + closing #ajax-content-wrap/.ocm-effect-wrap.
  const postContent = '</div></div></div>' + toLocal(bodyNoScripts.slice(footerIdx));

  const scripts = [...headScripts, ...bodyScripts]
    .filter(
      // Data blocks, not executable behavior — safe to drop.
      (s) => s.type !== 'application/json' && s.type !== 'speculationrules' && s.type !== 'text/html',
    )
    // Drop scripts that need a live WP backend / removed services.
    .filter((s) => !SCRIPT_PRUNE.some((p) => (s.src && s.src.includes(p)) || (s.id && s.id.includes(p))))
    // Localize WP URLs: external src → mirrored copy; inline config strings
    // (ajaxurl, REST endpoints) → root-relative, so any runtime call hits our
    // own origin (and fails harmlessly) instead of phoning home to WP. Handle
    // both plain and JSON-escaped (\/\/) forms.
    .map((s) => {
      if (s.src) return { ...s, src: toLocal(s.src) };
      const code = toLocal(s.code).replace(
        new RegExp(`(?:https?:)?\\\\/\\\\/${WP_HOST.replace(/[.]/g, '\\.')}`, 'g'),
        '',
      );
      return { ...s, code };
    });

  const result = { headHtml, bodyAttrs, preContent, postContent, scripts };
  cache.set(pageUrl, result);
  return result;
}
