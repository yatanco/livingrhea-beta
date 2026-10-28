// Historical export URL helper, used only by one-time migration utilities and tests.
// Normal content rendering uses local Astro Content Collections.

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
