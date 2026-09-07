// Right-hand panel. It walks the selected section's descriptors and knows nothing about
// what any particular section is.
import { el, getPath } from '../util.js';
import { GLOBAL_CONTENT_ARCHETYPES } from '../model/enums.js';
import { REGISTRY } from '../sections/_registry.js';
import * as store from '../store/pages.js';
import { renderField } from './fields.js';

export function mountInspector() {
  const host = /** @type {HTMLElement} */ (document.getElementById('inspector'));
  /** @type {Record<string, boolean>} */
  let openGroups = {};
  let openItem = /** @type {string|null} */ (null);

  const paint = () => {
    const section = store.selected();
    host.replaceChildren();

    if (!section) {
      host.append(el('.empty', { text: 'Select a section on the canvas or in the outline.' }));
      return;
    }

    const type = REGISTRY[section.key];
    if (!type) { host.append(el('.empty', { text: `Unknown section type: ${section.key}` })); return; }

    if (GLOBAL_CONTENT_ARCHETYPES.includes(type.archetype)) {
      host.append(el('.notice', {}, [
        el('span', { text: 'Content comes from the site-wide settings. Only the switches below are per page.' }),
        el('button.btn.btn-sm', { type: 'button',
          onclick: async () => (await import('./globals-panel.js')).openGlobals(type.key) }, 'Open global settings'),
      ]));
    }

    // Errors are keyed by field path so a widget can show its own message inline.
    /** @type {Map<string, {message:string}[]>} */
    const errors = new Map();
    for (const i of store.state.issues) {
      if (i.sectionId !== section.id || !i.path) continue;
      if (!errors.has(i.path)) errors.set(i.path, []);
      errors.get(i.path)?.push({ message: i.message });
    }

    const ctx = {
      get: (path) => (path === '' ? section.props : readValue(section, path)),
      set: (path, value, opts = {}) => writeValue(section, path, value, opts),
      errors,
      get openItem() { return openItem; },
      set openItem(v) { openItem = v; },
    };

    for (const group of type.fields || []) {
      const key = `${section.key}:${group.title}`;
      const isOpen = openGroups[key] ?? group.open ?? false;
      const body = el('.fs-body');
      let rendered = 0;
      for (const f of group.fields || []) {
        const node = renderField(f, ctx, '');
        if (node) { body.append(node); rendered++; }
      }
      if (!rendered) continue;

      const box = el('.fs', { 'data-open': String(isOpen) });
      box.append(el('.fs-head', {
        onclick: () => {
          openGroups[key] = box.getAttribute('data-open') !== 'true';
          box.setAttribute('data-open', String(openGroups[key]));
        },
      }, [el('span.chev', { text: '▾' }), el('span', { text: group.title })]), body);
      host.append(box);
    }
  };

  // Rebuilding the panel while someone is mid-keystroke destroys their caret — fatal in a
  // text input or a contenteditable rich-text field. But a click on a segmented control, a
  // toggle, a select or an image uploader is a single discrete action with no caret to
  // lose, and it very often needs the panel to update immediately (a `when` condition
  // revealing the field the admin just asked for, a segmented button's active state
  // moving). Gating repaint on "is a section selected" — the previous rule — blocked ALL of
  // that whenever a section was selected, which is always, while editing.
  //
  // So the gate is narrower: only skip when the focused element is one that holds an
  // in-progress edit a rebuild would destroy — free text, rich text, or a native control
  // being actively dragged (colour swatch, range slider). Everything else repaints at once.
  const LIVE_INPUT_TYPES = new Set([
    'text', 'email', 'tel', 'url', 'search', 'number', 'password',
    'color', 'range', 'date', 'datetime-local',
  ]);
  function caretAtRisk() {
    const el = document.activeElement;
    if (!el || !host.contains(el)) return false;
    if (/** @type {HTMLElement} */ (el).isContentEditable) return true;
    if (el.tagName === 'TEXTAREA') return true;
    if (el.tagName === 'INPUT') {
      return LIVE_INPUT_TYPES.has((/** @type {HTMLInputElement} */ (el).type || 'text').toLowerCase());
    }
    return false;                          // BUTTON, SELECT, checkbox: safe to rebuild
  }

  store.on('sel', () => { openItem = null; paint(); });
  store.on('reset', () => { openGroups = {}; openItem = null; paint(); });
  store.on('doc', () => { if (!caretAtRisk()) paint(); });
  store.on('issues', () => { if (!caretAtRisk()) paint(); });
  host.addEventListener('focusout', () => {
    // focusout fires before focus lands on the next node, so settle first.
    setTimeout(() => { if (!caretAtRisk()) paint(); }, 0);
  });
  paint();
}

/**
 * `scope: 'section'` fields (currently `anchor_id`) live on the Section itself, not in
 * `props`. The path alone cannot say which, so the section's own shape decides.
 */
const SECTION_SCOPED = new Set(['anchor_id']);

function readValue(section, path) {
  if (SECTION_SCOPED.has(path)) return /** @type {any} */ (section)[path];
  return getPath(section.props, path);
}

function writeValue(section, path, value, opts) {
  if (SECTION_SCOPED.has(path)) {
    store.patchSection(section.id, { [path]: value || null });
    return;
  }
  store.setSectionProp(section.id, path, value);
}
