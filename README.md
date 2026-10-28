# Living Rhea — independent Astro site

Content, media, and templates are local. WordPress is not used for editing, builds, or serving visitors.

## Run

Use Node 24 (`nvm use` if available), then:

```sh
npm ci
npm run dev
```

For a verified production build: `npm run check`. Deploy `dist/` through Cloudflare Pages' Git integration. `npm run build` runs no content export or network migration step.

## Edit

- Browser: `/admin/` → log in with the Decap Turbo account → Pages / Journal posts / Site settings.
- Codex: edit JSON files under `src/content/`. The `body` field is Markdown; `hero` is an image path. Ask Codex to keep slugs, update links when necessary, and run `npm run check`.
- Upload images in the editor; they are stored under `public/media/editor/`.
- Publishing saves a Git commit on `astro-headless-migration`. Configure Cloudflare Pages to deploy that branch. Edits appear after a successful Pages build, not instantly.
- Previewing a rich-text edit is not the same as previewing the complete site. Check the Pages preview after layout changes.

## Launch

See `LAUNCH-TODO.md` for exact remaining account settings and verification. `MIGRATION-TODO.md` records what changed and improvement suggestions.

The saved public WordPress exports in `migration/` are reference data, not live content. They include the source used for the migration and a record of unavailable images. Do not rerun imports over editorial changes.
