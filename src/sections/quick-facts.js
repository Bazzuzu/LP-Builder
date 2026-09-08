// Story & Specs — spec doc 36 (internal key SECTION_QUICK_FACTS is unchanged; renaming that
// touches the canonical registry, the doc filename and any already-saved pages — this is
// the display name only). Narrative text, a photo pairing, and a vertical list of labelled
// facts — one of several content+media combinations this section type is meant to cover,
// not literally a "quick facts" widget.
import { ARCHETYPE, LEVEL } from '../model/enums.js';
import { blankRich, dynamicShell, esc, img, rich } from '../render/html.js';
import { RT_FULL, all, imgField, isBlank, needMedia, needRich, needText, styleGroup } from './_common.js';

/** @type {import('../model/types.js').SectionType} */
export default {
  key: 'SECTION_QUICK_FACTS',
  doc: 36,
  name: 'Story & Specs',
  archetype: ARCHETYPE.DYNAMIC,
  group: 'content',
  icon: '◲',
  description: 'Narrative text, a photo pairing and a list of specs. Fixed layout, no media-side flip.',

  fields: [
    styleGroup({ bg: '#FFFFFF', size: 'SIZE_M', align: 'ALIGN_LEFT' }),
    { title: 'Content', open: true, fields: [
      { key: 'section_title', kind: 'text', label: 'Section title', required: true },
      { key: 'primary_paragraph', kind: 'richtext', label: 'Lead paragraph', required: true, tools: RT_FULL },
      { key: 'secondary_paragraph', kind: 'richtext', label: 'Footnote', tools: RT_FULL,
        help: 'Optional small print under the fact list, e.g. a disclaimer.' },
    ] },
    { title: 'Facts', open: true, fields: [
      { key: 'cards', kind: 'repeater', label: 'Facts', min: 2, max: 4, addLabel: '+ Add fact',
        itemTitle: (/** @type {any} */ c, /** @type {number} */ i) => c.title || `Fact ${i + 1}`,
        help: 'Facts 1 and 2 are mandatory. A fact with only one of its two fields filled is an error, never a silent drop.',
        item: { fields: [
          { key: 'title', kind: 'text', label: 'Label', placeholder: 'Emirates Airlines' },
          // Formatting parity with other rich fields for now — this becomes the shared
          // caption/paragraph editor once that component is standardised across sections.
          { key: 'paragraph', kind: 'richtext', label: 'Caption', tools: RT_FULL },
        ] } },
    ] },
    { title: 'Media', open: false, fields: [
      imgField('upload_small_1', 'Thumbnail 1'),
      imgField('upload_small_2', 'Thumbnail 2'),
      imgField('upload_big', 'Featured image', { hint: 'Container clamps to 400–640px, object-fit: cover.' }),
    ] },
  ],

  defaults: {
    bg_color: '#FFFFFF', heading_size: 'SIZE_M', heading_align: 'ALIGN_LEFT',
    section_title: 'The Emirates A380 blueprint',
    primary_paragraph: '<p>Experience the pinnacle of transatlantic travel. The A380 offers unparalleled space, a dedicated onboard lounge, and direct aisle access for ultimate productivity.</p>',
    secondary_paragraph: '<p>Aircraft types and lounge availability are subject to operational changes. Your concierge will verify the exact configuration before booking.</p>',
    cards: [
      { title: 'Emirates Airlines', paragraph: '<p>Skytrax 5-Star<br>Chauffeur-drive</p>' },
      { title: 'Airbus A380-800', paragraph: '<p>Iconic Onboard Bar<br>Whisper-quiet</p>' },
      { title: 'Fully Flat Suite', paragraph: '<p>1-2-1 Layout<br>Mini-bar built in</p>' },
      { title: 'Concourse A Lounge', paragraph: '<p>Direct Boarding<br>Moët &amp; Chandon Bar</p>' },
    ],
    upload_big: null, upload_small_1: null, upload_small_2: null,
  },

  validate(props) {
    const cards = props.cards || [];
    /** @type {import('../model/types.js').Issue[]} */
    const cardIssues = [];
    for (let i = 0; i < Math.max(2, cards.length); i++) {
      const c = cards[i] || {};
      const hasTitle = !isBlank(c.title);
      const hasText = !blankRich(c.paragraph);
      if (i < 2 && (!hasTitle || !hasText)) {
        cardIssues.push({ level: LEVEL.L1, code: 'E100', path: `cards.${i}`,
          message: `Fact ${i + 1} is mandatory — fill in both the label and its caption.` });
      } else if (i >= 2 && hasTitle !== hasText) {
        // Doc 36 §6.2: a half-filled optional fact is an error, not a silent disappearance.
        cardIssues.push({ level: LEVEL.L1, code: 'E100', path: `cards.${i}`,
          message: `Fact ${i + 1} has only one of its two fields filled. Complete it or clear it.` });
      }
    }
    return all(
      needText(props, 'section_title', 'Section title'),
      needRich(props, 'primary_paragraph', 'Lead paragraph'),
      cardIssues,
      needMedia(props, 'upload_big', 'Featured image'),
      needMedia(props, 'upload_small_1', 'Thumbnail 1'),
      needMedia(props, 'upload_small_2', 'Thumbnail 2'),
    );
  },

  css: `
.qf{display:grid;grid-template-columns:0.9fr 1.5fr 1fr;gap:48px;align-items:start}
.qf-media{display:grid;grid-template-columns:1fr 1fr;gap:14px;height:clamp(400px,38vw,560px)}
.qf-media>*{border-radius:14px;overflow:hidden}
.qf-media img{width:100%;height:100%;object-fit:cover}
.qf-media .ph{height:100%;min-height:0}
.qf-small-1{grid-column:1;grid-row:1}
.qf-small-2{grid-column:1;grid-row:2}
.qf-big{grid-column:2;grid-row:1/3}
.qf-facts{display:flex;flex-direction:column;gap:26px}
.qf-fact-t{font-weight:var(--title-weight);font-size:19px;letter-spacing:-.01em;margin-bottom:6px}
.qf-fact-p{font-size:14.5px;color:var(--ink-soft);line-height:1.5}
.qf-fact-p p{margin:0 0 4px}
.qf-fact-p p:last-child{margin-bottom:0}
.qf-note{font-size:12.5px;color:var(--ink-faint);line-height:1.5;margin-top:4px}
@media (max-width:1023px){
  .qf{grid-template-columns:1fr;gap:32px}
  .qf-media{height:clamp(320px,70vw,480px)}
}
`,

  render(section) {
    const p = section.props || {};
    const facts = (p.cards || []).filter((/** @type {any} */ c, /** @type {number} */ i) =>
      i < 2 || (!isBlank(c.title) && !blankRich(c.paragraph)));

    const copy = `<div class="qf-copy">
      <div class="sec-sub">${rich(p.primary_paragraph)}</div>
    </div>`;

    const media = `<div class="qf-media">
      <div class="qf-small-1">${img(p.upload_small_1, { placeholder: 'Thumb 1' })}</div>
      <div class="qf-small-2">${img(p.upload_small_2, { placeholder: 'Thumb 2' })}</div>
      <div class="qf-big">${img(p.upload_big, { placeholder: 'Featured' })}</div>
    </div>`;

    const factsList = `<div class="qf-facts">
      ${facts.map((/** @type {any} */ c) => `<div class="qf-fact">
        <div class="qf-fact-t">${esc(c.title || '')}</div>
        ${blankRich(c.paragraph) ? '' : `<div class="qf-fact-p">${rich(c.paragraph)}</div>`}
      </div>`).join('')}
      ${blankRich(p.secondary_paragraph) ? '' : `<div class="qf-note">${rich(p.secondary_paragraph)}</div>`}
    </div>`;

    // Fixed order — text, media, facts — matching the reference layout. No media-side flip:
    // unlike Text & Media, this section always reads left to right in this one arrangement.
    return dynamicShell(section, `<div class="qf">${copy}${media}${factsList}</div>`);
  },
};
