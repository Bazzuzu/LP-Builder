// Page structure panel. Slots are drawn explicitly — an author who cannot see the
// containers cannot understand why a section will not move past an anchor.
import { el } from '../util.js';
import { ANCHOR_SLOT, DYNAMIC_SLOTS } from '../model/enums.js';
import { canMoveDown, canMoveUp, sectionsInSlot } from '../model/slots.js';
import { REGISTRY } from '../sections/_registry.js';
import * as store from '../store/pages.js';
import { openLibrary } from './library.js';

/** @type {number[]} */
const ANCHOR_SLOTS = Object.values(ANCHOR_SLOT);
const ALL_SLOTS = [...new Set([...ANCHOR_SLOTS, ...DYNAMIC_SLOTS])].sort((a, b) => a - b);

export function mountOutline() {
  const host = /** @type {HTMLElement} */ (document.getElementById('outline'));

  const paint = () => {
    const doc = store.doc();
    host.replaceChildren();
    if (!doc) return;

    for (const slot of ALL_SLOTS) {
      const items = sectionsInSlot(doc.sections, slot);
      const isAnchorSlot = ANCHOR_SLOTS.includes(slot);

      if (isAnchorSlot) {
        for (const s of items) host.append(row(s, true));
        continue;
      }

      for (const s of items) host.append(row(s, false));
      // The insertion point is drawn even when the slot is empty: an author who cannot see
      // the container cannot understand why a section will not move past an anchor.
      host.append(el('.ol-slot', { onclick: () => openLibrary(slot) },
        items.length ? `+ Add to slot ${String(slot).padStart(2, '0')}`
                     : `Slot ${String(slot).padStart(2, '0')} — empty, click to add`));
    }
  };

  /** @param {import('../model/types.js').Section} s @param {boolean} locked */
  function row(s, locked) {
    const type = REGISTRY[s.key];
    const issues = store.state.issues.filter((i) => i.sectionId === s.id);
    const node = el('.ol-item' + (store.state.selection === s.id ? '.sel' : '') + (issues.length ? '.invalid' : '') + (s.is_visible === false ? '.hidden-sec' : ''), {
      onclick: () => store.select(s.id),
    });

    node.append(
      el('span.ol-icon', { text: type?.icon || '▦' }),
      el('.ol-name', {}, [
        el('span', { text: type?.name || s.key }),
        s.is_visible === false ? el('span.ol-badge', { text: 'hidden' }) : null,
        locked ? el('span.ol-badge', { text: 'anchor' }) : null,
      ].filter(Boolean)),
    );

    const tools = el('.ol-actions');
    if (!locked) {
      tools.append(
        btn('▲', 'Move up', !canMoveUp(store.doc()?.sections || [], s.id), () => store.moveSection(s.id, 'up')),
        btn('▼', 'Move down', !canMoveDown(store.doc()?.sections || [], s.id), () => store.moveSection(s.id, 'down')),
        btn(s.is_visible === false ? '◌' : '◉', 'Toggle visibility', false, () => store.toggleVisibility(s.id)),
        btn('⧉', 'Duplicate', false, () => store.duplicateSection(s.id)),
        btn('✕', 'Delete', false, () => store.deleteSection(s.id)),
      );
    } else {
      // Anchors are mandatory: the controls are shown disabled rather than hidden, so the
      // rule is visible instead of mysterious.
      tools.append(btn('🔒', 'Mandatory anchor — cannot be moved, hidden or deleted', true, () => {}));
    }
    node.append(tools);
    return node;
  }

  const btn = (label, title, disabled, onClick) => el('button', {
    type: 'button', title, disabled,
    onclick: (e) => { e.stopPropagation(); onClick(); },
  }, label);

  store.on('doc', paint);
  store.on('sel', paint);
  store.on('issues', paint);
  store.on('reset', paint);
  paint();
}
