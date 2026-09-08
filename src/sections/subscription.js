// Subscription — spec doc 34. Static global module, max one per page.
import { ARCHETYPE } from '../model/enums.js';
import { attr, esc, img, rich } from '../render/html.js';

/** @type {import('../model/types.js').SectionType} */
export default {
  key: 'SECTION_SUBSCRIPTION',
  doc: 34,
  name: 'Subscription',
  archetype: ARCHETYPE.STATIC,
  group: 'global',
  icon: '✉',
  description: 'Newsletter signup with standardised corporate copy.',
  // No configurable bg_color, but it always renders on plain white — needed so the
  // same-background divider (render/page.js) can compare it against its neighbours.
  fixedBg: '#FFFFFF',

  fields: [
    { title: 'Subscription', open: true, fields: [
      { key: '_global_note', kind: 'note', label: '',
        text: 'Copy and form behaviour are standardised site-wide. Edit them in Global Settings > Subscription.' },
    ] },
  ],

  defaults: {},

  css: `
.sub{padding:var(--section-y) 0}
.sub-card{display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:32px;
  background:var(--bg-light-grey);border-radius:28px;overflow:hidden}
.sub-copy{padding:64px 0 64px 64px}
.sub-copy h2{margin:0 0 14px;font-size:32px;font-weight:700;letter-spacing:-.02em;
  line-height:1.2;max-width:480px}
.sub-lead{margin:0 0 28px;color:var(--ink-soft);font-size:16px;max-width:460px}
.sub-form{display:flex;gap:12px;flex-wrap:wrap}
.sub-field{flex:1 1 220px;border:1px solid var(--line);border-radius:var(--radius-sm);
  padding:8px 16px;background:#fff;display:flex;flex-direction:column;gap:2px;justify-content:center}
.sub-field span{font-size:12px;color:var(--ink-soft)}
.sub-field input{border:0;padding:0;font:inherit;font-size:15px;background:transparent;
  outline:0;width:100%;color:var(--ink)}
.sub-btn{display:inline-flex;align-items:center;gap:10px;white-space:nowrap}
.sub-note{margin-top:18px;font-size:13px;color:var(--ink-faint)}
.sub-note a{color:inherit;text-decoration:underline}
.sub-note p{margin:0}
.sub-media{position:relative;align-self:stretch;min-height:280px}
.sub-media img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;
  object-position:right center}
.sub-media .ph{position:absolute;inset:0;width:100%;height:100%;min-height:0}
@media (max-width:1023px){
  .sub-card{grid-template-columns:1fr}
  .sub-copy{padding:40px 32px 0}
  .sub-media{min-height:220px}
}
@media (max-width:767px){ .sub-copy h2{font-size:24px} }
`,

  render(section, ctx) {
    const g = ctx.globals?.subscription || {};
    return `<section class="sub"${attr('id', section.anchor_id)}><div class="wrap"><div class="sub-card">
      <div class="sub-copy">
        <h2>${esc(g.title || '')}</h2>
        <p class="sub-lead">${esc(g.subtitle || '')}</p>
        <form class="sub-form" data-subscribe novalidate>
          <label class="sub-field">
            <span>Email</span>
            <input type="email" name="email" required aria-label="Email"
                   placeholder="${esc(g.email_placeholder || 'Enter your email')}">
          </label>
          <button class="btn sub-btn" type="submit">${esc(g.button_label || 'Subscribe')}<span aria-hidden="true">→</span></button>
        </form>
        <div class="sub-note">${rich(g.privacy_notice || '')}</div>
      </div>
      <div class="sub-media">${img(g.phone_image, { placeholder: 'Image', decorative: true })}</div>
    </div></div></section>`;
  },
};
