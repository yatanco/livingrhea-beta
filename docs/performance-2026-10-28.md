# Performance work — 28 October 2026

Preserve the original design and functionality, including the automatic Mailchimp popup and existing form validation. CMS remains deferred.

## Baseline

The supplied PageSpeed report tested the main Pages URL: performance 41, FCP 6.9 s, LCP 14.0 s, CLS 0.331. A separate fresh mobile test of the current review deployment (`97d9b062.livingrhea-astro.pages.dev`) measured performance 55, FCP 7.9 s, LCP 15.7 s, TBT 40 ms, CLS 0.083. These are lab runs, not field data; different deployments and network variation prevent attributing their difference to this pass.

The review deployment already passed the three agentic audits. Preview noindex headers are intentional; the preview SEO score is not a production SEO measurement. Do not invent an AI service catalog for this informational website.

## Changes

- Remove 23 stylesheet registrations for absent WordPress editor/plugin UI or duplicate/replaced fonts. Core layout, slider, navigation and widget styles remain.
- Load seven noncritical stylesheets asynchronously with normal stylesheet fallbacks when JavaScript is disabled.
- Bundle the same font faces through Astro, use font-display: swap, and preload the existing Ogg heading and Inter Latin fonts.
- Add intrinsic dimensions to local exported images and blog featured images to reserve their layout space.
- Keep the hero eager; load later background images within 400 px of the viewport. Existing containers and no-JavaScript background fallbacks remain.
- Give icon-only coaching CTAs descriptive accessible names.
- Cache static compatibility assets for 30 days; theme CSS/JS URLs include a content hash so changed files get fresh URLs. Astro fingerprinted assets retain their year-long immutable cache.

## Validation and limits

`npm run check` builds all 87 pages, checks local links/assets/anchors, and passes 12 tests. Regression checks cover automatic Mailchimp loading, form actions, eager hero, background fallbacks, stylesheet fallbacks, and image dimensions throughout the output. No forms were submitted.

Mailchimp’s separate marketing popup contributes approximately 1 MB of third-party images/scripts. Its timing and validation were preserved at the owner’s request. Its cache headers are controlled by Mailchimp. Remaining Salient scripts support the original interactions; removing them requires component-by-component parity work. A fresh PageSpeed run after preview deployment is required before claiming a measured gain from this pass.

## First deployed measurement and correction

[First run](https://pagespeed.web.dev/analysis/https-366b318d-livingrhea-astro-pages-dev/onknq894be?form_factor=mobile): FCP 3.8 s, LCP 9.6 s, payload 3,172 KiB (baseline 3,942 KiB), unused CSS 75 KiB (baseline 141 KiB). However CLS regressed to 0.514 and performance scored 40. This is not an overall success. The earlier paint exposed the original slider resizing from its default height to its mobile column aspect ratio. Reserve its existing 900/1100 responsive size in CSS before its unchanged JavaScript initializes; measure again.

## Corrected deployment results

[Mobile report](https://pagespeed.web.dev/analysis/https-e8b42304-livingrhea-astro-pages-dev/mf906cuund?form_factor=mobile), [tested immutable preview](https://e8b42304.livingrhea-astro.pages.dev/), commit `ca7a491`, 07:19 GMT-5:

| Metric | Review baseline | Corrected pass |
| --- | ---: | ---: |
| Performance | 55 | 56 |
| FCP | 7.9 s | 7.0 s |
| LCP | 15.7 s | 15.3 s |
| TBT | 40 ms | 0 ms |
| CLS | 0.083 | 0.083 |
| Speed Index | 8.6 s | 7.6 s |
| Transferred payload | 3,942 KiB | 3,172 KiB |
| Estimated unused CSS | 141 KiB | 75 KiB |
| Estimated render-blocking savings | 3,130 ms | 2,030 ms |

Accessibility 95, best practices 96, agentic browsing 3/3. Preview SEO 69 is due to its intentional noindex response. The first, faster run varied substantially: do not claim its 9.6-second LCP as the final result. The corrected run verifies the layout-shift regression is gone, but does not establish a major overall score gain.

### Remaining priorities

1. Reduce the remaining theme CSS by extracting verified shared critical styles, checking every page and breakpoint before deferring more. About 75 KiB is still estimated unused on the homepage; shared page styles cannot be removed indiscriminately.
2. Profile the existing hero initialization and animation sequence. Preserve its visible appearance and interactions while replacing layout calculations with CSS where parity can be proved. LCP is still poor.
3. Minify and consolidate compatible theme scripts without changing execution order or form/popup behavior; approximately 296 KiB is still reported unused on the homepage, including scripts supporting interactions that Lighthouse does not exercise.
4. Keep the automatic Mailchimp widget unchanged under the current requirement. Its approximately 1 MB contribution and short third-party caching remain unavoidable from this repository.
5. Resolve remaining contrast, heading-order and ARIA audit findings individually, preserving visible copy and design unless a change is agreed.

Cloudflare deployment and both GitHub validation checks succeeded. The PR remains unmerged; these are review-preview changes, not a production domain switch.
