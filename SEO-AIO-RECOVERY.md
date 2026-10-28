# Living Rhea — search and AI-discovery recovery

Checked October 27, 2026. This is a recovery plan, not a diagnosis of the traffic decline: Search Console, Bing Webmaster Tools, analytics, and historical ranking data have not been accessed.

## Findings from the public site and migration

- The current WordPress homepage declares `index, follow`. A homepage `noindex` directive was not found in the checked response. Older migration notes saying it is sitewide noindex are outdated.
- The current robots file permits ordinary crawling, advertises the WordPress sitemap, and blocks several individually named bots. That is not evidence that every AI-search experience is blocked. The existing crawler policy is preserved in the Astro migration.
- The original Astro copy fetched WordPress content and layout at build time. The final migration uses local content and layout files, so retiring WordPress will not break rebuilds.
- Known original post URLs and historical internal links have been mapped to Astro routes. Old sitemap endpoints redirect to `/sitemap.xml`, preserving a discovery route for previously submitted sitemaps.
- Blog posts previously inherited parts of the About-page head through the shared layout. Canonical/social metadata now describes each route, and factual Person, WebSite, WebPage/BlogPosting structured data is generated from local records. No new visible design or medical claims are introduced.
- The production domain has not been switched. A working preview is not proof that the real-domain migration or search recovery is complete.

## Priority 1: preserve discovery through launch

Keep the same domain and useful URLs. Confirm HTTPS, 200 responses for important pages, one canonical hostname, and direct 301s for known old URLs. Preserve the domain's existing Search Console verification records. After cutover, submit the new sitemap to Google and Bing and inspect Home, Coaching, About, and a few historically valuable articles.

Use the highest-traffic historical landing pages and inbound-link URLs to extend the redirect map. The exported WordPress permalink list cannot reveal every URL that received traffic years ago. Avoid redirecting every missing URL to the homepage: recover the page or use the closest relevant destination when one exists.

## Priority 2: use search data to find the loss

In Search Console, compare the pre-downtime period with the latest available period by page, query, country, and device. Separate lost impressions from lower click-through rate. Review Page indexing, HTTPS, manual actions/security, and representative URL Inspection results. In Bing Webmaster Tools, review crawl/index coverage and the submitted sitemap.

Start with the ten previously strongest pages rather than rewriting the whole archive. Record the old URL, current URL/status, indexing state, former queries, and action needed. Review weekly after launch. A fixed schedule or ranking recovery cannot be promised without evidence.

## Priority 3: improve authority and usefulness without a redesign

Rhea's scientific training, original work, named publications, and experience are useful assets already present in the site. Make the About page and relevant work easy to find from substantive articles. For health topics, clarify authorship, accurately state credentials, distinguish personal experience from broader evidence, and cite appropriate original research where claims warrant it. Add genuine review dates only after reviewing the content; do not make old posts look newly written by changing dates automatically.

For pages that already earned traffic, improve the answer to the original query: a clear introduction, useful headings, direct explanations, and relevant links to other articles/services. Short factual answers to common questions can help readers, but do not add generic AI-written FAQs to every page. Changes to health guidance should be reviewed by the owner or an appropriate subject expert.

## Priority 4: AI discovery and measurement

Google says its normal SEO fundamentals remain relevant to AI search experiences. Its current Search Console settings also include a separate **Search generative AI** inclusion control. Confirm the domain and any parent property are included if that matches your preference. Google explicitly distinguishes this from the `Google-Extended` training control. No account setting was changed during this migration. [Google's AI search guidance](https://developers.google.com/search/docs/appearance/ai-features), [Search generative AI controls](https://support.google.com/webmasters/answer/16908024?hl=en).

Bing's AI Performance reporting can help track citations across supported experiences. After the sitemap and indexing are healthy, IndexNow is an optional way to notify participating search engines of real URL updates; it does not guarantee inclusion. [Bing AI Performance](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/), [Bing URL submission guidance](https://www.bing.com/webmasters/help/URL-Submission-62f2860b).

My recommendation is to prioritize the readable, crawlable site and its established content over extra AI-specific infrastructure. The existing `llms.txt` may stay, but it is not the traffic-recovery plan. Keep structured data factual, content visible in HTML, stable links, and a consistent identity for Rhea. [Google's generative-search optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

## Practical improvements to queue separately

- Confirm the real booking and Fullscript destinations; some inherited links currently point to Contact.
- Confirm social profile URLs; several inherited header icons point to the homepage.
- Decide whether `test-post-for-press-page` belongs in the public archive.
- Recover the few genuinely missing old images from a backup if worthwhile.
- Add Pagefind later if on-site search is needed; avoid a WordPress search backend.
- Add CMS editing later using content fields that preserve the current design.
- Measure mobile loading after launch before replacing theme assets. The static migration removes WordPress server dependence, but retaining appearance also retains some legacy CSS and JavaScript.
