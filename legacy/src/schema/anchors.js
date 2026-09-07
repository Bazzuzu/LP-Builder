// Trust anchor, Footer anchor, and the two globally-managed static blocks.
// Spec pages 17-22.
import { styleGroup, RT_FULL, logoImg } from './common.js';

export const trust = {
  type: 'trust',
  name: 'Trust & Social Proof',
  icon: '★',
  group: 'anchor',
  anchor: 3,
  singleton: true,
  // The spec flags Trust's mandatory status as "pending architectural review", so it is an
  // anchor (never deleted, never reordered) but carries a visibility toggle. Either outcome
  // of that review is then a one-word change here rather than a data-model migration.
  hideable: true,
  description: 'Trustpilot feed, accreditations and the VIP testimonial card.',

  fields: [
    {
      title: 'Layout',
      open: true,
      fields: [
        { key: 'mode', kind: 'segmented', label: 'Display mode', default: 'extended',
          options: [{ value: 'extended', label: 'Extended' }, { value: 'compact', label: 'Compact' }],
          help: 'Compact is the low-profile variant for content-dense pages.' },
        { key: 'title', kind: 'text', label: 'Section title', default: 'Trusted by travellers worldwide' },
      ],
    },
    {
      title: 'Blocks',
      open: true,
      fields: [
        { key: 'trustpilot', kind: 'toggle', label: 'Trustpilot integration', default: true },
        { key: 'tpScore', kind: 'text', label: 'Score', default: '4.8',
          when: (p, get) => get('trustpilot') },
        { key: 'tpCount', kind: 'text', label: 'Review count', default: '2,431 reviews',
          when: (p, get) => get('trustpilot') },
        { key: 'accreditations', kind: 'toggle', label: 'Accreditation badges', default: true,
          help: 'IATA, IATAN, ARC and BBB. Asset variant follows the hero theme mode.' },
        { key: 'celebrity', kind: 'toggle', label: 'Celebrity / VIP review', default: false },
        logoImg('celebPhoto', 'VIP photo', { when: (p, get) => get('celebrity') }),
        { key: 'celebName', kind: 'text', label: 'VIP name', when: (p, get) => get('celebrity') },
        { key: 'celebQuote', kind: 'richtext', label: 'VIP quote', tools: ['b', 'i', 'color'],
          when: (p, get) => get('celebrity') },
      ],
    },
    styleGroup({ bg: 'rgba(0, 0, 0, 0.04)', size: 'm', align: 'center' }),
  ],

  validate(p) {
    const out = [];
    if (p.celebrity && !p.celebName)
      out.push({ path: 'celebName', message: 'VIP review is on but has no name.' });
    if (!p.trustpilot && !p.accreditations && !p.celebrity)
      out.push({ path: 'trustpilot', severity: 'warn', message: 'Every trust block is switched off.' });
    return out;
  },
};

export const footer = {
  type: 'footer',
  name: 'Footer',
  icon: '▁',
  group: 'anchor',
  anchor: 4,
  singleton: true,
  description: 'Global site-wide footer.',
  fields: [
    {
      title: 'Content',
      open: true,
      fields: [
        { key: 'company', kind: 'text', label: 'Company line', default: 'Business Class Consolidator' },
        { key: 'phone', kind: 'text', label: 'Phone', default: '+1 (800) 000-0000' },
        { key: 'email', kind: 'text', label: 'Email', default: 'support@example.com' },
        { key: 'legal', kind: 'richtext', label: 'Legal / disclaimer', tools: RT_FULL },
      ],
    },
  ],
};

export const newsletter = {
  type: 'newsletter',
  name: 'Newsletter',
  icon: '✉',
  group: 'global',
  singleton: true,
  hideable: true,
  // Phase 1 is a hardcoded layout with a visibility toggle only (spec §2.2). The component is
  // written so Phase 2 can add editable copy without touching the surrounding page model.
  description: 'Global subscription block. Visibility toggle only in phase 1.',
  fields: [
    {
      title: 'Phase 1',
      open: true,
      fields: [
        { kind: 'note', text: 'Layout and copy are managed globally. This page can only show or hide the block — use the eye icon in the page structure.' },
      ],
    },
  ],
};

export const contact = {
  type: 'contact',
  name: 'Contact Us',
  icon: '☏',
  group: 'global',
  singleton: true,
  hideable: true,
  description: 'Global contact matrix shared by Home and Route pages.',
  fields: [
    {
      title: 'Phase 1',
      open: true,
      fields: [
        { kind: 'note', text: 'Content comes from global settings. This page can only show or hide the block.' },
      ],
    },
  ],
};
