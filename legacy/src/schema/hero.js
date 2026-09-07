// Hero Section — mandatory anchor #1. Spec pages 6-9.
import { img, logoImg, RT_BASIC, RT_FULL, INK, TEXT_PRESETS } from './common.js';

const badgeFields = (key) => [
  { key: `${key}.on`, kind: 'toggle', label: 'Inline badge', default: false },
  logoImg(`${key}.icon`, 'Badge icon', { when: (p, get) => get(`${key}.on`) }),
  { key: `${key}.label`, kind: 'text', label: 'Badge label', when: (p, get) => get(`${key}.on`) },
  { key: `${key}.color`, kind: 'color', label: 'Badge color', default: '#7C5C3E',
    presets: TEXT_PRESETS, when: (p, get) => get(`${key}.on`) },
];

export default {
  type: 'hero',
  name: 'Hero',
  icon: '▤',
  group: 'anchor',
  anchor: 1,
  singleton: true,
  description: 'Above-the-fold block: background, headline, price and lead CTA.',

  fields: [
    {
      // Spec §2.1 (Theme Mode) names these as hero-governed: "Header Logo: Bronze
      // (Light) / White (Dark)", "Accreditation Badges", "Header Elements: menu
      // trigger and phone number" — a header bar the earlier build never rendered.
      title: 'Header bar',
      open: true,
      fields: [
        { key: 'header.on', kind: 'toggle', label: 'Show header bar', default: true },
        { key: 'header.logoText', kind: 'text', label: 'Logo / wordmark', default: 'Business Class',
          when: (p, get) => get('header.on') },
        { key: 'header.accreditations', kind: 'toggle', label: 'Accreditation badges', default: true,
          help: 'IATA, IATAN, ARC, BBB. Styling follows the theme mode below.',
          when: (p, get) => get('header.on') },
        { key: 'header.phone', kind: 'text', label: 'Phone number', default: '+1 (888) 315-7838',
          placeholder: 'Leave empty to hide', when: (p, get) => get('header.on') },
        { key: 'header.menu', kind: 'toggle', label: 'Menu button', default: true,
          help: 'Opens the lead form, same as the main CTA.', when: (p, get) => get('header.on') },
      ],
    },
    {
      title: 'Global styles',
      open: true,
      fields: [
        { key: 'theme', kind: 'segmented', label: 'Theme mode', default: 'dark',
          options: [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }],
          help: 'Drives logo variant, accreditation badges, widget themes and default text colors.' },
      ],
    },
    {
      title: 'Desktop background',
      open: false,
      fields: [
        img('bgDesktop', 'Desktop image', { hint: 'PNG, JPG or WebP. 1920×1080 recommended.' }),
        { key: 'overlayColor', kind: 'color', label: 'Overlay color', default: '#000000', alpha: false },
        { key: 'overlayOpacity', kind: 'range', label: 'Overlay opacity', default: 50, min: 0, max: 100, unit: '%' },
      ],
    },
    {
      title: 'Mobile background',
      open: false,
      fields: [
        img('bgMobile', 'Mobile image', { hint: 'Rendered below 768px. Falls back to the desktop image.' }),
        { key: 'overlayColorM', kind: 'color', label: 'Overlay color', default: '#000000', alpha: false },
        { key: 'overlayOpacityM', kind: 'range', label: 'Overlay opacity', default: 50, min: 0, max: 100, unit: '%' },
      ],
    },
    {
      title: 'Eyebrow',
      open: false,
      fields: [
        { key: 'eyebrow.mode', kind: 'select', label: 'Display mode', default: 'none', options: [
          { value: 'none', label: 'None' }, { value: 'text', label: 'Text' },
          { value: 'timer', label: 'Timer' }, { value: 'logo', label: 'Logo' },
          { value: 'badge', label: 'Badge' },
        ] },

        // Text mode
        { key: 'eyebrow.text', kind: 'text', label: 'Eyebrow text',
          when: (p, get) => get('eyebrow.mode') === 'text' },

        // Timer mode
        { key: 'eyebrow.prefix', kind: 'text', label: 'Prefix text', default: 'Offer ends in',
          when: (p, get) => get('eyebrow.mode') === 'timer' },
        { key: 'eyebrow.endsAt', kind: 'datetime', label: 'End date & time',
          when: (p, get) => get('eyebrow.mode') === 'timer' },

        // Text + Timer both support the optional inline badge
        ...badgeFields('eyebrow.badge').map((f) => ({
          ...f, when: (p, get) => ['text', 'timer'].includes(get('eyebrow.mode')) &&
            (f.key.endsWith('.on') || get('eyebrow.badge.on')),
        })),

        // Logo mode
        logoImg('eyebrow.logo', 'Logo', { hint: 'SVG or PNG. Container is 10:1 (560×56).',
          when: (p, get) => get('eyebrow.mode') === 'logo' }),

        // Standalone badge mode
        logoImg('eyebrow.soloIcon', 'Icon', { when: (p, get) => get('eyebrow.mode') === 'badge' }),
        { key: 'eyebrow.soloLabel', kind: 'text', label: 'Label',
          when: (p, get) => get('eyebrow.mode') === 'badge' },
        { key: 'eyebrow.soloColor', kind: 'color', label: 'Color', default: '#7C5C3E',
          presets: TEXT_PRESETS, when: (p, get) => get('eyebrow.mode') === 'badge' },
      ],
    },
    {
      title: 'Typography',
      open: true,
      fields: [
        { key: 'titlePreset', kind: 'segmented', label: 'Title preset', default: 't1',
          options: [{ value: 't1', label: 'Title 1 · 56px' }, { value: 't2', label: 'Title 2 · 48px' }] },
        { key: 'title', kind: 'richtext', label: 'Main title (H1)', required: true, singleLine: false,
          tools: ['b', 'i', 'color'], help: 'Enter inserts a line break.' },
        { key: 'paragraph', kind: 'richtext', label: 'Paragraph', tools: RT_FULL },
      ],
    },
    {
      title: 'Pricing module',
      open: true,
      fields: [
        { key: 'price.top', kind: 'richtext', label: 'Top label', tools: RT_BASIC,
          placeholder: 'Prices starting from' },
        { key: 'price.value', kind: 'richtext', label: 'Price', required: true, tools: RT_BASIC,
          prefix: '$', suffix: '*', help: 'The $ and the closing * are added automatically.' },
        { key: 'price.bottom', kind: 'richtext', label: 'Bottom label', tools: RT_BASIC,
          placeholder: 'per person / taxes included' },
        { key: 'price.asideOn', kind: 'toggle', label: 'Aside logo', default: false },
        logoImg('price.aside', 'Aside image', { hint: 'SVG or PNG. Container is 1:2 (vertical).',
          when: (p, get) => get('price.asideOn') }),
        { key: 'price.belowOn', kind: 'toggle', label: 'Bottom logo', default: false },
        logoImg('price.below', 'Bottom image', { hint: 'SVG or PNG. Container is 10:1 (560×56).',
          when: (p, get) => get('price.belowOn') }),
      ],
    },
    {
      title: 'Lead form CTA',
      open: true,
      fields: [
        { key: 'cta.label', kind: 'text', label: 'Button label', default: 'Get My Quote', required: true },
        { key: 'cta.bg', kind: 'color', label: 'Button background', default: 'rgba(0, 0, 0, 0.88)', alpha: true,
          presets: [{ value: 'rgba(0, 0, 0, 0.88)', label: 'Ink 88%' }, { value: '#7C5C3E', label: 'Bronze' },
            { value: '#FFFFFF', label: 'White' }] },
        { key: 'cta.fg', kind: 'color', label: 'Button text', default: '#FFFFFF', presets: TEXT_PRESETS },
      ],
    },
  ],

  validate(p) {
    const out = [];
    if (p.eyebrow?.mode === 'timer' && !p.eyebrow.endsAt)
      out.push({ path: 'eyebrow.endsAt', message: 'Timer eyebrow needs an end date.' });
    if (p.eyebrow?.mode === 'logo' && !p.eyebrow.logo)
      out.push({ path: 'eyebrow.logo', message: 'Logo eyebrow needs an uploaded logo.' });
    if (p.eyebrow?.mode === 'badge' && !p.eyebrow.soloLabel)
      out.push({ path: 'eyebrow.soloLabel', message: 'Badge eyebrow needs a label.' });
    if (!p.bgDesktop)
      out.push({ path: 'bgDesktop', severity: 'warn', message: 'No desktop background image.' });
    return out;
  },
};
