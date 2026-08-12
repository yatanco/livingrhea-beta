# livingrhea.com → Astro + headless WP: migration to-do

Architecture: Astro (static build) pulls content from the WP REST API
at build time. WordPress keeps running exactly as-is behind the
scenes — same wp-admin, same WPBakery editor — but only Astro serves
production traffic. This means: everything the client *edits* in WP
(page text, blog posts, images) carries over automatically on the
next build. Everything that's a *plugin feature running live on the
old PHP site* does not, and needs one of the options below.

## 1. Newsletter signup (Mailchimp) — easy
Currently an embedded form tied to a WP plugin/shortcode
(`eepurl.com/8dr2yTLOdh`). Get the real embedded-form HTML from
Mailchimp (Audience → Signup forms → Embedded forms) and drop it into
`src/components/Newsletter.astro`. This is a Mailchimp-hosted POST —
it doesn't touch WP or PHP at all, so it's a copy-paste, not a rebuild.

## 2. Contact form (WPForms) — decided: Formspree
WPForms posts to PHP on the WP server, which a static site doesn't
have. Using **Formspree** — free tier, no server code, just point the
`<form action>` in `src/pages/contact.astro` at your real form ID.
Before cutover: check WPForms → Entries and any connected
integrations (Zapier, email notifications) on the current site so
nothing silently stops notifying anyone once WPForms is gone.

## 3. Instagram feed (homepage) — decided: hosted widget (Elfsight/SnapWidget)
The current plugin (Smash Balloon or similar) is live-authenticated to
an Instagram account. Going with a paid hosted embed widget instead of
rolling our own Instagram Basic Display API integration — a few
dollars a month buys out of Meta's token-refresh maintenance burden,
which is exactly the kind of thing that quietly breaks a site nobody's
actively developing anymore. Drop the embed's script tag into the
homepage where the Instagram grid currently sits.

## 4. Search — decided: skip
The theme has a "Hit enter to search" overlay wired to WP's native
search. Not building a static-search replacement (e.g. Pagefind) for
launch — a 7-page brand site is unlikely to get meaningful search
volume. Check Search Console after launch; add Pagefind later if the
data says otherwise.

## 5. WPBakery visual blocks worth rebuilding as real components
The `[slug].astro` catch-all renders WPBakery's output HTML verbatim,
which keeps the *content* but loses interactivity for:
- Homepage testimonials quote carousel
- `/coaching/` PACKAGES section (currently plain cards/anchors, was
  likely a WPBakery tab or accordion block)
- Any image sliders using WPBakery's slider shortcode
Rebuild these as small Astro/vanilla-JS components once you see them
rendered — they're mostly cosmetic, not urgent for launch.

## 6. Rebuild trigger for the client
WP → Astro isn't live-updating like WP → PHP was. Add a webhook (WP
Webhooks plugin, or a two-line `save_post` hook) that calls your
Cloudflare Pages "deploy hook" URL whenever a post/page is
published/updated. Otherwise the client publishes in WP and nothing
changes on the live site until someone manually rebuilds.

## 7. robots meta — decide, don't inherit by accident
Every crawled page currently sends
`<meta name="robots" content="noindex, nofollow">` site-wide. That
means Google isn't indexing this site *today*. Confirm with the
client whether that's intentional (site still in soft-launch) before
you either carry it over or drop it in the rebuild — this is a
one-line decision with real SEO consequences either direction.

## 8. Housekeeping before/at cutover
- [ ] Analytics/pixels (GA4, Meta pixel, etc.) — grab tracking IDs
      from the WP theme header/footer, they won't be in the REST
      content field.
- [ ] 301 redirects — pull the full URL list from the WP XML export
      and diff against Astro's routes; redirect anything that moves.
- [ ] RSS feed (`/feed/rss/`) — Astro has a `@astrojs/rss` package,
      wire it up so `livingrhea.com/blog/rss.xml` (or similar) keeps
      working for anything subscribed to it.
- [ ] Favicon / social share images (og:image) — currently theme
      defaults, re-set in `Base.astro`.
- [ ] DNS/hosting cutover plan: WP moves to a subdomain (e.g.
      `cms.livingrhea.com`) that only you and the build process hit;
      the root domain points at Cloudflare Pages.

## What does NOT need touching
- Blog posts, page copy, images — all comes from WP REST automatically.
- YouTube embeds on `/music/` — plain iframes, migrate as-is.
- Outbound links (Dropbox speaker kits, Fullscript, Instagram profile
  link) — static links, no work needed.
