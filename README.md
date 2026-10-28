# Living Rhea — Astro site

This static Astro site preserves the existing Living Rhea design while moving published pages, posts, layout snapshots, styles, fonts, and images into the repository. Builds and visitors do not need WordPress. Familiar `/wp-content/` and `/wp-includes/` paths are static compatibility assets, not a PHP application.

## Run and verify

Use Node 24, then:

```sh
npm ci
npm run dev
```

`npm run check` builds the site, checks generated local links/assets/anchors, and runs the test suite. `npm run build` creates `dist/` without fetching WordPress. Astro is pinned to stable `7.4.2` with a committed lockfile. Use Node 24 (`.nvmrc`).

## Source

- `src/pages/`: file-based Astro routes, including the blog archive and `[slug].astro` article route.
- `src/content/pages/` and `src/content/posts/`: local Markdown content collections with validated frontmatter. Main page bodies retain the original exported HTML, classes, and wrappers.
- `src/content/shells/`: historical layout snapshots. Astro components and `Base.astro` assemble the local site chrome at build time.
- `src/styles/site/`: repository-owned local CSS, imported by the routes that use it. Article-only framing is in `article.css`.
- `public/`: local theme compatibility assets, JavaScript, fonts, images, redirects, and site files.
- `src/lib/`: local content, layout, image, and SEO helpers. Normal builds make no WordPress API calls.
- `migration/`: original public exports and image/link recovery records for comparison.
- `docs/`: owner guides, migration notes, image measurements, audit findings, and the current handoff log.

## Editing

The owner can edit blog posts and the eight main pages' title/description/body
text at `/admin/` — a [Sveltia CMS](https://sveltiacms.app)
instance, signed in with GitHub, publishing through the same
branch-preview-review flow as a code change. See
[the owner's editing guide](docs/cms-editing-guide.md) and
[how it's wired up / how to reuse it elsewhere](docs/cms-architecture.md).

For anything the CMS doesn't expose yet (page layout or new fields), edit the local source while preserving existing wrappers and design. Review the Pages preview before production changes. Do not reimport WordPress over local edits.

## Current status

The latest pushed commits are on `astro-headless-migration`. Check the Cloudflare Pages production-branch setting and deployment status before treating the site as a reviewed production release; the branch's configured role has not been independently verified in this workspace. No DNS change was made. Desktop and mobile review of the restored article layout is still pending because browser access was unavailable.

The contaminated “Choice – Our Global Impact” post was removed from the live content collection. `/choice/` redirects to `/blog/`; its historical WordPress export remains under `migration/`. Restore replacement copy only from a trusted source.

## Audit and performance

The 28 October 2026 repository audit is in [docs/repo-audit-2026-10-28.md](docs/repo-audit-2026-10-28.md), with recovered external-link probe details in [docs/external-link-audit-2026-10-28.json](docs/external-link-audit-2026-10-28.json). This is a partial audit: local generated links/assets were checked, and a recovered set of external URLs was reviewed. It is not a full recrawl or a fresh Lighthouse, Core Web Vitals, accessibility, or form-delivery assessment. Some external servers block automated probes, so 403/406/409/429 and timeout results do not by themselves prove a dead link.

The measured homepage critical CSS is about 51.6 KB gzip before paint, with full route CSS retained. Existing image optimization evidence is in [docs/image-optimization-evidence.json](docs/image-optimization-evidence.json). The audit found no compelling reason to relocate the already-small WebP archive thumbnails. Large legacy styles remain a future optimization candidate; remove rules only after checking the affected routes and states.

See [LAUNCH-TODO.md](LAUNCH-TODO.md) for cutover notes and [SEO-AIO-RECOVERY.md](SEO-AIO-RECOVERY.md) for traffic recovery recommendations.

## Native Astro images

The homepage background uses `getImage()` to generate a smaller AVIF, with the existing WebP retained as a browser fallback and social image. Large blog-card photos use Astro's `Image` component with 400/800px responsive candidates; smaller photos retain their existing file. Crop and layout are unchanged.

Imported source images live under `src/assets/images/`, organized by year/month. The CMS stores new post images in this same folder so featured images remain local Astro assets and can be optimized at build time. Public `/wp-content/` compatibility URLs stay in `public/` for the existing rendered markup and old links. Images not imported there continue to work through their existing public URL.

## Documentation

- [CMS editing guide (for the site owner)](docs/cms-editing-guide.md)
- [CMS architecture and how to reuse it](docs/cms-architecture.md)
- [Repository audit: links, images, CSS](docs/repo-audit-2026-10-28.md)
- [Recovered external link results](docs/external-link-audit-2026-10-28.json)
- [Claude handoff log](docs/HANDOFF-2026-10-28.md)
- [Historical migration audit and prioritized to-do list](docs/livingrhea-audit-and-todo.md)
- [Client owner guide](docs/client-owner-guide.md)
- [SEO/AIO recovery plan](docs/seo-aio-recovery-plan.md)
- [Image optimization measurements](docs/image-optimization-evidence.json)
- [Launch checklist](LAUNCH-TODO.md)
- [Migration status](MIGRATION-TODO.md)

Older audit and launch documents describe earlier states; use the dated current audit and handoff log for recent work. Confirm deployment settings and account-side checks before production cutover.

See [Astro-native assets and editing](docs/astro-native-assets.md) for the current local CSS pipeline, native hero, popup removal, and retained service integrations.

Current follow-up: [lean homepage CSS and social links](docs/lean-css-and-socials.md). The remaining [native content authoring target](docs/native-content-target.md) is explicitly documented; JSON/HTML exports are transitional.
