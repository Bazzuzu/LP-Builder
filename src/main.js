// Bootstrap. Wires the panels to the stores and owns the topbar.
import { debounce, el, toast } from './util.js';
import { initAssets } from './store/assets.js';
import { loadGlobals, globals, onGlobals } from './store/globals.js';
import { validatePage } from './model/validate.js';
import { REGISTRY } from './sections/_registry.js';
import { templateById, pageFromTemplate } from './presets/page-templates.js';
import * as store from './store/pages.js';
import { mountOutline } from './ui/outline.js';
import { mountInspector } from './ui/inspector.js';
import { mountSidePanel } from './ui/side-panel.js';
import { mountPreview } from './ui/preview.js';
import { openIssues } from './ui/issues.js';
import { openGlobals } from './ui/globals-panel.js';
import { openPageSettings, openPagesModal } from './ui/pages.js';
import { openModal } from './ui/modal.js';
import { exportHtml, exportJson } from './export.js';

async function boot() {
  await initAssets();
  loadGlobals();

  if (!store.load()) {
    // First run lands on something real rather than an empty canvas.
    store.state.pages = [pageFromTemplate(templateById('route'), 'JFK to LHR')];
    store.state.currentId = store.state.pages[0].id;
  }

  mountOutline();
  mountInspector();
  mountSidePanel();
  mountPreview();
  wireTopbar();
  wireShortcuts();

  runValidation();
  store.on('doc', scheduleValidation);
  store.on('reset', runValidation);
  onGlobals(runValidation);

  paintPageName();
  store.on('doc', paintPageName);
  store.on('reset', paintPageName);
}

/* ------------------------------------------------------------- validation */

function runValidation() {
  const page = store.doc();
  const result = page
    ? validatePage(page, REGISTRY, { globals: globals() })
    : { issues: [], L0: [], L1: [], L2: [] };
  store.state.issues = result.issues;

  const blocking = result.L0.length + result.L1.length;
  const dot = document.getElementById('issues-dot');
  dot?.classList.toggle('on', blocking > 0);
  const btn = document.getElementById('btn-issues');
  if (btn?.lastChild) btn.lastChild.textContent = blocking > 0 ? ` Issues (${blocking})` : ' Issues';
  store.emit('issues');
}
const scheduleValidation = debounce(runValidation, 250);

/* ------------------------------------------------------------------ chrome */

function paintPageName() {
  const node = document.getElementById('page-name');
  if (node) node.textContent = store.doc()?.internal_name || '—';
}

function wireTopbar() {
  const $ = (/** @type {string} */ id) => document.getElementById(id);

  $('btn-pages')?.addEventListener('click', () => openPagesModal());
  $('page-name')?.addEventListener('click', () => openPageSettings());
  $('btn-globals')?.addEventListener('click', () => openGlobals());
  $('btn-issues')?.addEventListener('click', () => openIssues());
  $('btn-undo')?.addEventListener('click', () => store.undo());
  $('btn-redo')?.addEventListener('click', () => store.redo());
  $('btn-export')?.addEventListener('click', () => {
    const page = store.doc();
    const blocking = store.state.issues.filter((i) => i.level !== 'L2').length;
    if (!blocking) { exportHtml(page); return; }
    // Export is not publish: an incomplete draft may still be exported, but not silently.
    openModal({
      title: 'Export with open issues?',
      body: el('div', {}, [
        el('p', { text: `This page has ${blocking} issue${blocking > 1 ? 's' : ''} that would block publishing.` }),
        el('.f-help', { text: 'Exporting is still allowed — the file will simply be incomplete.' }),
      ]),
      actions: [
        { label: 'Review issues', onClick: () => { openIssues(); return false; } },
        { label: 'Export anyway', primary: true, onClick: () => exportHtml(page) },
      ],
    });
  });
  $('btn-json')?.addEventListener('click', () => { exportJson(store.doc()); toast('Page JSON downloaded'); });

  document.getElementById('viewport-seg')?.addEventListener('click', (e) => {
    const btn = /** @type {HTMLElement} */ (e.target).closest('button');
    if (!btn) return;
    const vp = /** @type {any} */ (btn.dataset.vp);
    store.setViewport(vp);
    [...(btn.parentElement?.children || [])].forEach((c) => c.classList.toggle('on', c === btn));
  });

  document.getElementById('zoom-seg')?.addEventListener('click', (e) => {
    const btn = /** @type {HTMLElement} */ (e.target).closest('button');
    if (!btn) return;
    store.setZoom(/** @type {any} */ (Number(btn.dataset.zoom)));
    [...(btn.parentElement?.children || [])].forEach((c) => c.classList.toggle('on', c === btn));
  });
}

function wireShortcuts() {
  document.addEventListener('keydown', (e) => {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;
    const tag = /** @type {HTMLElement} */ (document.activeElement)?.tagName;
    const typing = tag === 'INPUT' || tag === 'TEXTAREA'
      || /** @type {HTMLElement} */ (document.activeElement)?.isContentEditable;
    if (e.key.toLowerCase() === 'z' && !typing) {
      e.preventDefault();
      e.shiftKey ? store.redo() : store.undo();
    }
  });
}

boot();
