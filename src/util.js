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

/**
 * el('div.cls#id', {attrs}, children|string)
 * @param {string} spec
 * @param {Record<string, any>} [attrs]
 * @param {any} [children]
 */
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
  for (const c of Array.isArray(children) ? children : [children]) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

/** @param {string} msg */
export function toast(msg) {
  const root = document.getElementById('toast-root');
  if (!root) return;                       // no toast host on a bare export page
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

/** Always writes hex — 6 digits when opaque, 8 (#RRGGBBAA) when translucent. */
export function writeColor(hex, a) {
  if (a >= 1) return hex.toUpperCase();
  const alphaHex = Math.round(a * 255).toString(16).padStart(2, '0');
  return (hex + alphaHex).toUpperCase();
}

export const slugify = (s) => String(s).toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'page';

export const fmtBytes = (n) =>
  n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(0) + ' KB' : (n / 1048576).toFixed(1) + ' MB';

/* ------------------------------------------------------------ time zones */

/** IANA zone, or 'UTC' if the string is not one the runtime recognises. */
function safeZone(tz) {
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return tz; }
  catch { return 'UTC'; }
}

/** Milliseconds to ADD to a UTC instant's own fields to get its wall-clock reading in `tz`. */
function tzOffsetMs(date, tz) {
  const parts = {};
  for (const { type, value } of new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(date)) if (type !== 'literal') parts[type] = value;
  const asIfUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day,
    parts.hour === '24' ? 0 : +parts.hour, +parts.minute, +parts.second);
  return asIfUtc - date.getTime();
}

/**
 * Read a `<input type="datetime-local">` value as wall-clock time IN `tz`, return the
 * absolute instant as ISO8601 (UTC). This is what makes a countdown's deadline the same
 * moment for every visitor regardless of their own timezone.
 * @param {string} localValue "YYYY-MM-DDTHH:mm"
 * @param {string} tz IANA zone name
 */
export function zonedTimeToIso(localValue, tz) {
  if (!localValue) return null;
  const zone = safeZone(tz);
  const guess = new Date(localValue + ':00Z');            // read the digits as if they were UTC
  return new Date(guess.getTime() - tzOffsetMs(guess, zone)).toISOString();
}

/**
 * Inverse of `zonedTimeToIso` — format a stored absolute instant as the wall-clock string
 * `tz` would show, for redisplay in a `datetime-local` input.
 * @param {string|null} iso
 * @param {string} tz
 */
export function isoToZonedLocal(iso, tz) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const parts = {};
  for (const { type, value } of new Intl.DateTimeFormat('en-US', {
    timeZone: safeZone(tz), hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).formatToParts(d)) if (type !== 'literal') parts[type] = value;
  const hh = parts.hour === '24' ? '00' : parts.hour;
  return `${parts.year}-${parts.month}-${parts.day}T${hh}:${parts.minute}`;
}

/**
 * A placeholder alt suggestion from a filename — not a description of what the image shows,
 * just something better than leaving the field empty. "cabin-lounge-2.jpg" -> "Cabin lounge 2".
 * Meaningless names ("IMG_4821.jpg") stay meaningless; this does not guess content.
 * @param {string} filename
 */
export function humanizeFilename(filename) {
  const stem = String(filename || '').replace(/\.[a-z0-9]+$/i, '');
  const spaced = stem.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  return spaced ? spaced.charAt(0).toUpperCase() + spaced.slice(1) : '';
}
