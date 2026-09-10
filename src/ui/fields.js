// Generic field widgets. The inspector never knows what a section is — it walks the
// descriptors and asks for a widget per `kind`. A new control type is one entry in WIDGETS.
import { el, fmtBytes, humanizeFilename, readColor, writeColor } from '../util.js';
import { assetUrl, getAsset, pickFile, putAsset } from '../store/assets.js';
import { isoToZonedLocal, zonedTimeToIso } from '../util.js';
import { parseBulkRows } from '../sections/prices.js';
import { confirmDelete } from './confirm.js';
import { openModal } from './modal.js';
import { richText } from './richtext.js';

/**
 * @typedef {object} FieldCtx
 * @property {(path: string) => any} get
 * @property {(path: string, value: any, opts?: { coalesce?: string|null, structural?: boolean }) => void} set
 * @property {Map<string, { message: string }[]>} errors
 * @property {string|null} [openItem]
 */

/**
 * @param {import('../model/types.js').FieldDescriptor} f
 * @param {FieldCtx} ctx
 * @param {string} [keyPrefix]
 */
export function renderField(f, ctx, keyPrefix = '') {
  if (f.kind === 'note') return el('.f-note', { text: f.text || '' });
  if (f.when && !f.when(ctx.get('') || {}, (p) => ctx.get(p))) return null;

  const path = keyPrefix + f.key;
  const errs = ctx.errors.get(path) || [];
  const wrap = el('.f' + (errs.length ? '.has-err' : ''));
  const build = WIDGETS[f.kind] || WIDGETS.text;

  if (f.kind !== 'toggle' && f.label) {
    wrap.append(el('.f-label', {}, [f.label, f.required ? el('span.req', { text: '*' }) : null]));
  }
  wrap.append(build(f, ctx, path));
  if (f.help) wrap.append(el('.f-help', { text: f.help }));
  for (const e of errs) wrap.append(el('.f-err', { text: e.message }));
  return wrap;
}

