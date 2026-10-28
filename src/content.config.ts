import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string().default("Rhea Mehta"),
      categories: z
        .array(
          z.object({
            id: z.number().optional(),
            name: z.string(),
            slug: z.string(),
          }),
        )
        .default([]),
      featuredImage: image().optional(),
      legacyFeaturedImage: z.string().optional(),
      draft: z.boolean().default(false),
      featuredImageAlt: z.string().default(""),
      legacyId: z.number().int().optional(),
      legacyUrl: z.string().url().optional(),
    }),
});
const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      description: z.string(),
      path: z.string().startsWith("/"),
      labels: z.record(z.string(), z.string()),
      hero: z
        .object({
          image: image(),
          socialImage: z.string().optional(),
          heading: z.array(z.string()),
          actionLabel: z.string(),
          actionHref: z.string(),
        })
        .optional(),
    }),
});
export const collections = { posts, pages };
