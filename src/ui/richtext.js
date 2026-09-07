// Minimal rich-text editor on contenteditable. execCommand is deprecated but universally
// supported and by far the cheapest way to get per-selection colouring, which the spec requires.
import { el, debounce } from '../util.js';

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
    if (cmd === 'foreColor') document.execCommand('styleWithCSS', false, 'false');
    push(); sync();
  };

  const btns = new Map();
  for (const key of tools) {
    if (key === 'color') {
      const holder = el('button.rt-color', { type: 'button', title: 'Text color', text: 'A' });
      const inp = /** @type {HTMLInputElement} */ (el('input', { type: 'color', value: '#000000' }));
      // The native colour picker steals focus the instant it opens, so this one can't
      // preventDefault its mousedown (that would stop the picker opening at all) — it only
      // needs to save the selection; `run()` restores it once a colour is actually picked.
      holder.addEventListener('mousedown', saveSelection);
      inp.addEventListener('input', () => run('foreColor', inp.value));
      holder.append(inp);
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
  ed.addEventListener('blur', () => push.flush());
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
