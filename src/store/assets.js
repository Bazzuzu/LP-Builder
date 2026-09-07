// Asset store: images live in IndexedDB as data URLs (localStorage is far too small).
// Everything is mirrored into an in-memory Map so renderers can resolve ids synchronously.
import { uid } from '../util.js';

const DB = 'lpb-assets', STORE = 'assets';
const mem = new Map();
let dbp = null;

function open() {
  if (dbp) return dbp;
  dbp = new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'id' });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}

function tx(mode, fn) {
  return open().then((db) => new Promise((res, rej) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => res(req && req.result);
    t.onerror = () => rej(t.error);
  }));
}

/** Load the whole store into memory. Fine at prototype scale. */
export async function initAssets() {
  try {
    const all = await tx('readonly', (s) => s.getAll());
    for (const a of all || []) mem.set(a.id, a);
  } catch (e) {
    console.warn('Asset store unavailable, running in-memory only.', e);
  }
}

export const getAsset = (id) => (id ? mem.get(id) || null : null);
export const assetUrl = (id) => getAsset(id)?.url || '';
export const allAssets = () => [...mem.values()];

export async function putAsset(file) {
  const url = await new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = () => rej(fr.error);
    fr.readAsDataURL(file);
  });
  const rec = { id: uid('as'), name: file.name, type: file.type, size: file.size, url, at: Date.now() };
  mem.set(rec.id, rec);
  try { await tx('readwrite', (s) => s.put(rec)); } catch (e) { console.warn(e); }
  return rec;
}

/** Register an asset from a data URL (used when importing a page JSON with inlined images). */
export async function putAssetRaw(rec) {
  if (!rec?.id || mem.has(rec.id)) return rec?.id;
  mem.set(rec.id, rec);
  try { await tx('readwrite', (s) => s.put(rec)); } catch (e) { console.warn(e); }
  return rec.id;
}

export async function deleteAsset(id) {
  mem.delete(id);
  try { await tx('readwrite', (s) => s.delete(id)); } catch (e) { console.warn(e); }
}

/** Pick a file from disk and store it. Resolves to an asset id, or null if cancelled. */
export function pickFile(accept) {
  return new Promise((res) => {
    const i = document.createElement('input');
    i.type = 'file';
    i.accept = accept || 'image/*';
    i.onchange = async () => {
      const f = i.files?.[0];
      res(f ? (await putAsset(f)).id : null);
    };
    // A cancelled dialog fires no event in most browsers; the promise simply never settles,
    // which is harmless here since nothing awaits it in a blocking way.
    i.click();
  });
}
