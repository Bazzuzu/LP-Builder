// Page documents + editor state. Every mutation goes through commit(), which snapshots
// for undo and persists. Ported from the previous store, re-seated on the slot model.
import { clone, debounce, slugify, uid } from '../util.js';
import { ANCHOR_SLOT, DYNAMIC_SLOTS } from '../model/enums.js';
import * as slots from '../model/slots.js';

/**
 * @typedef {import('../model/types.js').PageDoc} PageDoc
 * @typedef {import('../model/types.js').Section} Section
 * @typedef {import('../model/enums.js').ComponentKey} ComponentKey
 */

export const SCHEMA_VERSION = 2;
const LS_KEY = 'lpb.state.v2';
const HISTORY_MAX = 60;
const COALESCE_MS = 700;

const listeners = { doc: new Set(), sel: new Set(), ui: new Set(), issues: new Set(), reset: new Set() };

export const state = {
  /** @type {PageDoc[]} */ pages: [],
  /** @type {string|null} */ currentId: null,
  /** @type {string|null} */ selection: null,
  /** @type {'desktop'|'tablet'|'mobile'} */ viewport: 'desktop',
  /** Visual scale of the preview frame only — never changes what the page itself renders
   *  or which responsive breakpoint applies inside it (see setZoom). */
  zoom: 100,
  /** @type {import('../model/types.js').Issue[]} */ issues: [],
};

/** @type {PageDoc[][]} */ let past = [];
/** @type {PageDoc[][]} */ let future = [];
let lastCoalesce = { key: /** @type {string|null} */ (null), at: 0 };

/** @param {keyof typeof listeners} topic @param {() => void} fn */
export function on(topic, fn) { listeners[topic].add(fn); return () => listeners[topic].delete(fn); }
/** @param {keyof typeof listeners} topic */
export function emit(topic) { for (const fn of listeners[topic]) fn(); }

export const doc = () => state.pages.find((p) => p.id === state.currentId) || null;
/** @param {string|null} id */
export const section = (id) => doc()?.sections.find((s) => s.id === id) || null;
export const selected = () => section(state.selection);

/* ---------------------------------------------------------------- history */

/**
 * Apply `fn` to a draft of the whole page list, then swap it in.
 * Returning `false` from `fn` aborts the commit, leaving history untouched.
 * `coalesceKey` merges rapid edits to the same field into one undo step.
 * @param {(ctx: { pages: PageDoc[], doc: PageDoc|undefined }) => any} fn
 * @param {{ coalesceKey?: string|null }} [opts]
 */
export function commit(fn, { coalesceKey = null } = {}) {
  const before = state.pages;
  const draft = clone(before);
  const ctx = { pages: draft, doc: draft.find((p) => p.id === state.currentId) };
  if (fn(ctx) === false) return false;

  const now = Date.now();
  const merge = coalesceKey && lastCoalesce.key === coalesceKey && now - lastCoalesce.at < COALESCE_MS;
  if (!merge) {
    past.push(before);
    if (past.length > HISTORY_MAX) past.shift();
  }
  lastCoalesce = { key: coalesceKey, at: now };
  future = [];

  state.pages = draft;
  if (ctx.doc) ctx.doc.updated_at = now;
  persist();
  emit('doc');
  return true;
}

export function undo() {
  if (!past.length) return;
  future.push(state.pages);
  state.pages = /** @type {PageDoc[]} */ (past.pop());
  afterTimeTravel();
}
export function redo() {
  if (!future.length) return;
  past.push(state.pages);
  state.pages = /** @type {PageDoc[]} */ (future.pop());
  afterTimeTravel();
}
export const canUndo = () => past.length > 0;
export const canRedo = () => future.length > 0;

function afterTimeTravel() {
  lastCoalesce = { key: null, at: 0 };
  if (!doc()) state.currentId = state.pages[0]?.id || null;
  if (state.selection && !section(state.selection)) { state.selection = null; emit('sel'); }
  persist(); emit('doc'); emit('reset');
}

