import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, access } from "node:fs/promises";
import { load } from "cheerio";
const json = async (p) => JSON.parse(await readFile(p, "utf8"));
test("every exported published post has a page and an intact title", async () => {
  const original = await json("migration/wordpress-posts.json");
  assert.equal((await readdir("src/content/posts")).length, original.length);
  for (const post of original) {
    const migrated = await json(`src/content/posts/${post.slug}.json`);
    assert.equal(migrated.title, load(post.title.rendered).text());
    const $ = load(await readFile(`dist/blog/${post.slug}/index.html`, "utf8"));
    assert.equal($("h1").text(), migrated.title);
    assert.ok($(".prose").text().trim().length > 0);
  }
});
test("all intended pages are migrated and sample content is excluded", async () => {
  const original = await json("migration/wordpress-pages.json");
  for (const page of original.filter(
    (x) => !["sample-page", "blog"].includes(x.slug),
  )) {
    await access(`src/content/pages/${page.slug}.json`);
    await access(
      page.slug === "livingrhea-com"
        ? "dist/index.html"
        : `dist/${page.slug}/index.html`,
    );
  }
});
test("normal builds and templates have no WordPress fetch dependency", async () => {
  const pkg = await json("package.json");
  assert.equal(pkg.scripts.prebuild, undefined);
  assert.equal(pkg.scripts.postbuild, undefined);
  const content = await readFile("src/lib/content.js", "utf8");
  assert.doesNotMatch(content, /\bfetch\s*\(/);
  const $ = load(await readFile("dist/index.html", "utf8"));
  assert.equal(
    $('script[src*="wp-"],link[href*="wp-"],img[src*="wp-"]').length,
    0,
  );
  assert.equal(
    $('link[rel="canonical"]').attr("href"),
    "https://livingrhea.com/",
  );
});
test("contact form cannot submit to an unconfigured placeholder", async () => {
  const settings = await json("src/content/settings/site.json");
  const $ = load(await readFile("dist/contact/index.html", "utf8"));
  const form = $(".contact-form");
  if (settings.contactFormAction) {
    assert.equal(form.attr("action"), settings.contactFormAction);
    assert.doesNotMatch(settings.contactFormAction, /YOUR_|PLACEHOLDER/);
    assert.equal(new URL(settings.contactFormAction).protocol, "https:");
  } else assert.equal(form.length, 0);
});
test("all original post permalinks that changed have exact redirects", async () => {
  const redirects = await readFile("public/_redirects", "utf8");
  for (const post of await json("migration/wordpress-posts.json")) {
    const old = new URL(post.link).pathname;
    const target = `/blog/${post.slug}/`;
    if (old !== target)
      assert.ok(redirects.includes(`${old} ${target} 301`), old);
  }
});
