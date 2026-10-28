# Launch on Cloudflare Pages

The migration is on `codex/wordpress-independent` in draft PR #1, targeting `astro-headless-migration`. It preserves the original appearance and no longer fetches WordPress during builds. Do not merge or change DNS before the owner reviews the restored preview.

## Cloudflare configuration

Existing project: https://livingrhea-astro.pages.dev/

- Repository: `yatanco/livingrhea-astro`.
- Production branch: `astro-headless-migration` unless intentionally changed later.
- Build: `npm run build`.
- Output: `dist`.
- Root: repository root.
- Node: `24` (`.nvmrc` also declares 24).
- No `WORDPRESS_API_URL`, WordPress deployment hook, database, or CMS secret is needed.

The review branch automatically gets a Cloudflare preview. After owner review, merge the PR to publish through the configured production branch.

## Owner checks before switching the domain

1. Review Home, About, Coaching, Breathwork, Music, Press, Blog, and Contact on desktop and phone. Confirm the original design is retained.
2. Submit a real contact test to `https://formspree.io/f/mzeerlkq`; verify the intended inbox receives it. No test message has been submitted by the agent.
3. Test newsletter signup/guide delivery with an owner-controlled address. The existing Mailchimp audience is retained; its automation/delivery cannot be verified from page HTML alone.
4. Confirm the final Pages build succeeds, historical redirects work, and sitemap/RSS return XML.
5. In Pages → Custom domains, add `livingrhea.com` and `www.livingrhea.com`. Follow Cloudflare's exact displayed DNS instructions. Do not change email MX/TXT records.
6. Wait for active HTTPS. Keep a single canonical hostname (the code uses `https://livingrhea.com`). Redirect www to apex in Cloudflare if desired.
7. Verify the root site and several old article URLs on the real domain, then submit `/sitemap.xml` to Search Console and Bing Webmaster Tools.
8. Keep the WordPress backup and previous DNS values through verification. The old hosting can be retired after checks pass; this Astro site does not depend on it.

No production DNS has been changed. The PR remains unmerged pending review.

## CMS

Implemented: Sveltia CMS at `/admin/`, publishing through GitHub as draft PRs. See `docs/cms-editing-guide.md` (owner) and `docs/cms-architecture.md` (setup/reuse). It covers blog posts fully and the 8 main pages' title/description/body text; page layout editing is still a developer task. Setup needs one owner action (a GitHub OAuth App) before sign-in works end to end — see `docs/cms-architecture.md`. The earlier Decap Turbo Site ID (`19346064-1322-4ff7-a71f-c72e01d44608`) is unused; Decap and Keystatic were both evaluated and Sveltia was chosen (see the architecture doc for why).
