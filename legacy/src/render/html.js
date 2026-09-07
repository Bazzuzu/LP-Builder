// Rendering primitives shared by every section renderer.
// The same functions run for the live preview and for the exported file, so preview
// is WYSIWYG by construction.
import { esc } from '../util.js';
import { assetUrl } from '../assets.js';

export { esc };

/** Image fields hold either an asset id or a literal URL (built-in preset icons). */
export const src = (v) => (!v ? '' : String(v).startsWith('as_') ? assetUrl(v) : v);

const ALLOWED = {
  B: [], STRONG: [], I: [], EM: [], S: [], STRIKE: [], U: [], BR: [], P: [],
  UL: [], OL: [], LI: [], SPAN: ['style'], A: ['href', 'target', 'rel'], DIV: [],
};

/** Sanitize admin-authored rich text down to the tags the spec allows. */
export function rt(html) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html');
  const root = doc.body.firstChild;
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) continue;
      if (child.nodeType !== 1) { child.remove(); continue; }
      // Some browsers (and any page saved before this fix) still carry legacy
      // <font color> from execCommand — fold it into the <span style> form we allow.
      if (child.tagName === 'FONT') {
        const span = doc.createElement('span');
        const color = child.getAttribute('color');
        if (color) span.setAttribute('style', 'color:' + color);
        span.append(...child.childNodes);
        child.replaceWith(span);
        walk(span);
        continue;
      }
      const allowed = ALLOWED[child.tagName];
      if (!allowed) { child.replaceWith(...child.childNodes); continue; }
      for (const attr of [...child.attributes]) {
        if (!allowed.includes(attr.name)) { child.removeAttribute(attr.name); continue; }
        if (attr.name === 'style') {
          const color = /(?:^|;)\s*color\s*:\s*([^;]+)/i.exec(attr.value);
          if (color) child.setAttribute('style', 'color:' + color[1].trim());
          else child.removeAttribute('style');
        }
        if (attr.name === 'href' && /^\s*javascript:/i.test(attr.value)) child.setAttribute('href', '#');
      }
      if (child.tagName === 'A' && child.getAttribute('target') === '_blank')
        child.setAttribute('rel', 'noopener noreferrer');
      walk(child);
    }
  };
  walk(root);
  return root.innerHTML;
}

/** True when a rich-text value renders nothing worth a DOM node. */
export const blank = (h) => !h || String(h).replace(/<[^>]*>/g, '').replace(/&nbsp;|\s/g, '') === '';

export const attr = (name, value) => (value == null || value === '' ? '' : ` ${name}="${esc(value)}"`);

export const style = (obj) => {
  const s = Object.entries(obj).filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}:${v}`).join(';');
  return s ? ` style="${esc(s)}"` : '';
};

/** Wrapper every dynamic section shares: background, heading size/align, anchor id. */
export function shell(section, inner, extra = {}) {
  const p = section.props || {};
  const cls = ['sec', `sec-${section.type}`, `h-${p.headingSize || 'm'}`, `a-${p.headingAlign || 'left'}`,
    extra.class].filter(Boolean).join(' ');
  return `<section class="${cls}"${attr('id', p.anchorId)} data-sec="${esc(section.id)}"` +
    style({ background: p.bg || '' }) + `><div class="wrap">${inner}</div></section>`;
}

/** Optional "title + subheading" header block. */
export function header(p) {
  const t = p.title ? `<h2 class="sec-title">${esc(p.title)}</h2>` : '';
  const s = !blank(p.subheading) ? `<div class="sec-sub">${rt(p.subheading)}</div>` : '';
  return t || s ? `<div class="sec-head">${t}${s}</div>` : '';
}

export function ctaBtn(cta, cls = 'btn') {
  if (!cta?.on || !cta.label) return '';
  return `<a class="${cls}"${attr('href', cta.href || '#lead-modal')}>${esc(cta.label)}</a>`;
}

export const imgTag = (v, alt = '', cls = '', st = {}) => {
  const u = src(v);
  return u ? `<img${attr('class', cls)} src="${esc(u)}"${attr('alt', alt)}${style(st)} loading="lazy">` : '';
};

export const placeholder = (label, cls = '') =>
  `<div class="ph ${cls}">${esc(label)}</div>`;
