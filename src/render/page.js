// Assembles a complete, standalone HTML document from a PageDoc.
// One function serves both surfaces: `mode: 'preview'` adds the click-to-select bridge,
// `mode: 'export'` produces the shippable file. They are otherwise byte-identical, so the
// preview cannot drift from what ships.
import { esc } from '../util.js';
import { inRenderOrder } from '../model/slots.js';
import { TOKENS_CSS } from './tokens.js';
import { BASE_CSS } from './base.js';
import { RUNTIME_JS, previewBridge } from './runtime.js';

/**
 * @typedef {import('../model/types.js').PageDoc} PageDoc
 * @typedef {import('../model/types.js').SectionType} SectionType
 * @typedef {import('../model/types.js').GlobalConfig} GlobalConfig
 */

/**
 * @param {PageDoc|null} page
 * @param {{ registry: Record<string, SectionType>, globals: GlobalConfig,
 *           mode?: 'preview'|'export', selected?: string|null }} opts
 * @returns {string}
 */
export function renderPage(page, { registry, globals, mode = 'export', selected = null }) {
  if (!page) return '<!doctype html><html lang="en"><body></body></html>';

  const visible = inRenderOrder(page.sections || []).filter((s) => s.is_visible !== false);
  const ctx = { page, globals, mode };

  /** @type {Set<string>} */
  const usedKeys = new Set();
  const body = visible.map((s, i) => {
    const type = registry[s.key];
    if (!type?.render) return `<!-- unknown section type: ${esc(s.key)} -->`;
    usedKeys.add(s.key);
    let html;
    try {
      html = type.render(s, ctx);
    } catch (err) {
      // One broken section must not take the page down: the editor still needs to render,
      // and the author needs to see which block failed.
      console.error('Render failed for', s.key, err);
      html = `<!-- render error in ${esc(s.key)}: ${esc(/** @type {Error} */ (err).message)} -->`;
    }
    // Two sections that both sit on the same flat colour would otherwise run together
    // as one block — a hairline seam keeps them visually distinct. Sections with a
    // configurable `bg_color` are compared on that; anchors/statics without one (Prices,
    // Contact, Subscription, Footer, Trust) fall back to their type's fixed `fixedBg` — only
    // Hero, whose background is an image, declares none and so never grows one either side.
    const divider = i > 0 && sameBg(visible[i - 1], s, registry) ? '<div class="lpb-divider"></div>' : '';
    return divider + (mode === 'preview'
      ? `<div class="lpb-sec" data-section-id="${esc(s.id)}">${html}</div>`
      : html);
  }).join('\n');

  // Only the CSS of section types this page actually uses travels with the export.
  const sectionCss = [...usedKeys].map((k) => registry[k]?.css || '').filter(Boolean).join('\n');

  const meta = page.meta || {};
  const heroTheme = visible.find((s) => s.key === 'SECTION_HERO')?.props?.theme_mode || 'Dark';
  const title = meta.meta_title || page.internal_name || 'Landing page';

  return `<!doctype html>
<html lang="en" data-theme="${esc(String(heroTheme).toLowerCase())}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
${meta.meta_description ? `<meta name="description" content="${esc(meta.meta_description)}">` : ''}
${meta.canonical_url ? `<link rel="canonical" href="${esc(meta.canonical_url)}">` : ''}
${meta.noindex_nofollow ? '<meta name="robots" content="noindex, nofollow">' : ''}
<meta property="og:title" content="${esc(title)}">
${meta.meta_description ? `<meta property="og:description" content="${esc(meta.meta_description)}">` : ''}
${meta.og_image ? `<meta property="og:image" content="${esc(meta.og_image)}">` : ''}
<style>${TOKENS_CSS}${BASE_CSS}${sectionCss}${mode === 'preview' ? PREVIEW_CSS : ''}</style>
</head>
<body${mode === 'preview' ? ' class="lpb-edit"' : ''}>
${body}
${leadModal()}
<script>${RUNTIME_JS}</script>
${mode === 'preview' ? `<script>${previewBridge(selected)}</script>` : ''}
</body>
</html>`;
}

/**
 * The flat background colour a section renders on, or null when it doesn't have one.
 * A configurable `bg_color` wins when present; otherwise falls back to the section type's
 * own fixed `fixedBg` (set on types whose background isn't an editable field but is still a
 * known flat colour — Prices, Contact, Subscription, Footer, Trust).
 * @param {import('../model/types.js').Section} s @param {SectionType} [type]
 */
const sectionBg = (s, type) => {
  const v = s?.props?.bg_color ?? type?.fixedBg;
  return v ? String(v).trim().toUpperCase() : null;
};

/**
 * @type {(a: import('../model/types.js').Section, b: import('../model/types.js').Section,
 *          registry: Record<string, SectionType>) => boolean}
 */
const sameBg = (a, b, registry) => {
  const bgA = sectionBg(a, registry[a.key]);
  const bgB = sectionBg(b, registry[b.key]);
  return bgA != null && bgA === bgB;
};

/**
 * Minimal lead overlay. The full field contract of doc 21 — trip type, route, dates,
 * cabin, travellers, consent and the CRM payload — arrives in phase 5; this is the target
 * every `#lead-modal` CTA needs in the meantime, and it is listed in BACKLOG.md.
 */
function leadModal() {
  return `<div class="lead" id="lead-modal" hidden>
  <div class="lead-box" role="dialog" aria-modal="true" aria-labelledby="lead-title">
    <button class="close" type="button" data-lead-close aria-label="Close">&times;</button>
    <h3 id="lead-title">Request a quote</h3>
    <p class="lead-intro">A travel specialist replies within 15 minutes.</p>
    <form data-lead-form novalidate>
      <input name="destination" placeholder="Destination" data-lead-dest aria-label="Destination">
      <input name="full_name" placeholder="Full name" required aria-label="Full name">
      <input name="email" type="email" placeholder="Email" required aria-label="Email">
      <input name="phone" placeholder="Phone" aria-label="Phone">
      <button class="btn" type="submit">Send request</button>
    </form>
    <div class="msg" data-msg role="status"></div>
  </div>
</div>`;
}

/** Editor affordances. Never present in an export. */
const PREVIEW_CSS = `
.lpb-edit .lpb-sec{position:relative;cursor:pointer}
.lpb-edit .lpb-sec::after{content:"";position:absolute;inset:0;pointer-events:none;
  outline:2px solid transparent;outline-offset:-2px;transition:outline-color .12s}
.lpb-edit .lpb-sec:hover::after{outline-color:rgba(184,135,110,.45)}
.lpb-edit .lpb-sec.lpb-selected::after{outline-color:var(--bronze)}
`;
