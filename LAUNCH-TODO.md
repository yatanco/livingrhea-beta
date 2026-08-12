# livingrhea.com — Launch TODO

Status of the Astro + headless-WordPress migration, and everything left before
going live on Cloudflare Pages. Ordered by "must do before launch" → "after".

Legend: **[you]** = needs the client/owner (credentials, decisions, WP edits);
**[done]** = complete in this repo; **[opt]** = nice-to-have.

---

## ✅ What the migration already does

- **[done]** Pulls all page/post content from the WP REST API at build time.
- **[done]** Renders WPBakery shortcodes to real HTML (WP Code Snippet #5).
- **[done]** Reproduces the Salient theme shell (header, footer, mobile menu,
  dropdowns, hero overlay, sliders, popup) per page.
- **[done]** **Runtime-independent from WordPress** — all CSS, JS, fonts and
  images are self-hosted; nothing loads from the WP origin when a visitor hits
  the site. (WP is only needed at *build* time.)
- **[done]** Images optimized to WebP (local sharp pass) + a post-build
  reconcile that guarantees no broken local asset paths.
- **[done]** Newsletter (Mailchimp) works — see below.
- **[done]** RSS feed at `/blog/rss.xml`; `_redirects`; `.nvmrc` (Node 22).

---

## 🚫 Blockers — before launch

### 1. Deploy hook (so client edits go live) — **[you]**
WP Code Snippet #7 is installed and active but has a placeholder URL.
1. Create the Cloudflare Pages project (see cutover below).
2. In CF: **Pages project → Settings → Builds & deployments → Deploy hooks →**
   create a hook, copy its URL.
3. wp-admin → Snippets → "Headless: rebuild Astro site on publish" → paste the
   URL over `PASTE_YOUR_CLOUDFLARE_DEPLOY_HOOK_URL_HERE` → Save.
Now publishing a page/post in WP triggers a rebuild automatically.

### 2. Contact form — **[you]**
`src/pages/contact.astro` still posts to `https://formspree.io/f/YOUR_FORM_ID`.
Create a form at formspree.io and paste the real form ID. Before cutover, check
WPForms → Entries + any Zapier/email integrations so nothing silently stops
notifying anyone.

### 3. Cutover order (critical — get this wrong and images 404) — **[you]**
The build bakes asset URLs from whatever `WORDPRESS_API_URL` points to.
1. Stand up WordPress at **`cms.livingrhea.com`**; confirm REST + wp-admin work
   there.
2. Set `WORDPRESS_API_URL=https://cms.livingrhea.com/wp-json/wp/v2` in the CF
   Pages project env (Production **and** Preview) and in local `.env`.
3. Update `site:` in `astro.config.mjs` to the final public URL.
4. Trigger a build; verify.
5. **Only then** point the root `livingrhea.com` DNS at Cloudflare Pages.

### 4. Indexing decision — **[you]**
The live WP site is sitewide `noindex,nofollow`. The Astro build **drops** that
(so it's indexable). Confirm that's intended before launch. (Code: the robots
meta is stripped in `src/lib/salient-shell.js`.)

### 5. Cloudflare Pages build settings — **[you]**
- Build command: `npm run build`  (runs mirror → build → reconcile)
- Output dir: `dist`
- Env: `WORDPRESS_API_URL`, `NODE_VERSION=22`
- The build fetches WP; the host's bot-protection is handled with retries, but
  if a build fails on a challenge, just re-run it.

---

## 🖼 Broken pages (content, not code) — **[you]** to fully fix

All broken images are on **blog posts** (recipe galleries + one experts
roundup). The build now **strips** these dead references so no broken-image
icons show — but the images are simply *gone from WordPress* (deleted NextGen
gallery media / ungenerated size variants). To restore them, re-upload in
wp-admin or edit the posts, then rebuild. Full list in
**`BROKEN-ASSETS-REPORT.md`** (regenerated each build). Affected posts:

- `/blog/14-health-sabotaging-myths-exposed-by-top-experts/`
- `/blog/raw-vegan-yogurt/`
- `/blog/green-warrior-smoothie/`
- `/blog/zenzini-pasta/`
- `/blog/mango-tango-faux-lassi/`
- `/blog/pesto-pizazz/`
- `/blog/rawkin-vegan-tacos/`
- `/blog/faux-fudgey-truffles/`
- `/blog/neat-nut-meat/`
- `/blog/are-you-drinking-a-smoothie-or-a-slurpee/`
- `/blog/benefit-from-medicinal-mushroom/`
- `/blog/excalibur-dehydrator-product-review/`
- `/blog/foffee-my-high-energy-coffee-substitute-2/`

Main pages (Home, About, Coaching, Himalayan Breathwork, Music, Press, Contact)
have **no** broken assets.

---

## 📧 Newsletter (Mailchimp) — ✅ works as-is

The footer signup is Mailchimp's **native embed** — it POSTs directly to
`https://livingrhea.us7.list-manage.com/subscribe/post` and does **not** depend
on WordPress. It has the email field, bot honeypot, and validation JS. Nothing
to adapt for launch.
- **[opt]** If you want it as a dedicated, styled Astro component elsewhere
  (e.g. a mid-page CTA), reuse `src/components/Newsletter.astro` and drop in the
  same `action`/hidden fields. The footer form already covers the basic case.

---

## 🔌 Plugin features that don't come along (were WP-runtime)

- **Instagram feed (home)** — the Smash Balloon feed was pruned (it needs WP).
  Replace with a hosted widget (Elfsight/SnapWidget) — MIGRATION-TODO #3. **[you]**
- **Popups** (Popup Maker "free smoothie guide") — the popup itself works
  (JS + Mailchimp). Confirm the signup still lands in the right audience. **[opt]**
- **Search overlay** — WP native search isn't wired; skipped for launch
  (MIGRATION-TODO #4). Add Pagefind later if needed. **[opt]**

---

## 🧭 Post-launch / polish — **[opt]**

- **Analytics/pixels** — confirm GA4 / Meta pixel actually fire (Site Kit tags
  come through the shell; verify with Realtime after launch).
- **Per-page SEO** — `<title>`/description are per-page, but OpenGraph/Twitter
  tags currently come from each page's shell head (mostly correct; audit the
  og:image per page if it matters).
- **301 redirects** — diff the full old WP URL list (XML export) against Astro
  routes and add any that moved to `public/_redirects`.
- **Favicon / social share image** — currently the theme defaults; set
  deliberately if desired.
- **Native rebuild (later)** — the site currently ships Salient's full CSS/JS.
  If you want a lighter, faster site, rebuild header/footer/hero as native Astro
  components — but that reduces how much the client can restructure in WPBakery,
  so weigh it against their editing needs.

---

## How the build works (for future you)

`npm run build` runs three steps:
1. **prebuild** — `scripts/mirror-wp-assets.mjs`: downloads referenced WP assets
   into `public/`, self-hosts Google Fonts, converts rasters to WebP.
2. **build** — `astro build`: pulls REST content, renders pages in per-page
   Salient shells, localizes all URLs.
3. **postbuild** — `scripts/reconcile-assets.mjs`: fetches any asset the mirror
   missed, then strips references that are 404 on WP (writes
   `BROKEN-ASSETS-REPORT.md`).

Mirrored assets under `public/wp-content|wp-includes|vendor` are git-ignored and
regenerated each build.
