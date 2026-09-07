// Bootstrap. Wires the panels to the store and owns the topbar.
import { el, toast, debounce } from './util.js';
import { initAssets } from './assets.js';
import * as store from './store.js';
import { mountOutline } from './ui/outline.js';
import { mountInspector } from './ui/inspector.js';
import { mountPreview } from './ui/preview.js';
import { openLibrary } from './ui/library.js';
import { openPagesModal, pageFromTemplate } from './ui/pages.js';
import { openIssues } from './ui/issues.js';
import { openModal } from './ui/modal.js';
import { validateDoc, countErrors } from './ui/validate.js';
import { exportHtml, exportJson, pageBundle, importBundle } from './export.js';
import { templateById } from './presets/templates.js';

async function boot() {
  await initAssets();

  if (!store.load()) {
    // First run: land on something real rather than an empty canvas.
    store.state.pages = [pageFromTemplate(templateById('business-class-deals'))];
    store.state.currentId = store.state.pages[0].id;
  }

  mountOutline();
  mountInspector();
  mountPreview();
  wireTopbar();
  wireShortcuts();
  runValidation();
  store.on('doc', scheduleValidation);
  store.on('reset', runValidation);
  paintPageName();
  store.on('doc', paintPageName);
}

/* ------------------------------------------------------------- validation */

function runValidation() {
  store.state.issues = validateDoc(store.doc());
  const n = countErrors(store.state.issues);
  const dot = document.getElementById('issues-dot');
  dot.classList.toggle('on', n > 0);
  document.getElementById('btn-issues').lastChild.textContent =
    n > 0 ? ` Issues (${n})` : ' Issues';
  store.emit('issues');
}
const scheduleValidation = debounce(runValidation, 250);

/* ---------------------------------------------------------------- topbar */

function paintPageName() {
  const node = document.getElementById('page-name');
  node.textContent = store.doc()?.name || '—';
}

function wireTopbar() {
  const $ = (id) => document.getElementById(id);

  $('btn-add').onclick = () => openLibrary();
  $('btn-pages').onclick = () => openPagesModal();
  $('btn-issues').onclick = () => { runValidation(); openIssues(); };

  $('page-name').onclick = () => {
    const doc = store.doc();
    if (!doc) return;
    const name = prompt('Page name', doc.name);
    if (name?.trim()) store.renamePage(doc.id, name.trim());
  };

  $('viewport-seg').onclick = (e) => {
    const b = e.target.closest('button[data-vp]');
    if (!b) return;
    [...b.parentNode.children].forEach((c) => c.classList.toggle('on', c === b));
    store.setViewport(b.dataset.vp);
  };

  const undo = $('btn-undo'), redo = $('btn-redo');
  const syncHistory = () => {
    undo.disabled = !store.canUndo();
    redo.disabled = !store.canRedo();
  };
  undo.onclick = () => store.undo();
  redo.onclick = () => store.redo();
  store.on('doc', syncHistory);
  store.on('reset', syncHistory);
  syncHistory();

  $('btn-json').onclick = () => openJson();

  $('btn-export').onclick = () => {
    runValidation();
    const errors = countErrors(store.state.issues);
    if (errors) {
      openModal({
        title: 'Publish blocked',
        narrow: true,
        body: el('div', { text: `${errors} validation ${errors === 1 ? 'error' : 'errors'} must be fixed before this page can be published.` }),
        actions: [
          { label: 'Export anyway', onClick: () => exportHtml(store.doc()) },
          { label: 'Review issues', primary: true, onClick: () => { openIssues(); return false; } },
        ],
      });
      return;
    }
    exportHtml(store.doc());
  };
}

function openJson() {
  const doc = store.doc();
  const ta = el('textarea.code');
  ta.value = JSON.stringify(pageBundle(doc), null, 2);
  openModal({
    title: 'Page JSON',
    body: el('div', {}, [
      el('.f-help', { text: 'Edit and apply, or copy this into another browser. Assets travel inside the bundle.',
        style: { marginBottom: '8px' } }),
      ta,
    ]),
    actions: [
      { label: 'Download .json', onClick: () => { exportJson(doc); return false; } },
      { label: 'Copy', onClick: () => { navigator.clipboard.writeText(ta.value); toast('Copied'); return false; } },
      { label: 'Apply', primary: true, onClick: async () => {
        try {
          const page = await importBundle(ta.value);
          page.id = doc.id;
          store.commit(({ pages }) => {
            const i = pages.findIndex((p) => p.id === doc.id);
            if (i < 0) return false;
            pages[i] = page;
          });
          store.emit('reset');
          toast('Applied');
        } catch (e) { alert(e.message); return false; }
      } },
    ],
  });
}

/* ------------------------------------------------------------- shortcuts */

function wireShortcuts() {
  document.addEventListener('keydown', (e) => {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;
    const editing = e.target.closest('input,textarea,[contenteditable="true"]');
    if (e.key.toLowerCase() === 'z' && !editing) {
      e.preventDefault();
      e.shiftKey ? store.redo() : store.undo();
    }
    if (e.key.toLowerCase() === 's') { e.preventDefault(); toast('Saved automatically'); }
  });
}

boot().catch((e) => {
  console.error(e);
  document.body.innerHTML = `<pre style="padding:24px;color:#b91c1c;white-space:pre-wrap">Boot failed:\n${e.stack || e.message}</pre>`;
});
