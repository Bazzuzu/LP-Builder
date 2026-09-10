// Field-group builders and validation helpers shared by section modules.
// A change to the universal controls is a one-file edit here, not twelve.
import { getPath } from '../util.js';
import { BG_PRESETS, LEVEL } from '../model/enums.js';
import { blankRich } from '../render/html.js';

/** @typedef {import('../model/types.js').Issue} Issue */

export const RT_FULL = ['b', 'i', 's', 'color', 'ul', 'ol', 'link'];
export const RT_BASIC = ['b', 'i', 's', 'color'];

export const SIZE_OPTS = [
  { value: 'SIZE_S', label: 'S' }, { value: 'SIZE_M', label: 'M' }, { value: 'SIZE_L', label: 'L' },
];
export const ALIGN_OPTS = [
  { value: 'ALIGN_LEFT', label: 'Left' }, { value: 'ALIGN_CENTER', label: 'Center' },
];

/**
 * The universal controls of a dynamic section (11_ABSTRACT §4.2) plus the in-page anchor.
 * `scope: 'section'` marks a field the inspector writes onto the Section itself rather than
 * into `props`. Heading size/alignment live in headerGroup — they're about the header
 * content, not the section's own background/anchor.
 * @param {{ bg?: string }} [defaults]
 */
export const styleGroup = ({ bg = '#FFFFFF' } = {}) => ({
  title: 'Section style',
  open: false,
  fields: [
    { key: 'bg_color', kind: 'color', label: 'Background', default: bg, presets: BG_PRESETS, alpha: true },
    { key: 'anchor_id', kind: 'text', label: 'Anchor id',
      scope: /** @type {'section'} */ ('section'), placeholder: 'e.g. deals',
      help: 'Optional. Lets a CTA link to this section with #anchor.' },
  ],
});

/**
 * Optional section header. Hidden on the page when both title and subheading are empty.
 * Heading size/alignment sit here rather than in styleGroup — they shape the header itself.
 * @param {{ open?: boolean, titleLabel?: string, required?: boolean, size?: string, align?: string }} [opts]
 */
export const headerGroup = ({ open = true, titleLabel = 'Section title', required = false,
  size = 'SIZE_M', align = 'ALIGN_LEFT' } = {}) => ({
  title: 'Header',
  open,
  fields: [
    { key: 'section_title', kind: 'text', label: titleLabel, required,
      help: required ? undefined : 'Hidden when empty.' },
    { key: 'subheading', kind: 'richtext', label: 'Subheading', tools: RT_FULL,
      help: 'Hidden when empty.' },
    { key: 'heading_size', kind: 'segmented', label: 'Heading size', default: size, options: SIZE_OPTS },
    { key: 'heading_align', kind: 'segmented', label: 'Heading alignment', default: align, options: ALIGN_OPTS },
  ],
});

/**
 * A CTA button. `toggle: false` makes the button unconditional.
 * @param {string} [key] @param {{ title?: string, toggle?: boolean, label?: string, href?: string }} [opts]
 */
export const ctaGroup = (key = 'cta', { title = 'CTA button', toggle = true, label = 'Learn more', href = '#lead-modal' } = {}) => ({
  title,
  open: false,
  fields: [
    ...(toggle ? [{ key: `${key}.on`, kind: 'toggle', label: 'Show button', default: false }] : []),
    { key: `${key}.label`, kind: 'text', label: 'Button label', default: label,
      when: (/** @type {any} */ p, /** @type {any} */ get) => !toggle || get(`${key}.on`) },
    { key: `${key}.href`, kind: 'text', label: 'Button URL', default: href,
      help: 'Relative path, absolute URL, or #lead-modal to open the lead form.',
      when: (/** @type {any} */ p, /** @type {any} */ get) => !toggle || get(`${key}.on`) },
  ],
});

/**
 * An image field. The widget edits the asset and its alt text together, because a content
 * image without alt fails L1 (SYS-02 §6) and the two should never be separated in the UI.
 * @param {string} key @param {string} label
 * @param {{ hint?: string, decorative?: boolean, ratio?: string,
 *           when?: (props: Record<string, any>, get: (path: string) => any) => any }} [opts]
 */
export const imgField = (key, label, { hint, decorative = false, ratio, when } = {}) => ({
  key, kind: 'image', label, decorative, ratio, help: hint, ...(when ? { when } : {}),
});

/* ------------------------------------------------------------ validation */

export const isBlank = (/** @type {any} */ v) => v == null || String(v).trim() === '';

/** @param {string} code @param {string} path @param {string} message @returns {Issue} */
const mk = (code, path, message) => ({ level: LEVEL.L1, code, path, message });

/** @returns {Issue[]} */
export const needText = (/** @type {any} */ props, /** @type {string} */ path, /** @type {string} */ label) =>
  isBlank(getPath(props, path)) ? [mk('E100', path, `${label} is required.`)] : [];

/** @returns {Issue[]} */
export const needRich = (/** @type {any} */ props, /** @type {string} */ path, /** @type {string} */ label) =>
  blankRich(getPath(props, path)) ? [mk('E100', path, `${label} is required.`)] : [];

/**
 * A media field is complete when it has an asset AND, unless decorative, alt text.
 * @returns {Issue[]}
 */
export function needMedia(props, path, label, { decorative = false } = {}) {
  const v = getPath(props, path);
  if (!v?.asset && !v?.url) return [mk('E101', path, `${label} is required.`)];
  if (!decorative && isBlank(v.alt)) return [mk('E100', `${path}.alt`, `${label} needs alt text.`)];
  return [];
}

/** Run several validators and flatten. @param {...Issue[]} lists @returns {Issue[]} */
export const all = (...lists) => lists.flat();
