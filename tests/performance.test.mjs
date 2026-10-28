import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { load } from 'cheerio';
const home = async () => load(await readFile('dist/index.html', 'utf8'));
test('marketing popup is absent while existing forms and local validation remain', async () => {
  const $ = await home();
  assert.equal($('#mcjs').length, 0);
  assert.doesNotMatch($.html(), /chimpstatic\.com|mcjs-connected/);
  assert.ok($('script[src^="/vendor/mailchimp/mc-validate-"]').length);
  assert.ok($('form[action*="list-manage.com"]').length);
});
test('rendered CSS is bundled locally by Astro and cached theme scripts are versioned', async () => {
  const $ = await home();
  assert.ok($('style[data-rhea-critical]').length);
  assert.ok($('link[rel="preload"][as="style"][href^="/_astro/"]').length);
  assert.match($.html(), /<noscript><link[^>]+rel="stylesheet"/);
  assert.equal($('link[rel="stylesheet"]').filter((_,el)=>!$(el).attr('href').startsWith('/_astro/')).length,0);
  assert.ok($('script[src*="asset="]').length > 10);
});
test('hero stays eager and deferred backgrounds have fallback styles', async () => {
  const $ = await home();
  assert.equal($('.image-bg[data-perf-background]').length, 0);
  assert.equal($('#rhea-home-hero img').attr('loading'), 'eager');
  assert.ok($('[data-perf-background]').length);
  assert.match(await readFile('dist/index.html','utf8'), /<noscript><style>\[data-perf-bg=/);
  assert.equal($('.nectar-cta a.link_text').filter((_, el) => !$(el).text().trim() && !$(el).attr('aria-label')).length,0);
});
test('local image tags reserve dimensions throughout rendered pages', async () => {
  const walk = async dir => (await Promise.all((await readdir(dir,{withFileTypes:true})).map(e => e.isDirectory() ? walk(`${dir}/${e.name}`) : e.name.endsWith('.html') ? [`${dir}/${e.name}`] : []))).flat();
  for (const path of await walk('dist')) {
    const $ = load(await readFile(path,'utf8'));
    $('link[rel="stylesheet"]').each((_,el) => assert.ok($(el).attr('href')?.startsWith('/_astro/'), `${path}: external or unbundled stylesheet`));
    $('img[src^="/wp-content/"],img[src^="/fonts/"]').each((_,el) => {
      assert.ok($(el).attr('width') && $(el).attr('height'), `${path}: ${$(el).attr('src')}`);
    });
  }
});

test('bundled CSS has no external imports, fonts, images or missing local assets', async () => {
  const { access } = await import('node:fs/promises');
  for (const file of (await readdir('dist/_astro')).filter(x=>x.endsWith('.css'))) {
    const css=await readFile(`dist/_astro/${file}`,'utf8');
    assert.doesNotMatch(css, /@import\s/);
    for (const m of css.matchAll(/url\(([^)]+)\)/g)) {
      const src=m[1].trim().replace(/^['"]|['"]$/g,'');
      if (src.startsWith('data:') || src.startsWith('#')) continue;
      assert.ok(src.startsWith('/') && !src.startsWith('//'), `${file}: ${src}`);
      await access('dist'+decodeURIComponent(src.split(/[?#]/)[0]));
    }
  }
});

test('homepage paint CSS is substantially smaller and full styles remain available', async () => {
  const reports=JSON.parse(await readFile('dist/_astro/critical-css-report.json','utf8'));
  const $=await home();
  assert.ok(reports.length);
  for (const r of reports) {
    assert.ok(r.criticalGzipBytes < r.fullGzipBytes * .6);
    assert.ok(r.criticalGzipBytes < 60000);
    const css=await readFile(`dist${r.href}`,'utf8');
    assert.equal(Buffer.byteLength(css),r.fullBytes);
    assert.ok($('style[data-rhea-critical]').text().includes('#rhea-home-hero'));
  }
});
test('the disconnected Instagram section and draft gallery are removed', async () => {
  const $=await home();
  assert.equal($('#sb_instagram,.social-gallery').length,0);
  assert.doesNotMatch($('.wp-content').text(),/Follow on Instagram/);
  assert.ok($('#freeGuide form').length);
});
test('desktop and mobile social icons use the configured profile URLs', async () => {
  const social=JSON.parse(await readFile('src/content/settings/social.json','utf8'));
  const $=await home();
  for (const list of ['#social','.off-canvas-social-links']) {
    assert.equal($(list).find('a[href=""],a[href="#"]').length,0);
    for (const key of ['twitter','facebook','youtube','instagram','linkedin','rss']) {
      assert.ok($(list).find('a').toArray().some(el=>$(el).attr('href')===social[key]),`${list}: ${key}`);
    }
    assert.equal($(list).find('.fa-vine').length,0);
  }
});
