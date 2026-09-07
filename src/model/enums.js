// Canonical registries. Mirrors `Docs/OOUX/SYSTEM RULES/02_SYSTEM_CANONICAL_ENUMS_AND_VALIDATION.md`.
// Nothing else in the codebase may define these values; everything imports from here.

/* ------------------------------------------------------------ components */

/** @typedef {typeof COMPONENT_KEYS[number]} ComponentKey */
export const COMPONENT_KEYS = /** @type {const} */ ([
  'SECTION_HERO',
  'SECTION_PRICES',
  'SECTION_TRUST',
  'SECTION_FOOTER',
  'SECTION_SUBSCRIPTION',
  'SECTION_CONTACT',
  'SECTION_QUICK_FACTS',
  'SECTION_MULTI_CARD_GRID',
  'SECTION_LARGE_IMAGE_BANNER',
  'SECTION_TEXT_MEDIA',
  'SECTION_LOGO_MARQUEE',
  'SECTION_FEATURE',
]);

/** @typedef {'anchor'|'dual-anchor'|'static'|'dynamic'} Archetype */
export const ARCHETYPE = /** @type {const} */ ({
  ANCHOR: 'anchor',            // page-level data, position locked   (Hero, Prices)
  DUAL_ANCHOR: 'dual-anchor',  // global data, position locked       (Trust, Footer)
  STATIC: 'static',            // global data, max 1, reorderable    (Subscription, Contact)
  DYNAMIC: 'dynamic',          // page-level data, 0..N, reorderable
});

/**
 * Archetypes whose content comes from the global store, not the page document.
 * @type {Archetype[]}
 */
export const GLOBAL_CONTENT_ARCHETYPES = [ARCHETYPE.DUAL_ANCHOR, ARCHETYPE.STATIC];

/* ----------------------------------------------------------------- slots */

/** Slot each anchor is pinned to. SYS-00 §1. */
export const ANCHOR_SLOT = /** @type {const} */ ({
  SECTION_HERO: 0,
  SECTION_PRICES: 2,
  SECTION_TRUST: 4,
  SECTION_FOOTER: 6,
});

/** Containers that accept dynamic and static modules. */
export const DYNAMIC_SLOTS = [1, 3, 5];

/** The four keys that must exist on every page, in slot order. */
export const MANDATORY_ANCHORS = /** @type {ComponentKey[]} */ (Object.keys(ANCHOR_SLOT));

/**
 * Slots a section of this key/archetype may occupy. Derived, never declared per section.
 * @param {ComponentKey} key
 * @param {Archetype} archetype
 * @returns {number[]}
 */
export function permittedSlots(key, archetype) {
  if (archetype === ARCHETYPE.ANCHOR || archetype === ARCHETYPE.DUAL_ANCHOR) {
    const slot = ANCHOR_SLOT[/** @type {keyof typeof ANCHOR_SLOT} */ (key)];
    return slot === undefined ? [] : [slot];
  }
  return [...DYNAMIC_SLOTS];
}

/**
 * How many instances of a key one page may hold. `Infinity` for dynamic modules.
 * @param {Archetype} archetype
 */
export const maxInstances = (archetype) =>
  archetype === ARCHETYPE.DYNAMIC ? Infinity : 1;

/* --------------------------------------------------------------- regions */

/** @typedef {typeof REGIONS[number]} Region */
export const REGIONS = /** @type {const} */ ([
  'Global',              // routing fallback, not a geography: shown under every tab
  'North America',
  'Latin America',
  'Europe',
  'Northern Africa',
  'Africa',              // sub-Saharan; disjoint from 'Northern Africa'
  'Middle East',
  'Indian Subcontinent',
  'Asia',
  'Oceania',
]);

/* ------------------------------------------------------------ validation */

/** @typedef {'L0'|'L1'|'L2'} Level */
export const LEVEL = /** @type {const} */ ({
  L0: 'L0',   // structural   — checked on publish
  L1: 'L1',   // content      — checked on publish, never blocks a draft save
  L2: 'L2',   // field format — checked per field on save
});

/** Error registry. SYS-02 §4.1. */
export const ERR = /** @type {const} */ ({
  E001: { level: 'L0', message: 'Missing mandatory Hero section.' },
  E002: { level: 'L0', message: 'Missing mandatory Prices section.' },
  E003: { level: 'L0', message: 'Missing mandatory Trust section.' },
  E004: { level: 'L0', message: 'Missing mandatory Footer section.' },
  E005: { level: 'L0', message: 'Fixed anchor slot sequence violation.' },
  E006: { level: 'L0', message: 'Duplicate Subscription section.' },
  E007: { level: 'L0', message: 'Duplicate Contact section.' },
  E008: { level: 'L0', message: 'Section assigned to a slot its archetype does not permit.' },
  E100: { level: 'L1', message: 'Required content field is empty.' },
  E101: { level: 'L1', message: 'Required media asset is missing.' },
  E102: { level: 'L1', message: 'Text-consistency violation in Multi-Card Grid.' },
  E103: { level: 'L1', message: 'Prices section has no rows.' },
  E104: { level: 'L1', message: 'Trust section has every sub-module disabled.' },
  E200: { level: 'L2', message: 'Field format is invalid.' },
  E201: { level: 'L2', message: 'Slug is already in use.' },
});

/** Which error code reports a missing anchor of each key. */
export const MISSING_ANCHOR_CODE = /** @type {const} */ ({
  SECTION_HERO: 'E001',
  SECTION_PRICES: 'E002',
  SECTION_TRUST: 'E003',
  SECTION_FOOTER: 'E004',
});

/** Which error code reports a duplicated static module. */
export const DUPLICATE_STATIC_CODE = /** @type {const} */ ({
  SECTION_SUBSCRIPTION: 'E006',
  SECTION_CONTACT: 'E007',
});

/* ------------------------------------------------------------- constants */

/** The only magic CTA href. Anything else is a normal link. SYS-02 §5. */
export const LEAD_ANCHOR = '#lead-modal';

export const BREAKPOINT = { MOBILE_MAX: 767, TABLET_MIN: 768, DESKTOP_MIN: 1024 };

// Every colour value in the field system is hex — 8 digits (#RRGGBBAA) when translucent,
// so a picker's own hex box, its presets and its defaults never disagree on format.
/** 88% opaque black — the site's default text/fallback ink. */
export const INK = '#000000E0';
/** 4% opaque black — the subtle background tint used for rhythm separation. */
export const BG_LIGHT_GREY = '#0000000A';
/** Warm sand, fully opaque. */
export const BG_LIGHT_BRONZE = '#F7F2EE';

/** Background presets offered first in every dynamic section. SYS-01 §2. */
export const BG_PRESETS = [
  { value: '#FFFFFF', label: 'White', token: 'BG_WHITE' },
  { value: BG_LIGHT_GREY, label: 'Light grey', token: 'BG_LIGHT_GREY' },
  { value: BG_LIGHT_BRONZE, label: 'Sand', token: 'BG_LIGHT_BRONZE' },
];

export const HEADING_SIZES = /** @type {const} */ (['SIZE_S', 'SIZE_M', 'SIZE_L']);
export const HEADING_ALIGNS = /** @type {const} */ (['ALIGN_LEFT', 'ALIGN_CENTER']);
export const CABIN_CLASSES = /** @type {const} */ (['Business', 'First', 'Premium Economy']);
export const PAGE_STATUSES = /** @type {const} */ (['Draft', 'Published', 'Archived']);
export const PAGE_TYPES = /** @type {const} */ (['RoutePage', 'CampaignPage', 'HomePage']);
