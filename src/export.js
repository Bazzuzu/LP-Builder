// Export. The HTML is the same document the preview renders, so what you see is the file.
import { renderPage } from './render/page.js';
import { REGISTRY } from './sections/_registry.js';
import { globals } from './store/globals.js';
import { assetUrl } from './store/assets.js';

/** @param {import('./model/types.js').PageDoc|null} page */
export function exportHtml(page) {
  if (!page) return;
  const html = renderPage(page, { registry: REGISTRY, globals: globals(), mode: 'export' });
  download(`${page.slug || 'page'}.html`, html, 'text/html');
}

/** The page document, with assets inlined so the JSON opens anywhere. */
export function exportJson(page) {
  if (!page) return;
  download(`${page.slug || 'page'}.json`, JSON.stringify(bundle(page), null, 2), 'application/json');
}

export function bundle(page) {
  /** @type {Record<string, string>} */
  const assets = {};
  walk(page, (v) => {
    if (v && typeof v === 'object' && typeof v.asset === 'string') {
      const url = assetUrl(v.asset);
      if (url) assets[v.asset] = url;
    }
  });
  return { kind: 'lpb.page', v: page.schema_version, page, assets };
}

function walk(node, fn) {
  if (!node || typeof node !== 'object') return;
  fn(node);
  for (const v of Object.values(node)) walk(v, fn);
}

function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
