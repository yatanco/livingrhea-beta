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

  const urls = new Set([site]); // home
  for (const p of pages) urls.add(new URL(p.data.path, site).href);
  urls.add(new URL("blog/", site).href);
  for (const p of posts) urls.add(new URL(`blog/${p.slug}/`, site).href);
  for (const term of termsWithPosts(posts))
    urls.add(new URL(`category/${term.slug}/`, site).href);
  for (const term of archivedTags(posts))
    urls.add(new URL(`tag/${term.slug}/`, site).href);

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    [...urls].map((u) => `<url><loc>${u}</loc></url>`).join("") +
    `</urlset>`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
