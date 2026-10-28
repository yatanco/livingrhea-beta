# Living Rhea — migration audit and prioritized work list

Prepared October 27, 2026 (America/Bogota).

## Outcome

The original appearance is restored. The Astro site builds from local page content, layout snapshots, fonts, and media; it no longer requires a WordPress server for builds or visitors. The migration remains in draft PR #1, unmerged, with production DNS unchanged. CMS implementation is deferred.

Review branch: https://codex-wordpress-independent.livingrhea-astro.pages.dev/

Pull request: https://github.com/yatanco/livingrhea-astro/pull/1

## What was checked

- All 87 generated HTML pages: 8 usable content pages, the Blog archive, 77 articles, and a custom 404.
- Automated local link, directly referenced asset, and same-page-anchor checks; original permalink mapping; route-specific article metadata; native image outputs.
- HTTP responses for the main pages, sitemap, RSS, robots, historical redirects, a missing page, and representative CSS/JavaScript/image resources on Cloudflare.
- Browser review of the original desktop appearance, About, mobile menu, and contact layout. No form submission or newsletter subscription was sent.
- Package dependency audit and clean GitHub/Cloudflare builds. A clean-build asset omission was found and fixed by anchoring Git ignore rules.

Search Console, Bing Webmaster Tools, analytics accounts, inbox delivery, email automations, full keyboard/screen-reader accessibility, and field Core Web Vitals were not available for verification. External historical links were not exhaustively crawled. This is a source, browser, and deployment review, not a penetration test or a certification of accessibility or legal compliance.

## Improvements already implemented

| Area | Result |
|---|---|
| WordPress independence | Local content/layout records and self-hosted compatibility assets; no WordPress fetch step in normal builds. |
| Appearance | Original layout, typography, colors, header/footer, photography, and archive styling retained. |
| Framework | Stable Astro 7.4.2 pinned, Node 24, committed lockfile. |
| Contact | Native Astro replacement in the original position, posting to the supplied Formspree endpoint. |
| Newsletter | Existing Mailchimp footer embed retained; direct signup added to the previously empty guide area. Delivery still needs confirmation. |
| Media repair | 14 missing expert image variants recovered; dead media/editor references and unavailable responsive candidates omitted. |
| Metadata | Correct per-route canonical/social metadata and factual structured data; articles no longer inherit About-page metadata. |
| Discovery | Known old article links and old sitemap URLs redirect to their Astro equivalents. |
| Caching | Week-long browser caching for static compatibility assets; immutable caching for hashed Astro outputs. |
| Runtime cleanup | WordPress form/feed/tracking glue and conflicting duplicate lightbox/emoji behavior removed or disabled. |

## Measured image savings

These are generated file sizes, not measured loading-time or ranking improvements.

| Resource | Before | After | Reduction |
|---|---:|---:|---:|
| Homepage hero | 230,270 bytes | 124,391 bytes | 46% |
| All 74 default blog-card image files, summed | 4,483,838 bytes | 2,973,554 bytes | 34% |

The hero uses Astro `getImage()` to create AVIF while retaining the existing WebP as a browser fallback and social image. Fifty-eight large card images use Astro `Image` with 400/800px responsive candidates. Smaller originals remain unchanged. No default card file is larger than the original. The visible layout and CSS crop are preserved. The archive is lazy-loaded, so the summed saving is not a claim that all those bytes were previously transferred on the first screen.

## Core Web Vitals status

| Metric | Measurement | Conclusion |
|---|---|---|
| LCP | Not measured with a trace or field data | No pass/fail claim. The smaller hero is a concrete payload improvement. |
| INP | Not measured with real interactions/field data | No pass/fail claim. Legacy theme JavaScript remains a measurement candidate. |
| CLS | Not measured with a trace or field data | No pass/fail claim. New Astro card images have explicit dimensions. |
| Lighthouse score | Not collected | No score is invented or inferred from source size. |

The homepage still references 49 local stylesheets (about 1.50 MB raw) and 22 local scripts (about 0.98 MB raw), excluding HTML, images, fonts, and third-party services. These are uncompressed source totals, not browser transfer measurements. The largest script is Salient `init.js` at 381,020 bytes; the slider script is 220,832 bytes. The hero was already WebP before this work, so simply recommending “convert images to WebP” would have missed the existing optimization.

## P0 — before production cutover

| Task | Owner | Done when |
|---|---|---|
| Review the restored appearance on desktop and a real phone | Client + developer | Key pages match the intended original design; no unwanted redesign remains. |
| Test contact delivery | Client | A controlled submission reaches the correct inbox and reply handling is clear. Confirm Formspree recipient activation. |
| Test guide signup and fulfillment | Client | A controlled signup receives the promised guide and expected consent/confirmation flow. Verify that the existing audience actually triggers the correct guide automation or tags. |
| Merge only the approved PR and verify production Pages build | Developer | The production branch produces the reviewed site. |
| Add apex/www custom domains and verify HTTPS | DNS owner + developer | Pages reports active domains; intended canonical-host redirect works; email DNS records remain intact. |
| Verify indexability on the real domain | Developer | Canonical URLs use livingrhea.com, sitemap/RSS work, and production responses do not carry an unintended `noindex` header. Preview deployments currently have Cloudflare's `X-Robots-Tag: noindex`, which is appropriate for previews. |
| Preserve rollback material | Developer + client | Git history, WordPress/database/media backup, prior DNS values, and a known deployment are retained until acceptance. |
| Confirm account ownership and recovery access | Client + developer | The client has agreed ownership/admin access and renewal/billing contacts for domain, Cloudflare, code, forms, mailing list, and analytics. |

