// A small anchored popup menu. It exists so a row's secondary actions can be one button
// instead of five: a list that is mostly rows of controls reads as a control panel, and
// the page structure should read as the page.
import { el } from '../util.js';

/** @typedef {{ label: string, onClick: () => void, danger?: boolean, disabled?: boolean }} MenuItem */

let current = /** @type {HTMLElement|null} */ (null);
let detach = /** @type {(() => void)|null} */ (null);

export function closeMenu() {
  detach?.();
  current?.remove();
  current = null;
  detach = null;
}

/**
 * @param {HTMLElement} anchor the button that opened it — the menu hangs under its left edge
 * @param {(MenuItem|'-')[]} items `'-'` draws a separator
 */
export function openMenu(anchor, items) {
  const reopening = current?.dataset.for === anchorKey(anchor);
  closeMenu();
  if (reopening) return;                     // clicking the same button again closes it

  const box = el('.menu', { 'data-for': anchorKey(anchor), role: 'menu' });
  for (const it of items) {
    if (it === '-') { box.append(el('.menu-sep')); continue; }
    box.append(el('button', {
      type: 'button', role: 'menuitem', disabled: it.disabled,
      class: it.danger ? 'danger' : '',
      onclick: (/** @type {MouseEvent} */ e) => { e.stopPropagation(); closeMenu(); it.onClick(); },
    }, it.label));
  }

  document.body.append(box);
  const r = anchor.getBoundingClientRect();
  const w = box.offsetWidth;
  const h = box.offsetHeight;
  // Flip up / pull left rather than letting the menu run off the window.
  box.style.left = `${Math.max(8, Math.min(r.left, window.innerWidth - w - 8))}px`;
  box.style.top = r.bottom + h + 8 > window.innerHeight
    ? `${Math.max(8, r.top - h - 4)}px`
    : `${r.bottom + 4}px`;

  const onDown = (/** @type {MouseEvent} */ e) => {
    if (!box.contains(/** @type {Node} */ (e.target))) closeMenu();
  };
  const onKey = (/** @type {KeyboardEvent} */ e) => { if (e.key === 'Escape') closeMenu(); };
  // Deferred, or the very click that opened the menu would immediately close it again.
  const t = setTimeout(() => document.addEventListener('mousedown', onDown), 0);
  document.addEventListener('keydown', onKey);
  window.addEventListener('resize', closeMenu);
  // Any scroll anywhere, capture phase: the menu is positioned in viewport coordinates and
  // would otherwise detach from its button.
  document.addEventListener('scroll', closeMenu, true);

  current = box;
  detach = () => {
    clearTimeout(t);
    document.removeEventListener('mousedown', onDown);
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', closeMenu);
    document.removeEventListener('scroll', closeMenu, true);
  };
}

/** Identity for "is this the same button?", without holding a reference across repaints. */
const anchorKey = (/** @type {HTMLElement} */ a) =>
  (a.closest('[data-id]')?.getAttribute('data-id') || '') + ':' + a.className;
