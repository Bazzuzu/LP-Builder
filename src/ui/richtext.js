// Minimal rich-text editor on contenteditable. execCommand is deprecated but universally
// supported and by far the cheapest way to get per-selection colouring, which the spec requires.
import { el, debounce, readColor } from '../util.js';

const RECENT_COLORS_KEY = 'lpb.rt.recentColors';
const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function getRecentColors() {
  try { return JSON.parse(localStorage.getItem(RECENT_COLORS_KEY) || '[]'); }
  catch { return []; }
}

/** Most-recent-first, deduped case-insensitively, capped at 10. */
function pushRecentColor(hex) {
  const list = [hex, ...getRecentColors().filter((c) => c.toLowerCase() !== hex.toLowerCase())].slice(0, 10);
  try { localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(list)); } catch { /* ignore */ }
  return list;
}

const TOOLS = {
  b:     { cmd: 'bold', label: 'B', title: 'Bold (Cmd/Ctrl+B)', style: 'font-weight:700' },
  i:     { cmd: 'italic', label: 'I', title: 'Italic (Cmd/Ctrl+I)', style: 'font-style:italic' },
  s:     { cmd: 'strikeThrough', label: 'S', title: 'Strikethrough', style: 'text-decoration:line-through' },
  ul:    { cmd: 'insertUnorderedList', label: '•—', title: 'Bulleted list' },
  ol:    { cmd: 'insertOrderedList', label: '1.', title: 'Numbered list' },
};

/**
 * @param {{ value?: string, tools?: string[], singleLine?: boolean,
 *           prefix?: string|null, suffix?: string|null,
 *           onChange: (html: string) => void }} opts
 */
