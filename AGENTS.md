# Living Rhea

Preserve the existing site's design. This is a migration, not a redesign. Do not change layout, typography, colors, imagery, or visible copy unless requested.

- Astro is pinned to stable 7.4.2; use Node 24 and the committed lockfile.
- Builds and runtime must not fetch WordPress. `src/lib/content.js` reads local exported records; `src/lib/salient-shell.js` reads local layout snapshots.
- Visible content lives in `src/content/pages/*.json` and `src/content/posts/*.json`, primarily `content.rendered`. Preserve existing markup classes and wrappers when editing copy.
- The `/wp-content/` and `/wp-includes/` paths contain static compatibility assets, not a PHP application. Avoid renaming them without a reason and redirects.
- Keep slugs stable. Add exact redirects for renamed or retired URLs and update internal links.
- CMS work is deferred; do not expose an incomplete editor or introduce custom auth.
- Contact posts directly to the configured Formspree endpoint; newsletter forms post directly to the existing Mailchimp audience. Do not send test messages or subscribe addresses without explicit authorization.
- Preserve the existing crawler privacy policy; do not enable model-training crawlers as an assumed SEO improvement.
- Change source, not `dist/`. Historical exports under `migration/` are reference data.
- Run `npm run check`; verify desktop/mobile for affected visual changes. Prefer small Astro components for necessary server-feature replacements while keeping their appearance.

- Site CSS is now authored in `src/styles/site/`, imported by explicit Astro routes. Snapshot CSS and old `wpb_custom_css` fields are historical; do not reintroduce their style/link tags. Keep CSS/font/image dependencies local.
- The homepage hero is native `HomeHero.astro`; do not reintroduce the one-slide theme engine. The separate automatic Mailchimp marketing popup was removed at the user’s request. Keep the newsletter/guide forms and their local validation.
