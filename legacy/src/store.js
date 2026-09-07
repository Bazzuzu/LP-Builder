// Single source of truth: a list of PageDocs + editor UI state.
// Mutations go through commit(), which snapshots for undo and persists.
import { clone, uid, debounce } from './util.js';

export const SCHEMA_VERSION = 1;
const LS_KEY = 'lpb.state.v1';
const HISTORY_MAX = 60;
const COALESCE_MS = 700;

const listeners = { doc: new Set(), sel: new Set(), ui: new Set(), issues: new Set(), reset: new Set() };

export const state = {
  pages: [],
  currentId: null,
  selection: null,      // section id
  viewport: 'desktop',
  issues: [],           // filled by ui/validate.js after each doc change
};

let past = [], future = [], lastCoalesce = { key: null, at: 0 };

export function on(topic, fn) { listeners[topic].add(fn); return () => listeners[topic].delete(fn); }
export function emit(topic) { for (const fn of listeners[topic]) fn(); }

export const doc = () => state.pages.find((p) => p.id === state.currentId) || null;
export const section = (id) => doc()?.sections.find((s) => s.id === id) || null;
export const selected = () => section(state.selection);

/* ---------------------------------------------------------------- history */

/**
 * Apply `fn` to a draft of the whole page list, then swap it in.
 * `coalesceKey` merges rapid edits to the same field into one undo step.
 */
export function commit(fn, { coalesceKey = null } = {}) {
  const before = state.pages;
  const draft = clone(before);
  const ctx = { pages: draft, doc: draft.find((p) => p.id === state.currentId) };
  const out = fn(ctx);
  if (out === false) return;

  const now = Date.now();
  const merge = coalesceKey && lastCoalesce.key === coalesceKey && now - lastCoalesce.at < COALESCE_MS;
  if (!merge) {
    past.push(before);
    if (past.length > HISTORY_MAX) past.shift();
  }
  lastCoalesce = { key: coalesceKey, at: now };
  future = [];

  state.pages = draft;
  if (ctx.doc) ctx.doc.updatedAt = now;
  persist();
  emit('doc');
}

export function undo() {
  if (!past.length) return;
  future.push(state.pages);
  state.pages = past.pop();
  lastCoalesce = { key: null, at: 0 };
  reconcileSelection(); persist(); emit('doc'); emit('reset');
}
export function redo() {
  if (!future.length) return;
  past.push(state.pages);
  state.pages = future.pop();
  lastCoalesce = { key: null, at: 0 };
  reconcileSelection(); persist(); emit('doc'); emit('reset');
}
export const canUndo = () => past.length > 0;
export const canRedo = () => future.length > 0;

function reconcileSelection() {
  if (!doc()) state.currentId = state.pages[0]?.id || null;
  if (state.selection && !section(state.selection)) { state.selection = null; emit('sel'); }
}

/* ------------------------------------------------------------- selection */

export function select(id) {
  if (state.selection === id) return;
  state.selection = id;
  emit('sel');
}

export function setViewport(vp) { state.viewport = vp; emit('ui'); }

/* ----------------------------------------------------------- persistence */

const persist = debounce(() => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      v: SCHEMA_VERSION, pages: state.pages, currentId: state.currentId,
    }));
  } catch (e) {
    console.warn('Persist failed (quota?). Images live in IndexedDB, so this is usually a page-count issue.', e);
  }
}, 400);

export function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
    if (raw?.pages?.length) {
      state.pages = raw.pages;
      state.currentId = raw.pages.some((p) => p.id === raw.currentId) ? raw.currentId : raw.pages[0].id;
      return true;
    }
  } catch (e) { console.warn('Could not read saved state', e); }
  return false;
}

/* ----------------------------------------------------------- page CRUD */

export function newPageDoc(name = 'Untitled page', sections = []) {
  return {
    schemaVersion: SCHEMA_VERSION,
    id: uid('pg'),
    name,
    meta: { title: name, description: '' },
    sections,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function addPage(page, { select: sel = true } = {}) {
  commit(({ pages }) => { pages.push(page); });
  if (sel) openPage(page.id);
  return page.id;
}

export function openPage(id) {
  if (state.currentId === id) return;
  state.currentId = id;
  state.selection = null;
  past = []; future = [];
  persist(); emit('doc'); emit('sel'); emit('reset');
}

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

export function renamePage(id, name) {
  commit(({ pages }) => {
    const p = pages.find((x) => x.id === id);
    if (!p) return false;
    p.name = name;
    if (!p.meta.title || p.meta.title === p.name) p.meta.title = name;
  }, { coalesceKey: 'rename:' + id });
}
