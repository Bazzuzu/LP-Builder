// Page structure panel.
//
// It shows the page the way the manager thinks about it — a stack of sections, some of
// them pinned — and never in the vocabulary of the data model. "Slot 03" is a slot index;
// what the manager needs to know is only that a section cannot be dragged past a pinned
// one, and the drawn boundaries say that on their own.
//
// One row = one section: what type it is, what it currently says, whether it needs
// attention. Everything else (reorder, duplicate, hide, delete) lives behind one menu, so
// the resting state of the list is a list, not a grid of glyphs.
import { el } from '../util.js';
import { ANCHOR_SLOT, DYNAMIC_SLOTS } from '../model/enums.js';
import { sectionsInSlot } from '../model/slots.js';
import { REGISTRY, sectionLabel } from '../sections/_registry.js';
import * as store from '../store/pages.js';
import { openLibrary } from './library.js';
import { openMenu } from './menu.js';
import { confirmDelete } from './confirm.js';

const LOCK_SVG = '<svg viewBox="0 0 12 12" width="10" height="10" fill="none" '
  + 'stroke="currentColor" stroke-width="1.2"><rect x="2.2" y="5.2" width="7.6" height="5.4" rx="1"/>'
  + '<path d="M4.1 5.2V3.9a1.9 1.9 0 0 1 3.8 0v1.3"/></svg>';

/** @type {number[]} */
const ANCHOR_SLOTS = Object.values(ANCHOR_SLOT);
const ALL_SLOTS = [...new Set([...ANCHOR_SLOTS, ...DYNAMIC_SLOTS])].sort((a, b) => a - b);

