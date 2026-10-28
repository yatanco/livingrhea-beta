# Living Rhea

This is a WordPress-independent static Astro site. Never restore runtime or build-time WordPress fetching.

- Content: `src/content/pages/*.json`, `src/content/posts/*.json`. `body` is Markdown, not HTML from a CMS API. Settings live in `src/content/settings/`.
- Browser editor: Decap CMS at `/admin/`, using the hosted Turbo backend. Keep its collections synchronized with content fields.
- Keep existing URL slugs. If renaming, update `public/_redirects` and internal links. Homepage source slug `livingrhea-com` maps to `/`.
- Images and downloads are local in `public/media/`. New uploads go in `public/media/editor/`. Give new images descriptive alt text.
- Do not edit `dist/` or old public export snapshots in `migration/`; change source files.
- Use Node 24. Run `npm run check` before handing off changes. Recheck desktop/mobile when changing layout.
- Prefer static templates and hosted forms. Avoid custom auth services, plugin-style integrations, and unnecessary dependencies.
- No secrets belong in content or public files. The CMS Site ID is public configuration.
- Build command: `npm run build`; output: `dist`. No WordPress environment variables or build hooks.
