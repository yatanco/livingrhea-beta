// One-time layout migration. Static output is used only as the verified reference.
import { readFile, writeFile, readdir, mkdir, rename } from 'node:fs/promises';
import { load } from 'cheerio';
import { createHash } from 'node:crypto';
const settings={};const registry={};
const selectors={header:'#header-outer',secondary:'#header-secondary-outer',spacer:'#header-space',search:'#search-outer',ajax:'#ajax-content-wrap',outer:'.ocm-effect-wrap',inner:'.ocm-effect-wrap-inner',container:'.container-wrap',main:'.container.main-content',row:'.container.main-content > .row'};
let base;
for(const f of await readdir('src/content/shells')){
 const source=JSON.parse(await readFile('src/content/shells/'+f));const key=f.replace('.json','');const path=key==='livingrhea-com'?'dist/index.html':`dist/${key}/index.html`;
 const $=load(await readFile(path,'utf8'));if(key==='about')base=$;
 const attrs=Object.fromEntries(Object.entries(selectors).map(([key,selector])=>[key,{...$(selector).first().attr()}]));
 const scripts=source.scripts.filter(s=>s.type!=='application/ld+json'&&s.id!=='mcjs'&&!(key==='livingrhea-com'&&['nectar-slider-js','nectar-slider-js-extra','nectar_slider_priority-js'].includes(s.id))).map(s=>{
  if(s.src?.includes('downloads.mailchimp.com/js/mc-validate.js'))s={...s,src:'/vendor/mailchimp/mc-validate-b15aceb04dbf.js'};
  const id=s.id||'inline-'+createHash('sha256').update(JSON.stringify(s)).digest('hex').slice(0,10);
  let name=id;if(registry[name]&&JSON.stringify(registry[name])!==JSON.stringify(s))name+='-'+key;
  registry[name]=s;return name;
 });
 settings[key]={bodyAttrs:source.bodyAttrs,...attrs,logoImages:$('#logo img').map((_,e)=>e.attribs).get(),scripts};
}
if(!base)throw new Error('Missing reference layout');
const $=base;
$('body script,body style,body link,body meta').remove();
$('.container.main-content > .row').first().html('RHEA_MAIN_SLOT');
$('#logo').html('RHEA_LOGO_IMAGES');
$('#social').replaceWith('RHEA_SOCIAL_DESKTOP');
$('.off-canvas-social-links').replaceWith('RHEA_SOCIAL_MOBILE');
const replace=[];
for(const[key,selector]of Object.entries(selectors)){
 const node=$(selector).first();if(!node.length)continue;
 const token=`RHEA_ATTR_${key}__`;node.attr('data-rhea-attrs',token);replace.push([token,`{...layout.${key}}`]);
 for(const name of Object.keys(node.attr()))if(name!=='data-rhea-attrs')node.removeAttr(name);
}
let nav=0;
$('li.menu-item').each((_,e)=>{
 const n=$(e);const classes=(n.attr('class')||'').split(/\s+/).filter(x=>!/^current[-_]/.test(x)).join(' ');
 const href=n.children('a').first().attr('href');const token=`RHEA_NAV_${nav++}__`;
 n.attr('class',token);
 const condition=href==='#'?"['/coaching/','/himalayan-breathwork/'].includes(path)":`path === ${JSON.stringify(href)}`;
 replace.push([`class="${token}"`,`class:list={[${JSON.stringify(classes)}, { 'current-menu-item': ${condition} }]}`]);
});
let html=$('body').html();
for(const[token,code]of replace)html=html.replaceAll(token.startsWith('class=')?token:`data-rhea-attrs="${token}"`,code);
html=html.replace('RHEA_MAIN_SLOT','<slot />').replace('RHEA_LOGO_IMAGES','{layout.logoImages.map(attrs => <img {...attrs} />)}').replace('RHEA_SOCIAL_DESKTOP','<SocialLinks />').replace('RHEA_SOCIAL_MOBILE','<SocialLinks mobile />');
await writeFile('src/components/SiteChrome.astro',`---\nimport SocialLinks from './SocialLinks.astro';\nconst { layout } = Astro.props;\nconst path = Astro.url.pathname;\n---\n${html}\n`);
await writeFile('src/lib/theme-settings.js','// Frozen local behavior and layout attributes; design markup lives in SiteChrome.astro.\nexport const scriptRegistry = '+JSON.stringify(registry,null,2)+';\nexport const layoutSettings = '+JSON.stringify(settings,null,2)+';\n');
await mkdir('migration/legacy-shells',{recursive:true});for(const f of await readdir('src/content/shells'))await rename('src/content/shells/'+f,'migration/legacy-shells/'+f);
