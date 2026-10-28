// One-time migration utility. Refuses to overwrite an edited Markdown file.
import { readFile, writeFile, readdir, mkdir, copyFile, access, rename } from 'node:fs/promises';
import { dirname, join, extname } from 'node:path';
import { load } from 'cheerio';
import TurndownService from 'turndown';
import { stringify } from 'yaml';
import { toLocal } from '../src/lib/wp-url.js';
import { prepareMarkup } from '../src/lib/performance.js';
const map = new Set(JSON.parse(await readFile('src/lib/image-map.json','utf8')).map(x=>x.toLowerCase()));
const fixes = JSON.parse(await readFile('migration/link-fixes.json','utf8'));
const plain = html => load(html || '',null,false).text().replace(/\s+/g,' ').trim();
const localize = html => toLocal(html).replace(/(\/wp-(?:content|includes)\/[^"'\s)?]+)\.(jpe?g|png)/gi,(all,base,ext)=>map.has(`${base}.${ext}`.toLowerCase())?`${base}.webp`:all);
const markdown = new TurndownService({ headingStyle:'atx', bulletListMarker:'-', codeBlockStyle:'fenced', emDelimiter:'*' });
markdown.keep(['iframe','table','canvas','sup']);
markdown.addRule('pictures', { filter: 'picture', replacement: (_, node) => markdown.turndown(node.querySelector('img')?.outerHTML || '') });
const names=(await readdir('src/content/posts')).filter(x=>x.endsWith('.json'));
if (!names.length) throw new Error('No unmigrated post exports. Markdown is now authoritative; do not rerun this migration.');
await mkdir('migration/legacy-posts',{recursive:true});
for (const file of names) {
  const post=JSON.parse(await readFile(`src/content/posts/${file}`,'utf8'));
  const destinationDir='src/content/posts';
  const destination=`${destinationDir}/${post.slug}.md`;
  if (await access(destination).then(()=>true,()=>false)) throw new Error(`Refusing to overwrite ${destination}`);
  await mkdir(destinationDir,{recursive:true});
  let html=localize(post.content.rendered);
  for (const fix of fixes) html=html.replaceAll(`href="${fix.from}"`,`href="${fix.to}"`).replaceAll(`href='${fix.from}'`,`href='${fix.to}'`);
  html=html.replace(/<a\b[^>]*href=["'][^"']*nextgen-attach_to_post[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi,'$1');
  html=await prepareMarkup(html);
  const $=load(html,null,false);
  for(let pass=0;pass<4;pass++) $('span,b,strong,i,em').each((_,e)=>{if(!$(e).text().trim() && $(e).find('br').length) $(e).replaceWith($(e).html());});
  $('img').each((_,el)=>{
    const src=$(el).attr('src');
    if (src?.startsWith('/wp-content/')) $(el).attr('src',`../../assets/images${src.replace("/wp-content/uploads", "")}`);
  });
  // Copy the article's local image sources once. Astro handles optimization.
  for (const el of $('img').toArray()) {
    const src=$(el).attr('src');
    if (!src?.startsWith('../../assets/images/')) continue;
    const path=src.replace('../../assets/images','').replace('/wp-content/uploads','');
    const target=join('src/assets/images',path);
    await mkdir(dirname(target),{recursive:true});
    await copyFile(join('public',path),target);
  }
  const media=post._embedded?.['wp:featuredmedia']?.[0];
  const featureUrl=media?.source_url?localize(media.source_url).replace(/^\/wp-content\/uploads\//,''):undefined;
  let featuredImage;
  if (featureUrl) {
    const ext=extname(featureUrl);
    const target=`${destinationDir}/images/${post.slug}${ext}`;
    await mkdir(dirname(target),{recursive:true});
    await copyFile(join('public/wp-content/uploads',featureUrl),target);
    featuredImage=`images/${post.slug}${ext}`;
  }
  const data={title:plain(post.title.rendered),description:plain(post.excerpt?.rendered),pubDate:`${post.date_gmt}Z`,updatedDate:`${post.modified_gmt}Z`,author:post._embedded?.author?.[0]?.name || 'Rhea Mehta',categories:(post._embedded?.['wp:term']?.[0] || []).map(t=>({id:t.id,name:plain(t.name),slug:t.slug})),featuredImage,featuredImageAlt:media?.alt_text || '',legacyId:post.id,legacyUrl:post.link};
  let body=markdown.turndown($.html());
  // DOM placeholder images in old exports can have empty alt text; keep them as images.
  await writeFile(destination,`---\n${stringify(data,{lineWidth:0})}---\n\n${body}\n`);
  await rename(`src/content/posts/${file}`,`migration/legacy-posts/${file}`);
}
console.log(`Converted ${names.length} articles to Markdown; old records archived outside runtime content.`);
