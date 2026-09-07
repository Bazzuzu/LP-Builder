// Renders the right-hand panel straight from the selected section's schema.
import { el, getPath, setPath, clone } from '../util.js';
import { TYPES, isShown, repeaterItem } from '../schema/registry.js';
import { renderField } from './fields.js';
import * as store from '../store.js';

// Fieldset open/closed state survives rebuilds; keyed by "type:fieldset title".
const openState = new Map();
let openItem = null;

export function mountInspector() {
  const root = document.getElementById('inspector');
  const titleEl = document.getElementById('inspector-title');

  const draw = () => {
    const section = store.selected();
    if (!section) {
      titleEl.textContent = 'Inspector';
      root.replaceChildren(el('.insp-empty', { html:
        'Nothing selected.<br>Pick a section on the left, or click it in the canvas.' }));
      return;
    }
    const type = TYPES[section.type];
    titleEl.textContent = type?.name || section.type;

    const errors = new Map();
    for (const issue of store.state.issues) {
      if (issue.sectionId !== section.id || !issue.path) continue;
      if (!errors.has(issue.path)) errors.set(issue.path, []);
      errors.get(issue.path).push(issue);
    }

    const ctx = {
      get: (p) => getPath(store.selected()?.props || {}, p),
      set(path, value, opts = {}) {
        store.commit(({ doc }) => {
          const s = doc.sections.find((x) => x.id === section.id);
          if (!s) return false;
          setPath(s.props, path, value);
          if (opts.sync) syncRepeaterLength(s, opts.sync);
        }, { coalesceKey: opts.coalesce ? `${section.id}:${opts.coalesce}` : null });
        if (opts.structural || opts.sync) draw();
      },
      errors,
      get openItem() { return openItem; },
      set openItem(v) { openItem = v; },
      rebuild: draw,
    };

    const frag = document.createDocumentFragment();
    if (type?.hideable) frag.append(visibilityRow(section));

    for (const fs of type?.fields || []) {
      const key = `${section.type}:${fs.title}`;
      const isOpen = openState.has(key) ? openState.get(key) : fs.open !== false;
      const set = el('fieldset.fs', { 'data-open': String(isOpen) });
      const head = el('button.fs-head', { type: 'button', onclick: () => {
        const next = set.getAttribute('data-open') !== 'true';
        set.setAttribute('data-open', String(next));
        openState.set(key, next);
      } }, [el('span.chev', { text: '▾' }), fs.title]);
      const body = el('.fs-body');
      let shown = 0;
      for (const f of fs.fields || []) {
        if (!isShown(f, section.props)) continue;
        body.append(renderField(f, ctx));
        shown++;
      }
      if (!shown) continue;
      set.append(head, body);
      frag.append(set);
    }
    root.replaceChildren(frag);
  };

  store.on('sel', () => { openItem = null; draw(); });
  // Undo/redo and page switches replace props wholesale, so the panel must be rebuilt.
  store.on('reset', draw);
  // Otherwise only redraw when the panel is empty — rebuilding mid-keystroke would
  // destroy the caret inside contenteditable rich-text fields.
  store.on('doc', () => { if (!store.selected()) draw(); });
  draw();
}

function visibilityRow(section) {
  const input = el('input', { type: 'checkbox', checked: section.visible !== false,
    onchange: (e) => store.commit(({ doc }) => {
      const s = doc.sections.find((x) => x.id === section.id);
      if (s) s.visible = e.target.checked;
    }) });
  return el('.fs', {}, [el('.fs-body', { style: { paddingTop: '10px' } }, [
    el('.f-inline', {}, [el('span', { text: 'Section visible on this page' }), el('label.sw', {}, [input, el('i')])]),
  ])]);
}

/** Keep a repeater's length in step with a "card count" style selector. */
function syncRepeaterLength(section, { key, n }) {
  const field = (TYPES[section.type]?.fields || []).flatMap((fs) => fs.fields || [])
    .find((f) => f.key === key && f.kind === 'repeater');
  if (!field || !Number.isFinite(n)) return;
  const arr = getPath(section.props, key) || [];
  while (arr.length < n) arr.push(repeaterItem(field));
  setPath(section.props, key, arr);
}
