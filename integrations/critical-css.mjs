import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import postcss from 'postcss';
import { load } from 'cheerio';

// Preserve the complete stylesheet. Only the active homepage rules and local
// interaction states are duplicated inline, so CSS never waits on a network hop.
// No selector is deleted from the cached, fingerprinted fallback stylesheet.
const interactive = /#(?:header|top\b|search|slide-out|sidewidget)|\.sf-menu|\.ocm-|\.slide-out|\.nectar-ocm|\.testimonial|\.nectar_cascading|\.fancybox|\.pum-|\.popmake|\.first-section|\.top-level/;
export function activeStyles(css, html) {
  const $ = load(html);
  const matches = new Map();
  const used = selector => {
    if (interactive.test(selector)) return true;
    if (matches.has(selector)) return matches.get(selector);
    let result;
    try {
      const staticSelector = selector
        .replace(/::?(?:before|after|first-letter|first-line|selection|placeholder|marker)\b/g, '')
        .replace(/:(?:hover|active|focus-visible|focus-within|focus|visited|link|target|checked|disabled|enabled)\b/g, '');
      // Empty :not() and unsupported browser pseudo selectors are retained.
      result = $(staticSelector).length > 0;
    } catch { result = true; }
    matches.set(selector, result);
    return result;
  };
  const root = postcss.parse(css);
  function trim(container) {
    for (const node of [...(container.nodes || [])]) {
      if (node.type === 'comment') node.remove();
      else if (node.type === 'rule') {
        const selectors = postcss.list.comma(node.selector).filter(used);
        if (selectors.length) node.selector = selectors.join(',');
        else node.remove();
      } else if (node.type === 'atrule' && node.nodes && !/^(?:font-face|(?:-\w+-)?keyframes|property)$/i.test(node.name)) {
        trim(node);
        if (!node.nodes.length) node.remove();
      }
    }
  }
  trim(root);
  return root.toString();
}

export async function optimizeHomepage(dir) {
  const path = join(fileURLToPath(dir), 'index.html');
  const html = await readFile(path, 'utf8');
  const $ = load(html);
  const reports = [];
  const links = $('link[rel="stylesheet"][href^="/_astro/"]').toArray();
  for (const [index, node] of links.entries()) {
    const link = $(node);
    const href = link.attr('href');
    const css = await readFile(join(fileURLToPath(dir), href.slice(1)), 'utf8');
    const critical = activeStyles(css, html);
    const original = link.prop('outerHTML');
    const id = `rhea-full-styles-${index}`;
    // Keep source order so component overrides retain their original precedence.
    link.before(`<style data-rhea-critical="${index}">${critical.replace(/<\/style/gi, '<\\/style')}</style>`);
    link.attr('id', id).attr('rel', 'preload').attr('as', 'style')
      .attr('onload', "this.onload=null;this.rel='stylesheet'");
    link.after(`<noscript>${original}</noscript>`);
    reports.push({ href, fullBytes: Buffer.byteLength(css), fullGzipBytes: gzipSync(css).length, criticalBytes: Buffer.byteLength(critical), criticalGzipBytes: gzipSync(critical).length });
  }
  if (!reports.length) throw new Error('No compiled homepage CSS found. Review critical CSS integration.');
  await writeFile(path, $.html());
  await writeFile(join(fileURLToPath(dir), '_astro/critical-css-report.json'), JSON.stringify(reports, null, 2)+'\n');
  return reports;
}

export default function criticalCss() {
  return { name: 'livingrhea-critical-css', hooks: {
    'astro:build:done': async ({ dir, logger }) => {
      const reports = await optimizeHomepage(dir);
      logger.info(`Homepage CSS: ${reports.reduce((n,r)=>n+r.fullGzipBytes,0)} → ${reports.reduce((n,r)=>n+r.criticalGzipBytes,0)} gzip bytes needed before paint; full styles preserved.`);
    },
  } };
}
