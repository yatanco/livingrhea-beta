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
      /** Short status note shown above the post, e.g. for a retired program. */
      notice: z.string().optional(),
      categories: z
        .array(
          z.object({
            id: z.number().optional(),
            name: z.string(),
            slug: z.string(),
          }),
        )
        .default([]),
      tags: z
        .array(z.object({ name: z.string(), slug: z.string() }))
        .default([]),
      recipe: z
        .object({
          category: z.string().optional(),
          yield: z.string().optional(),
          ingredients: z.array(z.string().min(1)).min(1),
          instructions: z.array(z.string().min(1)).min(1),
        })
        .optional(),
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
const gallery = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/gallery" }),
  schema: ({ image }) =>
    z.object({
      photo: image(),
      alt: z.string().default(""),
      caption: z.string().optional(),
      instagramUrl: z.string().url().optional(),
      date: z.coerce.date().default(() => new Date()),
    }),
});
export const collections = { posts, pages, gallery };
