# Astro-native and self-contained assets

## Current implementation — 28 October 2026

- Every page's styles now enter through Astro route imports. Native CSS compilation replaces the old chain of stylesheet links and inline snapshot styles with fingerprinted CSS under `/_astro/`.
- Site CSS, fonts, icons, images, and newsletter validation are stored in the repository. No stylesheet CDN, Google Fonts request, or WordPress server is required. The build needs no WordPress connection or remote asset download.
- The homepage hero is `src/components/HomeHero.astro`, using Astro's `Picture` component with responsive AVIF/WebP candidates. The image, dimensions, text and guide link are present in server-rendered HTML. The old homepage slider engine and loading overlay are gone; no carousel interaction was removed because the original contained one slide.
- The automatic Mailchimp marketing popup and its floating reminder are removed, as requested. The guide/newsletter forms and their Mailchimp destination remain. The existing validation script and Mailchimp badge are now pinned local files.
- Interior pages have explicit Astro routes and share `ContentPage.astro`. This gives each route its own style entry while retaining its exported content and appearance. Articles and blog cards retain their existing Astro image optimization.

## What remains external

Formspree handles contact delivery; Mailchimp handles newsletter subscription and guide delivery. Google Analytics remains configured. Music/video embeds and outbound links still use their original services. These are deliberate service integrations; the site cannot deliver email or host third-party streaming content without an external service. No test messages or subscriptions were sent.

## What still uses compatibility code

The header/menu, interior sliders, testimonials, lightboxes and some exported layout behavior still use **local, frozen** theme scripts and markup. This is not a WordPress runtime or a dependency on a remote theme provider. Replacing all of these at once would risk changing the design and interactions. New/replaced pieces should be Astro components with native CSS and small browser scripts; do not add a client framework for these simple interactions.

Priorities for the next component replacements: accessible navigation, testimonials, interior hero/slider blocks, then lightboxes and toggle panels. Each should be visually and interactively compared before its corresponding compatibility script is removed. Keep the existing form destinations and bot traps.

## Editing

See `src/styles/site/README.md` for the style map. Visible page/article copy remains in `src/content/pages/` and `src/content/posts/`; retain markup wrappers when asking AI to edit it. CMS work is still deferred. Build artifacts are never the editing source.

## Verification

`npm run check`: all 87 pages, local links/assets/anchors, and 13 regression tests. Tests cover responsive/eager hero images, local CSS throughout all routes, no external CSS imports/URLs, existing form destinations and validation, absence of the marketing widget, and local image dimensions. Desktop/mobile visual checks and mobile navigation checks were performed. A deployed PageSpeed measurement is recorded below when available.