/** @type {Record<string, (f: any, ctx: FieldCtx, path: string) => HTMLElement>} */
const WIDGETS = {
  text: (f, ctx, path) => el('input.inp', {
    type: 'text', value: ctx.get(path) ?? '', placeholder: f.placeholder || '',
    oninput: (e) => ctx.set(path, e.target.value, { coalesce: path }),
  }),

  richtext: (f, ctx, path) => richText({
    value: ctx.get(path) ?? '', tools: f.tools, singleLine: !!(f.singleLine || f.inline),
    onChange: (html) => ctx.set(path, html, { coalesce: path }),
  }).node,

  number: (f, ctx, path) => el('input.inp', {
    type: 'number', value: ctx.get(path) ?? '', min: f.min, max: f.max,
    oninput: (e) => ctx.set(path, e.target.value === '' ? null : +e.target.value, { coalesce: path }),
  }),

  range(f, ctx, path) {
    const out = el('span.f-out', { text: (ctx.get(path) ?? f.default ?? 0) + (f.unit || '') });
    const input = el('input', {
      type: 'range', min: f.min ?? 0, max: f.max ?? 100, value: ctx.get(path) ?? f.default ?? 0,
      oninput: (e) => { out.textContent = e.target.value + (f.unit || ''); ctx.set(path, +e.target.value, { coalesce: path }); },
    });
    return el('.f-row', {}, [input, out]);
  },

  toggle: (f, ctx, path) => el('.f-inline', {}, [
    el('span', {}, [f.label, f.required ? el('span.req', { text: '*' }) : null]),
    el('label.sw', {}, [
      el('input', { type: 'checkbox', checked: !!ctx.get(path),
        onchange: (e) => ctx.set(path, e.target.checked, { structural: true }) }),
      el('i'),
    ]),
  ]),

  select(f, ctx, path) {
    const cur = String(ctx.get(path) ?? f.default ?? '');
    const sel = el('select.inp', { onchange: (e) => ctx.set(path, coerce(f, e.target.value), { structural: true }) });
    for (const o of f.options || []) {
      sel.append(el('option', { value: o.value, selected: String(o.value) === cur }, o.label));
    }
    return sel;
  },

  segmented(f, ctx, path) {
    const cur = String(ctx.get(path) ?? f.default ?? '');
    const box = el('.seg-f');
    for (const o of f.options || []) {
      box.append(el('button', {
        type: 'button', class: String(o.value) === cur ? 'on' : '',
        onclick: () => { ctx.set(path, o.value, { structural: true }); f.onChange?.(o.value, ctx); },
      }, o.label));
    }
    return box;
  },

  /**
   * A named parameter set (doc 41 §4.3): picking one writes several props at once, then
   * every one of them stays independently editable.
   */
  preset(f, ctx) {
    const box = el('.seg-f');
    for (const o of f.options || []) {
      const values = f.applies?.[o.value] || {};
      const active = Object.entries(values).every(([k, v]) => String(ctx.get(k)) === String(v));
      box.append(el('button', {
        type: 'button', class: active ? 'on' : '',
        onclick: () => { for (const [k, v] of Object.entries(values)) ctx.set(k, v, { structural: true }); },
      }, o.label));
    }
    return box;
  },

  datetime: (f, ctx, path) => el('input.inp', {
    type: 'datetime-local', value: toLocal(ctx.get(path)),
    onchange: (e) => ctx.set(path, e.target.value ? new Date(e.target.value).toISOString() : null),
  }),

  /**
   * A datetime-local input whose value is read/written as wall-clock time in a SIBLING
   * timezone field (`f.tzKey`) rather than the browser's own zone — so the stored instant
   * means the same moment for every visitor, and re-editing shows it correctly for
   * whichever zone is currently selected.
   */
  'datetime-tz': (f, ctx, path) => el('input.inp', {
    type: 'datetime-local', value: isoToZonedLocal(ctx.get(path), ctx.get(f.tzKey) || 'UTC'),
    onchange: (e) => ctx.set(path, zonedTimeToIso(e.target.value, ctx.get(f.tzKey) || 'UTC')),
  }),

  /**
   * The site's own colours come first as named swatches; the free picker, the hex box and
   * the alpha slider sit behind a "Custom" disclosure. A manager picking a brand colour is
   * one click away from done, and going off-palette stays possible but is a decision they
   * have to make on purpose. Custom opens by default when the stored value is not one of
   * the presets, so an existing custom colour is never hidden from the person editing it.
   */
  color(f, ctx, path) {
    const raw = ctx.get(path) ?? f.default ?? '#FFFFFF';
    const presets = f.presets || [];
    const named = (/** @type {string} */ v) =>
      presets.find((p) => String(p.value).toLowerCase() === String(v ?? '').toLowerCase());

    const { hex, a } = readColor(raw);
    let alpha = a;

    const box = el('div');
    const fill = el('span', { style: { background: raw } });
    const native = /** @type {HTMLInputElement} */ (el('input', { type: 'color', value: hex }));
    const hexIn = /** @type {HTMLInputElement} */ (el('input.inp.mono', { type: 'text', value: raw }));
    const swatches = el('.color-presets');

    const apply = (value, coalesce) => {
      fill.style.background = value;
      hexIn.value = value;
      for (const b of swatches.children) {
        b.classList.toggle('on', String(b.getAttribute('data-value')).toLowerCase() === String(value).toLowerCase());
      }
      ctx.set(path, value, { coalesce: coalesce ? path : null });
    };

    for (const p of presets) {
      swatches.append(el('button', {
        type: 'button', title: p.label, 'data-value': p.value, style: { background: p.value },
        class: named(raw)?.value === p.value ? 'on' : '',
        onclick: () => {
          const r = readColor(p.value); alpha = r.a; native.value = r.hex; apply(p.value);
        },
      }));
    }
    if (presets.length) box.append(swatches);

    native.addEventListener('input', () => apply(writeColor(native.value, alpha), true));
    hexIn.addEventListener('change', () => {
      const r = readColor(hexIn.value); alpha = r.a; native.value = r.hex; apply(hexIn.value.trim());
    });

    const custom = el('.color-custom');
    custom.append(el('.color-f', {}, [el('.color-sw', {}, [fill, native]), hexIn]));
    if (f.alpha) {
      const val = el('span.f-out', { text: Math.round(alpha * 100) + '%' });
      custom.append(el('.f-row', {}, [
        el('span.f-help', { text: 'Alpha' }),
        el('input', { type: 'range', min: 0, max: 100, value: Math.round(alpha * 100),
          oninput: (/** @type {any} */ e) => {
            alpha = +e.target.value / 100; val.textContent = e.target.value + '%';
            apply(writeColor(native.value, alpha), true);
          } }),
        val,
      ]));
    }

    // With no presets to choose from there is nothing to disclose — show the picker plainly
    // rather than hiding the field's only control behind a toggle.
    if (!presets.length) { box.append(custom); return box; }

    const disc = el('details.color-disc', { open: !named(raw) });
    disc.append(el('summary', { text: 'Custom' }), custom);
    box.append(disc);
    return box;
  },

  /**
   * Image + alt in one control. They are never separated in the UI because a content image
   * without alt fails validation (SYS-02 §6), and splitting them invites forgetting one.
   */
  image(f, ctx, path) {
    const box = el('.img-f');
    const value = () => ctx.get(path) || {};
    const write = (patch) => ctx.set(path, { ...value(), ...patch });

    const draw = () => {
      box.replaceChildren();
      const v = value();
      const url = v.url || (v.asset ? assetUrl(v.asset) : '');
      box.classList.toggle('has', !!url);

      if (url) {
        const rec = v.asset ? getAsset(v.asset) : null;
        box.append(el('img', { src: url, alt: '' }));
        box.append(el('.img-meta', {}, [
          el('span', { text: rec ? `${rec.name} · ${fmtBytes(rec.size)}` : 'Linked image' }),
          el('span', {}, [
            el('button.btn.btn-sm', { type: 'button', onclick: choose }, 'Replace'),
            ' ',
            el('button.btn.btn-sm.btn-danger', { type: 'button',
              onclick: () => { ctx.set(path, null); draw(); } }, 'Remove'),
          ]),
        ]));
        if (!f.decorative) {
          box.append(el('.img-alt', {}, [
            el('.f-label', {}, ['Alt text', el('span.req', { text: '*' })]),
            el('input.inp', { type: 'text', value: v.alt || '',
              placeholder: 'What the image shows',
              oninput: (e) => write({ alt: e.target.value }) }),
          ]));
        }
      } else {
        box.append(el('.img-drop', { text: '⬆ Click or drop an image' }));
        if (f.ratio) box.append(el('.img-hint', { text: `Container ratio ${f.ratio}` }));
        if (f.help) box.append(el('.img-hint', { text: f.help }));
        box.onclick = choose;
      }
    };

    // A filename-derived guess, never overwriting alt text the admin already typed, and
    // never applied to decorative assets (their alt is fixed to "" and the field isn't shown).
    const suggestAlt = (/** @type {string} */ name) =>
      (!f.decorative && !value().alt && name) ? { alt: humanizeFilename(name) } : {};

    async function choose() {
      const id = await pickFile('image/*');
      if (!id) return;
      write({ asset: id, ...suggestAlt(getAsset(id)?.name) });
      draw();
    }
    box.addEventListener('dragover', (e) => { e.preventDefault(); box.classList.add('drag'); });
    box.addEventListener('dragleave', () => box.classList.remove('drag'));
    box.addEventListener('drop', async (e) => {
      e.preventDefault(); box.classList.remove('drag');
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      const rec = await putAsset(file);
      write({ asset: rec.id, ...suggestAlt(rec.name) });
      draw();
    });
    draw();
    return box;
  },

  repeater: (f, ctx, path) => repeater(f, ctx, path),
};

