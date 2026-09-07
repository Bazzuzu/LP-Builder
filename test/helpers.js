// Fixtures shared by the model tests. Mirrors the shapes in src/model/types.js.
import { ANCHOR_SLOT } from '../src/model/enums.js';

let n = 0;

/** @returns {import('../src/model/types.js').Section} */
export function sec(key, slot, order, extra = {}) {
  return {
    id: extra.id ?? `s${++n}`,
    key,
    slot_index: slot,
    order_in_slot: order,
    is_visible: true,
    anchor_id: null,
    props: {},
    created_at: 0,
    updated_at: 0,
    ...extra,
  };
}

export const dyn = (id, slot, order) => sec('SECTION_TEXT_MEDIA', slot, order, { id });

/** The four mandatory anchors in their pinned slots. */
export const anchors = () => [
  sec('SECTION_HERO', ANCHOR_SLOT.SECTION_HERO, 0, { id: 'hero' }),
  sec('SECTION_PRICES', ANCHOR_SLOT.SECTION_PRICES, 0, { id: 'prices' }),
  sec('SECTION_TRUST', ANCHOR_SLOT.SECTION_TRUST, 0, { id: 'trust' }),
  sec('SECTION_FOOTER', ANCHOR_SLOT.SECTION_FOOTER, 0, { id: 'footer' }),
];

/** @returns {import('../src/model/types.js').PageDoc} */
export const page = (sections) => ({
  schema_version: 2, id: 'pg', internal_name: 'T', slug: 't',
  status: 'Draft', page_type: 'RoutePage',
  meta: { meta_title: 'T', meta_description: '', canonical_url: null, og_image: null, noindex_nofollow: false },
  route: { default_origin: null, default_destination: null, target_country: 'US', target_region: 'Global', currency_code: 'USD' },
  sections, created_at: 0, updated_at: 0,
});

/** A registry stub: every key present, archetypes as the spec defines them. */
export const registry = (overrides = {}) => ({
  SECTION_HERO: { archetype: 'anchor' },
  SECTION_PRICES: { archetype: 'anchor' },
  SECTION_TRUST: { archetype: 'dual-anchor' },
  SECTION_FOOTER: { archetype: 'dual-anchor' },
  SECTION_SUBSCRIPTION: { archetype: 'static' },
  SECTION_CONTACT: { archetype: 'static' },
  SECTION_TEXT_MEDIA: { archetype: 'dynamic' },
  SECTION_FEATURE: { archetype: 'dynamic' },
  ...overrides,
});
