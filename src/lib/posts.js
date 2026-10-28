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
