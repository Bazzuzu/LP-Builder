// Field-builder helpers shared by every section schema.
// Spec §3 "Universal Controls for Dynamic Sections" lives here, so a change to the
// universal controls is a one-file edit.

export const BG_PRESETS = [
  { value: '#FFFFFF',            label: 'White' },
  { value: 'rgba(0, 0, 0, 0.04)', label: 'Light grey' },
  { value: '#F7F2EE',            label: 'Sand' },
];

export const INK = 'rgba(0, 0, 0, 0.88)';

export const TEXT_PRESETS = [
  { value: INK,       label: 'Ink' },
  { value: '#FFFFFF', label: 'White' },
  { value: '#7C5C3E', label: 'Bronze' },
  { value: '#B91C1C', label: 'Red' },
];

export const REGIONS = ['Global', 'Europe', 'Oceania', 'Middle East', 'Africa',
  'Indian Subcontinent', 'Northern Africa', 'Asia'];

export const SIZE_OPTS = [{ value: 's', label: 'S' }, { value: 'm', label: 'M' }, { value: 'l', label: 'L' }];
export const ALIGN_OPTS = [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }];

/** Spec §3.1 + §3.2 — background, heading size, heading alignment. */
export function styleGroup({ bg = '#FFFFFF', size = 'm', align = 'left' } = {}) {
  return {
    title: 'Section style',
    open: false,
    fields: [
      { key: 'bg', kind: 'color', label: 'Background', default: bg, presets: BG_PRESETS, alpha: true },
      { key: 'headingSize', kind: 'segmented', label: 'Heading size', default: size, options: SIZE_OPTS },
      { key: 'headingAlign', kind: 'segmented', label: 'Heading alignment', default: align, options: ALIGN_OPTS },
      { key: 'anchorId', kind: 'text', label: 'Anchor id', placeholder: 'e.g. deals',
        help: 'Optional. Lets you link to this section with #anchor.' },
    ],
  };
}

/** Optional "Section Title + Subheading" header used by most content sections. */
export function headerGroup({ open = true, titleLabel = 'Section title' } = {}) {
  return {
    title: 'Header',
    open,
    fields: [
      { key: 'title', kind: 'text', label: titleLabel, help: 'Hidden when empty.' },
      { key: 'subheading', kind: 'richtext', label: 'Subheading', help: 'Hidden when empty.',
        tools: ['b', 'i', 's', 'color', 'ul', 'ol', 'link'] },
    ],
  };
}

export const RT_FULL = ['b', 'i', 's', 'color', 'ul', 'ol', 'link'];
export const RT_BASIC = ['b', 'i', 's', 'color'];

export const ctaGroup = (key = 'cta', { title = 'CTA button', toggle = true } = {}) => ({
  title,
  open: false,
  fields: [
    toggle && { key: `${key}.on`, kind: 'toggle', label: 'Show button', default: false },
    { key: `${key}.label`, kind: 'text', label: 'Button label', default: 'Learn more',
      when: (p, get) => !toggle || get(`${key}.on`) },
    { key: `${key}.href`, kind: 'text', label: 'Button URL', default: '#lead-modal',
      help: 'Relative path, absolute URL, or #lead-modal to open the lead form.',
      when: (p, get) => !toggle || get(`${key}.on`) },
  ].filter(Boolean),
});

/** Uploader descriptor with the format/ratio hints the spec calls out. */
export const img = (key, label, opts = {}) => ({
  key, kind: 'image', label,
  accept: opts.accept || 'image/png,image/jpeg,image/webp',
  hint: opts.hint, required: opts.required, when: opts.when,
});

export const logoImg = (key, label, opts = {}) =>
  img(key, label, { accept: 'image/svg+xml,image/png', ...opts });
