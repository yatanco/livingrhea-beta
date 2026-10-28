# Lean homepage CSS, feed removal and social links

## What changed

The homepage's compiled stylesheet remains local and fingerprinted. A small Astro integration uses the completed static HTML to select the rules needed by its current markup and known interactive states. These are inlined in their original order. The complete stylesheet loads without blocking paint; it is not purged or rewritten, and a normal stylesheet link remains in `noscript` for browsers with JavaScript disabled. Interior pages retain their previous CSS loading behavior in this pass.

Local build evidence: the complete stylesheet is approximately **141 KB gzip**; approximately **52 KB gzip** of active styles are needed before first paint. This is a transfer/critical-path reduction, **not a measured 2.6-second saving**. Total CSS bytes can increase because active rules are present inline and in the cached full stylesheet. Remaining theme code should ultimately be replaced component by component, allowing smaller component-owned styles instead of this compatibility bridge.

The integration is `integrations/critical-css.mjs`. It runs at Astro's `astro:build:done` hook, using PostCSS to preserve nested rules and cascade order. Unknown pseudo selectors are retained conservatively. Header/menu, testimonial, lightbox and popup state rules are explicitly retained. A generated `/_astro/critical-css-report.json` records the output sizes. There is no browser or WordPress dependency in the build.

The hero now uses Astro's documented `priority` property on `Picture`, which sets eager loading, high fetch priority and synchronous decoding for this above-the-fold image. Responsive AVIF/WebP candidates remain.

The disconnected Instagram section, fixed-height gap and Follow button are removed. The proposed gallery was discarded; no new image gallery is shipped. Other site imagery remains.

Both desktop and mobile social icon lists read `src/content/settings/social.json`. YouTube and LinkedIn use the URLs supplied by the site manager; LinkedIn replaces the obsolete Vine icon. Instagram and Facebook were present in the site's existing content. X/Twitter `rheamehta` is supported by published interviews; the owner should confirm that this historical account is still the preferred one. RSS links to the site's local feed. No social API or widget is loaded.

## Astro documentation reviewed

- [Styles and CSS](https://docs.astro.build/en/guides/styling/): native CSS imports, component styling and stylesheet inlining. Inlining the entire 148 KiB compressed bundle would retain too much unnecessary startup work, so only active rules are inlined here.
- [Image and Assets API: priority](https://docs.astro.build/en/reference/modules/astro-assets/#priority): use `Picture priority` for the hero, not all images. Below-the-fold images stay lazy.
- [Integration API](https://docs.astro.build/en/reference/integrations-reference/#astrobuilddone): extend the static build using its output directory. The integration leaves the Vite-generated stylesheet intact.

Do not add a client-side framework, server rendering, or server islands for this content site. Static Astro components, responsive images and component-owned CSS remain the intended direction. Prefetching can be considered after startup work is reduced; eagerly prefetching every page would compete with the first-page load.

## Validation

`npm run check` builds 87 pages, checks local links/assets/anchors, and passes 17 tests. Additional checks cover CSS cascade/media/font preservation, the no-JavaScript fallback, social destinations, retained forms, and absence of the feed/gallery. Desktop appearance and the guide anchor were inspected locally with no browser console errors. The browser connection later timed out during the final mobile check; a fresh deployed mobile PageSpeed result has not yet been collected for this pass. Do not reuse the earlier preview score as this pass's score.
