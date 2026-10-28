// XML sitemap generated at build time from the local pages + posts. Plain XML (no
// @astrojs/sitemap dependency). Referenced by public/robots.txt.
import { getAllPages, getAllPosts } from "../lib/content.js";

const EXCLUDE = ["home", "livingrhea-com", "sample-page", "blog"]; // dup/handled elsewhere

export async function GET(context) {
  const site = context.site?.href || "https://livingrhea.com/";
  const [pages, posts] = await Promise.all([getAllPages(), getAllPosts()]);

  const urls = new Set([site]); // home
  for (const p of pages)
    if (!EXCLUDE.includes(p.slug)) urls.add(new URL(`${p.slug}/`, site).href);
  urls.add(new URL("blog/", site).href);
  for (const p of posts) urls.add(new URL(`blog/${p.slug}/`, site).href);

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    [...urls].map((u) => `<url><loc>${u}</loc></url>`).join("") +
    `</urlset>`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
