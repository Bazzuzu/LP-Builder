import { el } from '../util.js';

let closeCurrent = null;

/**
 * openModal({title, body, actions:[{label,primary,onClick}], narrow})
 * An action's onClick may return false to keep the modal open.
 */
export function openModal({ title, body, actions = [], narrow = false, onClose }) {
  closeModal();
  const root = document.getElementById('modal-root');
  const box = el('.modal' + (narrow ? '.narrow' : ''));
  const head = el('.modal-head', {}, [
    el('h2', { text: title || '' }),
    el('button.x', { type: 'button', 'aria-label': 'Close', text: '×', onclick: () => closeModal() }),
  ]);
  const bodyNode = el('.modal-body', {}, body ? [body] : []);
  box.append(head, bodyNode);

  if (actions.length) {
    const foot = el('.modal-foot');
    for (const a of actions) {
      foot.append(el('button.btn' + (a.primary ? '.btn-primary' : ''), {
        type: 'button',
        onclick: () => { if (a.onClick?.() !== false) closeModal(); },
      }, a.label));
    }
    box.append(foot);
  }

  root.replaceChildren(box);
  root.hidden = false;
  const onBackdrop = (e) => { if (e.target === root) closeModal(); };
  const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
  root.addEventListener('mousedown', onBackdrop);
  document.addEventListener('keydown', onKey);

  closeCurrent = () => {
    root.removeEventListener('mousedown', onBackdrop);
    document.removeEventListener('keydown', onKey);
    root.hidden = true;
    root.replaceChildren();
    closeCurrent = null;
    onClose?.();
  };
  return { close: closeModal, body: bodyNode };
}

export function closeModal() { closeCurrent?.(); }
