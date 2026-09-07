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

export function richText({ value = '', tools = ['b', 'i', 's', 'color'], singleLine = false, prefix, suffix, onChange }) {
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
  const run = (cmd, arg) => {
    ed.focus();
    // Plain foreColor inserts legacy <font color> tags, which the render sanitizer
    // (render/html.js) does not allowlist. styleWithCSS makes it emit <span
    // style="color:...">  instead — scoped to just this command so bold/italic/strike
    // keep using their normal <b>/<i>/<s> tags.
    if (cmd === 'foreColor') document.execCommand('styleWithCSS', false, true);
    document.execCommand(cmd, false, arg);
    if (cmd === 'foreColor') document.execCommand('styleWithCSS', false, false);
    push(); sync();
  };

  const btns = new Map();
  for (const key of tools) {
    if (key === 'color') {
      const holder = el('button.rt-color', { type: 'button', title: 'Text color', text: 'A' });
      const inp = el('input', { type: 'color', value: '#000000' });
      // Colour must apply to the selection that existed before the picker stole focus.
      let saved = null;
      holder.addEventListener('mousedown', () => { saved = window.getSelection().rangeCount ? window.getSelection().getRangeAt(0).cloneRange() : null; });
      inp.addEventListener('input', () => {
        if (saved) { const s = window.getSelection(); s.removeAllRanges(); s.addRange(saved); }
        run('foreColor', inp.value);
      });
      holder.append(inp);
      bar.append(holder);
      continue;
    }
    if (key === 'link') {
      const b = el('button', { type: 'button', title: 'Insert link', text: '🔗',
        onclick: () => {
          const url = prompt('Link URL', 'https://');
          if (!url) return;
          run('createLink', url);
          const a = ed.querySelector('a[href="' + url + '"]');
          if (a && confirm('Open in a new tab?')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; push(); }
        } });
      bar.append(b);
      continue;
    }
    const t = TOOLS[key];
    if (!t) continue;
    const b = el('button', { type: 'button', title: t.title, html: `<span style="${t.style || ''}">${t.label}</span>`,
      onclick: () => run(t.cmd) });
    btns.set(key, b);
    bar.append(b);
  }
  bar.append(el('button', { type: 'button', title: 'Clear formatting', text: '⌫',
    onclick: () => run('removeFormat') }));
  if (suffix) bar.append(el('span.rt-affix.rt-affix-suffix', { text: suffix, title: 'Added automatically at the end' }));

  ed.addEventListener('input', push);
  ed.addEventListener('blur', () => push.flush());
  ed.addEventListener('keyup', sync);
  ed.addEventListener('mouseup', sync);
  ed.addEventListener('paste', (e) => {
    // Paste as plain text so foreign markup never enters the document.
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
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
