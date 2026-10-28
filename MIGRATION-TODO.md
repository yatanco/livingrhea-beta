# Migration outcome and improvements

## Implemented

- Exported 8 usable pages and 77 published posts from the public WordPress API; excluded the sample page and replaced the blog archive with an Astro listing.
- Native Astro templates replace the Salient/WPBakery shell. The layout is a new, simpler presentation of the exported content, not a pixel-identical theme reproduction.
- All media is local under `/media/`. Existing optimized WebP images are used when available; unused theme/plugin CSS, JavaScript and fonts have been removed.
- Browser editing through Decap CMS/Turbo; Markdown content stored in JSON files in GitHub, also easy to edit with Codex.
- Native responsive navigation, journal listing, individual articles, sitemap, RSS, canonical URLs, social metadata, custom 404, and historical post redirects.
- Corrected old category links, malformed relative external links, empty coaching CTAs, and the dead homepage popup anchor.
- Kept the existing Mailchimp signup endpoint. Contact submits to the supplied Formspree endpoint; inbox delivery still needs a real submission test.
- Updated Astro and dependencies; local dependency audit passed with zero known vulnerabilities at implementation time.

## Before launch

Follow `LAUNCH-TODO.md`. Live CMS login/publishing, contact delivery, newsletter delivery, Pages deployment and DNS are not verified yet.

## Recommended next improvements

1. **Shorten the homepage.** The exported biography and testimonials are long. Keep a short introduction, three service cards, one or two testimonials, and a link to About. This is an editorial choice, so the migrated copy is retained for review.
2. **Use one booking destination.** A hosted scheduling link (your existing booking tool, or Cal.com/Calendly if you choose one) is simpler than a custom booking system. Current consultation buttons lead to Contact.
3. **Confirm Fullscript's real URL.** The old site's supplement link pointed to Contact. The new wording says “Ask about Fullscript supplements” until a real destination is supplied.
4. **Restore or replace a few old images.** Fourteen missing expert image variants were recovered from originals already present. Six file references remain unavailable, including two decorative emoji images and four content images. See `migration/image-recovery.json`. They are omitted rather than displayed as broken images.
5. **Review old and test posts.** `test-post-for-press-page` is publicly published in the source and was retained. Decide whether it belongs in the journal or should be removed with a redirect.
6. **Use links instead of feeds/widgets.** Music/video links and the Instagram profile need less maintenance than live social-feed plugins. Native content contains the exported media destinations.
7. **Add analytics only if useful.** Cloudflare Web Analytics is a simple option; configure it in Cloudflare rather than bringing WordPress's tracking scripts across.
8. **Improve image descriptions as you edit.** Legacy decorative images often had empty alt text. Cover-image alt text is editable in the CMS.

## Maintenance

Routine: edit, publish, check the resulting Pages build. Occasionally review dependency updates and run `npm run check`. Keep the lockfile and a Git backup; no PHP, WordPress core, theme, plugins, or database updates are required.
