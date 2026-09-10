// The section registry. Adding a type = write one module, add one import line here.
//
// The assertion below is the drift guard: the set of registered keys must equal the
// canonical list in SYS-02 §1. A typo in a key, a module forgotten in this file, or a key
// that exists in code but not in the spec all fail loudly at load time instead of
// surfacing as a blank section three screens later.
import { COMPONENT_KEYS } from '../model/enums.js';

import hero from './hero.js';
import prices from './prices.js';
import trust from './trust.js';
import footer from './footer.js';
import subscription from './subscription.js';
import contact from './contact.js';
import quickFacts from './quick-facts.js';
import multiCardGrid from './multi-card-grid.js';
import largeImageBanner from './large-image-banner.js';
import textMedia from './text-media.js';
import logoMarquee from './logo-marquee.js';
import feature from './feature.js';
import faq from './faq.js';

/** @type {import('../model/types.js').SectionType[]} */
const LIST = [
  hero, prices, trust, footer, subscription, contact,
  quickFacts, multiCardGrid, largeImageBanner, textMedia, logoMarquee, feature, faq,
];

/** @type {Record<string, import('../model/types.js').SectionType>} */
export const REGISTRY = Object.fromEntries(LIST.map((t) => [t.key, t]));

const registered = new Set(Object.keys(REGISTRY));
const canonical = new Set(COMPONENT_KEYS);
const missing = [...canonical].filter((k) => !registered.has(k));
const extra = [...registered].filter((k) => !canonical.has(/** @type {any} */ (k)));
if (missing.length || extra.length || registered.size !== LIST.length) {
  throw new Error(
    'Section registry does not match SYS-02 §1.'
    + (missing.length ? ` Missing: ${missing.join(', ')}.` : '')
    + (extra.length ? ` Not in the canonical list: ${extra.join(', ')}.` : '')
    + (registered.size !== LIST.length ? ' Duplicate key among registered modules.' : ''),
  );
}

/** Library groups shown in the "Add section" drawer, in order. */
export const LIBRARY_GROUPS = [
  { id: 'content', label: 'Content sections' },
  { id: 'intermediate', label: 'Intermediate & supporting' },
  { id: 'global', label: 'Global static blocks' },
];

/** Types a page editor may insert (anchors are created with the page). */
export const insertableTypes = () =>
  LIST.filter((t) => t.archetype === 'dynamic' || t.archetype === 'static');

/** Every field descriptor of a type, flattened across its groups. */
export const allFields = (key) => (REGISTRY[key]?.fields || []).flatMap((g) => g.fields || []);

/**
 * What this particular instance actually says, for the page-structure list — so two
 * sections of the same type are told apart without opening either. Generic on purpose:
 * the outline stays ignorant of section types, and a type that needs something else
 * declares its own `label(props)` instead of the outline growing a special case.
 * Returns '' when the section has no page-level copy of its own (the global blocks).
 * @param {import('../model/types.js').Section} section
 */
export function sectionLabel(section) {
  const type = REGISTRY[section.key];
  const props = section.props || {};
  const raw = type?.label ? type.label(props) : (props.section_title || props.title_text || '');
  return String(raw ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Defaults for a fresh instance, merged from the type's declared field defaults. */
export function defaultsFor(key) {
  const type = REGISTRY[key];
  if (!type) return {};
  return structuredClone(type.defaults || {});
}
