// Issues panel. Groups by validation level so the difference between "cannot publish"
// and "cannot save" is visible rather than folded into one list (SYS-02 §4).
import { el } from '../util.js';
import { REGISTRY } from '../sections/_registry.js';
import * as store from '../store/pages.js';
import { closeModal, openModal } from './modal.js';

const LEVEL_LABEL = {
  L0: 'Structure — blocks publishing',
  L1: 'Content — blocks publishing',
  L2: 'Field format',
};

export function openIssues() {
  const body = el('div');
  const issues = store.state.issues;

  if (!issues.length) {
    body.append(el('.empty-ok', { text: '✓ No issues. This page is ready to publish.' }));
  }

  for (const level of ['L0', 'L1', 'L2']) {
    const list = issues.filter((i) => i.level === level);
    if (!list.length) continue;
    body.append(el('.lib-group-title', { text: `${LEVEL_LABEL[level]} · ${list.length}` }));
    const ul = el('ul.issues');
    for (const i of list) {
      const section = i.sectionId ? store.section(i.sectionId) : null;
      const where = section ? (REGISTRY[section.key]?.name || section.key) : 'Page';
      ul.append(el('li', {
        onclick: () => { if (i.sectionId) store.select(i.sectionId); closeModal(); },
      }, [
        el('span.sev.error', { text: i.code }),
        el('div', {}, [
          el('div', { text: i.message }),
          el('.where', { text: i.path ? `${where} · ${i.path}` : where }),
        ]),
      ]));
    }
    body.append(ul);
  }

  openModal({ title: 'Issues', body });
}