/* ------------------------------------------------------------- selection */

/** @param {string|null} id */
export function select(id) {
  if (state.selection === id) return;
  state.selection = id;
  emit('sel');
}
/** @param {'desktop'|'tablet'|'mobile'} vp */
export function setViewport(vp) { state.viewport = vp; emit('ui'); }
/** @param {50|75|100} pct */
export function setZoom(pct) { state.zoom = pct; emit('ui'); }

/* ----------------------------------------------------------- persistence */

const persist = debounce(() => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      v: SCHEMA_VERSION, pages: state.pages, currentId: state.currentId,
    }));
  } catch (e) {
    console.warn('Persist failed (quota?). Images live in IndexedDB, so this is usually a page count issue.', e);
  }
}, 400);

export function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
    if (raw?.pages?.length) {
      state.pages = raw.pages;
      state.currentId = raw.pages.some((/** @type {PageDoc} */ p) => p.id === raw.currentId)
        ? raw.currentId : raw.pages[0].id;
      return true;
    }
  } catch (e) { console.warn('Could not read saved state', e); }
  return false;
}

/* -------------------------------------------------------------- factories */

/**
 * A blank page carrying every field doc 20 defines. Anchors are added by the caller.
 * @param {string} [name]
 * @param {Section[]} [sections]
 * @returns {PageDoc}
 */
export function newPageDoc(name = 'Untitled page', sections = []) {
  const now = Date.now();
  return {
    schema_version: SCHEMA_VERSION,
    id: uid('pg'),
    internal_name: name,
    slug: slugify(name),
    status: 'Draft',
    page_type: 'RoutePage',
    meta: {
      meta_title: name,
      meta_description: '',
      canonical_url: null,
      og_image: null,
      noindex_nofollow: false,
    },
    route: {
      default_origin: null,
      default_destination: null,
      target_country: 'US',
      target_region: 'Global',
      currency_code: 'USD',
    },
    sections,
    created_at: now,
    updated_at: now,
  };
}

/**
 * @param {ComponentKey} key
 * @param {{ slot?: number, props?: Record<string, any> }} [opts]
 * @returns {Section}
 */
export function newSection(key, { slot, props = {} } = {}) {
  const anchorSlot = ANCHOR_SLOT[/** @type {keyof typeof ANCHOR_SLOT} */ (key)];
  const now = Date.now();
  return {
    id: uid('sec'),
    key,
    slot_index: anchorSlot ?? slot ?? DYNAMIC_SLOTS[0],
    order_in_slot: 0,
    is_visible: true,
    anchor_id: null,
    props: clone(props),
    created_at: now,
    updated_at: now,
  };
}

/* ------------------------------------------------------------ section CRUD */

/**
 * @param {ComponentKey} key
 * @param {{ slot?: number, props?: Record<string, any>, select?: boolean }} [opts]
 */
export function addSection(key, { slot = DYNAMIC_SLOTS[0], props = {}, select: sel = true } = {}) {
  const s = newSection(key, { slot, props });
  const ok = commit(({ doc: d }) => {
    if (!d) return false;
    slots.appendToSlot(d.sections, s, s.slot_index);
  });
  if (ok && sel) select(s.id);
  return ok ? s.id : null;
}

/** @param {string} id @param {{ select?: boolean }} [opts] */
export function duplicateSection(id, { select: sel = true } = {}) {
  const src = section(id);
  if (!src) return null;
  const copy = { ...clone(src), id: uid('sec'), created_at: Date.now(), updated_at: Date.now() };
  const ok = commit(({ doc: d }) => {
    if (!d) return false;
    slots.insertAfter(d.sections, copy, id);
  });
  if (ok && sel) select(copy.id);
  return ok ? copy.id : null;
}

/** @param {string} id */
export function deleteSection(id) {
  const ok = commit(({ doc: d }) => (d ? slots.removeSection(d.sections, id) : false));
  if (ok && state.selection === id) select(null);
  return ok;
}

