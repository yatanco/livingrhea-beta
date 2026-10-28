# Launch on Cloudflare Pages

The source migration is complete and builds locally. Production launch still requires the following account configuration and checks.

## Cloudflare Pages

Connect `yatanco/livingrhea-astro` using Git integration:

- Production branch: `astro-headless-migration` (matches the Decap configuration).
- Build command: `npm run build`.
- Output directory: `dist`.
- Root directory: repository root.
- Environment variable: `NODE_VERSION=24`.
- Remove old `WORDPRESS_API_URL` and WordPress deploy hooks. No CMS secret is required for builds.

If you later merge into `main`, change the production branch in both Pages and `public/admin/config.yml` (and in the Turbo dashboard). Keep all three aligned.

## Editor

Decap Turbo Site ID is configured: `19346064-1322-4ff7-a71f-c72e01d44608`.

In its dashboard confirm:

- Repository: `yatanco/livingrhea-astro`.
- Branch: `astro-headless-migration`.
- Config path: `public/admin/config.yml`.
- Admin interface origins include `https://livingrhea.com/admin/` and the actual `https://livingrhea-astro.pages.dev/admin/` URL. Add `http://127.0.0.1:4321/admin/` if you want local testing.
- The Turbo GitHub App has access to this repository and your account has access to this Turbo site.

On the deployed preview, log in, change one harmless sentence, publish, and confirm that the Git commit and Pages rebuild finish. Undo the test edit after verifying. A configured Site ID alone does not prove authentication or publishing works.

## Contact and newsletter

The contact form is configured to submit to `https://formspree.io/f/mzeerlkq`.

Verify the Formspree recipient is activated. Test a real delivery to the intended inbox and spam handling before switching domains. The endpoint is editable in Site settings.

The newsletter uses the existing public Mailchimp embed endpoint. Test signup and guide delivery with an owner-controlled test address. No signup was submitted during development. Confirm this audience really sends the promised guide.

## Domain switch

1. Verify the Pages preview on desktop and phone, forms, editor publishing, media links, sitemap, RSS, and a historical blog redirect.
2. Add `livingrhea.com` and `www.livingrhea.com` through Pages → Custom domains. Follow Cloudflare's displayed records; do not guess a Pages hostname or IP.
3. Wait until both domains show active HTTPS. Set a single canonical hostname (the code uses the apex domain); redirect www to apex in Cloudflare if desired.
4. Keep email MX/TXT records intact. Remove only conflicting web records indicated by Pages.
5. Verify `https://livingrhea.com/`, `/admin/`, `/contact/`, `/blog/`, `/sitemap.xml`, and an old post URL.
6. Keep the WordPress backup and prior DNS values until launch checks pass. WordPress hosting can then be retired; the Astro site does not use it.

No production DNS records have been changed by this migration.
