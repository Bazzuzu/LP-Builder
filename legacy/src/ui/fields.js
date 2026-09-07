// Generic field widgets. The inspector never knows what a section is — it just walks
// the schema and asks for a widget per `kind`. New control type = one entry in WIDGETS.
import { el, readColor, writeColor, fmtBytes } from '../util.js';
import { getAsset, pickFile, putAsset, assetUrl } from '../assets.js';
import { richText } from './richtext.js';
import { repeaterItem } from '../schema/registry.js';
import { openModal } from './modal.js';

/**
 * ctx = { get(path), set(path, value, {coalesce, structural}), errors: Map, rebuild() }
 */
export function renderField(f, ctx, keyPrefix = '') {
  if (f.kind === 'note') return el('.f-help', { text: f.text, style: { padding: '2px 0 6px' } });

  const path = keyPrefix + f.key;
  const errs = ctx.errors.get(path) || [];
  const wrap = el('.f' + (errs.length ? '.has-err' : ''));
  const build = WIDGETS[f.kind] || WIDGETS.text;

  const labelled = f.kind !== 'toggle';
  if (labelled && f.label) {
    wrap.append(el('.f-label', {}, [f.label, f.required ? el('span.req', { text: '*' }) : null]));
  }
  wrap.append(build(f, ctx, path));
  if (f.help) wrap.append(el('.f-help', { text: f.help }));
  for (const e of errs) wrap.append(el('.f-err', { text: e.message }));
  return wrap;
}

