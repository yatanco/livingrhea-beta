import type { ImageMetadata } from "astro";

// Only images used by native Astro templates are imported here. Public copies
// remain available for existing article markup and historical image URLs.
const images = import.meta.glob<ImageMetadata>(
  "../assets/migrated/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG}",
  { eager: true, import: "default" },
);

export function localImage(path: string): ImageMetadata | undefined {
  return images[`../assets/migrated${path.split("?")[0]}`];
}
