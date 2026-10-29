import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { load } from 'cheerio';
import { parse } from 'yaml';
import { toLocal } from '../src/lib/wp-url.js';
const json = async path => JSON.parse(await readFile(path,'utf8'));
function words(html) {
  const $=load(html || '',null,false);
  $('style,script,noscript,svg,canvas').remove();
  $('br').replaceWith(' ');
  $('p,div,h1,h2,h3,h4,h5,h6,li,blockquote,section,figcaption').append(' ');
  return ($.root().text().normalize('NFKC').match(/[\p{L}\p{N}]+/gu)||[]).join(' ');
}
test('all main-page copy, destination links and forms survive the native conversion',async()=>{
  const baseline=await json('migration/native-pages-baseline.json');
  for(const [slug,old]of Object.entries(baseline)){
    const $=load(await readFile(slug==='home'?'dist/index.html':`dist/${slug}/index.html`,'utf8'));
    assert.equal(words($('.wp-content').first().html()),words(old.html),slug);
    const links=$('.wp-content a[href]').map((_,e)=>$(e).attr('href')).get();
    assert.deepEqual([...links].sort(),[...old.links].sort(),`${slug}: destinations`);
    assert.deepEqual($('.wp-content form').map((_,e)=>$(e).attr('action')).get(),old.forms,`${slug}: forms`);
    assert.equal($('.wp-content br').length,load(old.html)('br').length,`${slug}: line breaks`);
  }
});
test('all blog words, images and video embeds survive Markdown conversion',async()=>{
  for(const file of await readdir('migration/legacy-posts')){
    const old=await json('migration/legacy-posts/'+file);
    // choice was removed; the Kenya post's template copy was rewritten from confirmed facts.
    if (old.slug === 'choice' || old.slug === 'test-post-for-press-page') continue;
    const $=load(await readFile(`dist/blog/${old.slug}/index.html`,'utf8'));
    const before=load(old.content.rendered,null,false);
    const after=load($('.article-copy').html(),null,false);
    const current=words(after.html()), previous=words(before.html());
    if(current!==previous){const a=previous.split(' '),b=current.split(' ');let i=0;while(a[i]===b[i]&&i<a.length)i++;assert.fail(`${old.slug}: text differs at word ${i}: ${a.slice(i-3,i+12).join(' ')} / ${b.slice(i-3,i+12).join(' ')}`);}
    // Inline copies of the article's own hero image were removed as duplicates.
    const heroDuplicates=old.slug==='gsd-community-party-croatia'?1:0;
    assert.equal(after('img').length,before('img[src]').length-heroDuplicates,`${old.slug}: images`);
    assert.deepEqual(after('iframe').map((_,e)=>after(e).attr('src')).get(),before('iframe').map((_,e)=>toLocal(before(e).attr('src'))).get(),`${old.slug}: embeds`);
  }
});
test('all authoritative content records are Markdown, with no builder HTML',async()=>{
  let count=0;
  for(const name of await readdir('src/content/pages')){
    assert.ok(name.endsWith('.md'),name);count++;
    const source=await readFile(`src/content/pages/${name}`,'utf8');
    assert.ok(parse(source.match(/^---\n([\s\S]*?)\n---/)[1]).title);
    assert.doesNotMatch(source, /wpb_row|vc_column|wpb_wrapper|content\.rendered/);
  }
  for(const name of await readdir('src/content/posts')){
    if (!name.endsWith('.md')) continue;
    const source=await readFile(`src/content/posts/${name}`,'utf8');
    assert.ok(parse(source.match(/^---\n([\s\S]*?)\n---/)[1]).title);
    assert.doesNotMatch(source, /wpb_row|vc_column|wpb_wrapper|content\.rendered/);
    count++;
  }
  assert.equal(count,84);
  const base=await readFile('src/layouts/Base.astro','utf8');
  assert.match(base,/SiteChrome/);assert.doesNotMatch(base,/headHtml|preContent|postContent|getSalientShell/);
});
