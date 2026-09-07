import { el } from '../util.js';
import { openModal, closeModal } from './modal.js';
import * as store from '../store.js';

export function openIssues() {
  const issues = store.state.issues;
  const body = el('div');
  if (!issues.length) {
    body.append(el('.empty-ok', { text: '✓ No validation issues. This page is ready to publish.' }));
  } else {
    const ul = el('ul.issues');
    for (const i of issues) {
      ul.append(el('li', { onclick: () => { store.select(i.sectionId); closeModal(); } }, [
        el('span', { class: 'sev ' + i.severity, text: i.severity }),
        el('div', {}, [
          el('div', { text: i.message }),
          el('.where', { text: i.sectionName + (i.path ? ' · ' + i.path : '') }),
        ]),
      ]));
    }
    body.append(ul);
  }
  openModal({ title: `Validation (${issues.length})`, body, narrow: true });
}