## P1 — first improvement cycle

1. **Recover search using historical data.** Compare the best pre-downtime pages/queries with current Search Console and Bing data. Inspect the top ten old landing pages and add exact redirects or restore missing content where needed. Submit the new sitemap after cutover. See the separate SEO/AIO recovery plan.
2. **Confirm booking and supplement destinations.** Some inherited calls to action lead to Contact or placeholders. Obtain the actual booking and Fullscript URLs, then update links without changing their styling. One dependable hosted booking destination is simpler than a custom booking system.
3. **Correct inherited heading structure without changing appearance.** Home, Contact, and Blog currently have no H1. Seven routes have multiple H1s: Coaching, Music, Smoothie Movement, and four articles. Change semantic tags or heading levels while retaining the existing styles; verify the result visually.
4. **Make duplicate IDs unique.** Home repeats `about`; Coaching repeats `services`; five recipe posts repeat `ngg-image-0` (Zenzini Pasta repeats it three times). Update any linked anchors/scripts together and rerun checks.
5. **Confirm social links.** Several inherited header icons point to the homepage. Supply actual profile URLs or approve removing obsolete profiles such as Vine. Do not invent destinations.
6. **Check accessibility properly.** Complete keyboard navigation, focus, form-error, screen-reader, and contrast checks on the key journeys. Empty alt attributes are not automatically defects: many images are decorative. There are no missing alt attributes in the static scan, but descriptive quality still needs editorial review.
7. **Measure before trimming theme assets.** Capture a mobile performance trace/Lighthouse run and inspect CSS/JS coverage. Test one asset family or component at a time; do not remove a stylesheet merely because its plugin name sounds unnecessary. Keep the existing design as the visual acceptance criterion.
8. **Verify analytics and conversion destinations.** Existing Google/Mailchimp integrations are retained, but their account destinations and events have not been verified. Confirm contact and guide conversions in the client's accounts, and ensure the site's privacy information describes the actual services.

## P2 — subsequent, optional work

9. **Replace legacy components progressively with native Astro.** Start with a measured bottleneck, such as a slider or repeated layout shell. Reproduce the exact existing appearance before removing its legacy dependencies. The static migration removes PHP/database work but does not automatically remove all theme JavaScript.
10. **Add an appropriate CMS later.** Model text, images, services, testimonials, and posts into manageable fields without discarding the design. The client already created a Decap Turbo site; its configuration can be revisited. Today, copy changes can be made through Codex with preview/review.
11. **Decide whether on-site search is needed.** The inherited WordPress search is not a working search backend for the static site. Pagefind is a practical later option. Do not maintain WordPress solely for search.
12. **Decide what to do with the published test post.** `test-post-for-press-page` was retained from the source rather than silently deleted. Keep it, remove it with an appropriate response/redirect, or repurpose it intentionally.
13. **Review old media and external resources.** The six recorded missing image files and two dead NextGen preview references are documented. Recover worthwhile originals from backup. Check older affiliate/resource/video/speaker-kit links in batches, starting with traffic-bearing posts.
14. **Improve health-content attribution and evidence.** Keep credentials precise, distinguish experience from evidence, link to the author's background, and add genuine review dates after substantive review. Do not mass-refresh dates or manufacture expertise/claims for search.
15. **Add metadata only where supported by real content.** Useful service details and genuine common questions can be made clearer. Avoid generic AI-generated FAQ blocks and unsupported structured-data claims.
16. **Review security headers with the real integrations in mind.** `nosniff` and a referrer policy are present. A tailored Content Security Policy and production-domain HSTS settings can be considered after testing Mailchimp, analytics, embeds, and forms. Their absence in a preview response alone is not proof of a vulnerability.
17. **Review copied vendor JavaScript periodically.** `npm audit` reports zero known npm vulnerabilities, but it does not audit all copied theme/plugin JavaScript. Static files are still code. Keep an inventory and update or replace dependencies deliberately.
18. **Apply native image processing to further content only where it saves bytes.** The first pass targets hero/cards. Inline article/background images and other page imagery remain candidates. Preserve crop, sharpness, layout, and historical image URLs; retain already-small files when regeneration would enlarge them.

## Low-maintenance operating routine

For each change: branch → preview → checks → owner review → merge. Keep URLs stable. After a dependency update, run checks and spot-check the menu, contact form, guide signup, blog, and mobile layout. Review account access/renewals and package/vendor updates periodically rather than installing automatic major upgrades. No WordPress core, PHP, database, theme, or plugin server maintenance is required for this Astro site.

## Reviewed release

Final image-optimized preview: https://97d9b062.livingrhea-astro.pages.dev/

Source commit: `2c4e88039622fa384843b37907f6d36bb0f86e59`. GitHub validation (8 tests) and Cloudflare deployment passed. Production merge and DNS remain pending owner review.
