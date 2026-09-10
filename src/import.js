// Import: the counterpart to export.js. What that file writes, this one reads — a page
// bundle and a saved template are the same shape, so both go through here.
//
// Everything gets fresh ids on the way in. A bundle carries the ids it had on the machine
// it left, and reusing them would let an imported page collide with one already open —
// silently, because both would answer to the same lookup.
import { clone, uid } from './util.js';
import { putAssetRaw } from './store/assets.js';
import { repack } from './model/slots.js';
import { freeCopySlug, isSlugTaken, newPageDoc } from './store/pages.js';

/**
 * Read a bundle written by `exportJson`. Throws with a message meant to be shown, not
 * logged — an author who picked the wrong file needs to be told which file it was.
 * @param {string} text
 */
export function parseBundle(text) {
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('That file is not valid JSON.'); }
  if (!data || typeof data !== 'object') throw new Error('That file does not contain a page.');
  if (data.kind !== 'lpb.page' && data.kind !== 'lpb.template') {
    throw new Error('That file was not exported from the page builder.');
  }
  const page = data.page || (data.sections ? { sections: data.sections } : null);
  if (!Array.isArray(page?.sections)) throw new Error('That file contains no sections.');
  return { kind: data.kind, page, assets: data.assets || {}, name: data.name };
}

/**
 * Put a bundle's inlined images back in the asset store. Assets keep their original ids —
 * unlike pages, they are content, and two imports of the same image should resolve to one
 * record rather than accumulating copies.
 * @param {Record<string, any>} assets
 */
export async function restoreAssets(assets) {
  for (const [id, value] of Object.entries(assets || {})) {
    // Older exports stored a bare data URL where the whole record now goes.
    const rec = typeof value === 'string'
      ? { id, name: 'Imported image', type: '', size: value.length, url: value, at: Date.now() }
      : { ...value, id };
    if (rec.url) await putAssetRaw(rec);
  }
}

/**
 * A fresh PageDoc from an imported bundle: new page id, new section ids, and a slug that
 * does not tread on a page already open.
 * @param {{ page: any, name?: string }} parsed @param {string} [name]
 */
export function pageFromBundle(parsed, name) {
  const src = parsed.page;
  const doc = newPageDoc(name || src.internal_name || parsed.name || 'Imported page',
    sectionsFrom(src.sections));
  // Carried over verbatim where the source had them — an import is meant to reproduce the
  // page, and re-typing its SEO afterwards is not reproducing it.
  if (src.page_type) doc.page_type = src.page_type;
  if (src.meta) doc.meta = { ...doc.meta, ...clone(src.meta) };
  if (src.route) doc.route = { ...doc.route, ...clone(src.route) };
  // Keep the source slug when it is free; slugs are unique across every page (doc 20 §5.2),
  // so a clash takes the same `-copy` suffix Duplicate uses rather than failing the import.
  const slug = src.slug || doc.slug;
  doc.slug = isSlugTaken(slug) ? freeCopySlug(slug) : slug;
  return doc;
}

/** @param {any[]} sections */
export function sectionsFrom(sections) {
  const now = Date.now();
  const out = clone(sections || []).map((s) => ({
    ...s,
    id: uid('sec'),
    is_visible: s.is_visible !== false,
    anchor_id: s.anchor_id ?? null,
    created_at: now,
    updated_at: now,
  }));
  return repack(out);
}
