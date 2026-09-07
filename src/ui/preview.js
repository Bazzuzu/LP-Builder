// Live canvas. The iframe keeps landing CSS out of the admin, gives a real mobile viewport
// for the hero's mobile background, and runs the exact document Export produces.
import { debounce } from '../util.js';
import { renderPage } from '../render/page.js';
import { REGISTRY } from '../sections/_registry.js';
import { globals, onGlobals } from '../store/globals.js';
import * as store from '../store/pages.js';

export function mountPreview() {
  const frame = /** @type {HTMLIFrameElement} */ (document.getElementById('preview'));
  const stage = /** @type {HTMLElement} */ (document.getElementById('stage'));
  let scrollTop = 0;

  const paint = () => {
    // `scrollY` at 0 is legitimate (the user is at the top) and must not be treated as
    // "no value" — `y || scrollTop` would fall back to a stale non-zero position and the
    // next reload would visibly scroll the preview back down for no reason.
    try {
      const y = frame.contentWindow?.scrollY;
      if (y != null) scrollTop = y;
    } catch { /* cross-origin during navigation, ignore */ }
    frame.srcdoc = renderPage(store.doc(), {
      registry: REGISTRY, globals: globals(), mode: 'preview', selected: store.state.selection,
    });
  };

  frame.addEventListener('load', () => {
    // Layout is already complete by 'load' (srcdoc has no external resources to wait on),
    // so this runs synchronously rather than behind requestAnimationFrame — rAF is
    // suspended while the tab is backgrounded, which would silently delay every restore
    // for as long as the editor isn't the focused tab.
    // `behavior: 'instant'` bypasses the page's own `scroll-behavior: smooth` (doc 38/39
    // anchor links) so restoring position never looks like a scroll animation.
    try { frame.contentWindow?.scrollTo({ top: scrollTop, left: 0, behavior: 'instant' }); }
    catch { /* ignore */ }
  });

  const repaint = debounce(paint, 140);

  window.addEventListener('message', (e) => {
    if (e.data?.type === 'lpb:select') store.select(e.data.id);
  });

  store.on('doc', repaint);
  // Global Settings (Footer, Contact, Trust, Subscription) live in a separate store —
  // without this, editing them there would leave the canvas showing stale content
  // until some unrelated page edit happened to trigger a repaint.
  onGlobals(repaint);
  store.on('sel', () => {
    // Move the highlight without rebuilding, so the canvas does not flash on every click.
    const d = frame.contentDocument;
    if (!d) { repaint(); return; }
    d.querySelectorAll('.lpb-selected').forEach((n) => n.classList.remove('lpb-selected'));
    const node = store.state.selection && d.querySelector(`[data-section-id="${store.state.selection}"]`);
    if (node) {
      node.classList.add('lpb-selected');
      node.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });
  const paintUi = () => {
    stage.dataset.vp = store.state.viewport;
    stage.dataset.zoom = String(store.state.zoom);
  };
  store.on('ui', paintUi);
  paintUi();
  paint();
}
