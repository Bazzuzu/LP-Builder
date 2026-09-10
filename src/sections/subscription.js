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
/* Its own container spec, same pattern as Hero/Prices/Feature/Story & Specs/Text & Media/
   Trust/Multi-Card Grid. */
.sub{padding:80px 0}
.sub .wrap{max-width:1280px;padding:0 80px}
.sub-card{display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:40px;
  background:var(--bg-light-grey);border-radius:28px;overflow:hidden}
.sub-copy{padding:80px 0 80px 80px;max-width:640px}
/* Title and lead reuse the shared Heading component (.sec-title/.sec-sub) at size M,
   rather than their own bespoke type styles — the .h-m wrapper is what scopes them to that
   size, same as a dynamic section's own header would be. Grouped in .sub-head so the 8px
   title-to-lead rhythm the component already owns stays independent of the larger 40px gap
   down to the form below it. */
.sub-head{margin-bottom:40px}
.sub-copy .sec-title{max-width:480px}
.sub-copy .sec-sub{max-width:460px}
.sub-form{display:flex;gap:12px;flex-wrap:nowrap;margin-bottom:16px}
.sub-field{flex:1 1 220px;border:1px solid var(--line);border-radius:var(--radius-sm);
  padding:8px 16px;background:#fff;display:flex;flex-direction:column;gap:2px;justify-content:center}
.sub-field span{font-size:12px;color:var(--ink-soft)}
.sub-field input{border:0;padding:0;font:inherit;font-size:15px;background:transparent;
  outline:0;width:100%;color:var(--ink)}
.sub-btn{display:inline-flex;align-items:center;gap:10px;white-space:nowrap;flex:0 0 auto}
.sub-note{font-size:13px;color:var(--ink-faint)}
.sub-note a{color:inherit;text-decoration:underline}
.sub-note p{margin:0}
.sub-media{position:relative;align-self:stretch;min-height:280px}
/* Fills its own half of the card edge to edge — contained within the card's own rounded
   shape (clipped by .sub-card's overflow:hidden), not bleeding past it. */
.sub-media img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
  object-position:calc(50% - 200px) center}
.sub-media .ph{position:absolute;inset:0;width:100%;height:100%;min-height:0}
@media (max-width:1023px){
  .sub-card{grid-template-columns:1fr}
  .sub-copy{padding:40px 32px 0}
  .sub-media{min-height:220px}
}
@media (max-width:767px){
  .sub{padding:var(--section-y) 0}
  .sub .wrap{max-width:var(--container);padding:0 var(--gutter)}
}
`,

  render(section, ctx) {
    const g = ctx.globals?.subscription || {};
    return `<section class="sub"${attr('id', section.anchor_id)}><div class="wrap"><div class="sub-card">
      <div class="sub-copy h-m">
        <div class="sub-head">
          <h2 class="sec-title">${esc(g.title || '')}</h2>
          <div class="sec-sub">${esc(g.subtitle || '')}</div>
        </div>
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
