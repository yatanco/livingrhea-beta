# Living Rhea — static Astro migration

This migration preserves the original site's appearance and makes its content, layout, and assets local. Normal builds and visitors do not need a WordPress server. Familiar `/wp-content/` asset paths are retained as static files; those paths do not imply a running WordPress installation.

## Run and verify

Use Node 24, then:

```sh
npm ci
npm run dev
```

`npm run check` builds the site, audits local links/assets/anchors, and runs migration tests. `npm run build` creates `dist/` without fetching WordPress. Astro is pinned to stable `7.4.2` with a committed lockfile.

## Source

- `src/pages/`: Astro routes, the existing blog layout, and a native contact form posting to Formspree.
- `src/content/pages/` and `posts/`: local exported records. The visible HTML is in `content.rendered`; original layout classes and wrappers are preserved.
- `src/content/shells/`: saved page layouts (header/footer/body classes/head styles). `Base.astro` assembles these at build time.
- `public/`: local theme CSS, JavaScript, fonts, and images. External Mailchimp and analytics integrations remain external services.
- `src/lib/content.js`: reads local records, normalizes asset paths, and fixes known historical links. It makes no API calls.
- `migration/`: original public exports and image/link recovery records for comparison.

## Editing

The owner can edit blog posts and the 8 main pages' title/description/body
text directly at `/admin/` — a [Sveltia CMS](https://sveltiacms.app)
instance, signed in with GitHub, publishing through the same
branch-preview-review flow as a code change. See
[the owner's editing guide](docs/cms-editing-guide.md) and
[how it's wired up / how to reuse it elsewhere](docs/cms-architecture.md).

For anything the CMS doesn't expose yet (page layout, new fields), ask
Codex/Claude to change the local content files while preserving HTML
wrappers and existing design. Run `npm run check`, review the Pages
preview, and publish only after review. Do not reimport WordPress over
local edits.

See `LAUNCH-TODO.md` for cutover checks and `SEO-AIO-RECOVERY.md` for traffic recovery recommendations.

## Native Astro images

The homepage background uses `getImage()` to generate a smaller AVIF, with the existing WebP retained as a browser fallback and social image. Large blog-card photos use Astro's `Image` component with 400/800px responsive candidates; smaller photos retain their existing file. Crop and layout are unchanged.

Imported source images live under `src/assets/migrated/`; the path mirrors the corresponding public compatibility asset. If a new featured image is added, put its original in that imported source tree as well to enable the same optimization, or ask Codex to do it. Images not imported there continue to work through their existing public URL.

## Documentation

- [CMS editing guide (for the site owner)](docs/cms-editing-guide.md)
- [CMS architecture and how to reuse it](docs/cms-architecture.md)
- [Migration audit and prioritized to-do list](docs/livingrhea-audit-and-todo.md)
- [Client owner guide](docs/client-owner-guide.md)
- [SEO/AIO recovery plan](docs/seo-aio-recovery-plan.md)
- [Image optimization measurements](docs/image-optimization-evidence.json)
- [Launch checklist](LAUNCH-TODO.md)
- [Migration status](MIGRATION-TODO.md)

The audit and owner guide describe the reviewed release identified in those documents. Launch status and account checks should be confirmed before production cutover.

See [Astro-native assets and editing](docs/astro-native-assets.md) for the current local CSS pipeline, native hero, popup removal, and retained service integrations.

Current follow-up: [lean homepage CSS and social links](docs/lean-css-and-socials.md). The remaining [native content authoring target](docs/native-content-target.md) is explicitly documented; JSON/HTML exports are transitional.