/** @param {string} id @param {'up'|'down'} dir */
export function moveSection(id, dir) {
  return commit(({ doc: d }) => {
    if (!d) return false;
    return dir === 'up' ? slots.moveUp(d.sections, id) : slots.moveDown(d.sections, id);
  });
}

/**
 * Drop a dragged section into an explicit gap. `index` counts the target slot's other
 * sections. Returns false — leaving history untouched — when the drop changes nothing.
 * @param {string} id @param {number} slot @param {number} index
 */
export function moveSectionTo(id, slot, index) {
  return commit(({ doc: d }) => (d ? slots.moveTo(d.sections, id, slot, index) : false));
}

/** @param {string} id @param {boolean} [visible] */
export function toggleVisibility(id, visible) {
  return commit(({ doc: d }) => {
    const s = d?.sections.find((x) => x.id === id);
    if (!s) return false;
    s.is_visible = visible ?? !s.is_visible;
    s.updated_at = Date.now();
  });
}

/**
 * Write one field of a section's props. Rapid edits to the same path collapse into one
 * undo step, so typing in a text field does not fill the history.
 * @param {string} id @param {string} path @param {any} value
 */
export function setSectionProp(id, path, value) {
  return commit(({ doc: d }) => {
    const s = d?.sections.find((x) => x.id === id);
    if (!s) return false;
    setPathIn(s.props, path, value);
    s.updated_at = Date.now();
  }, { coalesceKey: `prop:${id}:${path}` });
}

/** @param {string} id @param {Partial<Section>} patch */
export function patchSection(id, patch) {
  return commit(({ doc: d }) => {
    const s = d?.sections.find((x) => x.id === id);
    if (!s) return false;
    Object.assign(s, patch, { updated_at: Date.now() });
  });
}

/** Local copy of setPath so the store does not depend on DOM helpers. */
function setPathIn(obj, path, value) {
  const keys = String(path).split('.');
  let o = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (o[k] == null || typeof o[k] !== 'object') o[k] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    o = o[k];
  }
  o[keys[keys.length - 1]] = value;
  return obj;
}

/* ---------------------------------------------------------------- page CRUD */

/** @param {PageDoc} page */
export function addPage(page, { select: sel = true } = {}) {
  commit(({ pages }) => { pages.push(page); });
  if (sel) openPage(page.id);
  return page.id;
}

/** @param {string} id */
export function openPage(id) {
  if (state.currentId === id) return;
  state.currentId = id;
  state.selection = null;
  past = []; future = [];
  persist(); emit('doc'); emit('sel'); emit('reset');
}

/** @param {string} id */
export function deletePage(id) {
  commit(({ pages }) => {
    const i = pages.findIndex((p) => p.id === id);
    if (i < 0) return false;
    pages.splice(i, 1);
  });
  if (state.currentId === id) {
    state.currentId = state.pages[0]?.id || null;
    state.selection = null;
    past = []; future = [];
    emit('sel'); emit('doc'); emit('reset');
  }
}

/** @param {string} id @param {string} name */
export function renamePage(id, name) {
  commit(({ pages }) => {
    const p = pages.find((x) => x.id === id);
    if (!p) return false;
    p.internal_name = name;
    if (!p.meta.meta_title || p.meta.meta_title === p.internal_name) p.meta.meta_title = name;
  }, { coalesceKey: 'rename:' + id });
}

/**
 * Slug uniqueness across every page, published or not, plus retired slugs held by redirects.
 * Doc 20 §5.2.
 * @param {string} slug @param {string} [exceptPageId]
 */
export const isSlugTaken = (slug, exceptPageId) =>
  state.pages.some((p) => p.id !== exceptPageId && p.slug === slug);

/** First free `{slug}-copy`, `-copy-2`, … Doc 20 §5.4. */
export function freeCopySlug(slug) {
  let candidate = `${slug}-copy`;
  for (let n = 2; isSlugTaken(candidate); n++) candidate = `${slug}-copy-${n}`;
  return candidate;
}
