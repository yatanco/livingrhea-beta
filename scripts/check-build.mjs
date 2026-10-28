import { readdir, readFile, access } from "node:fs/promises";
import { join } from "node:path";
import { load } from "cheerio";
const exists = async (p) =>
  access(p)
    .then(() => true)
    .catch(() => false);
async function walk(p) {
  const files = [];
  for (const f of await readdir(p, { withFileTypes: true })) {
    const x = join(p, f.name);
    files.push(...(f.isDirectory() ? await walk(x) : [x]));
  }
  return files;
}
const htmlFiles = (await walk("dist")).filter(
  (x) => x.endsWith(".html") && !x.includes("/admin/"),
);
const missing = new Map();
const brokenAnchors = [];
for (const path of htmlFiles) {
  const html = await readFile(path, "utf8");
  const $ = load(html);
  for (const el of $("[href],[src]").toArray()) {
    const ref = $(el).attr("href") || $(el).attr("src");
    if (!ref?.startsWith("/") || ref.startsWith("//")) continue;
    const u = new URL(ref, "https://livingrhea.com");
    const target = decodeURIComponent(u.pathname);
    const disk = join("dist", target);
    if (!(await exists(disk)) && !(await exists(join(disk, "index.html"))))
      missing.set(ref, (missing.get(ref) || []).concat(path));
  }
  for (const el of $('a[href^="#"]').toArray()) {
    const id = $(el).attr("href").slice(1);
    if (
      id &&
      !$("[id]")
        .toArray()
        .some((n) => $(n).attr("id") === id)
    )
      brokenAnchors.push({ path, id });
  }
  if (
    /(?:src|href)=["']https?:\/\/(?:www\.)?livingrhea\.com\/wp-(?:content|includes)/i.test(
      html,
    )
  )
    throw new Error(`WordPress asset dependency in ${path}`);
  if (!$('link[rel="canonical"]').length)
    throw new Error(`Missing canonical: ${path}`);
}
console.log(
  JSON.stringify(
    { pages: htmlFiles.length, missing: [...missing], brokenAnchors },
    null,
    2,
  ),
);
if (missing.size || brokenAnchors.length) process.exitCode = 1;
