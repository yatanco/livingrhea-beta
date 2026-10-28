// RSS feed for the blog, generated at build time from the local posts.
// Plain XML (no @astrojs/rss dependency) so the build stays lean. Output path
// is /blog/rss.xml — matches the <link rel="alternate"> in Base.astro.
import { getAllPosts } from "../../lib/content.js";

const esc = (s = "") =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const stripTags = (s = "") => s.replace(/<[^>]+>/g, "").trim();

export async function GET(context) {
  const site = context.site?.href || "https://livingrhea.com/";
  const posts = await getAllPosts();

  const items = posts
    .map((p) => {
      const link = new URL(`blog/${p.slug}/`, site).href;
      const title = esc(stripTags(p.title?.rendered || ""));
      const date = p.date ? new Date(p.date).toUTCString() : "";
      const desc = esc(stripTags(p.excerpt?.rendered || ""));
      return (
        `<item><title>${title}</title><link>${link}</link>` +
        `<guid isPermaLink="true">${link}</guid>` +
        (date ? `<pubDate>${date}</pubDate>` : "") +
        `<description>${desc}</description></item>`
      );
    })
    .join("");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0"><channel>` +
    `<title>Rhea Mehta — Blog</title>` +
    `<link>${site}</link>` +
    `<description>Living Rhea: science-backed, soul-aligned health.</description>` +
    items +
    `</channel></rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
