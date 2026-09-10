// Page list and page settings.
import { el, slugify, toast } from '../util.js';
import { PAGE_TYPES, REGIONS } from '../model/enums.js';
import { TEMPLATES, pageFromTemplate } from '../presets/page-templates.js';
import { exportTemplate } from '../export.js';
import { pageFromBundle, parseBundle, restoreAssets } from '../import.js';
import * as store from '../store/pages.js';
import { closeModal, openModal } from './modal.js';

export function openPagesModal() {
  const body = el('div');

  body.append(el('.lib-group-title', { text: 'Start from a template' }));
  const grid = el('.lib-grid');
  for (const t of TEMPLATES) {
    grid.append(el('button.lib-card', {
      type: 'button',
      onclick: () => { store.addPage(pageFromTemplate(t, t.name)); closeModal(); },
    }, [
      el('.lib-name', { text: t.name }),
      el('.lib-desc', { text: t.description }),
    ]));
  }
  body.append(grid);

  body.append(el('.f-row', {}, [
    el('button.btn.btn-sm', { type: 'button', onclick: importPage }, '↓ Import a page'),
    el('button.btn.btn-sm', { type: 'button', onclick: saveAsTemplate }, '↑ Save this page as a template'),
  ]));
  body.append(el('.f-help.f-tip', {
    text: 'Import reads a file from the JSON button. A saved template keeps this page’s '
      + 'content and images; commit the file it downloads to ship it to everyone.',
  }));

  body.append(el('.lib-group-title', { text: `Pages · ${store.state.pages.length}` }));
  const ul = el('ul.issues');
  for (const p of store.state.pages) {
    ul.append(el('li', { onclick: () => { store.openPage(p.id); closeModal(); } }, [
      el('div', {}, [
        el('div', { text: p.internal_name }),
        el('.where', { text: `/${p.slug} · ${p.status} · ${p.sections.length} sections` }),
      ]),
      el('button.btn.btn-sm.btn-danger', {
        type: 'button',
        disabled: store.state.pages.length < 2,
        title: store.state.pages.length < 2 ? 'The last page cannot be deleted' : 'Delete page',
        onclick: (e) => { e.stopPropagation(); store.deletePage(p.id); closeModal(); },
      }, 'Delete'),
    ]));
  }
  body.append(ul);

  openModal({ title: 'Pages', body });
}

/* ------------------------------------------------------- import & templates */

/** Read a page bundle from disk: its images go back into the asset store, then the page. */
function importPage() {
  const input = el('input', { type: 'file', accept: 'application/json,.json' });
  input.addEventListener('change', async () => {
    const file = /** @type {HTMLInputElement} */ (input).files?.[0];
    if (!file) return;
    try {
      const parsed = parseBundle(await file.text());
      // Assets first: a page whose images land after it renders shows placeholders until
      // something else happens to repaint.
      await restoreAssets(parsed.assets);
      const page = pageFromBundle(parsed);
      store.addPage(page);
      closeModal();
      toast(`Imported “${page.internal_name}”`);
    } catch (err) {
      // The message is written to be read by whoever picked the file, so it is shown rather
      // than logged — a silent no-op looks like the button is broken.
      openModal({
        narrow: true,
        title: 'Could not import that file',
        body: el('div', {}, [
          el('p', { text: /** @type {Error} */ (err).message }),
          el('.f-help', { text: file.name }),
        ]),
        actions: [{ label: 'Close', primary: true }],
      });
    }
  });
  input.click();
}

