# Site styles

These are repository-owned CSS sources. They were frozen from the original design on 28 October 2026, with the original cascade order preserved. Astro/Vite resolves the local `@import` lists, minifies the CSS and emits fingerprinted files under `/_astro/`. No CSS is fetched during builds or from a CDN at runtime.

- `livingrhea-com.css`: homepage entry.
- Other page names: that route's style entry; blog routes use `about.css`.
- `custom-*.css`: the original page-specific design overrides.
- `dynamic-css-css.css`: the original shared colors, typography and theme settings.
- `fonts.css`, `font-awesome.css`, `icomoon.css`: local font definitions.
- `mailchimp-classic.css` and `inline-3a7a11a5f3.css`: the existing newsletter form styling.
- Remaining files: frozen compatibility styles, named after the original stylesheet registrations. Their copyright/license notices remain where supplied.

Edit these sources, not `dist/` or the old public theme CSS. The CSS and style tags in `src/content/shells/*.json` are historical and no longer applied. The source page records still own visible copy; their old `wpb_custom_css` fields are also historical. New components should own their CSS, as `HomeHero.astro` does through `src/styles/home-hero.css`.

The saved popup theme's Montserrat font was downloaded once from Google Fonts to `public/fonts/site/`. Mailchimp form CSS is also frozen here. There is no automatic vendor update or synchronization. Legacy Internet Explorer star-property declarations and a broken invisible Instagram sprite preload were removed to make these sources valid build inputs. The missing sprite's loader background now uses a CSS border.

Run `npm run check` after edits. It checks all rendered pages for bundled local styles and checks every CSS URL for a local file. Review desktop and mobile appearance as well.
