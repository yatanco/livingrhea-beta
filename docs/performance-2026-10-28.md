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
