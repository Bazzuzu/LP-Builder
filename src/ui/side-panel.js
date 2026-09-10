// The left panel: Page structure by default, swapping to the selected section's settings
// (with a Back control) rather than showing both at once — one panel, two states, and the
// width that saves goes to the canvas.
//
// It also owns the panel's visibility. The topbar's menu button collapses it entirely, for
// when the page itself is what needs the room; the choice is remembered across sessions.
import { REGISTRY } from '../sections/_registry.js';
import * as store from '../store/pages.js';

const PANEL_KEY = 'lpb.ui.panel';

export function mountSidePanel() {
  const panel = /** @type {HTMLElement} */ (document.getElementById('side-panel'));
  const outline = /** @type {HTMLElement} */ (document.getElementById('outline'));
  const inspector = /** @type {HTMLElement} */ (document.getElementById('inspector'));
  const title = /** @type {HTMLElement} */ (document.getElementById('panel-title'));
  const back = /** @type {HTMLElement} */ (document.getElementById('btn-panel-back'));
  const toggle = /** @type {HTMLButtonElement|null} */ (document.getElementById('btn-panel'));

  let open = true;
  try { open = localStorage.getItem(PANEL_KEY) !== 'off'; } catch { /* storage may be blocked */ }

  const paint = () => {
    const section = store.selected();
    const name = section ? (REGISTRY[section.key]?.name || section.key) : 'Page structure';

    outline.hidden = !!section;
    inspector.hidden = !section;
    back.hidden = !section;
    title.textContent = name;

    panel.hidden = !open;
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      // Names what is behind the button rather than the button's own state, so someone who
      // collapsed the panel can see from the topbar what reopening it would show them.
      // The section's name is never case-folded — "FAQ" is not "faq", and "Multi-Card Grid"
      // is not "multi-card grid".
      const what = section ? `${name} settings` : 'page structure';
      toggle.title = `${open ? 'Hide' : 'Show'} ${what}`;
      toggle.setAttribute('aria-label', toggle.title);
    }
  };

  back.addEventListener('click', () => store.select(null));
  // Deliberately not reopened by selecting a section on the canvas: someone who collapsed
  // the panel did it to see the page, and every click on the canvas selects something.
  toggle?.addEventListener('click', () => {
    open = !open;
    try { localStorage.setItem(PANEL_KEY, open ? 'on' : 'off'); } catch { /* ignore */ }
    paint();
  });

  store.on('sel', paint);
  store.on('reset', paint);
  paint();
}
