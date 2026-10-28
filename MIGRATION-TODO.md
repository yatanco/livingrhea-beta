# Migration status and remaining improvements

## Implemented

- Original Astro templates and original visual design retained. No redesign is part of the final implementation.
- 8 usable pages plus 77 posts are local; the sample page is excluded and Blog has its own archive route. Original public exports remain in `migration/` for comparison.
- Header/footer/page layout snapshots, theme assets, fonts, and images are local. Builds no longer call WordPress. The exported Salient CSS/JavaScript is retained where it supports the existing design.
- Contact uses a small native Astro replacement in the original page location, posting to the supplied Formspree endpoint.
- Existing Mailchimp footer signup retained; the previously empty guide-signup area now has a direct Mailchimp form.
- WordPress form/Instagram/Jetpack tracking scripts are excluded; the conflicting duplicate lightbox plugin and unused emoji loader are removed. Popup Maker's server-backed analytics is disabled; its presentation remains.
- Fourteen missing expert image variants recovered from local originals. Unavailable images and dead NextGen editor previews are omitted. Missing responsive-size candidates fall back to available image sources.
- Historical permalink redirects, corrected internal links, old sitemap URL redirects, canonical URLs, route-specific social metadata, and factual structured data added without changing the visible design.
- Astro stable 7.4.2 pinned; dependency audit passes. Normal builds require no WordPress environment variables or credentials.

## Not yet verified or launched

Live inbox/guide delivery needs owner-controlled submissions. CMS is deferred. Production merge and DNS cutover remain pending review. See `LAUNCH-TODO.md`.

## Simple follow-up suggestions

- **Search:** the inherited WordPress search is not a full static-site search. Pagefind is a suitable later Astro-friendly replacement if search is needed.
- **Instagram:** retain the existing profile link rather than maintaining a live feed plugin. The old feed's backend is not carried over.
- **Booking/Fullscript:** supply the real destinations if separate booking or supplement ordering is intended. Some inherited links currently lead to Contact or are placeholders.
- **Social icons:** several old header icons point to the homepage; confirm the real profiles before changing or removing them.
- **Editing:** use Codex for small copy changes now. Add a CMS after choosing manageable content fields that preserve the existing design.
- **Performance:** static hosting removes PHP/database work, but keeping the existing design also retains theme CSS/JavaScript. Any future replacement of those assets should preserve appearance and be measured separately.
- **Content:** decide whether the published `test-post-for-press-page` belongs in the archive. It was retained rather than silently deleted.

SEO/AIO recommendations are in `SEO-AIO-RECOVERY.md`.

## Native Astro image optimization

The homepage hero now uses Astro `getImage()` (AVIF with WebP fallback), reducing its generated file from 230,270 to 124,391 bytes. Fifty-eight large archive images use native Astro `Image` responsive output. Across all 74 featured images, the default files total 2,973,554 bytes instead of 4,483,838 bytes (34% less); smaller candidates can reduce transfer further depending on the viewport. Already-small images are retained rather than enlarged by re-encoding. These are file-size comparisons, not measured Core Web Vitals gains.

Week-long browser caching is restored for static `/wp-content/`, `/wp-includes/`, and `/vendor/` assets. Hashed Astro assets retain immutable caching.
