import { getCollection } from "astro:content";
// Query validated, local Markdown. No WordPress-shaped content adapter.
export async function getAllPosts() {
  return (
    await getCollection(
      "posts",
      ({ data }) => import.meta.env.DEV || !data.draft,
    )
  )
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
    .map((entry) => ({ slug: entry.id, ...entry.data, entry }));
}

// First validated category from the article frontmatter. There's no
// category archive route on this site (no WordPress-style taxonomy
// pages), so this is used for display only, never as a link destination.
export function category(post) {
  const term = post.categories[0];
  return term
    ? { name: term.name, slug: term.slug }
    : { name: "Blog", slug: "blog" };
}

// Rough estimate (200 words/minute), same convention WordPress reading-time
// plugins use. Derived from the actual article body, not a stored value.
export function readingTime(markdownBody = "") {
  const words = markdownBody
    .replace(/```[\s\S]*?```/g, " ") // code fences
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links: keep the text
    .replace(/[#*_>`~-]/g, " ") // markdown punctuation
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
