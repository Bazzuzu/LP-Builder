// "Add section" drawer. Static modules already on the page are offered as disabled,
// with the reason, rather than silently missing (doc 34/35 §5.1).
import { el } from '../util.js';
import { ARCHETYPE } from '../model/enums.js';
import { LIBRARY_GROUPS, defaultsFor, insertableTypes } from '../sections/_registry.js';
import * as store from '../store/pages.js';
import { closeModal, openModal } from './modal.js';

/** @param {number} slot */
export function openLibrary(slot) {
  const doc = store.doc();
  if (!doc) return;
  const used = new Set(doc.sections.map((s) => s.key));
  const body = el('div');

  for (const group of LIBRARY_GROUPS) {
    const types = insertableTypes().filter((t) => (t.group || 'content') === group.id);
    if (!types.length) continue;
    body.append(el('.lib-group-title', { text: group.label }));
    const grid = el('.lib-grid');

    for (const t of types) {
      const taken = t.archetype === ARCHETYPE.STATIC && used.has(t.key);
      grid.append(el('button.lib-card' + (taken ? '.off' : ''), {
        type: 'button', disabled: taken,
        title: taken ? `Only one ${t.name} section is permitted per page.` : '',
        onclick: () => {
          store.addSection(/** @type {any} */ (t.key), { slot, props: defaultsFor(t.key) });
          closeModal();
        },
      }, [
        el('span.lib-icon', { text: t.icon || '▦' }),
        el('.lib-name', { text: t.name }),
        el('.lib-desc', { text: taken ? 'Already on this page — only one is permitted.' : (t.description || '') }),
      ]));
    }
    body.append(grid);
  }

  openModal({ title: `Add a section to slot ${String(slot).padStart(2, '0')}`, body });
}
