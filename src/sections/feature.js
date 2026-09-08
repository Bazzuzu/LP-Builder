// Feature — spec doc 41. Icon size and paragraph visibility are consequences of which
// preset is picked, not independent knobs — 64px only ever belongs to Highlighted, and a
// missing paragraph is what DEFINES Compact rather than something layered on top of it.
// `item_count` is the one dimension that genuinely varies independently of the preset.
import { ARCHETYPE } from '../model/enums.js';
import { blankRich, dynamicShell, esc, img, rich } from '../render/html.js';
import { RT_BASIC, all, headerGroup, needMedia, needRich, needText, styleGroup } from './_common.js';

/** The three presets (doc 41 §4.3). Selecting one is the only way `icon_size` and
 * `has_paragraph` change — there is no independent control for either. */
export const PRESETS = {
  Highlighted: { icon_size: 64, item_count: 3, has_paragraph: true },
  Standard: { icon_size: 48, item_count: 3, has_paragraph: true },
  Compact: { icon_size: 48, item_count: 3, has_paragraph: false },
};

/** @type {import('../model/types.js').SectionType} */
export default {
  key: 'SECTION_FEATURE',
  doc: 41,
  name: 'Feature',
  archetype: ARCHETYPE.DYNAMIC,
  group: 'intermediate',
  icon: '✦',
  description: 'Icon + title (+ paragraph) items, in three presets: Highlighted, Standard, Compact.',

  fields: [
    styleGroup({ bg: '#FFFFFF', size: 'SIZE_M', align: 'ALIGN_CENTER' }),
    headerGroup({ open: false }),
    { title: 'Presentation', open: true, fields: [
      { key: '_preset', kind: 'preset', label: 'Preset', options: Object.keys(PRESETS).map((k) => ({ value: k, label: k })),
        applies: PRESETS,
        help: 'Sets the icon size and layout. Highlighted and Standard show a paragraph; Compact is icon + label only — that is what makes it Compact, not a separate toggle.' },
      { key: 'item_count', kind: 'segmented', label: 'Items', default: 3,
        options: [{ value: 3, label: '3' }, { value: 4, label: '4' }],
        // Highlighted is fixed at exactly 3 (doc 41 §4.3); only Standard and Compact — the
        // two 48px presets — let the count vary. `icon_size` is what actually distinguishes
        // them, since neither is stored as its own "which preset" flag.
        when: (/** @type {any} */ p) => Number(p.icon_size) !== 64 },
    ] },
    { title: 'Items', open: true, fields: [
      { key: 'items', kind: 'repeater', label: 'Items', min: 3, max: 4, fixed: 'item_count',
        itemTitle: (/** @type {any} */ it, /** @type {number} */ i) => it.title || `Item ${i + 1}`,
        item: { fields: [
          { key: 'icon', kind: 'image', label: 'Icon', decorative: true },
          { key: 'title', kind: 'text', label: 'Title' },
          { key: 'paragraph', kind: 'richtext', label: 'Paragraph', tools: RT_BASIC,
            when: (/** @type {any} */ p) => p.has_paragraph !== false },
        ] } },
    ] },
  ],

  defaults: {
    bg_color: '#FFFFFF', heading_size: 'SIZE_M', heading_align: 'ALIGN_CENTER',
    section_title: 'Why discerning travellers book with us',
    subheading: '<p>Industry-leading contracts paired with white-glove concierge management.</p>',
    icon_size: 64, item_count: 3, has_paragraph: true,
    items: [
      { icon: null, title: 'Wholesale fare privilege',
        paragraph: '<p>Up to 70% off published business and first class fares via private consolidator contracts.</p>' },
      { icon: null, title: 'Dedicated personal agent',
        paragraph: '<p>Direct access to a senior specialist who manages your booking, seats and routing 24/7.</p>' },
      { icon: null, title: 'Complete journey protection',
        paragraph: '<p>Flight monitoring, fee-free date changes and emergency re-routing assistance.</p>' },
      { icon: null, title: 'Best fare guarantee', paragraph: '<p>Matched or bettered against any comparable quote.</p>' },
    ],
  },

  validate(props) {
    const items = activeItems(props);
    return all(...items.flatMap((it, i) => [
      needMedia({ icon: it.icon }, 'icon', `Item ${i + 1} icon`, { decorative: true })
        .map((x) => ({ ...x, path: `items.${i}.icon` })),
      needText(it, 'title', `Item ${i + 1} title`).map((x) => ({ ...x, path: `items.${i}.title` })),
      props.has_paragraph !== false
        ? needRich(it, 'paragraph', `Item ${i + 1} paragraph`).map((x) => ({ ...x, path: `items.${i}.paragraph` }))
        : [],
    ]));
  },

  css: `
.ft{display:grid;gap:28px}
.ft.n3{grid-template-columns:repeat(3,1fr)}
.ft.n4{grid-template-columns:repeat(4,1fr)}

/* Highlighted (icon 64px): vertical stack, centred when the section header is centred. */
.ft-item{display:flex;flex-direction:column;gap:14px}
.sec.a-center .ft-item{align-items:center}

.ft-icon{display:flex;align-items:center;justify-content:center;flex:0 0 auto;
  background:var(--bg-light-grey);border-radius:14px}
.ft-icon img{width:100%;height:100%;object-fit:contain}
.ft-icon .ph{width:100%;height:100%;min-height:0;font-size:10px;border-radius:14px}
.ft-t{font-weight:var(--title-weight);font-size:18px;letter-spacing:-.01em}
.ft-p{color:var(--ink-soft);font-size:15px}
.ft-p p{margin:0}

/* Standard (icon 48px, has a paragraph): icon left, text right, left-aligned regardless
   of the section's own heading alignment — doc 41's three presets read as three distinct
   layouts, not one card with a smaller icon. */
.ft.row{gap:32px 28px}
.ft.row .ft-item{flex-direction:row;align-items:flex-start;text-align:left;gap:14px}

/* Compact (no paragraph): icon + single-line label in a row, divided like a stat strip. */
.ft.bullets{gap:16px 28px}
.ft.bullets .ft-item{flex-direction:row;align-items:center;gap:12px;text-align:left;
  padding-left:20px;border-left:1px solid var(--line)}
.ft.bullets .ft-item:first-child{padding-left:0;border-left:0}
.ft.bullets .ft-t{font-size:16px;font-weight:600}

@media (max-width:1023px){
  .ft.n4{grid-template-columns:repeat(2,1fr)}
  .ft.n3{grid-template-columns:1fr}
  .ft.row.n3{grid-template-columns:repeat(2,1fr)}
  .ft.bullets.n3,.ft.bullets.n4{grid-template-columns:repeat(2,1fr)}
}
@media (max-width:767px){
  .ft.n3,.ft.n4,.ft.row.n3,.ft.row.n4{grid-template-columns:1fr}
  .ft.bullets.n3,.ft.bullets.n4{grid-template-columns:repeat(2,1fr)}
  .ft.bullets .ft-item:nth-child(2n){padding-left:20px;border-left:1px solid var(--line)}
  .ft.bullets .ft-item:nth-child(odd){padding-left:0;border-left:0}
}
`,

  render(section) {
    const p = section.props || {};
    const size = Number(p.icon_size) === 64 ? 64 : 48;
    const withText = p.has_paragraph !== false;
    // Three presets, three layouts — derived from the same two values that define the
    // preset itself, so there is nothing new to keep in sync.
    const layout = !withText ? 'bullets' : (size === 64 ? '' : 'row');
    const items = activeItems(p);

    return dynamicShell(section, `<div class="ft n${items.length} ${layout}">
      ${items.map((it) => `<div class="ft-item">
        <div class="ft-icon" style="width:${size}px;height:${size}px">
          ${img(it.icon, { decorative: true, placeholder: 'Icon' })}
        </div>
        <div>
          <div class="ft-t">${esc(it.title || '')}</div>
          ${withText && !blankRich(it.paragraph) ? `<div class="ft-p">${rich(it.paragraph)}</div>` : ''}
        </div>
      </div>`).join('')}
    </div>`);
  },
};

/**
 * The leading `item_count` items. Items beyond it stay in the document so that lowering
 * and raising the count is lossless (doc 41 §6.1).
 */
const activeItems = (p) => (p.items || []).slice(0, Number(p.item_count) || 3);