/* -------------------------------------------------------------- repeater */

function repeater(f, ctx, path) {
  const stored = ctx.get(path) || [];
  // `fixed` means another prop dictates how many items are active. The rest stay in the
  // document — that is the retention rule — so the editor shows the active ones and says
  // plainly that the others are kept.
  const activeCount = f.fixed ? Number(ctx.get(f.fixed)) || stored.length : stored.length;
  const items = f.fixed ? stored.slice(0, activeCount) : stored;
  const box = el('.rep');

  items.forEach((item, i) => {
    const hasErr = [...ctx.errors.keys()].some((k) => k.startsWith(`${path}.${i}`));
    const open = ctx.openItem === `${path}.${i}`;
    const node = el('.rep-item' + (hasErr ? '.invalid' : ''), { 'data-open': String(open) });
    const head = el('.rep-head', {
      onclick: (e) => {
        if (e.target.closest('.rep-tools')) return;
        const isOpen = node.getAttribute('data-open') === 'true';
        ctx.openItem = isOpen ? null : `${path}.${i}`;
        node.setAttribute('data-open', String(!isOpen));
      },
    }, [
      el('span.chev', { text: '▾' }),
      el('.rep-title', { text: f.itemTitle ? f.itemTitle(item, i) : `Item ${i + 1}` }),
      el('.rep-tools', {}, [
        el('button', { type: 'button', title: 'Move up', disabled: i === 0, onclick: () => move(i, -1) }, '▲'),
        el('button', { type: 'button', title: 'Move down', disabled: i === items.length - 1, onclick: () => move(i, 1) }, '▼'),
        !f.fixed && el('button', { type: 'button', title: 'Duplicate', onclick: () => dup(i) }, '⧉'),
        !f.fixed && el('button', { type: 'button', title: 'Delete',
          disabled: !!f.min && items.length <= f.min, onclick: () => askDelete(i, item) }, '✕'),
      ].filter(Boolean)),
    ]);
    const body = el('.rep-body');
    for (const sub of f.item?.fields || []) {
      const node2 = renderField(sub, ctx, `${path}.${i}.`);
      if (node2) body.append(node2);
    }
    node.append(head, body);
    box.append(node);
  });

  if (!items.length) box.append(el('.rep-empty', { text: 'No items yet.' }));

  const kept = stored.length - items.length;
  if (kept > 0) {
    box.append(el('.f-help', { text: `${kept} more item${kept > 1 ? 's' : ''} kept for the larger layout.` }));
  }

  const foot = el('.rep-foot');
  if (!f.fixed && (!f.max || stored.length < f.max)) {
    foot.append(el('button.btn.btn-sm', { type: 'button', onclick: add }, f.addLabel || '+ Add'));
  }
  if (f.multiUpload) foot.append(el('button.btn.btn-sm', { type: 'button', onclick: multiUpload }, '↑ Upload files'));
  if (f.bulkImport) foot.append(el('button.btn.btn-sm', { type: 'button', onclick: bulk }, 'Bulk import'));
  if (foot.children.length) box.append(foot);

  const write = (next) => ctx.set(path, next, { structural: true });
  const blank = () => Object.fromEntries((f.item?.fields || [])
    .map((sub) => [sub.key, sub.default ?? (sub.kind === 'toggle' ? false : sub.kind === 'image' ? null : '')]));

  function add() { write([...(ctx.get(path) || []), blank()]); }
  function dup(i) { const a = [...ctx.get(path)]; a.splice(i + 1, 0, structuredClone(a[i])); write(a); }
  function del(i) { const a = [...ctx.get(path)]; a.splice(i, 1); write(a); }

  /**
   * An empty row is a mistake to undo, not a decision to confirm — asking about one is the
   * dialogue that teaches people to dismiss dialogues. A row someone has filled in gets the
   * question.
   */
  function askDelete(i, item) {
    const label = f.itemTitle ? f.itemTitle(item, i) : `Item ${i + 1}`;
    const filled = Object.entries(item || {}).some(([k, v]) =>
      !k.startsWith('row_id') && v != null && v !== '' && v !== false);
    if (!filled) { del(i); return; }
    confirmDelete({ what: (f.label || 'this item').replace(/s$/, '').toLowerCase() || 'item',
      detail: label, onConfirm: () => del(i) });
  }
  function move(i, d) { const a = [...ctx.get(path)]; const [x] = a.splice(i, 1); a.splice(i + d, 0, x); write(a); }

  function multiUpload() {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.multiple = true; inp.accept = 'image/*';
    inp.onchange = async () => {
      const next = [...(ctx.get(path) || [])];
      for (const file of [...(inp.files || [])]) {
        const rec = await putAsset(file);
        next.push({ ...blank(), file: { asset: rec.id }, alt: humanizeFilename(file.name) });
      }
      write(next);
    };
    inp.click();
  }

  function bulk() {
    const spec = BULK[f.bulkImport];
    if (!spec) return;
    const ta = /** @type {HTMLTextAreaElement} */ (el('textarea.code', { placeholder: spec.sample, rows: '8' }));
    const errBox = el('.f-err');
    openModal({
      title: 'Bulk import',
      body: el('div', {}, [el('.f-help', { text: spec.format }), ta, errBox]),
      actions: [
        { label: 'Replace all rows', onClick: () => run(true) },
        { label: 'Append', primary: true, onClick: () => run(false) },
      ],
    });
    function run(replace) {
      const { rows, errors } = spec.parse(String(ta.value));
      // All-or-nothing: nothing is written unless every line parses (doc 31 §4.4).
      if (errors.length) {
        errBox.replaceChildren(...errors.map((e) => el('div', { text: `Line ${e.line}: ${e.message}` })));
        return false;
      }
      if (!rows.length) { errBox.textContent = 'Nothing to import.'; return false; }
      const existing = replace ? [] : (ctx.get(path) || []);
      if (f.max && existing.length + rows.length > f.max) {
        errBox.textContent = `That would make ${existing.length + rows.length} rows; the maximum is ${f.max}.`;
        return false;
      }
      write([...existing, ...rows]);
      return true;
    }
  }

  return box;
}

/** Bulk-import dialects, keyed by the descriptor's `bulkImport` name. */
const BULK = {
  prices: {
    format: 'Route | Fare | Published fare | Cabin | Detail | Badge | Region — one row per line. '
      + 'Cabin accepts "Business", "Business Class", etc. A second detail label can be added per-row afterwards.',
    sample: 'London (LHR)|1,234|4,321|Business|Nonstop|Special Fare|Europe',
    parse: parseBulkRows,
  },
};

const coerce = (f, v) => (typeof f.options?.[0]?.value === 'number' ? Number(v) : v);

const toLocal = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