/** Freeze the current page as a template file, ready to be committed. */
function saveAsTemplate() {
  const page = store.doc();
  if (!page) return;
  const name = el('input.inp', { type: 'text', value: page.internal_name || '' });
  const desc = el('input.inp', { type: 'text', placeholder: 'What this template is for' });

  openModal({
    narrow: true,
    title: 'Save as template',
    body: el('.gpane', {}, [
      el('.f', {}, [el('.f-label', { text: 'Template name' }), name]),
      el('.f', {}, [el('.f-label', { text: 'Description' }), desc]),
      el('.f-help', {
        text: 'Downloads a .js file. Put it in src/presets/templates/ and add it to that '
          + 'folder’s index.js — the file says exactly how in its header.',
      }),
    ]),
    actions: [
      { label: 'Cancel' },
      { label: 'Download', primary: true, onClick: () => {
        const value = /** @type {HTMLInputElement} */ (name).value.trim();
        if (!value) return false;
        exportTemplate(page, { name: value, description: /** @type {HTMLInputElement} */ (desc).value.trim() });
        toast('Template file downloaded');
      } },
    ],
  });
}

/** Page-level settings: identity, SEO and the route defaults the lead form inherits. */
export function openPageSettings() {
  const page = store.doc();
  if (!page) return;
  const draft = structuredClone(page);
  const body = el('.gpane');
  const errBox = el('.f-err');

  const field = (label, value, onInput, help) => {
    const input = el('input.inp', { type: 'text', value: value ?? '', oninput: (e) => onInput(e.target.value) });
    return el('.f', {}, [el('.f-label', { text: label }), input, help ? el('.f-help.f-tip', { text: help }) : null].filter(Boolean));
  };
  const select = (label, value, options, onChange) => {
    const sel = el('select.inp', { onchange: (e) => onChange(e.target.value) });
    for (const o of options) sel.append(el('option', { value: o, selected: o === value }, o));
    return el('.f', {}, [el('.f-label', { text: label }), sel]);
  };

  body.append(
    el('.lib-group-title', { text: 'Identity' }),
    field('Internal name', draft.internal_name, (v) => { draft.internal_name = v; }),
    field('Slug', draft.slug, (v) => { draft.slug = slugify(v); }, 'Lowercase letters, digits and hyphens.'),
    select('Page type', draft.page_type, [...PAGE_TYPES], (v) => { draft.page_type = v; }),

    el('.lib-group-title', { text: 'SEO' }),
    field('Meta title', draft.meta.meta_title, (v) => { draft.meta.meta_title = v; }, 'Under 60 characters reads best.'),
    field('Meta description', draft.meta.meta_description, (v) => { draft.meta.meta_description = v; }, 'Under 160 characters.'),
    field('Canonical URL', draft.meta.canonical_url, (v) => { draft.meta.canonical_url = v || null; }),
    el('.f', {}, [el('.f-inline', {}, [
      el('span', { text: 'noindex, nofollow' }),
      el('label.sw', {}, [
        el('input', { type: 'checkbox', checked: !!draft.meta.noindex_nofollow,
          onchange: (e) => { draft.meta.noindex_nofollow = e.target.checked; } }),
        el('i'),
      ]),
    ])]),

    el('.lib-group-title', { text: 'Route defaults' }),
    field('Default origin', draft.route.default_origin, (v) => { draft.route.default_origin = v || null; },
      'Pre-fills the lead form.'),
    field('Default destination', draft.route.default_destination, (v) => { draft.route.default_destination = v || null; }),
    field('Target country', draft.route.target_country, (v) => { draft.route.target_country = v.toUpperCase(); }),
    select('Target region', draft.route.target_region, [...REGIONS], (v) => { draft.route.target_region = v; }),
    field('Currency', draft.route.currency_code, (v) => { draft.route.currency_code = v.toUpperCase(); },
      'ISO 4217. Drives every price symbol on the page.'),
    errBox,
  );

  openModal({
    title: 'Page settings',
    body,
    actions: [{ label: 'Save', primary: true, onClick: () => {
      if (store.isSlugTaken(draft.slug, page.id)) {
        errBox.textContent = 'E201: that slug is already in use by another page.';
        return false;
      }
      store.commit(({ pages }) => {
        const p = pages.find((x) => x.id === page.id);
        if (!p) return false;
        Object.assign(p, {
          internal_name: draft.internal_name, slug: draft.slug, page_type: draft.page_type,
          meta: draft.meta, route: draft.route,
        });
      });
      return true;
    } }],
  });
}
