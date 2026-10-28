// Build-time metadata helpers. No external services or runtime requests.
export function plainText(value = "") {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|nbsp|lt|gt);/gi, (_, entity) => {
      if (entity[0] === "#")
        return String.fromCodePoint(
          entity[1].toLowerCase() === "x"
            ? parseInt(entity.slice(2), 16)
            : parseInt(entity.slice(1), 10),
        );
      return (
        { amp: "&", quot: '"', apos: "'", nbsp: " ", lt: "<", gt: ">" }[
          entity.toLowerCase()
        ] || _
      );
    })
    .replace(/\s+/g, " ")
    .trim();
}
export const pageDescriptions = {
  "/": "Dr. Rhea Mehta blends nutrition science, holistic health coaching, breathwork, and ancestral wisdom.",
  "/about/":
    "Meet Dr. Rhea Mehta: scientist, holistic health coach, mantra artist, and wellness innovator.",
  "/coaching/":
    "Explore personalized holistic health coaching with Dr. Rhea Mehta, including the Clean Sweep coaching program.",
  "/himalayan-breathwork/":
    "Explore Himalayan breathwork and Kriya Yoga with Dr. Rhea Mehta.",
  "/music/": "Discover Soul Ceremony and the mantra music of Dr. Rhea Mehta.",
  "/press/":
    "Interviews, articles, and media appearances featuring Dr. Rhea Mehta.",
  "/blog/":
    "Recipes, reflections, and articles on nutrition and wellbeing from Dr. Rhea Mehta.",
  "/contact/":
    "Get in touch with Dr. Rhea Mehta about coaching, breathwork, speaking, and collaborations.",
  "/smoothie-movement/":
    "Discover Global Smoothie Day, the healthy-living movement founded by Dr. Rhea Mehta.",
};
