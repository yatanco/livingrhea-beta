import { load } from "cheerio";
// Markdown H1 markers delimit editable sections; they are not public headings.
export function pageSections(rendered) {
  const $ = load(rendered, null, false);
  const sections = {};
  let key;
  $.root()
    .contents()
    .each((_, node) => {
      if (
        node.type === "tag" &&
        node.name === "h1" &&
        $(node).text().startsWith("section-")
      ) {
        key = $(node).text().slice("section-".length).trim();
        if (key in sections)
          throw new Error(`Duplicate Markdown section: ${key}`);
        sections[key] = "";
      } else if (key) sections[key] += $.html(node);
    });
  return sections;
}
