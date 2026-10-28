// Localize WordPress asset URLs so the built site references its OWN copies
// (mirrored into /public by scripts/mirror-wp-assets.mjs) instead of loading
// them from the live WP origin at runtime. This is what makes the deployed
// site independent of WordPress: content is pulled at build time, and every
// CSS/JS/font/image is served from the Astro origin.
//
// Written to import cleanly from both Astro (import.meta.env) and a plain
// Node script (process.env) — see the optional chaining on import.meta.env.

export const WP_ORIGIN = "https://livingrhea.com";
export const WP_HOST = "livingrhea.com";

// Google Fonts is self-hosted too (mirror writes /vendor/google-fonts.css).
export const GOOGLE_FONTS_LOCAL = "/vendor/google-fonts.css";

// Match the host with or without a leading www. (WP content sometimes uses the
// www. variant, which would otherwise leak as an external reference).
const hostEsc = WP_HOST.replace(/^www\./, "").replace(/[.]/g, "\\.");
// Matches https://host, http://host, and protocol-relative //host (± www.).
const originRe = new RegExp(`(?:https?:)?//(?:www\\.)?${hostEsc}`, "g");

/** Rewrite every WP-origin URL in a string to a root-relative path. */
export function toLocal(input) {
  if (typeof input !== "string") return input;
  return input.replace(originRe, "");
}
