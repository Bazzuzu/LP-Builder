// Field-group builders and validation helpers shared by section modules.
// A change to the universal controls is a one-file edit here, not twelve.
import { getPath } from '../util.js';
import { BG_PRESETS, LEVEL } from '../model/enums.js';
import { blankRich } from '../render/html.js';

/** @typedef {import('../model/types.js').Issue} Issue */

export const RT_FULL = ['b', 'i', 's', 'color', 'ul', 'ol', 'link'];
export const RT_BASIC = ['b', 'i', 's', 'color'];

/**
 * Every size control in the editor reads small-to-large, left to right — the same direction
 * as the numeric segmented controls beside them (2/3/4, 3/4) and as HEADING_SIZES. Hero's
 * title preset and Feature's presets used to run the other way, so "L" was on the left in
 * one panel and on the right in the next.
 */
export const SIZE_OPTS = [
  { value: 'SIZE_S', label: 'S' }, { value: 'SIZE_M', label: 'M' }, { value: 'SIZE_L', label: 'L' },
];
export const ALIGN_OPTS = [
  { value: 'ALIGN_LEFT', label: 'Left' }, { value: 'ALIGN_CENTER', label: 'Center' },
];

/*
 * ---------------------------------------------------------------- grouping
 *
 * Every section's settings panel is built from the same four groups, in the same order:
 *
 *   Content     what the section says            open
 *   Media       the pictures                     closed
 *   Appearance  how it looks                     closed
 *   Advanced    the in-page anchor               closed
 *
 * A section may insert its own group between Content and Media when it has a body of
 * repeating content of its own (Rows, Items, Facts, Logos, Cards) — that is the only
 * licensed exception, and it is always still content.
 *
 * The order is the manager's priority order, not the data model's: the group opened on
 * arrival is the one holding the words, and styling never sits between two content fields.
 */
export const GROUP = {
  CONTENT: 'Content',
  MEDIA: 'Media',
  APPEARANCE: 'Appearance',
  ADVANCED: 'Advanced',
};

/**
 * A section header's own fields — the title, its supporting line, and how big and where
 * they sit. Returned as a plain array rather than a group of its own: a header IS content,
 * and giving it a second panel only made the author open two groups to write one sentence.
 * @param {{ titleLabel?: string, required?: boolean, subLabel?: string, subHelp?: string,
 *           sub?: boolean, size?: string, align?: string }} [opts]
 */
export const headingFields = ({ titleLabel = 'Title', required = false, subLabel = 'Subtitle',
  subHelp = 'Hidden when empty.', sub = true, size = 'SIZE_M', align = 'ALIGN_LEFT' } = {}) => [
  { key: 'section_title', kind: 'text', label: titleLabel, required,
    help: required ? undefined : 'Hidden when empty.' },
  ...(sub ? [{ key: 'subheading', kind: 'richtext', label: subLabel, tools: RT_FULL, help: subHelp }] : []),
  { key: 'heading_size', kind: 'segmented', label: 'Heading size', default: size, options: SIZE_OPTS },
  { key: 'heading_align', kind: 'segmented', label: 'Alignment', default: align, options: ALIGN_OPTS },
];

/** @param {any[]} fields @param {{ open?: boolean }} [opts] */
export const contentGroup = (fields, { open = true } = {}) => ({ title: GROUP.CONTENT, open, fields });

/** @param {any[]} fields @param {{ open?: boolean }} [opts] */
export const mediaGroup = (fields, { open = false } = {}) => ({ title: GROUP.MEDIA, open, fields });

/**
 * Background, and whatever else changes how the section looks rather than what it says.
 * The test for this group is exactly that: if a control alters the words, it is Content.
 * @param {{ bg?: string, fields?: any[] }} [opts]
 */
export const appearanceGroup = ({ bg = '#FFFFFF', fields = [] } = {}) => ({
  title: GROUP.APPEARANCE,
  open: false,
  fields: [
    { key: 'bg_color', kind: 'color', label: 'Background', default: bg, presets: BG_PRESETS, alpha: true },
    ...fields,
  ],
});

/**
 * The in-page anchor: last, closed, and out of the way. It is the one field here written
 * for a developer rather than an author, and it used to sit beside Background — where an
 * author looking for the background colour had to read past it every time.
 * `scope: 'section'` marks a field the inspector writes onto the Section itself, not props.
 * @param {any[]} [fields]
 */
export const advancedGroup = (fields = []) => ({
  title: GROUP.ADVANCED,
  open: false,
  fields: [
    { key: 'anchor_id', kind: 'text', label: 'Anchor id',
      scope: /** @type {'section'} */ ('section'), placeholder: 'e.g. deals',
      help: 'Optional. Lets a CTA link to this section with #anchor.' },
    ...fields,
  ],
});

/**
 * A CTA button. `toggle: false` makes the button unconditional.
 * @param {string} [key] @param {{ title?: string, toggle?: boolean, label?: string, href?: string }} [opts]
 */
export const ctaGroup = (key = 'cta', { title = 'Button', toggle = true, label = 'Learn more', href = '#lead-modal' } = {}) => ({
  title,
  open: false,
  fields: [
    // Labels are bare inside a group already called "Button" — "Button label" in the
    // "Button" group is the panel telling the author twice where they are.
    ...(toggle ? [{ key: `${key}.on`, kind: 'toggle', label: 'Show button', default: false }] : []),
    { key: `${key}.label`, kind: 'text', label: 'Label', default: label,
      when: (/** @type {any} */ p, /** @type {any} */ get) => !toggle || get(`${key}.on`) },
    { key: `${key}.href`, kind: 'text', label: 'Link', default: href,
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
