// Page list and page settings.
import { el, slugify } from '../util.js';
import { PAGE_TYPES, REGIONS } from '../model/enums.js';
import { TEMPLATES, pageFromTemplate } from '../presets/page-templates.js';
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

/** Page-level settings: identity, SEO and the route defaults the lead form inherits. */
export function openPageSettings() {
  const page = store.doc();
  if (!page) return;
  const draft = structuredClone(page);
  const body = el('.gpane');
  const errBox = el('.f-err');

  const field = (label, value, onInput, help) => {
    const input = el('input.inp', { type: 'text', value: value ?? '', oninput: (e) => onInput(e.target.value) });
    return el('.f', {}, [el('.f-label', { text: label }), input, help ? el('.f-help', { text: help }) : null].filter(Boolean));
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
