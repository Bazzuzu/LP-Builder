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
/* Four independent columns, not three — the two photo groups are separate tracks so their
   widths aren't forced to split one column down the middle. The row's height tracks
   whichever column has the most content (usually the facts list): minmax(400px,auto) gives
   it a 400px floor without forcing shorter content up to a fixed value — grid_template_rows
   with two FIXED lengths, e.g. minmax(400px,640px), always resolves to the max in an
   auto-height container regardless of content, which is not "clamp to content" at all. The
   640px ceiling is enforced separately below, on the container itself. */
.qf{display:grid;grid-template-columns:0.9fr 0.75fr 0.75fr 1fr;grid-template-rows:minmax(400px,auto);
  max-height:640px;gap:32px;align-items:stretch}
/* The lead paragraph sits on the column's own bottom edge — space-between, not a margin —
   so it lines up with the bottom of the photo columns regardless of how tall the row grows. */
.qf-copy{display:flex;flex-direction:column;gap:16px;height:100%;justify-content:space-between}
.qf-title{margin:0;font-size:var(--h-m);font-weight:var(--h-weight);letter-spacing:-.02em;line-height:1.2}
.qf-lead{color:var(--ink-soft);font-size:var(--body-l)}
.qf-lead p{margin:0}
.qf-stack{display:flex;flex-direction:column;gap:14px;height:100%}
.qf-stack>*{flex:1;min-height:0;border-radius:14px;overflow:hidden}
.qf-stack img{width:100%;height:100%;object-fit:cover}
.qf-stack .ph{height:100%;min-height:0}
.qf-big{height:100%;border-radius:14px;overflow:hidden}
.qf-big img{width:100%;height:100%;object-fit:cover}
.qf-big .ph{height:100%;min-height:0}
/* overflow-y:auto is the escape hatch for the rare case where facts content genuinely needs
   more than 640px — it scrolls in place instead of forcing the row (and so the photo
   columns) past the ceiling above. */
.qf-facts{display:flex;flex-direction:column;gap:26px;max-height:100%;overflow-y:auto}
.qf-fact-t{font-weight:var(--title-weight);font-size:19px;letter-spacing:-.01em;margin-bottom:6px}
.qf-fact-p{font-size:14.5px;color:var(--ink-soft);line-height:1.5}
.qf-fact-p p{margin:0 0 4px}
.qf-fact-p p:last-child{margin-bottom:0}
.qf-note{font-size:12.5px;color:var(--ink-faint);line-height:1.5;margin-top:4px}
@media (max-width:1023px){
  .qf{grid-template-columns:1fr;grid-template-rows:none;max-height:none;gap:32px}
  .qf-copy{height:auto;justify-content:flex-start}
  .qf-stack,.qf-big{height:clamp(280px,70vw,420px)}
  .qf-facts{max-height:none;overflow-y:visible}
}
`,

  render(section) {
    const p = section.props || {};
    const facts = (p.cards || []).filter((/** @type {any} */ c, /** @type {number} */ i) =>
      i < 2 || (!isBlank(c.title) && !blankRich(c.paragraph)));

    const copy = `<div class="qf-copy">
      <h2 class="qf-title">${esc(p.section_title || '')}</h2>
      <div class="qf-lead">${rich(p.primary_paragraph)}</div>
    </div>`;

    const stack = `<div class="qf-stack">
      <div>${img(p.upload_small_1, { placeholder: 'Thumb 1' })}</div>
      <div>${img(p.upload_small_2, { placeholder: 'Thumb 2' })}</div>
    </div>`;

    const big = `<div class="qf-big">${img(p.upload_big, { placeholder: 'Featured' })}</div>`;

    const factsList = `<div class="qf-facts">
      ${facts.map((/** @type {any} */ c) => `<div class="qf-fact">
        <div class="qf-fact-t">${esc(c.title || '')}</div>
        ${blankRich(c.paragraph) ? '' : `<div class="qf-fact-p">${rich(c.paragraph)}</div>`}
      </div>`).join('')}
      ${blankRich(p.secondary_paragraph) ? '' : `<div class="qf-note">${rich(p.secondary_paragraph)}</div>`}
    </div>`;

    // Fixed order — text, photo stack, featured photo, facts — matching the reference
    // layout. No media-side flip: unlike Text & Media, this always reads left to right.
    // The section's own title/subheading header is skipped (withHeader: false) — the title
    // lives inside the first column instead, sharing its height with the other three.
    return dynamicShell(section, `<div class="qf">${copy}${stack}${big}${factsList}</div>`, { withHeader: false });
  },
};
