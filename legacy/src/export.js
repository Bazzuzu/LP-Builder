// Export / import. The HTML export is a single self-contained file: images are already
// data URLs, so it drops straight into a GitHub Pages repo with no asset folder.
import { renderPage } from './render/page.js';
import { slugify, toast } from './util.js';
import { getAsset, putAssetRaw } from './assets.js';
import { SCHEMA_VERSION } from './store.js';

function download(filename, text, mime = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type: mime + ';charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportHtml(doc) {
  const html = renderPage(doc, { mode: 'export' });
  download(`${slugify(doc.name)}.html`, html, 'text/html');
  toast('Exported ' + slugify(doc.name) + '.html');
  return html;
}

/** Every asset id referenced anywhere in the doc, so a JSON export travels with its images. */
function collectAssets(value, out = new Set()) {
  if (typeof value === 'string') { if (value.startsWith('as_')) out.add(value); return out; }
  if (Array.isArray(value)) { value.forEach((v) => collectAssets(v, out)); return out; }
  if (value && typeof value === 'object') { Object.values(value).forEach((v) => collectAssets(v, out)); return out; }
  return out;
}

export function pageBundle(doc) {
  const ids = [...collectAssets(doc)];
  return {
    kind: 'lpb-page',
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    page: doc,
    assets: ids.map((id) => getAsset(id)).filter(Boolean),
  };
}

export function exportJson(doc) {
  download(`${slugify(doc.name)}.json`, JSON.stringify(pageBundle(doc), null, 2), 'application/json');
  toast('Exported page JSON');
}

/** @returns {Promise<object|null>} the imported PageDoc, with its assets registered. */
export async function importBundle(text) {
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('That is not valid JSON.'); }
  const page = data.page || (data.sections ? data : null);
  if (!page?.sections) throw new Error('No page found in this file.');
  for (const a of data.assets || []) await putAssetRaw(a);
  page.id = 'pg_' + Math.random().toString(36).slice(2, 9);
  page.schemaVersion = SCHEMA_VERSION;
  return page;
}

export { download };
