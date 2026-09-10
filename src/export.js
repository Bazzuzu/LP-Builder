// Export. The HTML is the same document the preview renders, so what you see is the file.
import { renderPage } from './render/page.js';
import { REGISTRY } from './sections/_registry.js';
import { globals } from './store/globals.js';
import { getAsset } from './store/assets.js';
import { slugify } from './util.js';

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

/**
 * Every asset the page references, keyed by id. The whole record travels, not just the data
 * URL: on the other side the image field shows "cabin.jpg · 240 KB", and a name it never
 * received is a name it cannot show. Older exports stored a bare URL string, and the
 * importer still reads those.
 */
export function bundle(page) {
  /** @type {Record<string, any>} */
  const assets = {};
  walk(page, (v) => {
    if (v && typeof v === 'object' && typeof v.asset === 'string') {
      const rec = getAsset(v.asset);
      if (rec?.url) assets[v.asset] = rec;
    }
  });
  return { kind: 'lpb.page', v: page.schema_version, page, assets };
}

/**
 * The current page as a template module, ready to be committed. A `.js` file rather than
 * `.json` because this project has no build step and no JSON import assertions — one plain
 * ES module the registry can import is the cheapest thing that works everywhere.
 * @param {import('./model/types.js').PageDoc|null} page
 * @param {{ name: string, description?: string }} meta
 */
export function exportTemplate(page, { name, description = '' }) {
  if (!page) return;
  const id = slugify(name) || 'template';
  const { assets } = bundle(page);
  const data = {
    kind: 'lpb.template',
    v: page.schema_version,
    id,
    name,
    description,
    // Only what defines the template: no page id, slug, timestamps or SEO — a template is a
    // starting point, and inheriting another page's canonical URL is how duplicates happen.
    sections: page.sections.map((s) => ({
      key: s.key, slot_index: s.slot_index, order_in_slot: s.order_in_slot,
      is_visible: s.is_visible, anchor_id: s.anchor_id, props: s.props,
    })),
    assets,
  };
  const file = `// Saved from the editor on ${new Date().toISOString().slice(0, 10)}.\n`
    + `// To ship it: drop this file in src/presets/templates/ and add one line to\n`
    + `// src/presets/templates/index.js —  import ${jsIdent(id)} from './${id}.js';\n`
    + `// then list it in that file's TEMPLATES array.\n`
    + `export default ${JSON.stringify(data, null, 2)};\n`;
  download(`${id}.js`, file, 'text/javascript');
}

/** A slug turned into something that can be a variable name. */
const jsIdent = (/** @type {string} */ id) =>
  id.replace(/[^a-z0-9]+(.)?/gi, (_, c) => (c ? c.toUpperCase() : '')).replace(/^\d/, '_$&');

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
