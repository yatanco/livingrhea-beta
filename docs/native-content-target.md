# Long-term content and design target

The current exported JSON records containing HTML are an intermediate preservation format, not the intended authoring experience. They were retained to protect the original design during the initial WordPress removal. This stage is not complete.

The required destination is:

- Astro static generation: no WordPress, CMS connection or runtime content server.
- Rhea edits ordinary Markdown/MDX files, with readable frontmatter for titles, dates, summaries and image choices.
- Astro Content Collections validate those files at build time.
- Main-page layouts, navigation, forms, galleries/sliders and their presentation live in reusable `.astro` components and local CSS. Content files should not contain WordPress builder markup or theme settings.
- A local Markdown editor can be used; an online CMS is optional and remains deferred.

## Conversion order

1. Blog articles: convert the 77 published posts to Markdown, preserve dates, titles, categories, images, links and stable URLs, and render through a shared Astro article layout. Keep raw HTML only for media that cannot be represented cleanly, then replace it with components where appropriate.
2. Main pages: extract copy into readable Markdown/MDX sections and move layout into Astro components. Preserve the current appearance; do not simply rename HTML-filled JSON records to `.mdx`.
3. Header/footer and remaining widgets: replace saved shell markup and frozen theme interactions with native components, removing their compatibility scripts and CSS only after equivalent behavior is verified.
4. Document an owner editing workflow using the actual chosen content schema and editor. A Markdown editor is not a direct fit for the current JSON export format.

Validation must compare visible text, destination URLs, image assets and heading structure, in addition to desktop/mobile appearance. Keep the historical exports as migration references; they should no longer be runtime content sources after conversion.
