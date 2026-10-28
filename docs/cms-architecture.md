# CMS architecture: what's running, why, and how to reuse it

## What's actually deployed

Three pieces, none of them a new server to maintain:

1. **Sveltia CMS** — a static admin page at `public/admin/index.html` +
   `public/admin/config.yml`. It's not an npm dependency and has no build
   step: `index.html` loads the editor from a CDN
   (`unpkg.com/@sveltia/cms`), and `config.yml` describes the content
   fields. Both are plain files Astro copies into the static build like any
   other file in `public/`.
2. **A shared OAuth helper** — a ~450-line open-source Cloudflare Worker
   ([`sveltia/sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth),
   MIT) deployed as `sveltia-cms-auth` on the Cloudflare account already
   used for Pages. It does one thing: when someone clicks "Sign in with
   GitHub" in the editor, it completes the OAuth handshake with GitHub and
   hands the editor a token. It holds no content and is **not specific to
   this site** — `backend.repo` in each site's own `config.yml` is what
   actually scopes access, so the same worker can authenticate editors for
   Casa Gaviota or any future site too. Deploy it once, point every site's
   `config.yml` at it.
3. **GitHub itself** is the actual backend. Every edit is a commit; every
   save is a Pull Request (`publish_mode: editorial_workflow`) against
   `astro-headless-migration`, reviewed/previewed the same way a
   developer's PR is, before anyone publishes it. There's no database and
   nothing new to back up — the content already lives in this git repo.

## Why Sveltia over Keystatic (or Decap)

All three were considered against this project's actual constraints:

- **Decap CMS** (what WordPress-to-Astro migrations often default to) is
  effectively unmaintained upstream; Sveltia is its actively-maintained,
  config-compatible successor — same `config.yml` shape, better editing UX,
  faster. There's no reason to pick the older one for a new setup.
- **Keystatic** has the tightest native integration with Astro (content
  schema can be shared with `content.config.ts`), but its GitHub-backed mode
  needs an Astro **adapter** (e.g. `@astrojs/cloudflare`) and at least one
  server-rendered route (`/keystatic`, `prerender = false`) — the rest of
  the site can stay static, but the deployment model changes from pure
  static files to Cloudflare Pages *Functions*. This site is currently 100%
  static (`output: "static"`, no adapter) by design, and every existing
  piece of infrastructure — the `_headers`/`_redirects` files, the
  critical-CSS build integration, the caching strategy — is tuned around
  that. Taking on an adapter switch for the whole site, just to gain one
  authenticated admin route, is a disproportionate architecture change for
  "smallest useful CMS foundation."
- **Sveltia CMS** needs zero changes to the Astro app itself. It's a static
  page plus one small, already-proven piece of shared infrastructure
  (the auth worker) that sits entirely outside the Astro build. That's the
  smaller, safer, more reusable foundation for a first pass — and nothing
  here blocks moving to Keystatic later if a tighter editor integration
  becomes worth an adapter switch.

## One-time setup (not done yet — needs the account owner)

Two things only a human with the right account access can do; everything
else is already built:

1. **Register a GitHub OAuth App** (one-time, ~2 minutes):
   [github.com/settings/applications/new](https://github.com/settings/applications/new)
   - Application name: `Living Rhea CMS` (or anything)
   - Homepage URL: `https://livingrhea.com`
   - Authorization callback URL: `https://sveltia-cms-auth.haneen.workers.dev/callback`
   - Generate a client secret. Hand the **Client ID** and **Client Secret**
     to whoever is finishing this setup (don't paste the secret anywhere
     public — a direct message is fine).
2. **Deploy the auth worker and set its two secrets.** This repo doesn't
   vendor the worker's source (it's generic infrastructure, not site code);
   clone it fresh and deploy:

   ```sh
   git clone https://github.com/sveltia/sveltia-cms-auth.git
   cd sveltia-cms-auth
   npx wrangler deploy
   npx wrangler secret put GITHUB_CLIENT_ID      # paste the Client ID
   npx wrangler secret put GITHUB_CLIENT_SECRET  # paste the Client Secret
   npx wrangler secret put ALLOWED_DOMAINS        # value: livingrhea.com,livingrhea-astro.pages.dev
   ```

   The deployed URL will be `https://sveltia-cms-auth.<your-workers.dev-subdomain>.workers.dev`
   — confirm it matches `backend.base_url` in `public/admin/config.yml`
   (already set to `sveltia-cms-auth.haneen.workers.dev` for this account;
   update it if the worker name or subdomain differs).

Once both are done, `/admin/` on the preview deploy (and later the
production domain) will let GitHub collaborators sign in.

## Reusing this for Casa Gaviota (or any future site)

1. Skip step 2 above entirely — the worker already exists and is
   repo-agnostic.
2. In the new site's repo, add the same `public/admin/index.html` and a
   `config.yml` with `backend.repo` set to the new repo and `base_url`
   pointing at this same worker's URL.
3. Register a *separate* GitHub OAuth App for that repo if you want
   independent access control, or reuse this one if the same people edit
   both sites — either works; the worker doesn't care which repo a given
   site's `config.yml` points it at.
4. Shape that site's `collections:` to its own content model. The two
   patterns used here are worth reusing directly:
   - **Any frontmatter key the editor doesn't expose must still be
     declared, as `widget: hidden`** — Sveltia (like Decap before it)
     strips undeclared frontmatter keys on save. Forgetting this silently
     corrupts existing content the first time someone edits it.
   - **A body that's chunked by convention (headings, a fixed order,
     anything a template parses structurally) needs a `hint:` telling the
     editor what not to break**, or a different field shape entirely —
     a plain markdown widget doesn't enforce structure on its own.

## What this doesn't do yet

- No visual/section editing for the 8 main pages — only title and meta
  description. Page *text* editing was tried first (`body` as a markdown
  field) and pulled back: the pages' content is chunked by `# section-...`
  heading lines that `src/lib/page-sections.js` splits and injects into
  fixed layout positions, and the markdown editor rendered those headings
  as indistinguishable from real content — confirmed live, not just a
  theoretical risk. `body` is declared as `widget: hidden` on every page
  now specifically so it round-trips unchanged (verified safe by reading
  Sveltia's own serializer: a hidden field still populates from the
  existing entry and gets written back as-is; omitting the field entirely
  would have blanked the page body on the next save). The real fix is
  reshaping page content into labeled per-section fields — tracked in
  `docs/native-content-target.md`, not done here.
- Posts use Astro/Sveltia page bundles: `src/content/posts/<slug>/index.md`
  with each featured image in that post's `images/` folder. The CMS collection
  uses `path: "{{slug}}/index"`, `media_folder: images`, and
  `public_folder: images`. This keeps the image visible in the editor and
  lets Astro's `image()` schema optimize it at build time. Inline article
  images remain in the shared `src/assets/images/` library. The old public
  image URL is kept in the hidden `legacyFeaturedImage` field for social-share
  fallback and compatibility.
