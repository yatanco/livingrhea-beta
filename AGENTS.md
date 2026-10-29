# Living Rhea — beta

This repo (`yatanco/livingrhea-beta`, branch `main`) is a ground-up rebuild of livingrhea.com, deployed to https://beta.livingrhea.com. The owner allowed a simplified design; the goal is zero JavaScript on public pages and perfect Lighthouse scores. The production site lives in `yatanco/livingrhea-astro`; never push beta work there.

- Astro is pinned to stable 7.4.2; use Node 24 and the committed lockfile.
- Public pages ship no `<script>` except JSON-LD, and load no CSS, fonts or images from other hosts. CSS is inlined (`build.inlineStylesheets: "always"`). Interactivity is HTML/CSS only: `<details>` for the mobile menu and packages, CSS hover/focus for the dropdown, scroll-snap for testimonials.
- Design system: `src/styles/beta/global.css` (tokens, type, `.wrap`, `.section`, `.split`, `.btn`, `.prose`) plus scoped component styles. Fonts are local in `public/fonts/beta/`. Keep text contrast at WCAG AA: `--accent` (#c2410c) on light backgrounds, `--accent-bright` only on the dark footer.
- Content: `src/content/pages/*.md` (frontmatter `labels` + `# section-…` Markdown blocks, split by `pageSections()`) and `src/content/posts/*.md`. Page components in `src/components/pages/` consume those keys, so the CMS keeps working. A post body must not contain an `# h1`; the title is the page's only h1.
- Images: `Pic.astro` (local image by its historical `/wp-content/uploads/` path), `Hero.astro` (eager AVIF/WebP LCP image). YouTube: `Video.astro`, or a `srcdoc` iframe in Markdown, so the player loads only on click.
- External links must already exist in `tests/fixtures/external-links.json` (copied from the live build). Never type an external URL from memory; copy it from the source.
- Keep slugs stable with exact redirects in `public/_redirects` (wildcards last).
- Contact posts to the configured Formspree endpoint; newsletter forms post to the existing Mailchimp audience. Do not send test messages or subscribe addresses without explicit authorization.
- Preserve the crawler privacy policy in `robots.txt`. Canonicals point to livingrhea.com so beta is not indexed as a duplicate.
- Change source, not `dist/`. Historical exports under `migration/` are reference data.
- Run `npm run check`; verify desktop and mobile for visual changes.
