// Prices Section — mandatory anchor #2. Spec pages 11-15.
import { logoImg, RT_FULL, INK, REGIONS, TEXT_PRESETS, styleGroup, img } from './common.js';

export const rowFields = [
  { key: 'title', kind: 'text', label: 'Row title', required: true, placeholder: 'London to New York' },
  { key: 'price', kind: 'text', label: 'Price', required: true, placeholder: '1,234', prefix: '$' },
  { key: 'anchorPrice', kind: 'text', label: 'Anchor price', placeholder: '4,321', prefix: '$',
    help: 'Struck-through baseline fare. Subject to the global toggle.' },
  { key: 'label1', kind: 'text', label: 'Label 1', placeholder: 'Business Class' },
  { key: 'label2', kind: 'text', label: 'Label 2', placeholder: 'Nonstop' },
  { key: 'label3', kind: 'text', label: 'Label 3', placeholder: 'Special fare',
    help: 'Micro-label above the price.' },
  logoImg('logo', 'Airline logo', { hint: 'SVG or PNG, 1:1.' }),
  { key: 'region', kind: 'select', label: 'Region', default: 'Global',
    options: REGIONS.map((r) => ({ value: r, label: r })) },
  { key: 'color', kind: 'color', label: 'Text color', default: INK, presets: TEXT_PRESETS },
];

export default {
  type: 'prices',
  name: 'Prices',
  icon: '≡',
  group: 'anchor',
  anchor: 2,
  singleton: true,
  description: 'Fare table with sticky media, region tabs and lead-modal handoff.',

  fields: [
    {
      title: 'Media column',
      open: false,
      fields: [
        { key: 'mediaMode', kind: 'segmented', label: 'Layout', default: '1',
          options: [{ value: '0', label: 'None' }, { value: '1', label: '1 image' }, { value: '2', label: '2 images' }] },
        img('media1', 'Large image', { hint: '1:1 square. JPG, PNG or WebP.',
          when: (p, get) => get('mediaMode') !== '0' }),
        img('media2', 'Small image', { hint: '1:1 square.', when: (p, get) => get('mediaMode') === '2' }),
        { key: 'sticky', kind: 'toggle', label: 'Sticky on scroll', default: true },
      ],
    },
    {
      title: 'Header',
      open: true,
      fields: [
        { key: 'title', kind: 'text', label: 'Section title (H2)', help: 'Hidden when empty.' },
        { key: 'titleColor', kind: 'color', label: 'Title color', default: INK, presets: TEXT_PRESETS },
        { key: 'titleItalic', kind: 'toggle', label: 'Italic title', default: false },
        { key: 'subheading', kind: 'richtext', label: 'Subheading', tools: RT_FULL, help: 'Hidden when empty.' },
      ],
    },
    {
      title: 'Table settings',
      open: true,
      fields: [
        { key: 'head1', kind: 'text', label: 'Column 1 headline', default: 'Route & Cabin',
          help: 'Clear the field to hide the header cell.' },
        { key: 'head2', kind: 'text', label: 'Column 2 headline', default: 'Published / Our Fare' },
        { key: 'regionTabs', kind: 'toggle', label: 'Region tabs', default: false,
          help: 'Renders filter tabs built from the regions used by the rows.' },
        { key: 'show.labels12', kind: 'toggle', label: 'Show labels 1 & 2', default: true },
        { key: 'show.label3', kind: 'toggle', label: 'Show label 3', default: true },
        { key: 'show.anchorPrice', kind: 'toggle', label: 'Show anchor price', default: true },
        { key: 'show.logo', kind: 'toggle', label: 'Show airline logo', default: true },
      ],
    },
    {
      title: 'Rows',
      open: true,
      fields: [
        { key: 'rows', kind: 'repeater', label: 'Price rows', max: 30, addLabel: '+ Add row',
          itemTitle: (it, i) => it.title || `Row ${i + 1}`,
          bulk: {
            label: 'Bulk import',
            format: 'Row title/Price/Anchor price/Label 1/Label 2/Label 3/Region',
            sample: 'Berlin/1,234/4,321/Business Class/Nonstop/–/Global\nParis/999/2,500/Premium Economy/1 Stop/Special Fare/Europe',
            parse: parseBulk,
          },
          item: { fields: rowFields },
          default: [] },
      ],
    },
    {
      title: 'Footer',
      open: false,
      fields: [
        { key: 'disclaimer', kind: 'richtext', label: 'Bottom paragraph', tools: RT_FULL,
          help: 'Hidden when empty. Typically fare conditions.' },
      ],
    },
    styleGroup({ bg: '#FFFFFF', size: 'l', align: 'left' }),
  ],

  validate(p) {
    const out = [];
    const rows = p.rows || [];
    if (!rows.length) out.push({ path: 'rows', message: 'Add at least one price row.' });
    rows.forEach((r, i) => {
      if (!r.title?.trim()) out.push({ path: `rows.${i}.title`, message: `Row ${i + 1}: title is required.` });
      if (!r.price?.trim()) out.push({ path: `rows.${i}.price`, message: `Row ${i + 1}: price is required.` });
    });
    if (rows.length > 30) out.push({ path: 'rows', message: 'Maximum 30 rows.' });
    if (p.mediaMode !== '0' && !p.media1)
      out.push({ path: 'media1', severity: 'warn', message: 'Media column is on but no image is uploaded.' });
    return out;
  },
};

/** "Title/Price/Anchor/L1/L2/L3/Region" per line. "–" and "" both mean empty. */
export function parseBulk(text) {
  const rows = [], errors = [];
  text.split('\n').forEach((line, i) => {
    const t = line.trim();
    if (!t) return;
    const c = t.split('/').map((s) => s.trim()).map((s) => (s === '-' || s === '–' ? '' : s));
    if (!c[0] || !c[1]) { errors.push(`Line ${i + 1}: needs at least a title and a price.`); return; }
    const region = c[6] && REGIONS.includes(c[6]) ? c[6] : 'Global';
    if (c[6] && region !== c[6]) errors.push(`Line ${i + 1}: unknown region "${c[6]}", using Global.`);
    rows.push({ title: c[0], price: c[1], anchorPrice: c[2] || '', label1: c[3] || '',
      label2: c[4] || '', label3: c[5] || '', region, color: INK });
  });
  return { rows, errors };
}
