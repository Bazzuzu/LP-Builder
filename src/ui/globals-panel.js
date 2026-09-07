// Global settings. Site-wide content lives in its own store, so this panel is deliberately
// separate from the page inspector: editing it changes every page at once.
import { el, getPath, setPath } from '../util.js';
import { globals, resetGlobals, updateGlobals } from '../store/globals.js';
import { closeModal, openModal } from './modal.js';

const AREAS = {
  SECTION_FOOTER: 'footer',
  SECTION_CONTACT: 'contact',
  SECTION_TRUST: 'trust',
  SECTION_SUBSCRIPTION: 'subscription',
};

/** Editable leaves per area. Nested structures (nav columns, reviews) are JSON for now. */
const FIELDS = {
  footer: [
    ['legal_disclaimers', 'Legal disclaimers', 'textarea'],
    ['copyright_notice', 'Copyright notice', 'text'],
    ['registration_notice', 'Registration notice', 'text'],
    ['newsletter.title', 'Newsletter title', 'text'],
    ['newsletter.subtitle', 'Newsletter subtitle', 'textarea'],
    ['newsletter.email_placeholder', 'Newsletter email placeholder', 'text'],
    ['newsletter.button_label', 'Newsletter button label', 'text'],
    ['newsletter.privacy_notice', 'Newsletter privacy notice', 'textarea'],
  ],
  contact: [
    ['headline', 'Headline', 'text'],
    ['subheadline', 'Subheadline', 'textarea'],
    ['channels.chat.title', 'Chat title', 'text'],
    ['channels.chat.description', 'Chat description', 'textarea'],
    ['channels.chat.cta_label', 'Chat CTA label', 'text'],
    ['channels.chat.cta_href', 'Chat CTA link', 'text'],
    ['channels.phone.title', 'Phone title', 'text'],
    ['channels.phone.description', 'Phone description', 'textarea'],
    ['channels.phone.cta_label', 'Phone CTA label', 'text'],
    ['channels.phone.cta_href', 'Phone CTA link', 'text'],
    ['channels.email.title', 'Email title', 'text'],
    ['channels.email.description', 'Email description', 'textarea'],
    ['channels.email.cta_label', 'Email CTA label', 'text'],
    ['channels.email.cta_href', 'Email CTA link', 'text'],
  ],
  trust: [
    ['trustpilot.aggregate_score', 'Trustpilot score', 'text'],
    ['trustpilot.review_count', 'Review count', 'text'],
    ['trustpilot.rating_label', 'Rating label (e.g. Excellent)', 'text'],
    ['celebrity_endorsements.0.person_name', 'Endorser name', 'text'],
    ['celebrity_endorsements.0.person_title', 'Endorser title', 'text'],
    ['celebrity_endorsements.0.quote', 'Endorsement quote', 'textarea'],
    ['celebrity_endorsements.0.video_url', 'Video link (optional)', 'text'],
    ['accreditation_badges.0.title', 'Badge 1 title', 'text'],
    ['accreditation_badges.0.body', 'Badge 1 description', 'textarea'],
    ['accreditation_badges.1.title', 'Badge 2 title', 'text'],
    ['accreditation_badges.1.body', 'Badge 2 description', 'textarea'],
    ['accreditation_badges.2.title', 'Badge 3 title', 'text'],
    ['accreditation_badges.2.body', 'Badge 3 description', 'textarea'],
  ],
  subscription: [
    ['title', 'Title', 'text'],
    ['subtitle', 'Subtitle', 'textarea'],
    ['email_placeholder', 'Email placeholder', 'text'],
    ['button_label', 'Button label', 'text'],
    ['privacy_notice', 'Privacy notice', 'textarea'],
  ],
};

/** @param {string} [focusKey] A component key whose area should open first. */
export function openGlobals(focusKey) {
  const start = AREAS[focusKey || ''] || 'footer';
  const body = el('div');
  let area = start;

  const tabs = el('.gtabs');
  const pane = el('.gpane');

  const paint = () => {
    [...tabs.children].forEach((c) => c.classList.toggle('on', c.getAttribute('data-area') === area));
    pane.replaceChildren();
    const draft = structuredClone(globals()[area]);

    for (const [path, label, kind] of FIELDS[area]) {
      const value = getPath(draft, path) ?? '';
      const input = kind === 'textarea'
        ? el('textarea.inp', { oninput: (e) => setPath(draft, path, e.target.value) }, String(value))
        : el('input.inp', { type: 'text', value: String(value),
            oninput: (e) => setPath(draft, path, e.target.value) });
      pane.append(el('.f', {}, [el('.f-label', { text: label }), input]));
    }

    pane.append(el('.f-help', {
      text: 'Changes apply to every page that shows this section, immediately.',
    }));
    pane.dataset.area = area;
    /** @type {any} */ (pane).__draft = draft;
  };

  for (const key of Object.keys(FIELDS)) {
    tabs.append(el('button', {
      type: 'button', 'data-area': key,
      onclick: () => { area = key; paint(); },
    }, key[0].toUpperCase() + key.slice(1)));
  }

  body.append(tabs, pane);
  paint();

  openModal({
    title: 'Global settings',
    body,
    actions: [
      { label: 'Reset to defaults', onClick: () => { resetGlobals(); closeModal(); return false; } },
      { label: 'Save', primary: true, onClick: () => {
        updateGlobals(/** @type {any} */ (pane.dataset.area), /** @type {any} */ (pane).__draft);
      } },
    ],
  });
}
