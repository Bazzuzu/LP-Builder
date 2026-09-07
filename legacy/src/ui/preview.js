// Live canvas. The iframe keeps landing CSS out of the admin, gives a real mobile viewport
// for the hero's mobile background, and runs the exact document that Export produces.
import { debounce } from '../util.js';
import { renderPage } from '../render/page.js';
import * as store from '../store.js';

export function mountPreview() {
  const frame = document.getElementById('preview');
  const stage = document.getElementById('stage');
  let scrollTop = 0;

  const paint = () => {
    const doc = store.doc();
    try { scrollTop = frame.contentWindow?.scrollY || scrollTop; } catch { /* cross-origin, ignore */ }
    frame.srcdoc = renderPage(doc, { mode: 'preview', selected: store.state.selection });
  };

  frame.addEventListener('load', () => {
    try { frame.contentWindow.scrollTo(0, scrollTop); } catch { /* ignore */ }
  });

  const repaint = debounce(paint, 140);

  window.addEventListener('message', (e) => {
    if (e.data?.lpb === 'select') store.select(e.data.id);
  });

  store.on('doc', repaint);
  store.on('sel', () => {
    // Highlight without a full rebuild so the canvas does not flash on every click.
    const d = frame.contentDocument;
    if (!d) { repaint(); return; }
    d.querySelectorAll('.lpb-sel').forEach((n) => n.classList.remove('lpb-sel'));
    const node = store.state.selection && d.querySelector(`[data-sec="${store.state.selection}"]`);
    if (node) { node.classList.add('lpb-sel'); node.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  });
  store.on('ui', () => { stage.dataset.vp = store.state.viewport; });

  stage.dataset.vp = store.state.viewport;
  paint();
}
