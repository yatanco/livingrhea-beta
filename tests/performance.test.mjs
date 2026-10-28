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
  assert.ok($('link[rel="stylesheet"][href^="/_astro/"]').length);
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
