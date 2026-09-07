// A page that uses every section type, built from each type's own defaults.
// Used by the render tests and by `render-fixture.js` for eyeballing in a browser.
import { REGISTRY, defaultsFor } from '../src/sections/_registry.js';

export { REGISTRY as registry };

/** @param {string} id @param {string} key @param {number} slot @param {number} order @param {object} [extra] */
function sec(id, key, slot, order, extra = {}) {
  const { props, ...rest } = extra;
  return {
    id, key, slot_index: slot, order_in_slot: order,
    is_visible: true, anchor_id: null,
    props: { ...defaultsFor(key), ...(props || {}) },
    created_at: 0, updated_at: 0, ...rest,
  };
}

/** @returns {import('../src/model/types.js').PageDoc} */
export const fixturePage = () => ({
  schema_version: 2,
  id: 'pg_fixture',
  internal_name: 'JFK to LHR',
  slug: 'jfk-to-lhr',
  status: 'Draft',
  page_type: 'RoutePage',
  meta: {
    meta_title: 'Business Class JFK → LHR from $1,234',
    meta_description: 'Private consolidator fares to London with concierge booking.',
    canonical_url: null, og_image: null, noindex_nofollow: false,
  },
  route: {
    default_origin: 'New York (JFK)', default_destination: 'London (LHR)',
    target_country: 'US', target_region: 'Europe', currency_code: 'USD',
  },
  created_at: 0, updated_at: 0,
  sections: [
    sec('hero', 'SECTION_HERO', 0, 0),

    sec('feat', 'SECTION_FEATURE', 1, 0),
    sec('tm1', 'SECTION_TEXT_MEDIA', 1, 1, { anchor_id: 'lounges' }),
    sec('mq', 'SECTION_LOGO_MARQUEE', 1, 2),

    sec('prices', 'SECTION_PRICES', 2, 0, { props: { region_tabs_enabled: true } }),

    sec('qf', 'SECTION_QUICK_FACTS', 3, 0),
    sec('grid', 'SECTION_MULTI_CARD_GRID', 3, 1),
    sec('banner', 'SECTION_LARGE_IMAGE_BANNER', 3, 2),
    // Hidden on purpose: it must not appear in the output at all.
    sec('tm2', 'SECTION_TEXT_MEDIA', 3, 3, {
      is_visible: false, props: { section_title: 'Draft block nobody should see' },
    }),

    sec('trust', 'SECTION_TRUST', 4, 0),

    sec('sub', 'SECTION_SUBSCRIPTION', 5, 0),
    sec('contact', 'SECTION_CONTACT', 5, 1),

    sec('footer', 'SECTION_FOOTER', 6, 0),
  ],
});
