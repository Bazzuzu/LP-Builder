// HTML building helpers shared by every section renderer.
import { esc } from '../util.js';
import { assetUrl } from '../store/assets.js';

export { esc };

/** ` name="value"`, or nothing when the value is empty. @param {string} name @param {any} v */
export const attr = (name, v) =>
  v == null || v === false || v === '' ? '' : ` ${name}="${esc(v)}"`;

/** ` style="a:b;c:d"` from an object, skipping empty values. @param {Record<string, any>} obj */
export const style = (obj) => {
  const body = Object.entries(obj || {})
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
  return body ? ` style="${esc(body)}"` : '';
};

/** Join truthy class names. @param {...(string|false|null|undefined)} names */
export const cls = (...names) => names.filter(Boolean).join(' ');

/**
 * Rich text is stored as HTML produced by our own editor, so it is emitted as-is.
 * Nothing here sanitises: the only writer is an authenticated admin, and the output is a
 * static file. If a public or untrusted writer is ever added, this is the choke point.
 * @param {string|null|undefined} html
 */
export const rich = (html) => (html == null ? '' : String(html));

/** True when a rich-text value carries no visible content. @param {any} v */
export const blankRich = (v) =>
  v == null || String(v).replace(/<[^>]*>/g, '').replace(/&nbsp;|\s/g, '') === '';

/** @typedef {{ asset?: string|null, url?: string|null, alt?: string|null }} MediaValue */

/**
 * An `<img>` for a media field, or a labelled placeholder when nothing is uploaded yet.
 * `alt` is always emitted — empty for decorative assets, which is what screen readers need
 * to skip them (SYS-02 §6).
 * @param {MediaValue|null|undefined} media
 * @param {{ className?: string, decorative?: boolean, placeholder?: string, loading?: 'lazy'|'eager' }} [opts]
 */
export function img(media, opts = {}) {
  const { className = '', decorative = false, placeholder = 'Image', loading = 'lazy' } = opts;
  const src = media?.url || (media?.asset ? assetUrl(media.asset) : '');
  if (!src) return `<div class="${esc(cls('ph', className))}">${esc(placeholder)}</div>`;
  const alt = decorative ? '' : (media?.alt || '');
  return `<img${attr('class', className)} src="${esc(src)}" alt="${esc(alt)}"${attr('loading', loading)}>`;
}

/* --------------------------------------------------------- section shell */

const SIZE_CLASS = { SIZE_S: 'h-s', SIZE_M: 'h-m', SIZE_L: 'h-l' };
const ALIGN_CLASS = { ALIGN_LEFT: 'a-left', ALIGN_CENTER: 'a-center' };

/**
 * The intro header of a dynamic section. The whole wrapper disappears when both the title
 * and the subheading are empty, so an unused header leaves no vertical gap
 * (11_ABSTRACT §5.1).
 * @param {Record<string, any>} props
 */
export function sectionHeader(props) {
  const title = props?.section_title;
  const sub = props?.subheading;
  const hasTitle = title != null && String(title).trim() !== '';
  const hasSub = !blankRich(sub);
  if (!hasTitle && !hasSub) return '';
  return `<div class="sec-head">`
    + (hasTitle ? `<h2 class="sec-title">${esc(title)}</h2>` : '')
    + (hasSub ? `<div class="sec-sub">${rich(sub)}</div>` : '')
    + `</div>`;
}

/**
 * The `<section>` wrapper every dynamic section shares: background token, heading scale,
 * alignment and the optional in-page anchor id.
 * @param {import('../model/types.js').Section} section
 * @param {string} inner
 * @param {{ className?: string, withHeader?: boolean }} [opts]
 */
export function dynamicShell(section, inner, opts = {}) {
  const { className = '', withHeader = true } = opts;
  const p = section.props || {};
  const klass = cls(
    'sec',
    SIZE_CLASS[p.heading_size] || 'h-m',
    ALIGN_CLASS[p.heading_align] || 'a-left',
    className,
  );
  return `<section class="${esc(klass)}"${attr('id', section.anchor_id)}`
    // Exposed as a custom property, not just the `background` shorthand, so descendants
    // (e.g. a photo's "cutout" stroke) can match the section's own background exactly,
    // whatever the admin set it to — not a value hardcoded to assume white.
    + style({ background: p.bg_color, '--section-bg': p.bg_color || '#FFFFFF' })
    + `><div class="wrap">`
    + (withHeader ? sectionHeader(p) : '')
    + inner
    + `</div></section>`;
}

/**
 * A CTA link. `#lead-modal` is intercepted by the runtime; external links get the security
 * attributes rather than a recommendation to add them (doc 38 §6.2).
 * @param {{ label?: string, href?: string }|null|undefined} cta
 * @param {string} [className]
 */
export function ctaLink(cta, className = 'btn') {
  if (!cta?.label) return '';
  const href = cta.href || '#lead-modal';
  const external = /^https?:\/\//i.test(href);
  return `<a class="${esc(className)}" href="${esc(href)}"`
    + (external ? ' target="_blank" rel="noopener noreferrer"' : '')
    + `>${esc(cta.label)}</a>`;
}
