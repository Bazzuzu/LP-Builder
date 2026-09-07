// Prices — spec doc 31, with its child rows from doc 50. Fixed anchor, slot 02.
import { ARCHETYPE, CABIN_CLASSES, INK, LEVEL, REGIONS } from '../model/enums.js';
import { uid } from '../util.js';
import { attr, blankRich, cls, esc, img, rich, style } from '../render/html.js';
import { RT_FULL, all, imgField, isBlank, needText } from './_common.js';

const MAX_ROWS = 30;

/** @type {import('../model/types.js').SectionType} */
export default {
  key: 'SECTION_PRICES',
  doc: 31,
  name: 'Prices',
  archetype: ARCHETYPE.ANCHOR,
  icon: '≡',
  description: 'The transactional anchor: route fares, sticky media and the lead dispatch.',

  fields: [
    { title: 'Header', open: true, fields: [
      { key: 'section_title', kind: 'text', label: 'Section title', help: 'Hidden when empty.' },
      { key: 'title_color', kind: 'color', label: 'Title colour', default: INK },
      { key: 'title_weight', kind: 'segmented', label: 'Title weight', default: 'Bold',
        options: [{ value: 'Regular', label: 'Regular' }, { value: 'Bold', label: 'Bold' }] },
      { key: 'title_italic', kind: 'toggle', label: 'Italic', default: false },
      { key: 'subheading', kind: 'richtext', label: 'Subheading', tools: RT_FULL, help: 'Hidden when empty.' },
    ] },

    { title: 'Media', open: false, fields: [
      { key: 'media_layout_type', kind: 'segmented', label: 'Images', default: '1 Image',
        options: [{ value: '1 Image', label: '1' }, { value: '2 Images', label: '2' }] },
      imgField('media_image_single', 'Image', { ratio: '1:1',
        when: (/** @type {any} */ p) => p.media_layout_type !== '2 Images' }),
      imgField('media_image_large', 'Large image', { ratio: '1:1',
        when: (/** @type {any} */ p) => p.media_layout_type === '2 Images' }),
      imgField('media_image_small', 'Small image', { ratio: '1:1',
        when: (/** @type {any} */ p) => p.media_layout_type === '2 Images' }),
    ] },

    { title: 'Table', open: true, fields: [
      { key: 'table_headline_left', kind: 'text', label: 'Left column heading', default: 'Route & Cabin' },
      { key: 'table_headline_right', kind: 'text', label: 'Right column heading', default: 'Published / Our Fare' },
      { key: 'region_tabs_enabled', kind: 'toggle', label: 'Region tabs', default: false,
        help: 'Shown only when the rows span two or more regions besides Global.' },
      { key: 'show_global_labels_1_2', kind: 'toggle', label: 'Show route details', default: true },
      { key: 'show_global_label_3', kind: 'toggle', label: 'Show price badges', default: true },
      { key: 'show_global_anchor_price', kind: 'toggle', label: 'Show published fares', default: true },
      { key: 'show_global_airline_logo', kind: 'toggle', label: 'Show airline logos', default: true },
    ] },

    { title: 'Rows', open: true, fields: [
      { key: 'rows', kind: 'repeater', label: 'Price rows', addLabel: '+ Add row', min: 1, max: MAX_ROWS,
        itemTitle: (/** @type {any} */ r, /** @type {number} */ i) => r.row_title || `Row ${i + 1}`,
        bulkImport: 'prices',
        item: { fields: [
          { key: 'row_title', kind: 'text', label: 'Title', required: true, placeholder: 'London (LHR)' },
          { key: 'label_1', kind: 'text', label: 'Detail 1', placeholder: 'Business Class' },
          { key: 'label_2', kind: 'text', label: 'Detail 2', placeholder: 'Nonstop' },
          { key: 'price_value', kind: 'text', label: 'Our fare', required: true, placeholder: '1,234' },
          { key: 'anchor_price_value', kind: 'text', label: 'Published fare', placeholder: '4,321' },
          { key: 'cabin_class', kind: 'select', label: 'Cabin', default: 'Business',
            options: CABIN_CLASSES.map((c) => ({ value: c, label: c })),
            help: 'Machine-readable — hydrates the lead modal.' },
          { key: 'label_3', kind: 'text', label: 'Badge above price', placeholder: 'Special fare' },
          { key: 'label_3_is_strikethrough', kind: 'toggle', label: 'Strike the badge', default: false },
          imgField('airline_logo', 'Airline logo', { ratio: '1:1', decorative: true }),
          { key: 'region', kind: 'select', label: 'Region', default: 'Global',
            options: REGIONS.map((r) => ({ value: r, label: r })) },
          { key: 'text_color', kind: 'color', label: 'Row text colour', default: INK },
        ] } },
    ] },

    { title: 'Footnote', open: false, fields: [
      { key: 'footer_paragraph', kind: 'richtext', label: 'Disclaimer', tools: RT_FULL,
        help: 'Placed under the table. Hidden when empty.' },
    ] },
  ],

  defaults: {
    section_title: 'Our fares to London',
    title_color: INK, title_weight: 'Bold', title_italic: false,
    media_layout_type: '1 Image',
    table_headline_left: 'Route & Cabin', table_headline_right: 'Published / Our Fare',
    region_tabs_enabled: false,
    show_global_labels_1_2: true, show_global_label_3: true,
    show_global_anchor_price: true, show_global_airline_logo: true,
    rows: [
      newRow({ row_title: 'London (LHR)', price_value: '1,234', anchor_price_value: '4,321',
        label_1: 'Business Class', label_2: 'Nonstop', region: 'Europe' }),
      newRow({ row_title: 'Paris (CDG)', price_value: '1,180', anchor_price_value: '3,900',
        label_1: 'Business Class', label_2: '1 stop', label_3: 'Special fare', region: 'Europe' }),
      newRow({ row_title: 'Tokyo (HND)', price_value: '2,940', anchor_price_value: '7,450',
        label_1: 'First Class', label_2: 'Nonstop', cabin_class: 'First', region: 'Asia' }),
    ],
    footer_paragraph: '<p>Fares shown are per person including taxes and subject to availability.</p>',
  },

  validate(props) {
    const rows = props.rows || [];
    if (!rows.length) {
      return [{ level: LEVEL.L1, code: 'E103', path: 'rows',
        message: 'Prices section must contain at least 1 price row.' }];
    }
    return all(...rows.flatMap((/** @type {any} */ r, /** @type {number} */ i) => [
      needText(r, 'row_title', `Row ${i + 1} title`).map((x) => ({ ...x, path: `rows.${i}.row_title` })),
      needText(r, 'price_value', `Row ${i + 1} fare`).map((x) => ({ ...x, path: `rows.${i}.price_value` })),
    ]));
  },

  css: `
.prices{padding:var(--section-y) 0}
.prices-grid{display:grid;grid-template-columns:360px 1fr;gap:48px;align-items:start}
.prices-grid.no-media{grid-template-columns:1fr}
.prices-media{display:grid;position:sticky;top:var(--header-offset)}
.prices-media img{width:100%;border-radius:16px;object-fit:cover;aspect-ratio:1/1;display:block}
.prices-media .ph{aspect-ratio:1/1;min-height:0}
/* Two photos: an overlapping pair, matching Text & Media's collage — a cutout stroke in the
   section's own background stands in for a shadow, so it reads correctly on any bg colour. */
.prices-media.two{aspect-ratio:1/1}
.prices-media.two .pm-small,.prices-media.two .pm-big{
  position:absolute;border-radius:16px;overflow:hidden;
  box-shadow:0 0 0 12px var(--section-bg, #fff)}
.prices-media.two .pm-small{top:0;left:0;width:42%;z-index:1}
.prices-media.two .pm-big{bottom:0;right:0;width:72%;z-index:2}
.prices-media.two img,.prices-media.two .ph{border-radius:0}
.prices-title{margin:0 0 12px;font-size:32px;letter-spacing:-.02em;line-height:1.2}
.prices-title.regular{font-weight:500}
.prices-title.italic{font-style:italic}
.prices-sub{color:var(--ink-soft);margin-bottom:22px}
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px}
.tabs button{border:1px solid var(--line);background:#fff;padding:6px 14px;
  border-radius:var(--radius-pill);cursor:pointer;font:inherit;font-size:13.5px;color:var(--ink-soft)}
.tabs button.on{background:var(--ink);border-color:transparent;color:#fff}
.ptable-head{display:flex;justify-content:space-between;gap:16px;padding:12px 4px;
  font-size:12px;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-faint);
  border-bottom:1px solid var(--line)}
.prow{display:flex;align-items:center;gap:16px;padding:18px 4px;width:100%;text-align:left;
  border:0;border-bottom:1px solid rgba(0,0,0,.08);background:transparent;cursor:pointer;
  font:inherit;color:inherit;transition:background .12s}
.prow:hover{background:rgba(0,0,0,.025)}
.prow[hidden]{display:none}
.prow-logo{width:44px;height:44px;flex:0 0 auto;border-radius:10px;background:#fff;
  border:1px solid rgba(0,0,0,.06);box-shadow:0 1px 3px rgba(0,0,0,.06);padding:6px;
  display:flex;align-items:center;justify-content:center;overflow:hidden}
.prow-logo img{max-width:100%;max-height:100%;object-fit:contain}
.prow-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.prow-title{font-weight:700;font-size:17px}
.prow-labels{font-size:13.5px;opacity:.55}
.prow-labels span+span::before{content:"/";margin:0 6px;opacity:.6}
.prow-price{display:flex;align-items:center;gap:16px;flex:0 0 auto}
.prow-anchor{font-size:15px;opacity:.45;text-decoration:line-through;white-space:nowrap}
.prow-divider{width:1px;align-self:stretch;background:rgba(0,0,0,.12)}
.prow-price-main{text-align:right;white-space:nowrap}
.prow-l3{display:block;font-size:12px;color:var(--ink-soft);margin-bottom:2px}
.prow-l3.struck{text-decoration:line-through}
.prow-val{font-size:20px;font-weight:700;letter-spacing:-.01em}
.price-star{font-size:.55em;vertical-align:top;opacity:.65}
.prow-chevron{width:32px;height:32px;border-radius:999px;background:var(--bg-light-bronze);
  color:var(--bronze);flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:16px}
.prices-note{margin-top:22px;font-size:13px;color:var(--ink-soft)}
@media (max-width:1023px){
  .prices-grid{grid-template-columns:1fr}
  /* Still relative, not static — the "two photos" overlap positions its images
     absolutely against this element; static would stop it anchoring them. */
  .prices-media{position:relative;order:-1}
}
`,

  render(section, ctx) {
    const p = section.props || {};
    const currency = currencySymbol(ctx.page?.route?.currency_code);
    const rows = p.rows || [];
    const two = p.media_layout_type === '2 Images';
    const hasMedia = two
      ? !!(p.media_image_large || p.media_image_small)
      : !!p.media_image_single;

    const media = hasMedia
      ? `<div class="${esc(cls('prices-media', two && 'two'))}">`
        + (two
          ? img(p.media_image_small, { className: 'pm-small', placeholder: 'Small image' })
            + img(p.media_image_large, { className: 'pm-big', placeholder: 'Large image' })
          : img(p.media_image_single, { placeholder: 'Image' }))
        + `</div>`
      : '';

    return `<section class="prices" data-prices${attr('id', section.anchor_id)}><div class="wrap">
  <div class="${esc(cls('prices-grid', !hasMedia && 'no-media'))}">
    ${media}
    <div>
      ${isBlank(p.section_title) ? '' : `<h2 class="${esc(cls('prices-title',
          p.title_weight === 'Regular' && 'regular', p.title_italic && 'italic'))}"${style({ color: p.title_color })}>${esc(p.section_title)}</h2>`}
      ${blankRich(p.subheading) ? '' : `<div class="prices-sub">${rich(p.subheading)}</div>`}
      ${regionTabs(p, rows)}
      ${tableHead(p)}
      ${rows.map((/** @type {any} */ r) => renderRow(r, p, currency, ctx)).join('')}
      ${blankRich(p.footer_paragraph) ? '' : `<div class="prices-note">${rich(p.footer_paragraph)}</div>`}
    </div>
  </div>
