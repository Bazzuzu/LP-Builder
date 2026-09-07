// Merged left panel: Page structure by default, swapping to the selected section's
// Inspector (with a Back control) instead of showing both panels side by side at once —
// trades a second, always-visible panel for width back on the canvas.
import { REGISTRY } from '../sections/_registry.js';
import * as store from '../store/pages.js';

export function mountSidePanel() {
  const outline = /** @type {HTMLElement} */ (document.getElementById('outline'));
  const inspector = /** @type {HTMLElement} */ (document.getElementById('inspector'));
  const title = /** @type {HTMLElement} */ (document.getElementById('panel-title'));
  const back = /** @type {HTMLElement} */ (document.getElementById('btn-panel-back'));

  const paint = () => {
    const section = store.selected();
    outline.hidden = !!section;
    inspector.hidden = !section;
    back.hidden = !section;
    title.textContent = section ? (REGISTRY[section.key]?.name || section.key) : 'Page structure';
  };

  back.addEventListener('click', () => store.select(null));
  store.on('sel', paint);
  store.on('reset', paint);
  paint();
}
