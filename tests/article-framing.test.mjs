import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { load } from 'cheerio';

test('all articles retain one hero title and working discovery framing', async () => {
  for (const slug of await readdir('src/content/posts')) {
    const $ = load(await readFile(`dist/blog/${slug}/index.html`, 'utf8'));
    assert.equal($('.article-hero h1').length, 1, slug);
    assert.equal($('.article-breadcrumbs a[href="/blog/"]').length, 1, slug);
    assert.equal($('.article-related-card').length, 3, slug);
    assert.ok($('.article-adjacent a').length >= 1, slug);
    const links = $('.article-related-card').map((_, e) => $(e).attr('href')).get();
    assert.equal(new Set(links).size, 3, slug);
    assert.ok(!links.includes(`/blog/${slug}/`), slug);
    assert.ok($('.article-copy').text().trim().length > 0, slug);
    assert.equal($('.article-hero').parents('.container-wrap').length, 0, slug);
  }
});
