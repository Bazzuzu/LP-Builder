// Intermediate & supporting sections — spec pages 31-34.
import { styleGroup, headerGroup, logoImg, RT_FULL, RT_BASIC } from './common.js';
import { isBlank, isBlankHtml } from '../util.js';

export const logos = {
  type: 'logos',
  name: 'Logo Showcase / Marquee',
  icon: '⋯',
  group: 'intermediate',
  description: 'Partner or airline logos. Auto-switches to an infinite marquee when they overflow.',
  fields: [
    headerGroup(),
    {
      title: 'Logos',
      open: true,
      fields: [
        { key: 'items', kind: 'repeater', label: 'Logo items', addLabel: '+ Add logo', multiUpload: 'logo',
          itemTitle: (it, i) => it.alt || `Logo ${i + 1}`,
          item: { fields: [
            logoImg('logo', 'Logo', { required: true, hint: 'SVG or PNG. Rendered at a fixed 36px height.' }),
            { key: 'alt', kind: 'text', label: 'Alt text' },
            { key: 'href', kind: 'text', label: 'Link (optional)' },
          ] },
          default: [] },
        { key: 'speed', kind: 'range', label: 'Marquee speed', default: 30, min: 10, max: 90, unit: 's',
          help: 'Seconds per loop. Only applies when the logos overflow.' },
      ],
    },
    styleGroup({ bg: '#FFFFFF', size: 's', align: 'center' }),
  ],
  validate(p) {
    const out = [];
    (p.items || []).forEach((it, i) => {
      if (!it.logo) out.push({ path: `items.${i}.logo`, message: `Logo ${i + 1}: no file uploaded.` });
    });
    if (!(p.items || []).length) out.push({ path: 'items', severity: 'warn', message: 'No logos added.' });
    return out;
  },
};

/** Shared card repeater used by the Primary / Secondary variants. */
const cardRepeater = (iconPx, count, allRequired) => ({
  key: 'cards', kind: 'repeater', label: 'Cards', addLabel: '+ Add card',
  min: 1, max: 4, lockCount: count,
  itemTitle: (it, i) => it.title || `Card ${i + 1}`,
  item: { fields: [
    logoImg('icon', 'Card icon', { required: allRequired, hint: `SVG or PNG. ${iconPx}×${iconPx} container.` }),
    { key: 'title', kind: 'text', label: 'Card title', required: allRequired },
    { key: 'text', kind: 'richtext', label: 'Card paragraph', tools: RT_BASIC, required: allRequired },
  ] },
  default: [],
});

export const primaryCards = {
  type: 'primaryCards',
  name: 'Primary Cards (Highlighted)',
  icon: '◧',
  group: 'intermediate',
  description: '3-card value proposition grid with 64×64 icons. All fields mandatory.',
  fields: [
    headerGroup(),
    { title: 'Cards', open: true, fields: [cardRepeater(64, 3, true)] },
    styleGroup({ bg: '#F7F2EE', size: 'l', align: 'center' }),
  ],
  validate(p) {
    const out = [];
    const cards = p.cards || [];
    if (cards.length !== 3) out.push({ path: 'cards', message: 'This section is fixed at exactly 3 cards.' });
    cards.forEach((c, i) => {
      if (!c.icon) out.push({ path: `cards.${i}.icon`, message: `Card ${i + 1}: icon is required.` });
      if (isBlank(c.title)) out.push({ path: `cards.${i}.title`, message: `Card ${i + 1}: title is required.` });
      if (isBlankHtml(c.text)) out.push({ path: `cards.${i}.text`, message: `Card ${i + 1}: paragraph is required.` });
    });
    return out;
  },
};

export const secondaryCards = {
  type: 'secondaryCards',
  name: 'Secondary Cards (Standard)',
  icon: '◫',
  group: 'intermediate',
  description: '3 or 4 feature cards with 48×48 icons.',
  fields: [
    headerGroup(),
    {
      title: 'Cards',
      open: true,
      fields: [
        { key: 'count', kind: 'segmented', label: 'Card count', default: '3',
          options: [{ value: '3', label: '3 cards' }, { value: '4', label: '4 cards' }],
          syncRepeater: 'cards' },
        cardRepeater(48, null, true),
      ],
    },
    styleGroup({ bg: '#FFFFFF', size: 'm', align: 'left' }),
  ],
  validate(p) {
    const out = [];
    const n = +(p.count || 3);
    const cards = (p.cards || []).slice(0, n);
    if (cards.length < n) out.push({ path: 'cards', message: `Card count is ${n} but only ${cards.length} are filled in.` });
    cards.forEach((c, i) => {
      if (!c.icon) out.push({ path: `cards.${i}.icon`, message: `Card ${i + 1}: icon is required.` });
      if (isBlank(c.title)) out.push({ path: `cards.${i}.title`, message: `Card ${i + 1}: title is required.` });
      if (isBlankHtml(c.text)) out.push({ path: `cards.${i}.text`, message: `Card ${i + 1}: paragraph is required.` });
    });
    return out;
  },
};

export const bullets = {
  type: 'bullets',
  name: 'Bullet / Feature Points (Compact)',
  icon: '⋮',
  group: 'intermediate',
  description: 'Compact 3 or 4 item list with 48×48 icons.',
  fields: [
    headerGroup(),
    {
      title: 'Items',
      open: true,
      fields: [
        { key: 'count', kind: 'segmented', label: 'Item count', default: '3',
          options: [{ value: '3', label: '3 items' }, { value: '4', label: '4 items' }],
          syncRepeater: 'items' },
        { key: 'items', kind: 'repeater', label: 'Points', addLabel: '+ Add point', max: 4,
          itemTitle: (it, i) => it.label || `Point ${i + 1}`,
          item: { fields: [
            logoImg('icon', 'Item icon', { required: true, hint: 'SVG or PNG. 48×48 container.' }),
            { key: 'label', kind: 'text', label: 'Item label', required: true },
          ] },
          default: [] },
      ],
    },
    styleGroup({ bg: '#FFFFFF', size: 's', align: 'left' }),
  ],
  validate(p) {
    const out = [];
    const n = +(p.count || 3);
    const items = (p.items || []).slice(0, n);
    if (items.length < n) out.push({ path: 'items', message: `Item count is ${n} but only ${items.length} are filled in.` });
    items.forEach((it, i) => {
      if (!it.icon) out.push({ path: `items.${i}.icon`, message: `Point ${i + 1}: icon is required.` });
      if (isBlank(it.label)) out.push({ path: `items.${i}.label`, message: `Point ${i + 1}: label is required.` });
    });
    return out;
  },
};
