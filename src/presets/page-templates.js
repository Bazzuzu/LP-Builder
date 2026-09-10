// Starting points for a new page.
//
// Two kinds, and the difference is deliberate. A BUILT-IN template is a list of component
// keys per slot: its copy comes from each type's own defaults, so the four below never
// duplicate a word and never drift when a section's default copy changes. A SAVED template
// (./templates/) is a page someone wrote, frozen — content and images included — because
// "start from the page I already made" is a different job from "start from the standard
// shape", and only one of them can be expressed as a list of keys.
import { ANCHOR_SLOT } from '../model/enums.js';
import { defaultsFor } from '../sections/_registry.js';
import { newPageDoc, newSection } from '../store/pages.js';
import { restoreAssets, sectionsFrom } from '../import.js';
import { SAVED } from './templates/index.js';

/**
 * @typedef {object} PageTemplate
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {Record<number, string[]>} [slots]   built-in: section keys per slot
 * @property {any[]} [sections]                   saved: whole sections, with their content
 * @property {Record<string, any>} [assets]       saved: the images those sections reference
 */

/** @type {PageTemplate[]} */
const BUILT_IN = [
  {
    id: 'route',
    name: 'Route page',
    description: 'The full funnel: hero, proof, fares, editorial and contact.',
    slots: {
      1: ['SECTION_FEATURE', 'SECTION_LOGO_MARQUEE'],
      3: ['SECTION_QUICK_FACTS', 'SECTION_TEXT_MEDIA', 'SECTION_MULTI_CARD_GRID'],
      5: ['SECTION_SUBSCRIPTION', 'SECTION_CONTACT', 'SECTION_FAQ'],
    },
  },
  {
    id: 'campaign',
    name: 'Campaign page',
    description: 'Short and visual: a banner, one editorial block and the fares.',
    slots: {
      1: ['SECTION_LARGE_IMAGE_BANNER'],
      3: ['SECTION_TEXT_MEDIA'],
      5: ['SECTION_SUBSCRIPTION'],
    },
  },
  {
    id: 'blank',
    name: 'Blank',
    description: 'Only the four mandatory anchors.',
    slots: {},
  },
];

/** @type {PageTemplate[]} */
export const TEMPLATES = [...BUILT_IN, ...SAVED];

export const templateById = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];

/**
 * Put every saved template's images into the asset store, once, at boot. Doing it here —
 * rather than when a template is picked — is what lets `pageFromTemplate` stay synchronous:
 * it is called during boot to seed the very first page, and an async call there would have
 * rippled through the whole start-up path for the sake of a case that has no images.
 */
export async function hydrateTemplateAssets() {
  for (const t of SAVED) await restoreAssets(t.assets || {});
}

/**
 * Build a page from a template. The four anchors are always present — a page without them
 * cannot pass L0 and so could never be published.
 * @param {PageTemplate} template @param {string} [name]
 */
export function pageFromTemplate(template, name = 'New landing page') {
  // A saved template already IS a page: take its sections whole, with fresh ids.
  if (template.sections?.length) return newPageDoc(name, sectionsFrom(template.sections));

  const sections = [];
  for (const [key, slot] of Object.entries(ANCHOR_SLOT)) {
    sections.push(newSection(/** @type {any} */ (key), { slot, props: defaultsFor(key) }));
  }
  for (const [slot, keys] of Object.entries(template.slots || {})) {
    keys.forEach((key, i) => {
      const s = newSection(/** @type {any} */ (key), { slot: Number(slot), props: defaultsFor(key) });
      s.order_in_slot = i;
      sections.push(s);
    });
  }
  return newPageDoc(name, sections);
}
