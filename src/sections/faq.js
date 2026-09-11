// FAQ — an optional, fully page-level accordion. No spec document of its own; it follows
// the container and heading conventions every other section already shares.
//
// Built on native <details>/<summary>, so the accordion works in the exported file with no
// JavaScript at all — the same document the preview shows is the one that ships.
import { ARCHETYPE } from '../model/enums.js';
import { blankRich, cls, dynamicShell, esc, rich } from '../render/html.js';
import {
  RT_BASIC, RT_FULL, advancedGroup, all, appearanceGroup, contentGroup, headingFields,
  isBlank, needRich, needText,
} from './_common.js';

const MAX_ITEMS = 20;

/** @type {import('../model/types.js').SectionType} */
export default {
  key: 'SECTION_FAQ',
  doc: 0,
  name: 'FAQ',
  archetype: ARCHETYPE.DYNAMIC,
  group: 'content',
  icon: '?',
  description: 'Collapsible questions and answers, in one or two columns.',

  fields: [
    contentGroup(headingFields({ size: 'SIZE_L', subLabel: 'Subtitle',
      subHelp: 'Hidden when empty. Takes a link, e.g. to a dedicated FAQ page.' })),
    { title: 'Questions', open: true, fields: [
      { key: 'columns', kind: 'segmented', label: 'Columns', default: 2,
        options: [{ value: 1, label: '1' }, { value: 2, label: '2' }] },
      { key: 'start_open', kind: 'toggle', label: 'Open by default', default: true,
        help: 'Whether every answer is already expanded when the page loads.' },
      { key: 'items', kind: 'repeater', label: '', addLabel: '+ Add question',
        min: 1, max: MAX_ITEMS,
        itemTitle: (/** @type {any} */ it, /** @type {number} */ i) => it.question || `Question ${i + 1}`,
        item: { fields: [
          { key: 'question', kind: 'text', label: 'Question', required: true,
            placeholder: 'How long does it take to fly from New York to London?' },
          { key: 'answer', kind: 'richtext', label: 'Answer', required: true, tools: RT_BASIC },
        ] } },
    ] },
    appearanceGroup({ bg: '#FFFFFF' }),
    advancedGroup(),
  ],

  defaults: {
    bg_color: '#FFFFFF', heading_size: 'SIZE_L', heading_align: 'ALIGN_LEFT',
    section_title: 'Frequently asked questions',
    subheading: '<p>More answers can be found on the dedicated <a href="/faq">FAQ</a> page</p>',
    columns: 2,
    start_open: true,
    items: [
      { question: 'When is the cheapest time to fly from New York to London?',
        answer: '<p>The cheapest month to fly from New York to London is usually January.</p>' },
      { question: 'Which is the cheapest airport to fly into in London?',
        answer: '<p>If you’re flying from New York, the cheapest airport near London is London Gatwick — which is 40.3 km away from the centre of London. We’ve found flights into this airport from 1,333 USD.</p>' },
      { question: 'How much are return flights from New York to London?',
        answer: '<p>The best price we found for a return flight from New York to London is 1,333 USD. This is an estimate based on information collected from different airlines and travel providers over the last 4 days and is subject to change and availability.</p>' },
      { question: 'How long does it take to fly from New York to London?',
        answer: '<p>7 hours and 11 minutes is the average flight time from New York to London.</p>' },
    ],
  },

  validate(props) {
    const items = activeItems(props);
    if (!items.length) {
      return [{ level: /** @type {'L1'} */ ('L1'), code: 'E100', path: 'items',
        message: 'FAQ section must contain at least one question.' }];
    }
    return all(...items.flatMap((/** @type {any} */ it, /** @type {number} */ i) => [
      needText(it, 'question', `Question ${i + 1}`).map((x) => ({ ...x, path: `items.${i}.question` })),
      needRich(it, 'answer', `Question ${i + 1} answer`).map((x) => ({ ...x, path: `items.${i}.answer` })),
    ]));
  },

  css: `
/* The shared container spec — px/py/max-width — same as Prices, Feature, Trust and the rest. */
.faq-sec .wrap{max-width:1280px;padding:0 80px}
.faq-sec{padding:80px 0}
.faq-sec .sec-head{margin-bottom:40px}
.faq-list{display:grid;gap:0 40px;align-content:start}
.faq-list.c2{grid-template-columns:1fr 1fr}

/* Rows stretch, so the rule under each entry lines up with its neighbour's across the
   column gap even when one answer runs longer than the other. */
.faq-item{border-bottom:1px solid var(--line);padding:24px 0}
.faq-item.last-row{border-bottom:0}

.faq-q{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;
  cursor:pointer;list-style:none;font-weight:var(--title-weight);font-size:16px;
  line-height:1.4;letter-spacing:-.01em}
.faq-q::-webkit-details-marker{display:none}
.faq-q:hover{color:var(--bronze)}
/* Drawn from two borders rather than a glyph or an SVG: it is two lines, it inherits
   colour, and it rotates between the two states with nothing to swap out. */
.faq-chev{flex:0 0 auto;width:8px;height:8px;margin-top:5px;color:var(--bronze);
  border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;
  transform:rotate(45deg);transition:transform .18s ease}
.faq-item[open] .faq-chev{transform:rotate(-135deg);margin-top:8px}
.faq-a{margin-top:16px;color:var(--ink-soft);font-size:16px;line-height:1.5}
.faq-a p{margin:0 0 8px}
.faq-a p:last-child{margin-bottom:0}
.faq-a a{color:inherit;text-decoration:underline}

/* The grid collapses here, so the divider correction belongs here too. The last-row flag is
   written into the HTML from the DESKTOP column count; once there is one column, "last row"
   is the last item and nothing else, and that flag is no longer true about the layout.
   Keeping this correction in the 767px query left a gap between 768 and 1023 where a stacked
   two-column FAQ dropped a divider in the middle of the list.
   (No backticks anywhere in this string: the whole css block is a JS template literal.) */
@media (max-width:1023px){
  .faq-list.c2{grid-template-columns:1fr}
  .faq-item{border-bottom:1px solid var(--line)}
  .faq-item:last-child{border-bottom:0}
}
@media (max-width:767px){
  .faq-sec .wrap{max-width:var(--container);padding:0 var(--gutter)}
  .faq-sec{padding:var(--section-y) 0}
}
`,

  render(section) {
    const p = section.props || {};
    const items = activeItems(p);
    const cols = Number(p.columns) === 1 ? 1 : 2;
    const open = p.start_open !== false;
    // Which entries sit in the bottom row, so the list closes on text rather than on a rule.
    const lastRowFrom = items.length - ((items.length % cols) || cols);

    return dynamicShell(section, `<div class="${esc(cls('faq-list', `c${cols}`))}">
      ${items.map((it, i) => `<details class="${esc(cls('faq-item', i >= lastRowFrom && 'last-row'))}"${open ? ' open' : ''}>
        <summary class="faq-q">${esc(it.question || '')}<span class="faq-chev" aria-hidden="true"></span></summary>
        <div class="faq-a">${rich(it.answer)}</div>
      </details>`).join('')}
    </div>`, { className: 'faq-sec' });
  },
};

/** Entries with anything in them. A blank trailing row should not draw an empty accordion. */
const activeItems = (/** @type {any} */ p) =>
  (p.items || []).filter((/** @type {any} */ it) => !isBlank(it?.question) || !blankRich(it?.answer));
