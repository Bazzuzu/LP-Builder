// Logo Marquee — spec doc 40. Static row that becomes a ticker only when it overflows.
import { ARCHETYPE, BG_LIGHT_GREY, LEVEL } from '../model/enums.js';
import { attr, dynamicShell, esc, img } from '../render/html.js';
import { headerGroup, styleGroup } from './_common.js';

/** @type {import('../model/types.js').SectionType} */
export default {
  key: 'SECTION_LOGO_MARQUEE',
  doc: 40,
  name: 'Logo Marquee',
  archetype: ARCHETYPE.DYNAMIC,
  group: 'intermediate',
  icon: '⋯',
  description: 'Partner logos. Centred when they fit, an infinite ticker when they do not.',

  fields: [
    styleGroup({ bg: BG_LIGHT_GREY }),
    headerGroup({ open: false, size: 'SIZE_S', align: 'ALIGN_CENTER' }),
    { title: 'Logos', open: true, fields: [
      { key: 'logos', kind: 'repeater', label: 'Logos', addLabel: '+ Add logo', min: 1, multiUpload: true,
        itemTitle: (/** @type {any} */ l, /** @type {number} */ i) => l.alt || `Logo ${i + 1}`,
        help: 'Four to twelve reads best: fewer never triggers the ticker, more just doubles the DOM.',
        item: { fields: [
          { key: 'file', kind: 'image', label: 'Logo', decorative: true },
          { key: 'alt', kind: 'text', label: 'Alt text', help: 'Leave empty for a purely decorative mark.' },
          { key: 'href', kind: 'text', label: 'Link (optional)' },
        ] } },
      { key: 'speed', kind: 'range', label: 'Ticker speed', default: 30, min: 10, max: 90, unit: 's',
        help: 'Seconds per full cycle. Only applies once the ticker activates.' },
    ] },
  ],

  defaults: {
    bg_color: BG_LIGHT_GREY, heading_size: 'SIZE_S', heading_align: 'ALIGN_CENTER',
    section_title: 'Direct contracts with world-leading carriers',
    subheading: null,
    speed: 30,
    logos: ['Emirates', 'Qatar Airways', 'Singapore Airlines', 'British Airways', 'Lufthansa', 'Air France']
      .map((name) => ({ file: null, alt: name, href: '' })),
  },

  validate(props) {
    if (!(props.logos || []).length) {
      return [{ level: LEVEL.L1, code: 'E101', path: 'logos',
        message: 'Logo showcase requires at least 1 logo.' }];
    }
    return [];
  },

  css: `
/* Its own container spec — wider and with its own vertical rhythm — rather than the site's
   default .sec/.wrap (--section-y/--container/--gutter), same pattern as Hero's own .wrap. */
.mq-sec{padding:40px 0}
.mq-sec .wrap{max-width:1280px;padding:0 80px}
.mq{overflow:hidden}
.mq.is-scroll{overflow-x:auto}
.mq-track{display:flex;gap:64px;align-items:center;justify-content:center}
.mq.is-marquee .mq-track{justify-content:flex-start;width:max-content;
  animation:mq-scroll linear infinite;animation-duration:var(--mq-speed,30s)}
.mq.is-marquee:hover .mq-track{animation-play-state:paused}
.mq-item{height:36px;flex:0 0 auto;display:flex;align-items:center;text-decoration:none}
.mq-item img{height:36px;width:auto;object-fit:contain}
.mq-item .ph{height:36px;min-height:0;padding:0 14px;border-radius:6px;font-size:11px}
@keyframes mq-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@media (max-width:767px){
  .mq-sec{padding:var(--section-y) 0}
  .mq-sec .wrap{max-width:var(--container);padding:0 var(--gutter)}
}
`,

  render(section) {
    const p = section.props || {};
    const speed = Math.min(90, Math.max(10, Number(p.speed) || 30));
    const items = (p.logos || []).map((/** @type {any} */ l) => {
      const inner = img({ ...(l.file || {}), alt: l.alt }, { decorative: !l.alt, placeholder: l.alt || 'Logo' });
      return l.href
        ? `<a class="mq-item" href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${inner}</a>`
        : `<span class="mq-item">${inner}</span>`;
    }).join('');

    return dynamicShell(section,
      `<div class="mq" data-marquee style="--mq-speed:${speed}s">
        <div class="mq-track" data-marquee-track>${items}</div>
      </div>`, { className: 'mq-sec' });
  },
};
