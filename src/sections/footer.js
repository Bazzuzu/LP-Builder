// Footer — spec doc 33. Dual-role anchor at slot 06. Content is site-wide and read-only here.
import { ARCHETYPE } from '../model/enums.js';
import { attr, esc, rich } from '../render/html.js';

/** @type {import('../model/types.js').SectionType} */
export default {
  key: 'SECTION_FOOTER',
  doc: 33,
  name: 'Footer',
  archetype: ARCHETYPE.DUAL_ANCHOR,
  icon: '▁',
  description: 'Corporate navigation, legal disclaimers, accreditations and social links.',
  // No configurable bg_color, but it always renders on a fixed dark ground — needed so the
  // same-background divider (render/page.js) can compare it against its neighbours.
  fixedBg: '#111111',

  fields: [
    { title: 'Footer', open: true, fields: [
      { key: '_global_note', kind: 'note', label: '',
        text: 'Footer is a site-wide component. To change links or legal text, go to Global Settings > Footer.' },
    ] },
  ],

  defaults: {},

  css: `
.ft-site{background:#111;color:#fff;padding:56px 0 32px;font-size:14px}
.ft-cols{display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr 1.3fr;gap:32px}
.ft-brand{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:700;
  letter-spacing:-.01em;margin-bottom:16px}
.ft-brand svg{width:18px;height:18px}
.ft-copy{opacity:.55;line-height:1.5}
.ft-col h3{margin:0 0 14px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.55}
.ft-col a{display:block;padding:4px 0;text-decoration:none;opacity:.85}
.ft-col a:hover{opacity:1}
.ft-news h3{margin:0 0 10px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.75}
.ft-news p{margin:0 0 16px;opacity:.65;line-height:1.5}
.ft-news-form{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px}
.ft-field{flex:1 1 160px;border:1px solid rgba(255,255,255,.22);border-radius:var(--radius-sm);
  padding:7px 14px;display:flex;flex-direction:column;gap:2px;justify-content:center}
.ft-field span{font-size:11px;opacity:.55}
.ft-field input{border:0;padding:0;font:inherit;font-size:14px;background:transparent;
  outline:0;width:100%;color:#fff}
.ft-news-btn{background:rgba(255,255,255,.16);color:#fff;border:0;border-radius:var(--radius-pill);
  padding:0 20px;font:inherit;font-weight:600;font-size:14px;cursor:pointer;white-space:nowrap}
.ft-news-btn:hover{background:rgba(255,255,255,.24)}
.ft-news-note{opacity:.55;font-size:12.5px;margin-bottom:20px}
.ft-news-note a{color:inherit}
.ft-news-hr{height:1px;background:rgba(255,255,255,.14);margin-bottom:16px}
.ft-social{display:flex;gap:14px}
.ft-social a{opacity:.75;display:flex}
.ft-social a:hover{opacity:1}
.ft-social svg{width:18px;height:18px}
.ft-legal{margin-top:36px;padding-top:24px;border-top:1px solid rgba(255,255,255,.14);
  opacity:.55;font-size:12.5px;line-height:1.6}
.ft-legal p{margin:0}
.ft-legal a{color:inherit}
.ft-seals{display:flex;justify-content:center;align-items:center;gap:28px;margin-top:28px;
  filter:grayscale(1);opacity:.6}
.ft-seals .acc{display:flex;align-items:center;justify-content:center;width:44px;height:44px;
  border-radius:999px;border:1px solid rgba(255,255,255,.3);font-size:9px;letter-spacing:.04em;
  font-weight:700}
@media (max-width:1023px){ .ft-cols{grid-template-columns:1fr 1fr;row-gap:40px} }
@media (max-width:640px){ .ft-cols{grid-template-columns:1fr} }
`,

  render(section, ctx) {
    const g = ctx.globals?.footer || {};
    const news = g.newsletter || {};
    return `<footer class="ft-site"${attr('id', section.anchor_id)}><div class="wrap">
      <div class="ft-cols">
        <div class="ft-col">
          <div class="ft-brand">${ICON_LOGO}BUSINESS CLASS</div>
          <div class="ft-copy">${esc(g.copyright_notice || '')}<br>${esc(g.registration_notice || '')}</div>
        </div>
        ${(g.navigation_columns || []).map((/** @type {any} */ col) => `<div class="ft-col">
          <h3>${esc(col.column_title)}</h3>
          ${(col.links || []).map((/** @type {any} */ l) =>
            `<a href="${esc(l.url)}"${l.open_in_new_tab ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(l.label)}</a>`).join('')}
        </div>`).join('')}
        <div class="ft-col ft-news">
          <h3>${esc(news.title || '')}</h3>
          <p>${esc(news.subtitle || '')}</p>
          <form class="ft-news-form" data-subscribe novalidate>
            <label class="ft-field">
              <span>Email</span>
              <input type="email" name="email" required aria-label="Email"
                     placeholder="${esc(news.email_placeholder || 'Enter your email')}">
            </label>
            <button class="ft-news-btn" type="submit">${esc(news.button_label || 'Subscribe')}</button>
          </form>
          <div class="ft-news-note">${rich(news.privacy_notice || '')}</div>
          <div class="ft-news-hr"></div>
          <h3>Follow Us</h3>
          <div class="ft-social">
            ${(g.social_channels || []).map((/** @type {any} */ s) =>
              `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(s.platform)}">${SOCIAL_ICONS[s.platform] || ''}</a>`).join('')}
          </div>
        </div>
      </div>
      <div class="ft-legal">
        <div>${rich(g.legal_disclaimers || '')}</div>
      </div>
      <div class="ft-seals">
        ${(g.accreditation_seals || []).length
          ? (g.accreditation_seals || []).map((/** @type {any} */ s) => `<span class="acc">${esc(s)}</span>`).join('')
          : ['ASTA', 'IATA', 'ARC'].map((s) => `<span class="acc">${s}</span>`).join('')}
      </div>
    </div></footer>`;
  },
};

const ICON_LOGO = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 12 22 3l-6 19-4-8-8-2z"/></svg>';

const SOCIAL_ICONS = {
  LinkedIn: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 '
    + '0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/>'
    + '<circle cx="4" cy="4" r="2"/></svg>',
  Instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
    + 'stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/>'
    + '<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
  Facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3'
    + 'l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
};
