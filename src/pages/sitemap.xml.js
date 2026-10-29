// XML sitemap generated at build time from the local pages + posts. Plain XML (no
// @astrojs/sitemap dependency). Referenced by public/robots.txt.
import { getCollection } from "astro:content";
import { getAllPosts, termsWithPosts, archivedTags } from "../lib/posts.js";

const EXCLUDE = ["home", "livingrhea-com", "sample-page", "blog"]; // dup/handled elsewhere

export async function GET(context) {
  const site = context.site?.href || "https://livingrhea.com/";
  const [pages, posts] = await Promise.all([
    getCollection("pages"),
    getAllPosts(),
  ]);

  // url -> last modified date (posts and their archives), or null.
  const urls = new Map([[site, null]]); // home
  const day = (date) => date.toISOString().slice(0, 10);
  const latest = (list) =>
    day(new Date(Math.max(...list.map((p) => (p.updatedDate || p.pubDate).getTime()))));
  for (const p of pages) urls.set(new URL(p.data.path, site).href, null);
  urls.set(new URL("blog/", site).href, latest(posts));
  for (const p of posts)
    urls.set(new URL(`blog/${p.slug}/`, site).href, day(p.updatedDate || p.pubDate));
  for (const term of termsWithPosts(posts))
    urls.set(new URL(`category/${term.slug}/`, site).href, latest(term.posts));
  for (const term of archivedTags(posts))
    urls.set(new URL(`tag/${term.slug}/`, site).href, latest(term.posts));

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    [...urls]
      .map(([u, mod]) => `<url><loc>${u}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ""}</url>`)
      .join("") +
    `</urlset>`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
