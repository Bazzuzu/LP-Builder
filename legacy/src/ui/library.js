// "Add section" palette. Reads straight from the registry, so a new section type
// shows up here with no extra wiring.
import { el } from '../util.js';
import { TYPES, LIBRARY_GROUPS, makeSection } from '../schema/registry.js';
import { openModal } from './modal.js';
import { addSection } from './outline.js';
import * as store from '../store.js';

export function openLibrary({ index = null } = {}) {
  const doc = store.doc();
  const used = new Set(doc?.sections.map((s) => s.type) || []);
  const body = el('div');

  for (const group of LIBRARY_GROUPS) {
    const types = Object.values(TYPES).filter((t) => t.group === group.id);
    if (!types.length) continue;
    body.append(el('.lib-group-title', { text: group.label }));
    const grid = el('.cards');
    for (const t of types) {
      const disabled = t.singleton && used.has(t.type);
      grid.append(el('button.card', {
        type: 'button',
        style: disabled ? { opacity: '.45', cursor: 'not-allowed' } : {},
        onclick: () => {
          if (disabled) return false;
          addSection(makeSection(t.type), index);
        },
      }, [
        el('.thumb', { text: t.icon || '▪' }),
        el('h4', { text: t.name }),
        el('p', { text: disabled ? 'Already on this page — only one instance is allowed.' : (t.description || '') }),
      ]));
    }
    body.append(grid);
  }

  openModal({ title: 'Add a section', body });
}
