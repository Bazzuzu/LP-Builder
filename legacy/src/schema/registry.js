// The section-type registry. Adding a new section type = write a schema, write a renderer,
// add one line here. Nothing else in the app needs to know it exists.
import { getPath, setPath, uid, clone } from '../util.js';
import hero from './hero.js';
import prices from './prices.js';
import { trust, footer, newsletter, contact } from './anchors.js';
import { logos, primaryCards, secondaryCards, bullets } from './features.js';
import { quickFacts, cardsGrid, bigImage, textMedia } from './content.js';
import { RENDERERS } from '../render/sections/index.js';
import { BLOCK_DEFAULTS } from '../presets/defaults.js';

const LIST = [hero, prices, trust, footer, newsletter, contact,
  logos, primaryCards, secondaryCards, bullets,
  quickFacts, cardsGrid, bigImage, textMedia];

export const TYPES = Object.fromEntries(LIST.map((t) => [t.type, { ...t, render: RENDERERS[t.type] }]));
export const typeOf = (section) => TYPES[section?.type] || null;

/** Groups shown in the "Add section" library, in order. */
export const LIBRARY_GROUPS = [
  { id: 'intermediate', label: 'Intermediate & supporting' },
  { id: 'content', label: 'Content sections' },
  { id: 'global', label: 'Global static blocks' },
];

export const ANCHOR_ORDER = LIST.filter((t) => t.anchor)
  .sort((a, b) => a.anchor - b.anchor).map((t) => t.type);

/* ------------------------------------------------------------ field walk */

/** Every field descriptor of a type, flattened across fieldsets. */
export function allFields(type) {
  const t = TYPES[type];
  if (!t) return [];
  return t.fields.flatMap((fs) => fs.fields || []);
}

/** Resolve a field's `when` predicate against a props object. */
export const isShown = (field, props) =>
  !field.when || !!field.when(props, (p) => getPath(props, p));

/** Build a fresh props object from the schema's declared defaults, then system presets. */
export function defaultsFor(type) {
  const props = {};
  for (const f of allFields(type)) {
    if (f.kind === 'note' || !f.key) continue;
    if (f.default !== undefined) setPath(props, f.key, clone(f.default));
    else if (f.kind === 'repeater') setPath(props, f.key, []);
  }
  const preset = BLOCK_DEFAULTS[type];
  return preset ? mergeDeep(props, clone(preset)) : props;
}

export function mergeDeep(base, over) {
  for (const [k, v] of Object.entries(over || {})) {
    if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]))
      mergeDeep(base[k], v);
    else base[k] = v;
  }
  return base;
}

/** Blank item for a repeater, from its item schema defaults. */
export function repeaterItem(field) {
  const it = {};
  for (const f of field.item?.fields || []) {
    if (f.kind === 'note' || !f.key) continue;
    if (f.default !== undefined) setPath(it, f.key, clone(f.default));
  }
  return it;
}

/* -------------------------------------------------------- section factory */

export function makeSection(type, props) {
  const t = TYPES[type];
  if (!t) throw new Error('Unknown section type: ' + type);
  return {
    id: uid('sec'),
    type,
    visible: true,
    props: props ? mergeDeep(defaultsFor(type), clone(props)) : defaultsFor(type),
  };
}

/** The four anchors, in spec order, with system defaults applied. */
export const anchorSkeleton = () => ANCHOR_ORDER.map((t) => makeSection(t));

/* ------------------------------------------------- ordering constraints */

/**
 * Anchors are structurally enforced (spec §2.1): hero first, footer last, and the
 * remaining anchors in ascending order. Dynamic sections may sit in any slot between them.
 */
export function isValidOrder(sections) {
  const anchors = sections.map((s, i) => ({ i, a: TYPES[s.type]?.anchor })).filter((x) => x.a);
  for (let k = 1; k < anchors.length; k++) if (anchors[k].a < anchors[k - 1].a) return false;
  if (sections.length && TYPES[sections[0].type]?.anchor !== 1) return false;
  const last = sections[sections.length - 1];
  if (last && TYPES[last.type]?.anchor !== 4) return false;
  return true;
}

/** Indexes at which a dynamic section may be inserted. */
export function validSlots(sections) {
  const out = [];
  for (let i = 0; i <= sections.length; i++) {
    const probe = sections.slice();
    probe.splice(i, 0, { type: '__probe__' });
    if (isValidOrder(probe)) out.push(i);
  }
  return out;
}
