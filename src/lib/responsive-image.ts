import { getImage } from "astro:assets";
import { localImage } from "./local-images.ts";

// Shared by the hand-written page components (About/Coaching/Himalayan
// Breathwork/Home/Music/Press/Smoothie Movement) that reproduce the original
// WordPress markup verbatim. Their <img> src/srcset and CSS background-image
// values used to point straight at /wp-content/uploads/...; these helpers
// swap those for Astro's actual optimized output (format conversion, real
// responsive sizes) while leaving every other attribute on the tag
// untouched, so Salient/Flickity's JS still sees the markup it expects.

/** A single optimized src, for a plain <img src> or a CSS background-image
 * with no responsive variants (matches what the original markup had). */
export async function optimizedSrc(path: string, width?: number) {
  const source = localImage(path);
  if (!source) throw new Error(`No imported source image for ${path}`);
  const image = await getImage({
    src: source,
    width: width ?? source.width,
    format: "webp",
    quality: 82,
  });
  return image.src;
}

/** An optimized src + matching srcset across the given widths, for an <img>
 * that already had a WordPress-generated srcset of its own sizes. The
 * largest width becomes the default src, same as the original markup's
 * unsized default image. */
export async function responsiveImage(path: string, widths: number[]) {
  const source = localImage(path);
  if (!source) throw new Error(`No imported source image for ${path}`);
  const sorted = [...new Set(widths)]
    .sort((a, b) => a - b)
    .filter((w) => w <= source.width);
  if (!sorted.includes(source.width)) sorted.push(source.width);
  const variants = await Promise.all(
    sorted.map((width) =>
      getImage({ src: source, width, format: "webp", quality: 82 }),
    ),
  );
  return {
    src: variants.at(-1)!.src,
    srcset: variants.map((v) => `${v.src} ${v.attributes.width}w`).join(", "),
  };
}
