import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { load } from 'cheerio';
const home = async () => load(await readFile('dist/index.html', 'utf8'));
test('marketing popup and validation still load automatically', async () => {
  const $ = await home();
  assert.equal($('#mcjs').length, 1);
  assert.match($('#mcjs').html(), /chimpstatic/);
  assert.ok($('script[src*="mc-validate"]').length);
  assert.ok($('form[action*="list-manage.com"]').length);
  assert.ok($('.nectar-slider-wrap').length);
});
test('noncritical styles have a no-JavaScript fallback and theme assets are versioned', async () => {
  const $ = await home();
  assert.ok($('link[rel="preload"][as="style"]').length >= 5);
  assert.match(await readFile('dist/index.html','utf8'), /<noscript><link[^>]+rel="stylesheet"/);
  assert.ok($('link[href*="asset="]').length > 10);
  assert.equal($('#wp-block-editor-css,#dashicons-css,#contact-form-7-css,#wpforms-modern-base-css').length,0);
});
test('hero stays eager and deferred backgrounds have fallback styles', async () => {
  const $ = await home();
  assert.equal($('.image-bg[data-perf-background]').length, 0);
  assert.ok($('.image-bg[style*="background-image"]').length);
  assert.ok($('[data-perf-background]').length);
  assert.match(await readFile('dist/index.html','utf8'), /<noscript><style>\[data-perf-bg=/);
  assert.equal($('.nectar-cta a.link_text').filter((_, el) => !$(el).text().trim() && !$(el).attr('aria-label')).length,0);
});
test('local image tags reserve dimensions throughout rendered pages', async () => {
  const walk = async dir => (await Promise.all((await readdir(dir,{withFileTypes:true})).map(e => e.isDirectory() ? walk(`${dir}/${e.name}`) : e.name.endsWith('.html') ? [`${dir}/${e.name}`] : []))).flat();
  for (const path of await walk('dist')) {
    const $ = load(await readFile(path,'utf8'));
    $('img[src^="/wp-content/"],img[src^="/fonts/"]').each((_,el) => {
      assert.ok($(el).attr('width') && $(el).attr('height'), `${path}: ${$(el).attr('src')}`);
    });
  }
});
