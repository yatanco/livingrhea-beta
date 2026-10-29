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
    .map((entry) => ({
      slug: entry.id,
      ...entry.data,
      entry,
    }));
}

// First validated category from the article frontmatter. Each category has
// an archive at its original WordPress URL, /category/<slug>/.
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

// Every category (or tag) used by at least one post, in first-seen order,
// with the posts filed under it, as WordPress archives listed them.
export function termsWithPosts(posts, field = "categories") {
  const terms = new Map();
  for (const post of posts)
    for (const { name, slug } of post[field]) {
      if (!terms.has(slug)) terms.set(slug, { name, slug, posts: [] });
      terms.get(slug).posts.push(post);
    }
  return [...terms.values()];
}

// Tags get an archive page only once they group several posts; one- and
// two-post tag pages were thin duplicates of the posts themselves.
export const MIN_TAG_POSTS = 3;
export function archivedTags(posts) {
  return termsWithPosts(posts, "tags").filter(
    (term) => term.posts.length >= MIN_TAG_POSTS,
  );
}
