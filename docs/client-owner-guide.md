# Living Rhea — notes for the site owner

## What is changing

Your website keeps its existing design. It will be served by Astro on Cloudflare Pages instead of relying on WordPress to generate pages. The content and images are saved with the website's source files. Visitors do not need a WordPress server to view the new site.

The new version is still a review preview. The live domain has not been switched, and the migration pull request has not been merged. WordPress should stay backed up until the new version is accepted and the domain checks pass.

Preview: https://codex-wordpress-independent.livingrhea-astro.pages.dev/

## Your review checklist

Please check these on your computer and your phone:

- Home: logo, main image, wording, menu, testimonials, and guide signup.
- About: biography, credentials, photos, research/speaking references, and speaker-kit downloads.
- Coaching and breathwork: current services, package names, promises, availability, and the correct enquiry/booking destination.
- Music and Press: the correct releases, videos, interviews, and external links.
- Blog: important older posts and recipes, especially anything that previously attracted visitors.
- Contact: make one controlled test submission and confirm it reaches your intended inbox.
- Free guide: subscribe using an address you control and confirm the promised guide arrives. Check spam, any confirmation step, and the unsubscribe path.

The developer has checked the form wiring, but only you can confirm inbox receipt and whether the mailing-list automation sends the right guide. The guide form currently uses the existing Mailchimp audience. If that audience requires a particular tag or separate form to deliver the guide, provide the correct Mailchimp embed/settings.

## Information to confirm

1. Which inbox should receive enquiries, and who responds?
2. Should “Book a consultation” open a scheduler or simply the contact page? Supply the real destination.
3. What is the correct Fullscript ordering link?
4. Which social profiles should appear? Some old icons currently lead back to the homepage, and an obsolete profile can be removed with your approval.
5. Is the published test/press article meant to remain public?
6. Are the current packages, biography, credentials, testimonials, photos, and speaker kits still accurate and approved for use?

## Editing content

A new visual CMS is intentionally postponed. You are not expected to edit the exported HTML/JSON by hand.

For now, send a small change request with the page URL and the exact replacement text or photo. The developer or Codex can make the change, send a preview, and publish after your review. No WordPress login is needed for this process.

A useful request is:

> On the Coaching page, replace [old paragraph] with [new paragraph]. Keep the current design, images, and URLs. Send a preview before publishing and run the site's checks.

For a new photo, supply the original file and explain which image it replaces. Astro now optimizes the homepage hero and larger blog-card images. The developer can add future source images to the same pipeline. Avoid changing page URLs casually; old links may still bring readers and search traffic.

## Accounts and ownership

Agree who owns each service and who has delegated developer access:

| Service | Why it matters |
|---|---|
| Domain registrar and DNS | Renewal, domain ownership, website and email routing. |
| Cloudflare | Hosting, domain setup, deployment history, and rollback. |
| GitHub/source repository | The website's source, content history, and recoverability. The current repository is under `yatanco`; agree the long-term ownership/access arrangement. |
| Formspree | Contact inbox delivery and spam controls. |
| Mailchimp | Subscriber list, guide delivery, sender identity, and mailing preferences. |
| Search Console, Bing, and analytics | Indexing, traffic recovery, and understanding useful pages/queries. |
| Dropbox or other media services | Access to speaker kits and any externally hosted downloads. |

Use account invitations/delegated access where available rather than sending passwords. Keep recovery details and billing/renewal contacts under an agreed owner. Review service limits and plans; the migration does not guarantee every third-party service will remain free.

## Traffic recovery

Moving to Astro alone does not restore rankings. The first step is to keep the domain and useful old links working, submit the correct sitemap, and review the pages that used to earn traffic. Search Console and Bing can help show whether pages are unindexed, queries have changed, or visitors are seeing results but not clicking.

Rhea's genuine expertise, original work, and clear authorship are useful strengths. Improve older content selectively and review health claims and supporting sources. Do not change dates simply to look fresh or publish large batches of generic AI-written posts.

There is a separate SEO/AIO recovery plan with more detail. AI-search visibility should be measured alongside regular search traffic; extra “AI optimization” files are not a substitute for a useful, accurate, crawlable site.

## Launch and ongoing care

Approve the preview, verify both forms, then let the DNS owner/developer complete the domain switch and HTTPS checks. Keep the old backup until the live site and important old links have been verified.

After launch, a small routine is enough: review enquiries and guide delivery, check important external links and service information, keep account access/renewals current, and have the developer review software updates periodically. Astro is pinned to a stable version; upgrades should be tested rather than applied as unreviewed major changes.

The remaining larger choices—CMS, on-site search, and replacement of heavy legacy theme components—can be scheduled separately. They should preserve the design you approved.

## Reviewed release

Final image-optimized preview: https://97d9b062.livingrhea-astro.pages.dev/

Source commit: `2c4e88039622fa384843b37907f6d36bb0f86e59`. GitHub validation (8 tests) and Cloudflare deployment passed. Production merge and DNS remain pending owner review.

## Update: 28 October 2026

The automatic marketing popup has been removed. The newsletter and free-guide forms remain. Styles, fonts and form validation are now stored with the site, and the homepage hero uses Astro responsive images. See [the current implementation and editing guide](astro-native-assets.md).
