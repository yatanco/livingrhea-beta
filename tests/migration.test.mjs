import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, access } from "node:fs/promises";
import { load } from "cheerio";
import { parse } from "yaml";
const frontmatter = s => parse(s.match(/^---\n([\s\S]*?)\n---/)[1]);
const json = async (p) => JSON.parse(await readFile(p, "utf8"));
// Slugs deliberately renamed after migration (old slug -> current slug).
const renamed = { "test-post-for-press-page": "gsd-community-party-kenya" };
const current = (slug) => renamed[slug] || slug;
test("every exported published post has a page and an intact title", async () => {
  const original = await json("migration/wordpress-posts.json");
  const active = original.filter((post) => post.slug !== "choice");
  assert.equal((await readdir("src/content/posts")).filter((name) => name.endsWith(".md")).length, active.length);
  for (const post of active) {
    const migrated = frontmatter(await readFile(`src/content/posts/${current(post.slug)}.md`, "utf8"));
    assert.equal(
      migrated.title,
      load(post.title.rendered).text().replace(/\s+/g, " ").trim(),
    );
    const $ = load(await readFile(`dist/blog/${current(post.slug)}/index.html`, "utf8"));
    assert.equal($("h1").first().text(), migrated.title);
    assert.ok($(".wp-content").text().trim().length > 0);
  }
});
test("all intended pages are migrated and sample content is excluded", async () => {
  const original = await json("migration/wordpress-pages.json");
  for (const page of original.filter(
    (x) => !["sample-page", "blog"].includes(x.slug),
  )) {
    await access(`src/content/pages/${page.slug === "livingrhea-com" ? "home" : page.slug}.md`);
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
  const content = await readFile("src/lib/posts.js", "utf8");
  assert.doesNotMatch(content, /\bfetch\s*\(/);
  const $ = load(await readFile("dist/index.html", "utf8"));
  assert.equal(
    $(
      'script[src^="https://livingrhea.com"],link[href^="https://livingrhea.com/wp-"],img[src^="https://livingrhea.com"]',
    ).length,
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
  const form = $(".astro-contact-form");
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
    const target = post.slug === "choice" ? "/blog/" : `/blog/${current(post.slug)}/`;
    if (old !== target)
      assert.ok(redirects.includes(`${old} ${target} 301`), old);
    if (current(post.slug) !== post.slug)
      assert.ok(redirects.includes(`/blog/${post.slug}/ ${target} 301`), post.slug);
  }
});

test("article metadata describes the article rather than its saved About-page layout", async () => {
  const original = (await json("migration/wordpress-posts.json"))[0];
  const canonical = `https://livingrhea.com/blog/${original.slug}/`;
  const $ = load(
    await readFile(`dist/blog/${original.slug}/index.html`, "utf8"),
  );
  assert.equal($('meta[property="og:url"]').length, 1);
  assert.equal($('meta[property="og:url"]').attr("content"), canonical);
  const blocks = $('script[type="application/ld+json"]');
  assert.equal(blocks.length, 1);
  const graph = JSON.parse(blocks.text())["@graph"];
  const article = graph.find((x) => x["@type"] === "BlogPosting");
  assert.equal(article.url, canonical);
  assert.equal(article.datePublished, `${original.date_gmt}Z`);
});

test("native Astro hero has responsive AVIF/WebP sources and keeps its social image", async () => {
  const $ = load(await readFile('dist/index.html', 'utf8'));
  const hero = $('#rhea-home-hero');
  assert.equal(hero.length,1);
  assert.equal(hero.find('img').attr('loading'),'eager');
  assert.equal(hero.find('img').attr('fetchpriority'),'high');
  assert.ok(hero.find('img').attr('width') && hero.find('img').attr('height'));
  for (const format of ['image/avif','image/webp']) {
    const candidates=hero.find(`source[type="${format}"]`).attr('srcset');
    assert.ok(candidates.split(',').length >= 3);
    for (const c of candidates.split(',')) await access(`dist${c.trim().split(/\s+/)[0]}`);
  }
  assert.equal(hero.find('a').attr('href'),'#freeGuide');
  assert.equal($('meta[property="og:image"]').attr('content'),'https://livingrhea.com/wp-content/uploads/2025/08/Rhea-Lotus-Cropped-Smoothie2.webp');
  assert.equal($('script[src*="nectar-slider"]').length,0);
});

test("responsive blog images have generated candidates and do not enlarge their default files", async () => {
  const { stat } = await import("node:fs/promises");
  const files = await readdir("migration/legacy-posts");
  const posts = new Map();
  for (const f of files) {
    const p = await json(`migration/legacy-posts/${f}`);
    posts.set(String(p.id), p);
  }
  const $ = load(await readFile("dist/blog/index.html", "utf8"));
  const cards = $(".masonry-blog-item").toArray();
  let optimized = 0;
  for (const card of cards) {
    const img = $(card).find("img");
    const src = img.attr("src");
    if (!src?.startsWith("/_astro/")) continue;
    optimized++;
    assert.ok(img.attr("width") && img.attr("height") && img.attr("sizes"));
    for (const candidate of img.attr("srcset").split(","))
      await access(`dist${candidate.trim().split(/\s+/)[0]}`);
    const id = $(card)
      .attr("class")
      .match(/post-(\d+)/)[1];
    let old = new URL(posts.get(id)._embedded["wp:featuredmedia"][0].source_url)
      .pathname;
    const webp = old.replace(/\.(jpe?g|png)$/i, ".webp");
    if (
      await access(`public${webp}`)
        .then(() => true)
        .catch(() => false)
    )
      old = webp;
    assert.ok(
      (await stat(`dist${src}`)).size <= (await stat(`public${old}`)).size,
      `Larger image for post ${id}`,
    );
  }
  assert.ok(optimized > 0);
});

test("original category and frequent tag archives are served, linked and listed", async () => {
  const terms = new Map();
  for (const post of await json("migration/wordpress-posts.json"))
    for (const term of (post._embedded?.["wp:term"] || []).flat())
      if (term.taxonomy === "category") terms.set(term.slug, new URL(term.link).pathname);
  const sitemap = await readFile("dist/sitemap.xml", "utf8");
  const redirects = await readFile("public/_redirects", "utf8");
  assert.ok(terms.size > 0);
  for (const [slug, path] of terms) {
    assert.equal(path, `/category/${slug}/`);
    const $ = load(await readFile(`dist${path}index.html`, "utf8"));
    assert.ok($(".masonry-blog-item").length > 0, slug);
    assert.ok(sitemap.includes(`https://livingrhea.com${path}`), slug);
  }
  assert.doesNotMatch(redirects, /^\/category\/\* /m);
  // Tags used on several posts keep their archive; rarer tags were thin pages.
  // Duplicate spellings were merged into one tag and redirected.
  const mergedTags = {
    healthhacks: "health-hacks",
    selfcare: "self-care",
    detoxification: "detox",
    "green-smoothie-2": "green-smoothies",
  };
  const tagPosts = new Map();
  for (const post of await json("migration/wordpress-posts.json"))
    if (post.slug !== "choice")
      for (const slug of new Set(
        (post._embedded?.["wp:term"] || [])
          .flat()
          .filter((term) => term.taxonomy === "post_tag")
          .map((term) => mergedTags[term.slug] || term.slug),
      ))
        tagPosts.set(slug, (tagPosts.get(slug) || 0) + 1);
  for (const [from, to] of Object.entries(mergedTags)) {
    assert.ok(redirects.includes(`/tag/${from}/ /tag/${to}/ 301`), from);
    assert.equal(tagPosts.has(from), false);
  }
  const archived = [...tagPosts].filter(([, count]) => count >= 3);
  assert.ok(archived.length > 0);
  for (const [slug, count] of archived) {
    const $tag = load(await readFile(`dist/tag/${slug}/index.html`, "utf8"));
    assert.equal($tag(".masonry-blog-item").length, count, slug);
    assert.ok(sitemap.includes(`https://livingrhea.com/tag/${slug}/`), slug);
  }
  const $ = load(await readFile("dist/blog/faux-fudgey-truffles/index.html", "utf8"));
  assert.equal($("a.article-category").attr("href"), "/category/recipes/");
  // Posts link their archived tags; the blog links every category.
  const tagLinks = $(".article-tags a").map((_, a) => $(a).attr("href")).get();
  assert.ok(tagLinks.length > 0);
  for (const href of tagLinks) assert.ok(sitemap.includes(`https://livingrhea.com${href}`), href);
  const $blog = load(await readFile("dist/blog/index.html", "utf8"));
  for (const path of terms.values()) assert.equal($blog(`.category-nav a[href="${path}"]`).length, 1, path);
  assert.match(sitemap, /<loc>https:\/\/livingrhea\.com\/blog\/faux-fudgey-truffles\/<\/loc><lastmod>\d{4}-\d\d-\d\d<\/lastmod>/);
  // Search snippets end on a whole word, without the recipe card's "Description" label.
  const snippetText = $('meta[name="description"]').attr("content");
  assert.ok(snippetText.length <= 160 && snippetText.endsWith("…"));
  assert.doesNotMatch(snippetText, /^Description /);
  // Cloudflare Pages applies the first match, so wildcards must come last.
  const rules = redirects.split("\n").filter((line) => line && !line.startsWith("#"));
  const firstWildcard = rules.findIndex((line) => line.split(" ")[0].includes("*"));
  assert.ok(rules.slice(firstWildcard).every((line) => line.split(" ")[0].includes("*")));
});
