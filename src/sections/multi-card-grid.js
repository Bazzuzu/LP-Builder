// Multi-Card Grid — spec doc 37, children per doc 51.
import { ARCHETYPE, LEVEL } from '../model/enums.js';
import { blankRich, dynamicShell, esc, img, rich } from '../render/html.js';
import { RT_BASIC, all, headerGroup, isBlank, needMedia, styleGroup } from './_common.js';

/** @type {import('../model/types.js').SectionType} */
export default {
  key: 'SECTION_MULTI_CARD_GRID',
  doc: 37,
  name: 'Multi-Card Grid',
  archetype: ARCHETYPE.DYNAMIC,
  group: 'content',
  icon: '▦',
  description: 'Two to four media cards: either all pictures, or all pictures with copy.',

  fields: [
    styleGroup({ bg: '#FFFFFF', size: 'SIZE_M', align: 'ALIGN_CENTER' }),
    headerGroup(),
    { title: 'Grid', open: true, fields: [
      { key: 'card_count', kind: 'segmented', label: 'Cards', default: 3,
        options: [{ value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4' }],
        help: 'Cards beyond the count are kept, not deleted — switching back restores them.' },
      { key: 'cards', kind: 'repeater', label: 'Cards', min: 2, max: 4, fixed: 'card_count',
        itemTitle: (/** @type {any} */ c, /** @type {number} */ i) => c.title || `Card ${i + 1}`,
        item: { fields: [
          { key: 'image', kind: 'image', label: 'Image' },
          { key: 'title', kind: 'text', label: 'Title' },
          { key: 'paragraph', kind: 'richtext', label: 'Paragraph', tools: RT_BASIC },
        ] } },
      { key: 'footnote', kind: 'richtext', label: 'Footnote', tools: RT_BASIC,
        help: 'Optional legal small print under the grid, e.g. an availability disclaimer.' },
    ] },
  ],

  defaults: {
    bg_color: '#FFFFFF', heading_size: 'SIZE_M', heading_align: 'ALIGN_CENTER',
    section_title: 'Curated in-flight excellence',
    subheading: '<p>Uncompromising luxury across every stage of your transatlantic journey.</p>',
    card_count: 3,
    cards: [
      { image: null, title: 'Michelin-inspired dining', paragraph: '<p>Multi-course à la carte menus paired with sommelier-selected champagnes.</p>' },
      { image: null, title: 'Turn-down service', paragraph: '<p>Full lie-flat suites fitted with Italian cotton linens.</p>' },
      { image: null, title: 'Chauffeur & lounge access', paragraph: '<p>Private terminal escorts and lounge sanctuary access worldwide.</p>' },
      { image: null, title: '', paragraph: '' },
    ],
    footnote: '',
  },

  validate(props) {
    const active = activeCards(props);
    /** @type {import('../model/types.js').Issue[]} */
    const out = [];

    active.forEach((c, i) => {
      out.push(...needMedia({ image: c.image }, 'image', `Card ${i + 1} image`)
        .map((x) => ({ ...x, path: `cards.${i}.${x.path}` })));
    });

    // All-or-nothing: the grid is either pure imagery or fully written (doc 37 §6.2).
    const withText = active.filter((c) => !isBlank(c.title) || !isBlank(stripped(c.paragraph)));
    const complete = active.filter((c) => !isBlank(c.title) && !isBlank(stripped(c.paragraph)));
    if (withText.length && complete.length !== active.length) {
      out.push({ level: LEVEL.L1, code: 'E102', path: 'cards',
        message: 'Text consistency violation: either every card has a title and a paragraph, or all cards are image-only.' });
    }
    return all(out);
  },

  css: `
.mcg{display:grid;gap:24px}
.mcg.n2{grid-template-columns:repeat(2,1fr)}
.mcg.n3{grid-template-columns:repeat(3,1fr)}
.mcg.n4{grid-template-columns:repeat(4,1fr)}
.mcg-card{text-align:left}
.mcg-card img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:14px}
.mcg-card .ph{aspect-ratio:4/3;min-height:0}
.mcg-t{font-weight:650;font-size:18px;margin-top:14px;letter-spacing:-.01em}
.mcg-p{color:var(--ink-soft);font-size:15px;margin-top:6px}
.mcg-p p{margin:0}
.mcg-note{margin-top:32px;font-size:12.5px;color:var(--ink-faint);text-align:center;line-height:1.5}
.mcg-note p{margin:0}
@media (max-width:1023px){ .mcg.n3,.mcg.n4{grid-template-columns:repeat(2,1fr)} }
@media (max-width:767px){ .mcg,.mcg.n2,.mcg.n3,.mcg.n4{grid-template-columns:1fr} }
`,

  render(section) {
    const p = section.props || {};
    const active = activeCards(p);
    const n = active.length;
    return dynamicShell(section, `<div class="mcg n${n}">
      ${active.map((c) => `<div class="mcg-card">
        ${img(c.image, { placeholder: 'Card image' })}
        ${isBlank(c.title) ? '' : `<div class="mcg-t">${esc(c.title)}</div>`}
        ${isBlank(stripped(c.paragraph)) ? '' : `<div class="mcg-p">${rich(c.paragraph)}</div>`}
      </div>`).join('')}
    </div>
    ${blankRich(p.footnote) ? '' : `<div class="mcg-note">${rich(p.footnote)}</div>`}`);
  },
};

/** The leading `card_count` cards. The rest stay in the document, inactive. */
const activeCards = (p) => (p.cards || []).slice(0, Number(p.card_count) || 3);
const stripped = (/** @type {any} */ h) => String(h ?? '').replace(/<[^>]*>/g, '').trim();