</div></section>`;
  },
};

/* ------------------------------------------------------------- fragments */

/**
 * Tabs appear only when the rows actually span two or more regions besides `Global`
 * (doc 31 §5.3). A lone `[All]` tab is not a filter, so it is not rendered.
 */
function regionTabs(p, rows) {
  if (!p.region_tabs_enabled) return '';
  const distinct = [...new Set(rows.map((/** @type {any} */ r) => r.region).filter((r) => r && r !== 'Global'))];
  if (distinct.length < 2) return '';
  return `<div class="tabs" data-region-tabs role="tablist">
    <button class="on" data-region="all" role="tab" aria-selected="true">All</button>
    ${distinct.map((r) => `<button data-region="${esc(r)}" role="tab" aria-selected="false">${esc(r)}</button>`).join('')}
  </div>`;
}

function tableHead(p) {
  const l = p.table_headline_left, r = p.table_headline_right;
  if (isBlank(l) && isBlank(r)) return '';
  return `<div class="ptable-head"><span>${esc(l || '')}</span><span>${esc(r || '')}</span></div>`;
}

/**
 * One row. Master toggles win over per-row data (doc 31 §5.2), and the row is a single
 * focusable button carrying the payload the modal hydrates from (doc 50 §5.5).
 */
function renderRow(r, p, currency, ctx) {
  const labels = [];
  if (p.show_global_labels_1_2 !== false) {
    if (!isBlank(r.label_1)) labels.push(esc(r.label_1));
    if (!isBlank(r.label_2)) labels.push(esc(r.label_2));
  }
  const showL3 = p.show_global_label_3 !== false && !isBlank(r.label_3);
  const showAnchor = p.show_global_anchor_price !== false && !isBlank(r.anchor_price_value);
  const showLogo = p.show_global_airline_logo !== false && r.airline_logo;
  // Same convention as Hero's price footnote (doc 30 §5.4): the asterisk points at the
  // Footer's shared legal disclaimer, so it only appears when there is something to point at.
  const star = blankRich(ctx?.globals?.footer?.legal_disclaimers) ? '' : '<span class="price-star">*</span>';

  const name = `Request a quote for ${r.row_title}, ${currency}${r.price_value}`;
  return `<button class="prow" data-row-quote
    data-destination="${esc(r.row_title || '')}"
    data-cabin="${esc(r.cabin_class || 'Business')}"
    data-row-region="${esc(r.region || 'Global')}"
    aria-label="${esc(name)}"${style({ color: r.text_color })}>
    ${showLogo ? `<span class="prow-logo">${img(r.airline_logo, { decorative: true, placeholder: '' })}</span>` : ''}
    <span class="prow-main">
      <span class="prow-title">${esc(r.row_title || '')}</span>
      ${labels.length ? `<span class="prow-labels">${labels.map((l) => `<span>${l}</span>`).join('')}</span>` : ''}
    </span>
    <span class="prow-price">
      ${showAnchor ? `<span class="prow-anchor">${esc(currency)}${esc(r.anchor_price_value)}</span><span class="prow-divider"></span>` : ''}
      <span class="prow-price-main">
        ${showL3 ? `<span class="${esc(cls('prow-l3', r.label_3_is_strikethrough && 'struck'))}">${esc(r.label_3)}</span>` : ''}
        <span class="prow-val">${esc(currency)}${esc(r.price_value || '')}${star}</span>
      </span>
    </span>
    <span class="prow-chevron" aria-hidden="true">&rsaquo;</span>
  </button>`;
}

/* ----------------------------------------------------------- bulk import */

/** @param {Partial<Record<string, any>>} [over] */
export function newRow(over = {}) {
  return {
    row_id: uid('row'), row_title: '', price_value: '', anchor_price_value: '',
    cabin_class: 'Business', label_1: '', label_2: '', label_3: '',
    label_3_is_strikethrough: false, airline_logo: null, region: 'Global',
    text_color: INK, ...over,
  };
}

/**
 * Cabin names typed in bulk import are prose, not the raw enum — "Business Class",
 * "business", "First" should all resolve. Strips a trailing "class" and matches
 * case-insensitively; only a genuinely unrecognised word is an error.
 * @param {string} raw
 * @returns {string|null}
 */
function normalizeCabin(raw) {
  const cleaned = raw.trim().replace(/\s+class$/i, '');
  return CABIN_CLASSES.find((c) => c.toLowerCase() === cleaned.toLowerCase()) || null;
}

/**
 * Parse the bulk-import syntax of doc 31 §4.4:
 * `Route|Price|Anchor price|Cabin|Detail|Badge|Region`, one row per line. `Detail` maps to
 * `label_1` and `Badge` to `label_3` — the two fields real fare listings actually use;
 * `label_2` stays a per-row field, editable individually, not part of the quick syntax.
 * Parsing is all-or-nothing: nothing is written unless every line parses, and the caller
 * gets the line numbers and reasons.
 * @param {string} text
 * @returns {{ rows: any[], errors: { line: number, message: string }[] }}
 */
export function parseBulkRows(text) {
  /** @type {any[]} */ const rows = [];
  /** @type {{line:number,message:string}[]} */ const errors = [];

  String(text || '').split(/\r?\n/).forEach((raw, idx) => {
    const line = idx + 1;
    if (!raw.trim()) return;                                  // blank lines are skipped
    // Split on unescaped pipes, then unescape `\|` back into a literal pipe.
    const cells = raw.split(/(?<!\\)\|/).map((c) => c.replace(/\\\|/g, '|').trim());
    if (cells.length < 2) {
      errors.push({ line, message: 'Needs at least a route and a fare, separated by |.' });
      return;
    }
    const [row_title, price_value, anchor_price_value = '', cabinRaw = '',
      label_1 = '', label_3 = '', region = ''] = cells;

    if (!row_title) { errors.push({ line, message: 'Route is empty.' }); return; }
    if (!price_value) { errors.push({ line, message: 'Fare is empty.' }); return; }

    const cabin_class = cabinRaw ? normalizeCabin(cabinRaw) : 'Business';
    if (!cabin_class) {
      errors.push({ line, message: `Unknown cabin "${cabinRaw}". Expected: ${CABIN_CLASSES.join(', ')} (with or without "Class").` });
      return;
    }
    if (region && !REGIONS.includes(/** @type {any} */ (region))) {
      errors.push({ line, message: `Unknown region "${region}".` });
      return;
    }
    rows.push(newRow({ row_title, price_value, anchor_price_value,
      cabin_class, label_1, label_3, region: region || 'Global' }));
  });

  return { rows, errors };
}

export { MAX_ROWS };

function currencySymbol(code) {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency: code || 'USD' })
      .formatToParts(0).find((x) => x.type === 'currency')?.value || '$';
  } catch { return '$'; }
}
