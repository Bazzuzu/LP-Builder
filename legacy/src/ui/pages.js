// Page manager: template gallery, page list, JSON import/export.
import { el, toast } from '../util.js';
import { openModal, closeModal } from './modal.js';
import { TEMPLATES } from '../presets/templates.js';
import { makeSection } from '../schema/registry.js';
import * as store from '../store.js';
import { exportJson, importBundle } from '../export.js';

export function pageFromTemplate(tpl, name) {
  return store.newPageDoc(
    name || tpl.name,
    tpl.sections.map((s) => makeSection(s.type, s.props)),
  );
}

export function openTemplateGallery({ onPick } = {}) {
  const body = el('div');
  body.append(el('.lib-group-title', { text: 'Start from a template' }));
  const grid = el('.cards');
  for (const t of TEMPLATES) {
    grid.append(el('button.card', { type: 'button', onclick: () => {
      const page = pageFromTemplate(t);
      if (onPick) onPick(page); else store.addPage(page);
      toast('Created “' + page.name + '”');
    } }, [
      el('.thumb', { text: t.icon }),
      el('h4', { text: t.name }),
      el('p', { text: t.description }),
    ]));
  }
  body.append(grid);
  openModal({ title: 'New page', body });
}

export function openPagesModal() {
  const body = el('div');

  const list = el('ul.pg-list');
  const draw = () => {
    list.replaceChildren();
    for (const p of store.state.pages) {
      const li = el('li', { class: p.id === store.state.currentId ? 'on' : '',
        onclick: () => { store.openPage(p.id); closeModal(); } });
      li.append(
        el('.grow', {}, [
          el('div', { text: p.name }),
          el('small', { text: `${p.sections.length} sections · updated ${new Date(p.updatedAt).toLocaleString()}` }),
        ]),
        el('button.btn.btn-sm', { type: 'button', onclick: (e) => { e.stopPropagation(); rename(p); } }, 'Rename'),
        el('button.btn.btn-sm', { type: 'button', onclick: (e) => { e.stopPropagation(); duplicate(p); } }, 'Duplicate'),
        el('button.btn.btn-sm', { type: 'button', onclick: (e) => { e.stopPropagation(); exportJson(p); } }, 'JSON'),
        el('button.btn.btn-sm.btn-danger', { type: 'button', onclick: (e) => { e.stopPropagation(); remove(p); } }, 'Delete'),
      );
      list.append(li);
    }
    if (!store.state.pages.length) list.append(el('.insp-empty', { text: 'No pages yet.' }));
  };

  const rename = (p) => {
    const name = prompt('Page name', p.name);
    if (name?.trim()) { store.renamePage(p.id, name.trim()); draw(); }
  };
  const duplicate = (p) => {
    const copy = JSON.parse(JSON.stringify(p));
    copy.id = 'pg_' + Math.random().toString(36).slice(2, 9);
    copy.name = p.name + ' copy';
    copy.sections.forEach((s) => { s.id = 'sec_' + Math.random().toString(36).slice(2, 9); });
    store.addPage(copy, { select: false });
    draw();
  };
  const remove = (p) => {
    if (!confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    store.deletePage(p.id);
    draw();
  };

  draw();
  body.append(list);

  openModal({
    title: 'Pages',
    body,
    actions: [
      { label: 'Import JSON…', onClick: () => { importFlow(); return false; } },
      { label: '+ New page', primary: true, onClick: () => { openTemplateGallery(); return true; } },
    ],
  });
}

function importFlow() {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'application/json,.json';
  inp.onchange = async () => {
    const file = inp.files?.[0];
    if (!file) return;
    try {
      const page = await importBundle(await file.text());
      store.addPage(page);
      closeModal();
      toast('Imported “' + page.name + '”');
    } catch (e) {
      alert(e.message);
    }
  };
  inp.click();
}