export function mountOutline() {
  const host = /** @type {HTMLElement} */ (document.getElementById('outline'));
  /** The section being dragged, or null. Lives across repaints of a single drag. */
  let dragging = /** @type {string|null} */ (null);

  const paint = () => {
    const doc = store.doc();
    host.replaceChildren();
    if (!doc) return;

    for (const slot of ALL_SLOTS) {
      const items = sectionsInSlot(doc.sections, slot);
      if (ANCHOR_SLOTS.includes(slot)) {
        for (const s of items) host.append(row(s, slot, 0, true));
        continue;
      }
      // A drop zone even when empty: the boundaries it draws are the only visible reason a
      // section cannot be dragged past a pinned one.
      const zone = el('.ol-zone', { 'data-slot': String(slot) });
      items.forEach((s, i) => zone.append(row(s, slot, i, false)));
      zone.append(insertLine(slot, items.length));
      host.append(zone);
    }
  };

  /* ------------------------------------------------------------------ rows */

  /**
   * @param {import('../model/types.js').Section} s
   * @param {number} slot @param {number} index @param {boolean} pinned
   */
  function row(s, slot, index, pinned) {
    const type = REGISTRY[s.key];
    const issues = store.state.issues.filter((i) => i.sectionId === s.id);
    const blocking = issues.filter((i) => i.level !== 'L2');
    const hidden = s.is_visible === false;
    const label = sectionLabel(s);

    const node = el('.ol-item', {
      'data-id': s.id,
      class: [store.state.selection === s.id && 'sel', hidden && 'is-hidden',
        pinned && 'pinned'].filter(Boolean).join(' '),
      onclick: () => store.select(s.id),
    });

    node.append(
      pinned
        // Drawn rather than typed: the Unicode padlocks are either missing from the default
        // UI font (tofu) or forced to colour emoji, and neither belongs in a quiet list.
        ? el('span.ol-grip.ol-pin', { title: 'Fixed position — every page has this section', html: LOCK_SVG })
        : el('span.ol-grip', { title: 'Drag to reorder', text: '⠿' }),
      el('span.ol-icon', { text: type?.icon || '▦' }),
      el('.ol-text', {}, [
        el('.ol-title', { text: type?.name || s.key }),
        label ? el('.ol-sub', { text: label, title: label }) : null,
      ].filter(Boolean)),
      el('.ol-flags', {}, [
        hidden ? el('span.ol-flag', { title: 'Hidden on the published page', text: '◌' }) : null,
        issues.length
          ? el('span.ol-count', {
            class: blocking.length ? 'blocking' : 'minor',
            title: issues.map((i) => i.message).join('\n'),
            text: String(issues.length),
          })
          : null,
      ].filter(Boolean)),
    );

    if (!pinned) {
      node.append(el('button.ol-more', {
        type: 'button', title: 'More actions', text: '⋯',
        // Deliberately does NOT select: selecting swaps this whole panel for the section's
        // settings, and someone reaching for "duplicate" has not asked to leave the list.
        onclick: (/** @type {MouseEvent} */ e) => {
          e.stopPropagation();
          openMenu(/** @type {HTMLElement} */ (e.currentTarget), rowMenu(s, hidden));
        },
      }));
      wireDrag(node, s.id, slot, index);
    }
    return node;
  }

  /** @param {import('../model/types.js').Section} s @param {boolean} hidden */
  const rowMenu = (s, hidden) => [
    { label: 'Move up', onClick: () => store.moveSection(s.id, 'up') },
    { label: 'Move down', onClick: () => store.moveSection(s.id, 'down') },
    '-',
    { label: hidden ? 'Show on the page' : 'Hide from the page',
      onClick: () => store.toggleVisibility(s.id) },
    // Stays in the list rather than jumping into the copy's settings: the copy is already
    // filled in, and the thing worth seeing is where it landed.
    { label: 'Duplicate', onClick: () => store.duplicateSection(s.id, { select: false }) },
    '-',
    { label: 'Delete', danger: true, onClick: () => confirmDelete({
      what: REGISTRY[s.key]?.name || 'this section',
      detail: sectionLabel(s),
      onConfirm: () => store.deleteSection(s.id),
    }) },
  ];

  /* ------------------------------------------------- insertion & drag-drop */

  /** @param {number} slot @param {number} index */
  function insertLine(slot, index) {
    const node = el('.ol-ins', {
      onclick: () => openLibrary(slot),
      title: 'Add a section here',
    }, [el('span', { text: '+ Add section' })]);
    wireDrop(node, slot, index);
    return node;
  }

  /** @param {HTMLElement} node @param {string} id @param {number} slot @param {number} index */
  function wireDrag(node, id, slot, index) {
    node.draggable = true;
    node.addEventListener('dragstart', (e) => {
      dragging = id;
      e.dataTransfer?.setData('text/plain', id);
      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
      // Deferred: setting it synchronously would make the browser snapshot the faded node
      // as the drag image.
      setTimeout(() => node.classList.add('dragging'), 0);
    });
    node.addEventListener('dragend', () => { dragging = null; clearDropMarks(); paint(); });
    // A row is two drop targets: its top half inserts above it, its bottom half below.
    wireDrop(node, slot, index, (e) => {
      const r = node.getBoundingClientRect();
      return e.clientY < r.top + r.height / 2 ? index : index + 1;
    });
  }

  /**
   * @param {HTMLElement} node @param {number} slot @param {number} index
   * @param {(e: DragEvent) => number} [resolve] index from the pointer's position
   */
  function wireDrop(node, slot, index, resolve) {
    node.addEventListener('dragover', (e) => {
      if (!dragging || dragging === node.dataset.id) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
      // dragover fires continuously; only touch the DOM when the marker actually changes.
      const mark = !resolve ? 'drop-on' : resolve(e) === index ? 'drop-before' : 'drop-after';
      if (!node.classList.contains(mark)) { clearDropMarks(); node.classList.add(mark); }
    });
    node.addEventListener('dragleave', () => clearMarks(node));
    node.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = dragging || e.dataTransfer?.getData('text/plain');
      clearDropMarks();
      dragging = null;
      if (id) store.moveSectionTo(id, slot, resolve ? resolve(e) : index);
    });
  }

  const MARKS = ['drop-before', 'drop-after', 'drop-on'];
  const clearMarks = (/** @type {Element} */ n) => n.classList.remove(...MARKS);
  const clearDropMarks = () =>
    host.querySelectorAll('.' + MARKS.join(',.')).forEach(clearMarks);

  store.on('doc', paint);
  store.on('sel', paint);
  store.on('issues', paint);
  store.on('reset', paint);
  paint();
}
