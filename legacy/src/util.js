// Small shared helpers. No dependencies.

export const uid = (p = 'id') =>
  p + '_' + Math.random().toString(36).slice(2, 9);

export const clone = (v) =>
  typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v));

export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function debounce(fn, ms) {
  let t;
  const wrapped = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  wrapped.cancel = () => clearTimeout(t);
  wrapped.flush = (...a) => { clearTimeout(t); fn(...a); };
  return wrapped;
}

/** get('a.b.0.c') on a nested object/array */
export function getPath(obj, path) {
  if (!path) return obj;
  return String(path).split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

/** set('a.b.0.c', v) — creates intermediate objects/arrays as needed. Mutates. */
export function setPath(obj, path, value) {
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

export const isBlank = (v) => v == null || (typeof v === 'string' && v.trim() === '');

/** True when a rich-text HTML string carries no visible content. */
export const isBlankHtml = (h) =>
  isBlank(h) || String(h).replace(/<[^>]*>/g, '').replace(/&nbsp;|\s/g, '') === '';

/** el('div.cls#id', {attrs}, children|string) */
export function el(spec, attrs = {}, children = []) {
  const m = /^([a-zA-Z0-9-]+)?((?:[.#][\w-]+)*)$/.exec(spec) || [];
  const node = document.createElement(m[1] || 'div');
  for (const token of (m[2] || '').match(/[.#][\w-]+/g) || []) {
    if (token[0] === '.') node.classList.add(token.slice(1));
    else node.id = token.slice(1);
  }
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className += (node.className ? ' ' : '') + v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of [].concat(children)) {
    if (c == null || c === false) continue;
    node.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return node;
}

export function toast(msg) {
  const root = document.getElementById('toast-root');
  const t = el('.toast', { text: msg });
  root.append(t);
  setTimeout(() => t.remove(), 2400);
}

/** Format rgba/hex for display. */
export function readColor(c) {
  const m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(c || '');
  if (m) return { hex: rgbToHex(+m[1], +m[2], +m[3]), a: m[4] === undefined ? 1 : +m[4] };
  const h = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(c || '');
  if (!h) return { hex: '#000000', a: 1 };
  let s = h[1];
  if (s.length === 3) s = s.split('').map((x) => x + x).join('');
  if (s.length === 8) return { hex: '#' + s.slice(0, 6), a: Math.round((parseInt(s.slice(6), 16) / 255) * 100) / 100 };
  return { hex: '#' + s, a: 1 };
}
const rgbToHex = (r, g, b) =>
  '#' + [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('');

export function writeColor(hex, a) {
  if (a >= 1) return hex;
  const s = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${Math.round(a * 100) / 100})`;
}

export const slugify = (s) => String(s).toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'page';

export const fmtBytes = (n) =>
  n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(0) + ' KB' : (n / 1048576).toFixed(1) + ' MB';
