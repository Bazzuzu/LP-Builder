// Confirmation for the one action in the editor that destroys work.
//
// Undo covers it, but undo is a glyph in the topbar that a manager on their first week has
// no reason to have found yet — and "I deleted the wrong section and don't know how to get
// it back" is exactly the moment that costs a support call. One dialogue, naming what is
// about to go, is cheaper than that.
import { el } from '../util.js';
import { openModal } from './modal.js';

/**
 * @param {{ what: string, detail?: string, onConfirm: () => void }} opts
 *   `what` is the thing's type ("Feature"), `detail` its own copy, when it has any.
 */
export function confirmDelete({ what, detail, onConfirm }) {
  openModal({
    narrow: true,
    title: `Delete ${what}?`,
    body: el('div', {}, [
      detail ? el('p.confirm-detail', { text: `“${detail}”` }) : null,
      el('p', { text: 'Its content is removed from this page. You can undo with Cmd/Ctrl+Z.' }),
    ].filter(Boolean)),
    actions: [
      { label: 'Cancel' },
      { label: 'Delete', primary: true, danger: true, onClick: onConfirm },
    ],
  });
}
