# Repository audit resumed from Claude Code — 28 October 2026

This continues the interrupted dead-link, image, and CSS audit. Source and generated output were inspected with Node 24.22.1. Historical migration exports were preserved. No manual deployment, form submission, newsletter subscription, or DNS change was performed. The branch push may have triggered Cloudflare Pages automatically; see the handoff log and verify deployment status.

## Findings and changes

| Priority | Finding | Result / next action |
| --- | --- | --- |
| High | The published “Choice – Our Global Impact” post contained unrelated Italian pharmaceutical advertising, including external pharmacy links; its description was also affected. | Removed the contaminated post from the live content collection. The legacy `/choice/` URL now redirects to `/blog/`. The historical WordPress export remains untouched under `migration/`; restore an authentic article only from a trusted source. |
| High | Blog articles lost the original image-backed header, metadata, breadcrumb and bottom navigation/recommendations. | Restored native article framing from the saved original HTML and the owner's screenshots. The featured image is now the hero rather than a duplicate inline image. Adjacent links follow publication order; related cards prioritize shared categories then recent posts. Related selection is deterministic, not a reproduction of WordPress's dynamic selection. |
| Medium | A historical Institute for Integrative Nutrition interview link used a retired dated path. | Updated `integrative-health-coaches-role.md` to the publisher's accessible article at https://www.integrativenutrition.com/blog/scientist-health-coach-dr-rhea-mehta-on-science-and-inspiration . The replacement title and interview were checked independently. |
| Low | Organifi referral URL had a stray trailing apostrophe. | Removed only the apostrophe, retaining the referral code. Destination availability is still inconclusive (Claude's probe returned 429). |
| Medium | External historical references include unavailable destinations. | Recovered Claude's probe output into `external-link-audit-2026-10-28.json`, with source locations. This is a subset, not a complete independent recrawl. Do not interpret 000, 403, 406, 409 or 429 as confirmed dead links. |
| Medium | Main CSS bundles remain large. | Before article framing: eight route bundles measured 0.89–1.14 MB raw / 139–170 KB gzip each. Main savings opportunity is reducing legacy theme/plugin rules and sharing common CSS between routes. Requires browser coverage over menus, forms, lightboxes, mobile states and all routes before removing rules. |
| Low | Duplicate compatibility and imported image files occupy disk. | Found 126 byte-identical `src/assets/migrated/` and `public/` copies totaling 11,147,111 bytes per set. Public URLs remain referenced by legacy content and archive cards. Removing copies without rewriting those consumers would break compatibility; relocation alone does not reduce visitor transfer. |
| Low | Missing empty gallery directory produces an Astro warning. | Gallery collection intentionally renders nothing when empty. Warning is non-fatal; add content through the existing workflow when photos are supplied. |
| Low | Older audit/launch documentation describes earlier branches, CMS and footer states. | Treat those documents as historical context, not verified current deployment status. |

## External links needing review

Claude's recovered probe returned 404 for the bit.ly/2dpfKsF shortlink, laudadio.ca, advancedmedicine.ca/rhea-mehta, the Better by Bowhead Apple app, two FineMinds articles, a historical Mindbodygreen detox article, and a malformed WHFoods path. The pharmacy links in the removed Choice article also failed. Source locations and the exact probe statuses are in the JSON and reflect the audit before the post was removed. The retired IIN interview path was corrected. No unrelated replacement destinations were invented.

Booking and Fullscript calls to action still point to Contact. Real replacement URLs must come from the owner. The inherited search form submits `?s=` to the homepage; there is no static search index. The saved header currently disables its search control.

## Images

Current native page components already import local images and generate responsive variants. Among remaining direct `/wp-content/` image `src` references in generated HTML, the largest inspected file was the already-WebP 10-day Juice Cleanse archive card at 68,066 bytes, followed by medicinal mushroom (56,502) and team7 (51,778). These are modest files; prioritize CSS and article layout over relocating them. This scan covers HTML image `src` values, not every CSS background or `srcset` candidate.

The restored hero uses responsive Astro image output with high fetch priority. Recommendation images are lazy-loaded. Static compatibility paths remain intact. No CDN or remote image dependency was introduced.

## CSS and rendering

The existing homepage critical-CSS integration reports 141,542 → 51,624 gzip bytes required before paint while retaining full styles. This is generated-size evidence, not a new Lighthouse or field performance measurement. An earlier font preload was reverted because it worsened measured layout shift; do not re-add it without matching fallback font metrics.

Article framing uses a route-specific stylesheet and existing local font families. Other routes retain their previous layout. Comments are not enabled, and the old nonfunctional comment link/count is not recreated. The removed automatic Mailchimp marketing popup remains removed.

## Validation and limits

`npm run check` passes under Node 24: 87 generated pages, zero missing local href/src targets, zero missing same-page anchors, and all test files pass. Checks also cover local CSS dependencies and migrated content preservation. External availability and form delivery are separate from these local checks.

Desktop/mobile visual verification remains pending: browser discovery was retried after the owner opened ChatGPT Desktop, including a fresh tool session, but reported “browser access host is unavailable.” The layout implementation must not be described as visually verified or an exact screenshot match until that review can run. No fresh Lighthouse or accessibility certification is claimed.
