// Content Sections Library — spec pages 24-29.
import { styleGroup, headerGroup, img, ctaGroup, RT_FULL, RT_BASIC } from './common.js';
import { isBlank, isBlankHtml } from '../util.js';

export const quickFacts = {
  type: 'quickFacts',
  name: 'Quick Facts',
  icon: '◲',
  group: 'content',
  description: 'Narrative column plus a multi-image showcase and key metric cards.',
  fields: [
    {
      title: 'Content',
      open: true,
      fields: [
        { key: 'title', kind: 'text', label: 'Section title', required: true },
        { key: 'intro', kind: 'richtext', label: 'Primary paragraph', required: true, tools: RT_FULL },
        { key: 'outro', kind: 'richtext', label: 'Secondary paragraph', tools: RT_FULL,
          help: 'Optional closing text placed below the cards.' },
      ],
    },
    {
      title: 'Metric cards',
      open: true,
      fields: [
        { key: 'cards', kind: 'repeater', label: 'Cards', min: 2, max: 4, addLabel: '+ Add card',
          itemTitle: (it, i) => it.title || `Card ${i + 1}`,
          help: 'Cards 1 and 2 are mandatory. Cards 3 and 4 are hidden when empty.',
          item: { fields: [
            { key: 'title', kind: 'text', label: 'Metric' },
            { key: 'text', kind: 'text', label: 'Caption' },
          ] },
          default: [] },
      ],
    },
    {
      title: 'Media showcase',
      open: false,
      fields: [
        img('imgBig', 'Big image', { hint: 'Container height 400–640px, object-fit: cover.' }),
        img('imgSmall1', 'Small image 1'),
        img('imgSmall2', 'Small image 2'),
      ],
    },
    styleGroup({ bg: '#F7F2EE', size: 'l', align: 'left' }),
  ],
  validate(p) {
    const out = [];
    if (isBlank(p.title)) out.push({ path: 'title', message: 'Section title is required.' });
    if (isBlankHtml(p.intro)) out.push({ path: 'intro', message: 'Primary paragraph is required.' });
    const cards = p.cards || [];
    [0, 1].forEach((i) => {
      const c = cards[i];
      if (!c || isBlank(c.title) || isBlank(c.text))
        out.push({ path: `cards.${i}.title`, message: `Card ${i + 1} is mandatory — fill in both metric and caption.` });
    });
    return out;
  },
};

export const cardsGrid = {
  type: 'cardsGrid',
  name: '2 / 3 / 4 Cards Grid',
  icon: '▦',
  group: 'content',
  description: 'Image card grid. Text is optional but must be all-or-nothing across cards.',
  fields: [
    headerGroup(),
    {
      title: 'Grid',
      open: true,
      fields: [
        { key: 'count', kind: 'segmented', label: 'Card count', default: '3',
          options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }],
          syncRepeater: 'cards' },
        { key: 'cards', kind: 'repeater', label: 'Cards', max: 4, addLabel: '+ Add card',
          itemTitle: (it, i) => it.title || `Card ${i + 1}`,
          item: { fields: [
            img('image', 'Card image', { required: true }),
            { key: 'title', kind: 'text', label: 'Card title' },
            { key: 'text', kind: 'textarea', label: 'Card paragraph' },
          ] },
          default: [] },
        { kind: 'note', text: 'All-or-nothing rule: either every active card carries text, or none does (pure image gallery).' },
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
      if (!c.image) out.push({ path: `cards.${i}.image`, message: `Card ${i + 1}: image is required.` });
    });
    const hasText = (c) => !isBlank(c.title) || !isBlank(c.text);
    const withText = cards.filter(hasText).length;
    if (withText > 0 && withText < cards.length) {
      cards.forEach((c, i) => {
        if (!hasText(c)) out.push({ path: `cards.${i}.title`,
          message: `Card ${i + 1}: other cards have text, so this one needs text too (all-or-nothing rule).` });
      });
    }
    return out;
  },
};

export const bigImage = {
  type: 'bigImage',
  name: 'Large Image Feature',
  icon: '▣',
  group: 'content',
  description: 'Full-bleed banner with an overlaid headline and CTA.',
  fields: [
    {
      title: 'Content',
      open: true,
      fields: [
        img('image', 'Featured image', { required: true, hint: 'JPG, PNG or WebP. 2400px wide recommended.' }),
        { key: 'title', kind: 'text', label: 'Section title' },
        { key: 'subheading', kind: 'richtext', label: 'Subheading', tools: RT_FULL },
        { key: 'overlay', kind: 'range', label: 'Image overlay', default: 35, min: 0, max: 100, unit: '%' },
        { key: 'boxed', kind: 'toggle', label: 'Boxed width', default: false },
      ],
    },
    ctaGroup('cta', { toggle: true }),
    styleGroup({ bg: '#FFFFFF', size: 'l', align: 'center' }),
  ],
  validate(p) {
    const out = [];
    if (p.cta?.on && isBlank(p.cta.label)) out.push({ path: 'cta.label', message: 'CTA is on but has no label.' });
    return out;
  },
};

export const textMedia = {
  type: 'textMedia',
  name: 'Text & Media Split',
  icon: '◨',
  group: 'content',
  description: 'Editorial column paired with 0, 1 or 2 images, in either orientation.',
  fields: [
    {
      title: 'Layout',
      open: true,
      fields: [
        { key: 'media', kind: 'segmented', label: 'Media', default: '1',
          options: [{ value: '0', label: 'No photo' }, { value: '1', label: '1 photo' }, { value: '2', label: '2 photos' }] },
        { key: 'orientation', kind: 'segmented', label: 'Orientation', default: 'left',
          options: [{ value: 'left', label: 'Image left' }, { value: 'right', label: 'Image right' }],
          when: (p, get) => get('media') !== '0' },
        img('image1', 'Large image', { when: (p, get) => get('media') !== '0' }),
        img('image2', 'Small image', { when: (p, get) => get('media') === '2' }),
      ],
    },
    {
      title: 'Content',
      open: true,
      fields: [
        { key: 'title', kind: 'text', label: 'Title' },
        { key: 'text', kind: 'richtext', label: 'Paragraph', tools: RT_FULL },
      ],
    },
    ctaGroup('cta', { toggle: true }),
    styleGroup({ bg: '#FFFFFF', size: 'm', align: 'left' }),
  ],
  validate(p) {
    const out = [];
    if (p.media !== '0' && !p.image1) out.push({ path: 'image1', message: 'Media layout is on but no image is uploaded.' });
    if (p.media === '2' && !p.image2) out.push({ path: 'image2', message: 'Two-photo layout needs a second image.' });
    if (isBlank(p.title) && isBlankHtml(p.text))
      out.push({ path: 'title', severity: 'warn', message: 'Section has no text content.' });
    if (p.cta?.on && isBlank(p.cta.label)) out.push({ path: 'cta.label', message: 'CTA is on but has no label.' });
    return out;
  },
};
