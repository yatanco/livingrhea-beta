import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
const pageFiles = import.meta.glob("../content/pages/*.json", {
  eager: true,
  import: "default",
});
const postFiles = import.meta.glob("../content/posts/*.json", {
  eager: true,
  import: "default",
});
export const getAllPages = async () => Object.values(pageFiles);
export const getAllPosts = async () =>
  Object.values(postFiles).sort((a, b) => b.date.localeCompare(a.date));
export const getPageBySlug = async (slug) =>
  Object.values(pageFiles).find((p) => p.slug === slug);
export const render = (body) =>
  sanitizeHtml(marked.parse(body || ""), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    transformTags: {
      h1: "h2",
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: "lazy", decoding: "async" },
      }),
    },
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height", "loading"],
    },
  });
export const plain = (s) =>
  sanitizeHtml(s || "", { allowedTags: [], allowedAttributes: {} });
