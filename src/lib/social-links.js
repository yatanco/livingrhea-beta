import { load } from 'cheerio';
import social from '../content/settings/social.json';

// Patch only the complete social lists, leaving the saved layout wrappers intact.
export function connectSocialLinks(html) {
  return html.replace(/<ul\b[^>]*(?:id=["']social["']|class=["'][^"']*off-canvas-social-links[^"']*["'])[^>]*>[\s\S]*?<\/ul>/gi, list => {
    const $ = load(list, null, false);
    $('li').each((_, node) => {
      const item = $(node);
      const link = item.find('a').first();
      let key = link.find('.screen-reader-text').text().trim().toLowerCase();
      if (key === 'vine') {
        key = 'linkedin';
        link.find('.screen-reader-text').text('LinkedIn');
        link.find('i').removeClass('fa-vine').addClass('fa-linkedin');
      }
      const href = social[key];
      if (!href) { item.remove(); return; }
      link.attr('href', href).attr('rel', 'noopener noreferrer');
      link.attr('aria-label', key === 'twitter' ? 'Rhea Mehta on X (Twitter)' : key === 'rss' ? 'Subscribe to the blog RSS feed' : `Rhea Mehta on ${{ youtube: "YouTube", linkedin: "LinkedIn" }[key] || key[0].toUpperCase()+key.slice(1)}`);
    });
    return $.html();
  });
}
