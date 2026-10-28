// One-time conversion of the verified static output into native layout templates
// and plain Markdown copy. Refuses to overwrite an existing content file.
import { readFile, writeFile, readdir, mkdir, access, rename } from 'node:fs/promises';
import { load } from 'cheerio';
import TurndownService from 'turndown';
import { stringify } from 'yaml';
const turndown = new TurndownService({headingStyle:'atx',bulletListMarker:'-',emDelimiter:'*'});
const plain = html => load(html || '',null,false).text().replace(/\s+/g,' ').trim();
const baseline = {};
await mkdir('src/components/pages',{recursive:true});
await mkdir('migration/legacy-pages',{recursive:true});
const names=(await readdir('src/content/pages')).filter(f=>f.endsWith('.json'));
if (!names.length) throw new Error('Page migration already completed; edit Markdown instead.');
for (const filename of names) {
  const record=JSON.parse(await readFile(`src/content/pages/${filename}`,'utf8'));
  const slug=record.slug==='livingrhea-com'?'home':record.slug;
  const path=slug==='home'?'/':`/${slug}/`;
  const output=slug==='home'?'dist/index.html':`dist/${slug}/index.html`;
  const full=load(await readFile(output,'utf8'));
  const content=full('.wp-content').first().html();
  if (!content) throw new Error(`Missing verified page content: ${slug}`);
  const $=load(content,null,false);
  for(let pass=0;pass<4;pass++) $('span,b,strong,i,em').each((_,e)=>{if(!$(e).text().trim() && $(e).find('br').length) $(e).replaceWith($(e).html());});
  baseline[slug]={html:content,text:$.root().text(),links:$('a[href]').map((_,e)=>$(e).attr('href')).get(),forms:$('form').map((_,e)=>$(e).attr('action')).get()};
  // Restore source background declarations; ContentFrame will lazy-load them.
  $('[data-perf-background]').each((_,e)=>{
    const n=$(e);n.attr('style',(n.attr('style')||'')+`;background-image:${n.attr('data-perf-background')};`).removeAttr('data-perf-background').removeAttr('data-perf-bg');
  });
  $('noscript,script').remove();
  const data={title:plain(record.title.rendered),description:plain(record.excerpt?.rendered),path,labels:{}};
  const hero=$('#rhea-home-hero');
  if (hero.length) {
    data.hero={image:'/wp-content/uploads/2025/08/Rhea-Lotus-Cropped-Smoothie2.webp',heading:hero.find('h2').html().split(/<br\s*\/?>/i).map(plain),actionLabel:hero.find('.button a').text().trim(),actionHref:hero.find('.button a').attr('href')};
    hero.replaceWith('RHEA_NATIVE_HERO');
  }
  const form=$('form.astro-contact-form');
  if (form.length) form.replaceWith('RHEA_CONTACT_FORM');
  const sections=[];
  const replacements=[];
  const allowed = new Set(['p','strong','em','b','i','a','br','h1','h2','h3','h4','h5','h6','ul','ol','li','blockquote','span']);
  let count=0;
  function extract(node) {
    const name=`copy-${++count}`;
    sections.push({name,body:turndown.turndown($(node).html())});
    const marker=`RHEA_COPY_${count}__`;
    replacements.push([marker,`<Fragment set:html={copy[${JSON.stringify(name)}]} />`]);
    $(node).html(marker);
  }
  $('.wpb_text_column > .wpb_wrapper').each((_,node)=>{
    if (!$(node).text().trim()) return;
    if ($(node).find('*').toArray().every(e=>allowed.has(e.name)) && !$(node).find('[style]').length) extract(node);
  });
  // Standalone testimonial/intro paragraphs also belong in editable Markdown.
  $('p').each((_,node)=>{
    if ($(node).text().includes('RHEA_COPY_') || !$(node).text().trim()) return;
    if ($(node).attr('style') || $(node).attr('class') || !$(node).find('*').toArray().every(e=>allowed.has(e.name))) return;
    if ($(node).parents('form').length) return;
    const name=`copy-${++count}`;
    sections.push({name,body:turndown.turndown($.html(node))});
    const marker=`RHEA_COPY_${count}__`;
    replacements.push([marker,`<Fragment set:html={copy[${JSON.stringify(name)}]} />`]);
    $(node).replaceWith(marker);
  });
  let label=0;
  const labelUses=new Map();
  function extractLabels(node) {
    for (const child of [...(node.children || [])]) {
      if (child.type==='text' && /[\p{L}\p{N}]/u.test(child.data) && !/RHEA_(?:COPY_|NATIVE_HERO|CONTACT_FORM)/.test(child.data)) {
        const value=child.data;
        let key=labelUses.get(value);
        if (!key) {
          const hint=value.trim().replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,35) || 'label';
          key=`${hint}-${++label}`;data.labels[key]=value;labelUses.set(value,key);
        }
        const marker=`RHEA_LABEL_${label}_${replacements.length}__`;
        replacements.push([marker,`{text[${JSON.stringify(key)}]}`]);child.data=marker;
      } else if (child.type==='tag' && !['svg','script','style','noscript'].includes(child.name)) extractLabels(child);
    }
  }
  extractLabels($.root()[0]);
  let template=$.html();
  for (const [marker,code] of replacements) template=template.replaceAll(marker,code);
  template=template.replace('RHEA_NATIVE_HERO','<HomeHero image={page.hero.image} heading={page.hero.heading} actionLabel={page.hero.actionLabel} actionHref={page.hero.actionHref} />').replace('RHEA_CONTACT_FORM','<ContactForm />');
  const component=slug.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join('')+'Page';
  const front=`---\nimport ContentFrame from '../ContentFrame.astro';\nimport { pageSections } from '../../lib/page-sections.js';\n${data.hero?"import HomeHero from '../HomeHero.astro';\n":''}${slug==='contact'?"import ContactForm from '../ContactForm.astro';\n":''}const { page } = Astro.props;\nconst text = page.labels;\nconst copy = pageSections(await Astro.slots.render('default'));\n---\n`;
  await writeFile(`src/components/pages/${component}.astro`,front+`<ContentFrame>\n${template}\n</ContentFrame>\n`);
  const dest=`src/content/pages/${slug}.md`;
  if (await access(dest).then(()=>true,()=>false)) throw new Error(`Refusing to overwrite ${dest}`);
  await writeFile(dest,`---\n${stringify(data,{lineWidth:0})}---\n\n`+sections.map(s=>`# section-${s.name}\n\n${s.body}\n`).join('\n'));
  const css=record.slug;
  const route=slug==='home'?'src/pages/index.astro':`src/pages/${slug}.astro`;
  let preload=full('link[as="image"]').attr('href');
  if (preload?.startsWith('/_astro/')) preload=undefined;
  await writeFile(route,`---\nimport '../styles/site/${css}.css';\nimport Base from '../layouts/Base.astro';\nimport ${component} from '../components/pages/${component}.astro';\nimport { getEntry, render } from 'astro:content';\nconst entry = await getEntry('pages', '${slug}');\nif (!entry) throw new Error('Missing ${slug} content');\nconst { Content } = await render(entry);\nconst page = entry.data;\n---\n<Base title={page.title} description={page.description} pageUrl={page.path}${preload?` preloadImage=${JSON.stringify(preload)}`:''}${data.hero?' socialImage={page.hero?.image}':''}>\n${!['home','contact'].includes(slug)?'<h1>{page.title}</h1>\n':''}<${component} page={page}><Content /></${component}>\n</Base>\n`);
  await rename(`src/content/pages/${filename}`,`migration/legacy-pages/${filename}`);
}
await writeFile('migration/native-pages-baseline.json',JSON.stringify(baseline,null,2)+'\n');
console.log(`Converted ${names.length} page layouts to Astro and page copy to Markdown.`);