export function richText({ value = '', tools = ['b', 'i', 's', 'color'], singleLine = false,
  prefix = null, suffix = null, onChange }) {
  const wrap = el('.rt');
  const bar = el('.rt-bar');
  const ed = el('.rt-editor', { contenteditable: 'true', spellcheck: 'false', html: value || '' });

  // Fixed adornments the admin never types (e.g. a currency symbol or a footnote mark) —
  // shown as chips in the toolbar; the matching renderer applies them at render time.
  if (prefix) bar.append(el('span.rt-affix', { text: prefix, title: 'Added automatically — no need to type it' }));

  const push = debounce(() => onChange(ed.innerHTML), 180);
  const sync = () => {
    for (const [key, btn] of btns) {
      const t = TOOLS[key];
      if (!t) continue;
      try { btn.classList.toggle('on', document.queryCommandState(t.cmd)); } catch { /* ignore */ }
    }
  };

  // A plain <button> takes focus on click in some browsers, which happens before the click
  // handler runs — by then the selection the admin made in `ed` can already be gone. Every
  // toolbar control saves it on mousedown (before that focus shift) and `run()` restores it
  // right before acting, so the command always lands on what was actually highlighted, not
  // on whatever the caret collapsed to.
  /** @type {Range|null} */
  let savedRange = null;
  const saveSelection = () => {
    const s = window.getSelection();
    savedRange = s && s.rangeCount ? s.getRangeAt(0).cloneRange() : null;
  };
  const restoreSelection = () => {
    if (!savedRange) return;
    const s = window.getSelection();
    s?.removeAllRanges();
    s?.addRange(savedRange);
  };
  /** Mousedown handler shared by every toolbar button: keep focus off the button entirely. */
  const keepSelection = (/** @type {MouseEvent} */ e) => { e.preventDefault(); saveSelection(); };

  const run = (cmd, arg) => {
    ed.focus();
    restoreSelection();
    // Plain foreColor inserts legacy <font color> tags, which the render sanitizer
    // (render/html.js) does not allowlist. styleWithCSS makes it emit <span
    // style="color:...">  instead — scoped to just this command so bold/italic/strike
    // keep using their normal <b>/<i>/<s> tags.
    if (cmd === 'foreColor') document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(cmd, false, arg);
    if (cmd === 'foreColor') {
      document.execCommand('styleWithCSS', false, 'false');
      // The browser always serialises the `color` property as rgb(...) the moment anything
      // touches the CSSOM `.style` object — even setting `.style.color` to a hex string
      // reads back as rgb() on the very next line, because the *property* setter always
      // re-canonicalises. The only way to keep the app's hex-only convention is to rewrite
      // the raw `style` ATTRIBUTE string directly and never go through `.style` again, since
      // `setAttribute` (unlike the CSSOM setter) stores exactly the string it's given.
      ed.querySelectorAll('[style*="color"]').forEach((node) => {
        const raw = node.getAttribute('style') || '';
        const m = /color:\s*(rgba?\([^)]+\))/i.exec(raw);
        if (m) node.setAttribute('style', raw.replace(m[1], readColor(m[1]).hex));
      });
    }
    push(); sync();
  };

  const btns = new Map();
  for (const key of tools) {
    if (key === 'color') {
      // `<button>` cannot legally contain another interactive control — the earlier
      // `<button><input type=color></button>` nesting is invalid HTML, and browsers'
      // handling of it is exactly what was dropping the editor's selection on click. This
      // is a plain, non-interactive `<span>` instead; the popover below holds every actual
      // control (a hex field first, since colour here is hex-only everywhere else, plus the
      // last 10 colours used and a native swatch for anything outside that list).
      const holder = el('span.rt-color', { title: 'Text color', text: 'A' });

      /** @type {HTMLElement|null} */
      let pop = null;
      const onOutside = (/** @type {MouseEvent} */ e) => {
        if (pop && !pop.contains(/** @type {Node} */ (e.target)) && e.target !== holder) closePop();
      };
      function closePop() {
        pop?.remove(); pop = null;
        wrap.classList.remove('rt-pop-open');
        document.removeEventListener('mousedown', onOutside, true);
      }
      const applyColor = (/** @type {string} */ hex) => {
        run('foreColor', hex);
        paintSwatches(pushRecentColor(hex));
      };
      /** @type {HTMLElement|null} */
      let swatchRow = null;
      function paintSwatches(/** @type {string[]} */ list) {
        if (!swatchRow) return;
        swatchRow.replaceChildren(...list.map((c) => el('button', {
          type: 'button', title: c, style: { background: c },
          onmousedown: keepSelection, onclick: () => { hexInput.value = c; applyColor(c); },
        })));
      }
      /** @type {HTMLInputElement} */
      let hexInput;
      function openPop() {
        if (pop) return;
        saveSelection();
        const commitHex = () => { if (HEX_RE.test(hexInput.value.trim())) applyColor(hexInput.value.trim()); };
        hexInput = /** @type {HTMLInputElement} */ (el('input.rt-color-hex', {
          type: 'text', placeholder: '#000000', onchange: commitHex,
          onkeydown: (/** @type {KeyboardEvent} */ e) => { if (e.key === 'Enter') { e.preventDefault(); commitHex(); } },
        }));
        swatchRow = el('.rt-color-swatches');
        paintSwatches(getRecentColors());
        // Unlike every other control here, this one can't preventDefault its mousedown —
        // that's exactly the browser interaction that opens the native colour picker, so
        // doing that would silently stop it from ever opening. Saving the selection without
        // blocking the default is enough; `run()` restores it once a colour is actually
        // picked, same as everywhere else.
        const more = el('input.rt-color-more', { type: 'color', title: 'Custom colour', value: '#000000',
          onmousedown: saveSelection,
          oninput: (/** @type {any} */ e) => { hexInput.value = e.target.value; applyColor(e.target.value); } });
        pop = el('.rt-color-pop', {}, [hexInput, swatchRow, more]);
        // Appended inside `wrap`, not `document.body` — the inspector only skips its
        // destroy-and-rebuild repaint while the focused element is one it can see is "live"
        // (its `caretAtRisk` check walks up from `document.activeElement`). A popover
        // floated onto `body` sits outside that check entirely: focusing its hex field would
        // still count as a blur as far as the panel is concerned, so it would repaint and
        // tear out the very editor node the saved selection pointed to, right underneath it.
        wrap.append(pop);
        wrap.classList.add('rt-pop-open');
        Object.assign(pop.style, { top: `${holder.offsetTop + holder.offsetHeight + 4}px`, left: `${holder.offsetLeft}px` });
        // Deliberately not auto-focusing the hex field: focusing any real input moves the
        // browser's selection out of `ed`, and the highlight on the text the admin just
        // picked visibly disappears the instant that happens. Left alone, the popover opens
        // with the selection still visibly highlighted — proof it was captured — and only
        // disappears if the admin chooses to type a hex value instead of clicking a swatch.
        setTimeout(() => document.addEventListener('mousedown', onOutside, true), 0);
      }
      holder.addEventListener('mousedown', (e) => { e.preventDefault(); pop ? closePop() : openPop(); });
      bar.append(holder);
      continue;
    }
    if (key === 'link') {
      const b = el('button', { type: 'button', title: 'Insert link', text: '🔗', onmousedown: keepSelection,
        onclick: () => {
          const url = prompt('Link URL', 'https://');
          if (!url) return;
          run('createLink', url);
          const a = /** @type {HTMLAnchorElement|null} */ (ed.querySelector('a[href="' + url + '"]'));
          if (a && confirm('Open in a new tab?')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; push(); }
        } });
      bar.append(b);
      continue;
    }
    const t = TOOLS[key];
    if (!t) continue;
    const b = el('button', { type: 'button', title: t.title, html: `<span style="${t.style || ''}">${t.label}</span>`,
      onmousedown: keepSelection, onclick: () => run(t.cmd) });
    btns.set(key, b);
    bar.append(b);
  }
  bar.append(el('button', { type: 'button', title: 'Clear formatting', text: '⌫', onmousedown: keepSelection,
    onclick: () => run('removeFormat') }));
  if (suffix) bar.append(el('span.rt-affix.rt-affix-suffix', { text: suffix, title: 'Added automatically at the end' }));

  ed.addEventListener('input', push);
  // Deferred one tick, matching the inspector's own focusout handling ("focusout fires
  // before focus lands on the next node, so settle first"): flushing synchronously here
  // commits mid-transition, while `document.activeElement` hasn't settled on wherever
  // focus is actually going yet (e.g. this field's own colour popover). The inspector's
  // caretAtRisk check reads activeElement to decide whether it's safe to repaint — caught
  // in that gap, it doesn't recognise the popover as "live" and tears the whole panel down,
  // taking the popover (and the editor node the saved selection pointed to) with it.
  ed.addEventListener('blur', () => setTimeout(() => push.flush(), 0));
  ed.addEventListener('keyup', sync);
  ed.addEventListener('mouseup', sync);
  ed.addEventListener('paste', (e) => {
    // Paste as plain text so foreign markup never enters the document.
    e.preventDefault();
    const text = e.clipboardData?.getData('text/plain') || '';
    document.execCommand('insertText', false, text);
  });
  ed.addEventListener('keydown', (e) => {
    if (singleLine && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); return; }
    if (e.key === 'Enter' && !e.shiftKey && !singleLine) {
      // Default <div> wrapping is noisy; a plain <br> matches what the spec describes.
      e.preventDefault();
      document.execCommand('insertLineBreak');
      push();
    }
  });

  wrap.append(bar, ed);
  return { node: wrap, editor: ed };
}