const WIDGETS = {
  text(f, ctx, path) {
    // `prefix` is a fixed adornment (e.g. a currency symbol) the admin never types —
    // it lives outside the input and the matching renderer prepends it at render time.
    const input = el('input' + (f.prefix ? '' : '.inp'), {
      type: 'text', value: ctx.get(path) ?? '', placeholder: f.placeholder || '',
      oninput: (e) => ctx.set(path, e.target.value, { coalesce: path }),
    });
    return f.prefix ? el('.affix-field', {}, [el('span.affix', { text: f.prefix }), input]) : input;
  },

  textarea(f, ctx, path) {
    return el('textarea.inp', {
      placeholder: f.placeholder || '',
      oninput: (e) => ctx.set(path, e.target.value, { coalesce: path }),
    }, ctx.get(path) ?? '');
  },

  richtext(f, ctx, path) {
    const { node } = richText({
      value: ctx.get(path) ?? '',
      tools: f.tools,
      singleLine: f.singleLine,
      prefix: f.prefix,
      suffix: f.suffix,
      onChange: (html) => ctx.set(path, html, { coalesce: path }),
    });
    return node;
  },

  number(f, ctx, path) {
    return el('input.inp', {
      type: 'number', value: ctx.get(path) ?? '', min: f.min, max: f.max,
      oninput: (e) => ctx.set(path, e.target.value === '' ? null : +e.target.value, { coalesce: path }),
    });
  },

  range(f, ctx, path) {
    const out = el('span', { text: (ctx.get(path) ?? f.default ?? 0) + (f.unit || ''),
      style: { minWidth: '38px', textAlign: 'right', color: 'var(--ink-3)' } });
    const input = el('input', {
      type: 'range', min: f.min ?? 0, max: f.max ?? 100, step: f.step ?? 1,
      value: ctx.get(path) ?? f.default ?? 0, style: { flex: '1' },
      oninput: (e) => { out.textContent = e.target.value + (f.unit || ''); ctx.set(path, +e.target.value, { coalesce: path }); },
    });
    return el('.f-row', {}, [input, out]);
  },

  toggle(f, ctx, path) {
    const input = el('input', { type: 'checkbox', checked: !!ctx.get(path),
      onchange: (e) => ctx.set(path, e.target.checked, { structural: true }) });
    return el('.f-inline', {}, [
      el('span', {}, [f.label, f.required ? el('span.req', { text: '*' }) : null]),
      el('label.sw', {}, [input, el('i')]),
    ]);
  },

  select(f, ctx, path) {
    const sel = el('select.inp', { onchange: (e) => ctx.set(path, e.target.value, { structural: true }) });
    for (const o of f.options || []) {
      sel.append(el('option', { value: o.value, selected: String(ctx.get(path) ?? f.default) === String(o.value) }, o.label));
    }
    return sel;
  },

  segmented(f, ctx, path) {
    const cur = String(ctx.get(path) ?? f.default ?? '');
    const box = el('.seg-f');
    for (const o of f.options || []) {
      box.append(el('button', {
        type: 'button', class: String(o.value) === cur ? 'on' : '', title: o.label,
        onclick: () => {
          ctx.set(path, o.value, { structural: true, sync: f.syncRepeater ? { key: f.syncRepeater, n: +o.value } : null });
        },
      }, o.label));
    }
    return box;
  },

  datetime(f, ctx, path) {
    return el('input.inp', { type: 'datetime-local', value: toLocal(ctx.get(path)),
      onchange: (e) => ctx.set(path, e.target.value ? new Date(e.target.value).toISOString() : '') });
  },

  color(f, ctx, path) {
    const raw = ctx.get(path) ?? f.default ?? '#FFFFFF';
    const { hex, a } = readColor(raw);
    const box = el('.f');
    const chip = el('.color-sw');
    const fill = el('span', { style: { background: raw } });
    const native = el('input', { type: 'color', value: hex, style: { position: 'absolute', inset: '0', opacity: '0', cursor: 'pointer' } });
    chip.append(fill, native);
    const hexIn = el('input.inp', { type: 'text', value: raw, style: { fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '11.5px' } });

    let alpha = a;
    const apply = (value, coalesce) => { fill.style.background = value; hexIn.value = value; ctx.set(path, value, { coalesce: coalesce ? path : null }); };
    native.addEventListener('input', () => apply(writeColor(native.value, alpha), true));
    hexIn.addEventListener('change', () => { const r = readColor(hexIn.value); alpha = r.a; native.value = r.hex; apply(hexIn.value.trim()); });

    box.append(el('.color-f', {}, [chip, hexIn]));

    if (f.presets?.length) {
      const row = el('.color-presets');
      for (const p of f.presets) {
        row.append(el('button', { type: 'button', title: p.label, style: { background: p.value },
          class: p.value.toLowerCase() === String(raw).toLowerCase() ? 'on' : '',
          onclick: () => { const r = readColor(p.value); alpha = r.a; native.value = r.hex; apply(p.value);
            [...row.children].forEach((c) => c.classList.remove('on')); } }));
      }
      box.append(row);
    }
    if (f.alpha) {
      const val = el('span', { text: Math.round(alpha * 100) + '%', style: { minWidth: '34px', textAlign: 'right', color: 'var(--ink-3)', fontSize: '11px' } });
      box.append(el('.alpha-row', {}, [
        el('span', { text: 'Alpha', style: { color: 'var(--ink-3)', fontSize: '11px' } }),
        el('input', { type: 'range', min: 0, max: 100, value: Math.round(alpha * 100),
          oninput: (e) => { alpha = +e.target.value / 100; val.textContent = e.target.value + '%'; apply(writeColor(native.value, alpha), true); } }),
        val,
      ]));
    }
    return box;
  },

  image(f, ctx, path) {
    const box = el('.img-f');
    const draw = () => {
      box.replaceChildren();
      const v = ctx.get(path);
      const url = v ? (String(v).startsWith('as_') ? assetUrl(v) : v) : '';
      box.classList.toggle('has', !!url);
      if (url) {
        const rec = getAsset(v);
        box.append(el('img', { src: url, alt: '' }));
        box.append(el('.img-meta', {}, [
          el('span', { text: rec ? `${rec.name} · ${fmtBytes(rec.size)}` : 'Built-in asset' }),
          el('span', {}, [
            el('button.btn.btn-sm', { type: 'button', onclick: () => choose() }, 'Replace'),
            ' ',
            el('button.btn.btn-sm.btn-danger', { type: 'button', onclick: () => { ctx.set(path, null); draw(); } }, 'Remove'),
          ]),
        ]));
      } else {
        box.append(el('div', { text: '⬆ Click to upload', style: { color: 'var(--ink-3)', padding: '10px 0' } }));
        if (f.hint) box.append(el('.img-hint', { text: f.hint }));
        box.onclick = choose;
      }
    };
    const choose = async () => {
      const id = await pickFile(f.accept);
      if (id) { ctx.set(path, id); draw(); }
    };
    box.addEventListener('dragover', (e) => { e.preventDefault(); box.style.borderColor = 'var(--accent)'; });
    box.addEventListener('dragleave', () => { box.style.borderColor = ''; });
    box.addEventListener('drop', async (e) => {
      e.preventDefault(); box.style.borderColor = '';
      const file = e.dataTransfer.files?.[0];
      if (file) { ctx.set(path, (await putAsset(file)).id); draw(); }
    });
    draw();
    return box;
  },

  repeater(f, ctx, path) { return repeater(f, ctx, path); },
};

