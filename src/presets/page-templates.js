// Starting points for a new page. A template is a list of component keys per slot; the
// section content comes from each type's own defaults, so a template never duplicates copy.
import { ANCHOR_SLOT } from '../model/enums.js';
import { defaultsFor } from '../sections/_registry.js';
import { newPageDoc, newSection } from '../store/pages.js';

/** @typedef {{ id: string, name: string, description: string, slots: Record<number, string[]> }} PageTemplate */

/** @type {PageTemplate[]} */
export const TEMPLATES = [
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

export const templateById = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];

/**
 * Build a page from a template. The four anchors are always present — a page without them
 * cannot pass L0 and so could never be published.
 * @param {PageTemplate} template @param {string} [name]
 */
export function pageFromTemplate(template, name = 'New landing page') {
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
