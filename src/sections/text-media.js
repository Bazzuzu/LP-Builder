// Text & Media — spec doc 39. Editorial split with 0, 1 or 2 images.
import { ARCHETYPE } from '../model/enums.js';
import { blankRich, cls, ctaLink, dynamicShell, esc, img, rich } from '../render/html.js';
import { RT_FULL, advancedGroup, all, appearanceGroup, contentGroup, ctaGroup, headingFields, imgField, mediaGroup, needMedia, needRich, needText } from './_common.js';

const hasMedia = (/** @type {any} */ p) => p.media_mode !== 'No Photo';

/** @type {import('../model/types.js').SectionType} */
export default {
  key: 'SECTION_TEXT_MEDIA',
  doc: 39,
  name: 'Text & Media',
  archetype: ARCHETYPE.DYNAMIC,
  group: 'content',
  icon: '◧',
  description: 'Narrative copy beside zero, one or two images, on either side.',

  fields: [
    contentGroup([
      // The body copy is this section's whole point, so it takes the place of a subheading
      // rather than being a second, optional line under one.
      ...headingFields({ required: true, sub: false }),
      { key: 'paragraph', kind: 'richtext', label: 'Text', required: true, tools: RT_FULL },
    ]),
    ctaGroup('cta'),
    mediaGroup([
      { key: 'media_mode', kind: 'segmented', label: 'Images', default: '1 Photo',
        options: [{ value: 'No Photo', label: 'None' }, { value: '1 Photo', label: '1' }, { value: '2 Photos', label: '2' }] },
      { key: 'media_side', kind: 'segmented', label: 'Side', default: 'Right',
        options: [{ value: 'Left', label: 'Left' }, { value: 'Right', label: 'Right' }],
        when: (/** @type {any} */ p) => hasMedia(p) },
      imgField('image_single', 'Image', { ratio: '1:1', when: (/** @type {any} */ p) => p.media_mode === '1 Photo' }),
      imgField('image_large', 'Large image', { when: (/** @type {any} */ p) => p.media_mode === '2 Photos' }),
      imgField('image_small', 'Small image', { when: (/** @type {any} */ p) => p.media_mode === '2 Photos' }),
    ], { open: true }),
    appearanceGroup({ bg: '#FFFFFF' }),
    advancedGroup(),
  ],

  defaults: {
    bg_color: '#FFFFFF', heading_size: 'SIZE_M', heading_align: 'ALIGN_LEFT',
    media_mode: '1 Photo', media_side: 'Right',
    section_title: 'London Executive Guide',
    paragraph: '<p>Flying Business Class across the Atlantic is a race against the clock. On the 7-hour sprint from New York to London, sleep is the ultimate metric. Carriers like American Airlines (Flagship First) and British Airways (Club Suite) prioritize 180-degree lie-flat beds and direct aisle access. Skip the in-flight meal, maximize your rest, and utilize the LHR Arrivals Lounges for a shower and espresso before heading straight to the City.</p>',
    image_single: null, image_large: null, image_small: null,
    cta: { on: true, label: 'Plan the Trip', href: '#lead-modal' },
  },

  validate(props) {
    return all(
      needText(props, 'section_title', 'Section title'),
      needRich(props, 'paragraph', 'Paragraph'),
      props.media_mode === '1 Photo' ? needMedia(props, 'image_single', 'Image') : [],
      props.media_mode === '2 Photos'
        ? all(needMedia(props, 'image_large', 'Large image'), needMedia(props, 'image_small', 'Small image'))
        : [],
      props.cta?.on ? all(needText(props, 'cta.label', 'CTA label'), needText(props, 'cta.href', 'CTA link')) : [],
    );
  },

  css: `
/* Its own container spec, same pattern as Hero/Prices/Feature/Logo Marquee/Story & Specs —
   px/py only here, the default max-width still applies. */
.tm-sec .wrap{max-width:1280px;padding-left:80px;padding-right:80px}
.tm-sec{padding-top:80px;padding-bottom:80px}
.tm{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.tm.media-left .tm-copy{order:2}
.tm-copy .sec-title{margin-bottom:14px}
.tm-body{color:var(--ink-soft);font-size:17px}
.tm-body p{margin:0 0 12px}
.tm-body ul,.tm-body ol{padding-left:22px;margin:0 0 12px}
.tm-cta{margin-top:20px}
.tm-media{display:grid;position:sticky;top:var(--header-offset)}
.tm-media img{width:100%;border-radius:16px;object-fit:cover;aspect-ratio:1/1;display:block}
.tm-media .ph{aspect-ratio:1/1;min-height:0}

/* Two photos: an overlapping pair, not a side-by-side grid. Plain absolute positioning —
   no SVG mask, no clip-path, just two boxes stacked, offset diagonally. Depth comes from a
   cutout stroke matching the section's own background, not a shadow (position:sticky on
   the parent already establishes the containing block these anchor against). */
.tm-media.two{aspect-ratio:1/1}
.tm-media.two .tm-media-small,.tm-media.two .tm-media-big{
  position:absolute;border-radius:16px;overflow:hidden;
  box-shadow:0 0 0 12px var(--section-bg, #fff)}
.tm-media.two .tm-media-small{top:0;left:0;width:42%;z-index:1}
.tm-media.two .tm-media-big{bottom:0;right:0;width:72%;z-index:2}
.tm-media.two img,.tm-media.two .ph{border-radius:0}

/* No photo: the second column doesn't collapse away — the supporting text (paragraph,
   CTA) moves into it instead, so the title keeps a column of its own rather than sharing
   space with everything else (doc 39 §6.1, revised). */
.tm.no-media .tm-title-col .sec-title{margin-bottom:0}

@media (max-width:1023px){
  .tm{grid-template-columns:1fr;gap:28px}
  .tm.media-left .tm-copy{order:0}
  /* Sticky only makes sense beside a taller column; single-stack mobile has no "beside".
     Still relative, not static — the "two photos" overlap positions its images
     absolutely against this element, and static would stop it anchoring them, sending
     them off to the nearest positioned ancestor instead. */
  .tm-media{position:relative}
}
@media (max-width:767px){
  .tm-sec .wrap{max-width:var(--container);padding-left:var(--gutter);padding-right:var(--gutter)}
  .tm-sec{padding-top:var(--section-y);padding-bottom:var(--section-y)}
}
`,

  render(section) {
    const p = section.props || {};
    const mode = p.media_mode || '1 Photo';
    const two = mode === '2 Photos';
    const left = p.media_side === 'Left';
    // This screen's CTA style is Secondary — light neutral fill, dark text — not the
    // dark-filled default `.btn` used elsewhere (Hero, Large Image Banner).
    const cta = p.cta?.on ? `<div class="tm-cta">${ctaLink(p.cta, 'btn btn-secondary')}</div>` : '';

    if (!hasMedia(p)) {
      // The title keeps its own column even without a photo — the supporting text
      // (paragraph, CTA) fills the second column instead of collapsing everything into one
      // full-width block (doc 39 §6.1, revised).
      return dynamicShell(section, `<div class="tm no-media">
        <div class="tm-title-col"><h2 class="sec-title">${esc(p.section_title || '')}</h2></div>
        <div class="tm-copy"><div class="tm-body">${rich(p.paragraph)}</div>${cta}</div>
      </div>`, { withHeader: false, className: 'tm-sec' });
    }

    const copy = `<div class="tm-copy">
      <h2 class="sec-title">${esc(p.section_title || '')}</h2>
      <div class="tm-body">${rich(p.paragraph)}</div>
      ${cta}
    </div>`;

    const media = `<div class="${esc(cls('tm-media', two && 'two'))}">`
      + (two
        ? img(p.image_small, { className: 'tm-media-small', placeholder: 'Small image' })
          + img(p.image_large, { className: 'tm-media-big', placeholder: 'Large image' })
        : img(p.image_single, { placeholder: 'Image' }))
      + `</div>`;

    // Mobile order is always title -> media -> paragraph -> CTA (doc 39 §6.4); the grid
    // handles it by stacking the copy block, which already carries that internal order.
    return dynamicShell(section,
      `<div class="${esc(cls('tm', left && 'media-left'))}">${copy}${media}</div>`,
      { withHeader: false, className: 'tm-sec' });
  },
};