/* ------------------------------------------------------------- repeater */

function repeater(f, ctx, path) {
  const items = ctx.get(path) || [];
  const box = el('.rep');
  const locked = !!f.lockCount;

  items.forEach((item, i) => {
    const itemErrs = [...ctx.errors.keys()].some((k) => k.startsWith(`${path}.${i}.`));
    const node = el('.rep-item' + (itemErrs ? '.invalid' : ''), { 'data-open': String(ctx.openItem === `${path}.${i}`) });
    const head = el('.rep-head', { onclick: (e) => {
      if (e.target.closest('.rep-tools')) return;
      const open = node.getAttribute('data-open') === 'true';
      ctx.openItem = open ? null : `${path}.${i}`;
      node.setAttribute('data-open', String(!open));
    } });
    head.append(
      el('span.chev', { text: '▾' }),
      el('.rep-title', { text: f.itemTitle ? f.itemTitle(item, i) : `Item ${i + 1}` }),
      el('.rep-tools', {}, [
        el('button', { type: 'button', title: 'Move up', disabled: i === 0, onclick: () => move(i, -1) }, '▲'),
        el('button', { type: 'button', title: 'Move down', disabled: i === items.length - 1, onclick: () => move(i, 1) }, '▼'),
        !locked && el('button', { type: 'button', title: 'Duplicate', onclick: () => dup(i) }, '⧉'),
        !locked && el('button', { type: 'button', title: 'Delete', onclick: () => del(i) }, '✕'),
      ].filter(Boolean)),
    );
    const body = el('.rep-body');
    for (const sub of f.item?.fields || []) {
      body.append(renderField(sub, ctx, `${path}.${i}.`));
    }
    node.append(head, body);
    box.append(node);
  });

  if (!items.length) box.append(el('.rep-body', { text: 'No items yet.', style: { color: 'var(--ink-3)' } }));

  const foot = el('.rep-foot');
  if (!locked && (!f.max || items.length < f.max)) {
    foot.append(el('button.btn.btn-sm', { type: 'button', onclick: () => add() }, f.addLabel || '+ Add'));
  }
  if (f.multiUpload) {
    foot.append(el('button.btn.btn-sm', { type: 'button', onclick: () => multiUpload() }, '↑ Upload files'));
  }
  if (f.bulk) {
    foot.append(el('button.btn.btn-sm', { type: 'button', onclick: () => bulk() }, f.bulk.label || 'Bulk import'));
  }
  if (foot.children.length) box.append(foot);

  const write = (next) => ctx.set(path, next, { structural: true });
  const add = () => write([...(ctx.get(path) || []), repeaterItem(f)]);
  const dup = (i) => { const a = [...ctx.get(path)]; a.splice(i + 1, 0, JSON.parse(JSON.stringify(a[i]))); write(a); };
  const del = (i) => { const a = [...ctx.get(path)]; a.splice(i, 1); write(a); };
  const move = (i, d) => { const a = [...ctx.get(path)]; const [x] = a.splice(i, 1); a.splice(i + d, 0, x); write(a); };

  const multiUpload = () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.multiple = true; inp.accept = 'image/svg+xml,image/png';
    inp.onchange = async () => {
      const next = [...(ctx.get(path) || [])];
      for (const file of inp.files) {
        const rec = await putAsset(file);
        next.push({ ...repeaterItem(f), logo: rec.id, alt: file.name.replace(/\.[^.]+$/, '') });
      }
      write(next);
    };
    inp.click();
  };

  const bulk = () => {
    const ta = el('textarea.code', { placeholder: f.bulk.sample || '' });
    const errBox = el('.f-err');
    openModal({
      title: f.bulk.label || 'Bulk import',
      narrow: false,
      body: el('div', {}, [
        el('.f-help', { text: 'Format: ' + f.bulk.format, style: { marginBottom: '8px' } }),
        ta, errBox,
      ]),
      actions: [
        { label: 'Replace all', onClick: () => run(true) },
        { label: 'Append', primary: true, onClick: () => run(false) },
      ],
    });
    function run(replace) {
      const { rows, errors } = f.bulk.parse(ta.value);
      if (!rows.length) { errBox.textContent = errors.join(' ') || 'Nothing to import.'; return false; }
      write(replace ? rows : [...(ctx.get(path) || []), ...rows]);
      return true;
    }
  };

  return box;
}

const toLocal = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
