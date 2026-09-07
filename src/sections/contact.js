// Contact Us — spec doc 35. Static global module, max one per page.
import { ARCHETYPE } from '../model/enums.js';
import { attr, esc, rich } from '../render/html.js';

/** @type {import('../model/types.js').SectionType} */
export default {
  key: 'SECTION_CONTACT',
  doc: 35,
  name: 'Contact Us',
  archetype: ARCHETYPE.STATIC,
  group: 'global',
  icon: '☎',
  description: 'Concierge phone numbers and email, site-wide.',

  fields: [
    { title: 'Contact', open: true, fields: [
      { key: '_global_note', kind: 'note', label: '',
        text: 'Contact details are managed centrally. Edit them in Global Settings > Contact.' },
    ] },
  ],

  defaults: {},

  css: `
.ct{padding:var(--section-y) 0}
.ct-head{max-width:640px;margin-bottom:32px}
.ct-head h2{margin:0 0 10px;font-size:30px;letter-spacing:-.02em;line-height:1.2}
.ct-head p{margin:0;color:var(--ink-soft)}
.ct-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px}
.ct-card{border:1px solid var(--line);border-radius:14px;padding:28px;display:flex;
  flex-direction:column}
.ct-icon{width:48px;height:48px;border-radius:12px;background:var(--ink);color:#fff;
  display:flex;align-items:center;justify-content:center;margin-bottom:24px}
.ct-icon svg{width:22px;height:22px}
.ct-card h3{margin:0 0 8px;font-size:18px;font-weight:650;letter-spacing:-.01em}
.ct-card .ct-desc{margin:0;color:var(--ink-soft);font-size:14.5px;line-height:1.5}
.ct-card .ct-desc p{margin:0}
.ct-card .ct-desc a{color:inherit;text-decoration:underline}
.ct-cta-row{margin-top:auto;padding-top:20px}
.ct-cta{display:block;border-top:1px solid var(--line);padding-top:16px;text-align:right;
  color:var(--bronze);font-weight:600;font-size:14.5px;text-decoration:none}
.ct-cta:hover{text-decoration:underline}
@media (max-width:767px){ .ct-head h2{font-size:24px} }
`,

  render(section, ctx) {
    const g = ctx.globals?.contact || {};
    const ch = g.channels || {};

    const card = (/** @type {any} */ c, /** @type {string} */ iconSvg) => !c ? '' : `<div class="ct-card">
      <div class="ct-icon" aria-hidden="true">${iconSvg}</div>
      <h3>${esc(c.title || '')}</h3>
      <div class="ct-desc">${rich(c.description || '')}</div>
      <div class="ct-cta-row">
        <a class="ct-cta" href="${esc(c.cta_href || '#lead-modal')}">${esc(c.cta_label || '')} ›</a>
      </div>
    </div>`;

    return `<section class="ct"${attr('id', section.anchor_id)}><div class="wrap">
      <div class="ct-head">
        <h2>${esc(g.headline || '')}</h2>
        <p>${esc(g.subheadline || '')}</p>
      </div>
      <div class="ct-grid">
        ${card(ch.chat, ICON_CHAT)}
        ${card(ch.phone, ICON_PHONE)}
        ${card(ch.email, ICON_MAIL)}
      </div>
    </div></section>`;
  },
};

const SVG_ATTRS = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
  + 'stroke-linecap="round" stroke-linejoin="round"';

const ICON_CHAT = `<svg ${SVG_ATTRS}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 `
  + `8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 `
  + `3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;

const ICON_PHONE = `<svg ${SVG_ATTRS}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 `
  + `19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 8.5 8.5 0 0 0 `
  + `.7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 `
  + `2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;

const ICON_MAIL = `<svg ${SVG_ATTRS}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2`
  + `V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg>`;
