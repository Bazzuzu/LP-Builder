// Page structure panel: anchors are fixed, dynamic sections drag between them.
import { el, toast } from '../util.js';
import { TYPES, isValidOrder } from '../schema/registry.js';
import * as store from '../store.js';
import { openLibrary } from './library.js';

export function mountOutline() {
  const root = document.getElementById('outline');
  let dragId = null;

  const draw = () => {
    const doc = store.doc();
    root.replaceChildren();
    if (!doc) {
      root.append(el('.insp-empty', { text: 'No page open.' }));
      return;
    }
    const bad = new Set(store.state.issues.filter((i) => i.severity === 'error').map((i) => i.sectionId));

    doc.sections.forEach((s, index) => {
      const t = TYPES[s.type] || {};
      const isAnchor = !!t.anchor;
      const node = el('.ol-item', {
        class: [
          store.state.selection === s.id ? 'sel' : '',
          bad.has(s.id) ? 'invalid' : '',
          s.visible === false ? 'hidden-sec' : '',
        ].filter(Boolean).join(' '),
        draggable: !isAnchor,
        onclick: () => store.select(s.id),
      });
      node.append(...[
        el('span.ol-icon', { text: t.icon || '▪' }),
        el('span.ol-name', { text: t.name || s.type, title: t.description || '' }),
        isAnchor ? el('span.ol-badge', { text: 'anchor' }) : null,
        el('.ol-actions', {}, [
          (isAnchor ? t.hideable : true) && el('button', {
            type: 'button', title: s.visible === false ? 'Show' : 'Hide',
            onclick: (e) => { e.stopPropagation(); toggle(s.id); },
          }, s.visible === false ? '◌' : '◉'),
          !isAnchor && el('button', { type: 'button', title: 'Duplicate',
            onclick: (e) => { e.stopPropagation(); duplicate(s.id); } }, '⧉'),
          !isAnchor && el('button', { type: 'button', title: 'Delete',
            onclick: (e) => { e.stopPropagation(); remove(s.id); } }, '✕'),
        ].filter(Boolean)),
      ].filter(Boolean));

      if (!isAnchor) {
        node.addEventListener('dragstart', (e) => {
          dragId = s.id; node.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', s.id);
        });
        node.addEventListener('dragend', () => { dragId = null; node.classList.remove('dragging'); draw(); });
      }
      root.append(node);

      // A drop target sits after every section; invalid ones are simply not rendered.
      root.append(slot(index + 1));
    });

    // Leading slot (before the hero) is never valid, so start at index 1 above and
    // only prepend a label for the whole list.
    root.prepend(el('.ol-label', { text: 'Sections' }));
  };

  const slot = (index) => {
    const doc = store.doc();
    const probe = doc.sections.slice();
    probe.splice(index, 0, { type: 'logos' });
    if (!isValidOrder(probe)) return document.createComment('');

    const node = el('.ol-slot', { text: '+ add section here',
      onclick: () => openLibrary({ index }) });
    node.addEventListener('dragover', (e) => {
      if (!dragId) return;
      e.preventDefault(); node.classList.add('drag-over');
    });
    node.addEventListener('dragleave', () => node.classList.remove('drag-over'));
    node.addEventListener('drop', (e) => {
      e.preventDefault(); node.classList.remove('drag-over');
      if (dragId) moveTo(dragId, index);
      dragId = null;
    });
    return node;
  };

  store.on('doc', draw);
  store.on('sel', draw);
  store.on('issues', draw);
  draw();
}

/* ------------------------------------------------------------- operations */

export function addSection(section, index) {
  store.commit(({ doc }) => {
    const at = index == null ? doc.sections.length - 1 : index;
    doc.sections.splice(at, 0, section);
    if (!isValidOrder(doc.sections)) return false;
  });
  if (store.section(section.id)) store.select(section.id);
  else toast('That section cannot go there — anchors must stay in order.');
}

function duplicate(id) {
  const doc = store.doc();
  const i = doc.sections.findIndex((s) => s.id === id);
  if (i < 0) return;
  const copy = JSON.parse(JSON.stringify(doc.sections[i]));
  copy.id = 'sec_' + Math.random().toString(36).slice(2, 9);
  store.commit(({ doc: d }) => { d.sections.splice(i + 1, 0, copy); });
  store.select(copy.id);
}

function remove(id) {
  const t = TYPES[store.doc()?.sections.find((s) => s.id === id)?.type];
  if (t?.anchor) { toast('Anchor sections cannot be deleted.'); return; }
  store.commit(({ doc }) => {
    const i = doc.sections.findIndex((s) => s.id === id);
    if (i < 0) return false;
    doc.sections.splice(i, 1);
  });
  if (store.state.selection === id) store.select(null);
}

function toggle(id) {
  store.commit(({ doc }) => {
    const s = doc.sections.find((x) => x.id === id);
    if (!s) return false;
    s.visible = s.visible === false;
  });
}

function moveTo(id, index) {
  store.commit(({ doc }) => {
    const from = doc.sections.findIndex((s) => s.id === id);
    if (from < 0) return false;
    const to = index > from ? index - 1 : index;
    if (to === from) return false;
    const [x] = doc.sections.splice(from, 1);
    doc.sections.splice(to, 0, x);
    if (!isValidOrder(doc.sections)) return false;
  });
}
