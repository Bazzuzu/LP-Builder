// Trust — spec doc 32. Dual-role anchor at slot 04: global data, page-level display switches.
// Always dark by design (doc 32 visual refresh): a social-proof band reads as a distinct,
// premium beat against the rest of the page, so unlike other sections it has no background
// picker — every colour below is scoped to `.trust` rather than the shared light-mode tokens.
import { ARCHETYPE, LEVEL } from '../model/enums.js';
import { attr, cls, esc, img, rich } from '../render/html.js';
import { headerGroup } from './_common.js';

/** @type {import('../model/types.js').SectionType} */
export default {
  key: 'SECTION_TRUST',
  doc: 32,
  name: 'Trust',
  archetype: ARCHETYPE.DUAL_ANCHOR,
  icon: '★',
  description: 'Trustpilot stream, a video/quote endorsement pair and accreditation badges. Content is site-wide; only the layout is local.',
  // No configurable bg_color, but it always renders on a fixed dark ground — needed so the
  // same-background divider (render/page.js) can compare it against its neighbours.
  fixedBg: '#0B0B0B',

  fields: [
    headerGroup({ titleLabel: 'Headline' }),
    { title: 'Display', open: true, fields: [
      { key: 'layout_mode', kind: 'segmented', label: 'Density', default: 'Extended',
        options: [{ value: 'Extended', label: 'Extended' }, { value: 'Compact', label: 'Compact' }],
        help: 'Compact is the low-profile mode for content-dense pages.' },
      { key: 'show_trustpilot_feed', kind: 'toggle', label: 'Trustpilot feed', default: true },
      { key: 'show_celebrity_review', kind: 'toggle', label: 'Video & VIP testimonial', default: true },
      { key: 'show_accreditation_badges', kind: 'toggle', label: 'Accreditation badges', default: true,
        help: 'Hidden in Compact regardless of this toggle, to keep the condensed layout short.' },
      { key: '_global_note', kind: 'note', label: '',
        text: 'Reviews, ratings, endorsements and badges are managed centrally in Global Settings > Trust.' },
    ] },
  ],

  defaults: {
    section_title: 'Trusted by Thousands of Business Class Travelers Worldwide',
    subheading: '<p>Our service is built on trust, backed by leading security technologies.</p>',
    layout_mode: 'Extended',
    show_trustpilot_feed: true,
    show_celebrity_review: true,
    show_accreditation_badges: true,
  },

  validate(props) {
    // Doc 32 §5.3: a mandatory anchor with both sub-modules off would render as an empty band.
    if (props.show_trustpilot_feed === false && props.show_celebrity_review === false) {
      return [{ level: LEVEL.L1, code: 'E104', path: 'show_trustpilot_feed',
        message: 'Trust section must display at least one social proof element.' }];
    }
    return [];
  },

  css: `
.trust{background:#0B0B0B;color:var(--on-dark);padding:var(--section-y) 0}
.trust.compact{padding:44px 0}
.tr-head{display:flex;justify-content:space-between;align-items:flex-end;gap:32px;flex-wrap:wrap;
  margin-bottom:40px}
.tr-title{margin:0 0 10px;font-size:var(--h-m);font-weight:700;letter-spacing:-.02em;line-height:1.2;
  max-width:640px}
.tr-title .tr-accent{color:#00b67a}
.tr-sub{margin:0;color:rgba(255,255,255,.62);font-size:16px;max-width:520px}
.tr-tp{display:flex;align-items:center;gap:14px;flex-wrap:wrap;white-space:nowrap}
.tr-tp-logo{display:flex;align-items:center;gap:8px;font-size:19px;font-weight:700;color:var(--on-dark)}
.tr-tp-logo .mark{color:#00b67a;font-size:20px}
.tr-tp-stars{display:inline-flex;gap:3px}
.tr-tp-stars span{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;
  background:#00b67a;color:#fff;font-size:14px;border-radius:5px}
.tr-tp-word{font-weight:600;font-size:15px}
.tr-tp-sep{color:rgba(255,255,255,.24)}
.tr-tp-rated{font-weight:600;font-size:15px;color:rgba(255,255,255,.75)}

.tr-row{position:relative;display:flex;align-items:stretch}
.tr-nav{flex:0 0 auto;width:34px;height:34px;border-radius:999px;border:0;cursor:pointer;
  background:rgba(255,255,255,.08);color:var(--on-dark);font-size:16px;line-height:1;
  display:flex;align-items:center;justify-content:center;align-self:center}
.tr-nav:hover{background:rgba(255,255,255,.16)}
.tr-nav.prev{margin-right:16px}
.tr-nav.next{margin-left:16px}

.tr-reviews{display:flex;gap:32px;overflow-x:auto;scroll-snap-type:x mandatory;flex:1;min-width:0;
  scrollbar-width:none}
.tr-reviews::-webkit-scrollbar{display:none}
.tr-review{flex:1 0 220px;scroll-snap-align:start;min-width:0}
.tr-review-date{font-size:12.5px;color:rgba(255,255,255,.42);margin-bottom:8px}
.tr-stars{display:inline-flex;color:#00b67a;letter-spacing:2px;font-size:13px;margin-bottom:10px}
.tr-review-title{font-weight:var(--title-weight);font-size:15.5px;margin-bottom:6px}
.tr-review-body{font-size:14px;line-height:1.5;color:rgba(255,255,255,.62);
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.trust.compact .tr-review-body{display:none}

.tr-hr{height:1px;background:rgba(255,255,255,.12);margin:40px 0}
.trust.compact .tr-hr{margin:28px 0}

.tr-celeb{display:grid;grid-template-columns:1.15fr 1fr;gap:48px;align-items:center;flex:1;min-width:0}
.trust.compact .tr-celeb{grid-template-columns:1fr}
.tr-video{position:relative;border-radius:14px;overflow:hidden;aspect-ratio:16/10;
  background:#000;display:block;color:inherit;text-decoration:none}
.trust.compact .tr-video{display:none}
.tr-video img{width:100%;height:100%;object-fit:cover;display:block}
.tr-quote{min-width:0}
.tr-avatar{width:56px;height:56px;border-radius:999px;object-fit:cover;margin-bottom:16px;display:block}
.tr-avatar.ph{width:56px;height:56px;min-height:0;border-radius:999px;font-size:9px}
.tr-quote blockquote{margin:0 0 16px;font-size:18px;letter-spacing:-.01em;line-height:1.4;
  color:var(--on-dark)}
.tr-person b{display:block;font-size:14.5px;font-weight:var(--title-weight)}
.tr-person span{display:block;font-size:13.5px;color:rgba(255,255,255,.55);margin-top:2px}

.tr-badges{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px}
.tr-badge{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;
  padding:24px}
.tr-badge img{height:32px;width:auto;max-width:120px;object-fit:contain;margin-bottom:28px;display:block}
.tr-badge .ph{height:32px;min-height:0;width:120px;margin-bottom:28px;font-size:9px}
.tr-badge-title{font-weight:700;font-size:16px;margin-bottom:8px}
.tr-badge-body{font-size:14px;line-height:1.5;color:rgba(255,255,255,.55)}

@media (max-width:767px){
  .tr-head{flex-direction:column;align-items:flex-start}
  .tr-celeb{grid-template-columns:1fr}
  .tr-nav{display:none}
  .tr-reviews{gap:20px}
}
`,

  render(section, ctx) {
    const p = section.props || {};
    const g = ctx.globals?.trust || {};
    const compact = p.layout_mode === 'Compact';
    const tp = g.trustpilot || {};
    const reviews = tp.reviews || [];
    const endorsements = g.celebrity_endorsements || [];
    const badges = g.accreditation_badges || [];
    const uid = section.id;

    const head = (p.section_title || p.subheading) ? `<div class="tr-head">
      <div class="tr-head-copy">
        ${p.section_title ? `<h2 class="tr-title">${accentFirstWord(p.section_title)}</h2>` : ''}
        ${p.subheading ? `<p class="tr-sub">${rich(p.subheading)}</p>` : ''}
      </div>
      ${tp.aggregate_score != null ? `<div class="tr-tp">
        <div class="tr-tp-logo"><span class="mark" aria-hidden="true">★</span>Trustpilot</div>
        <div class="tr-tp-stars" aria-hidden="true">${'<span>★</span>'.repeat(5)}</div>
        <div class="tr-tp-word">${esc(tp.rating_label || 'Excellent')}</div>
        <div class="tr-tp-sep">|</div>
        <div class="tr-tp-rated">Rated ${esc(Number(tp.aggregate_score).toFixed(1))}</div>
      </div>` : ''}
    </div>` : '';

    const feed = (p.show_trustpilot_feed === false || !reviews.length) ? '' : `<div class="tr-row">
      <button class="tr-nav prev" type="button" data-tr-scroll="${uid}-reviews" data-dir="prev" aria-label="Previous reviews">‹</button>
      <div class="tr-reviews" id="${esc(uid)}-reviews">
        ${reviews.map((/** @type {any} */ r) => `<div class="tr-review">
          <div class="tr-review-date">${esc(relativeDay(r.date))}</div>
          ${starRow(r.score)}
          <div class="tr-review-title">${esc(r.title || '')}</div>
          <div class="tr-review-body">${esc(r.body || '')}</div>
        </div>`).join('')}
      </div>
      <button class="tr-nav next" type="button" data-tr-scroll="${uid}-reviews" data-dir="next" aria-label="Next reviews">›</button>
    </div>`;

    const celeb = (p.show_celebrity_review === false || !endorsements.length) ? '' : `<div class="tr-row">
      ${endorsements.length > 1 ? `<button class="tr-nav prev" type="button" data-tr-celeb-nav="prev" data-tr-celeb-for="${esc(uid)}-celeb" aria-label="Previous testimonial">‹</button>` : ''}
      <div class="tr-celeb-track" id="${esc(uid)}-celeb">
        ${endorsements.map((/** @type {any} */ e, /** @type {number} */ i) => `<div class="tr-celeb"${i > 0 ? ' hidden' : ''}>
          ${videoBlock(e)}
          <div class="tr-quote">
            ${img(e.portrait, { className: 'tr-avatar', placeholder: 'Photo' })}
            <blockquote>${esc(e.quote || '')}</blockquote>
            <div class="tr-person"><b>${esc(e.person_name || '')}</b>${e.person_title ? `<span>${esc(e.person_title)}</span>` : ''}</div>
          </div>
        </div>`).join('')}
      </div>
      ${endorsements.length > 1 ? `<button class="tr-nav next" type="button" data-tr-celeb-nav="next" data-tr-celeb-for="${esc(uid)}-celeb" aria-label="Next testimonial">›</button>` : ''}
    </div>`;

    const badgeGrid = (compact || p.show_accreditation_badges === false || !badges.length) ? '' : `<div class="tr-badges">
      ${badges.map((/** @type {any} */ b) => `<div class="tr-badge">
        ${img(b.icon, { placeholder: 'Badge', decorative: true })}
        <div class="tr-badge-title">${esc(b.title || '')}</div>
        <div class="tr-badge-body">${esc(b.body || '')}</div>
      </div>`).join('')}
    </div>`;

    const dividers = [feed, celeb, badgeGrid].filter(Boolean);

    return `<section class="${esc(cls('trust', compact && 'compact'))}"${attr('id', section.anchor_id)}>
      <div class="wrap">${head}${dividers.join('<div class="tr-hr"></div>')}</div>
    </section>`;
  },
};

/** Wraps the first word of a headline in the brand-green accent span. */
function accentFirstWord(/** @type {string} */ text) {
  const s = String(text || '');
  const i = s.indexOf(' ');
  if (i === -1) return `<span class="tr-accent">${esc(s)}</span>`;
  return `<span class="tr-accent">${esc(s.slice(0, i))}</span>${esc(s.slice(i))}`;
}

/** A row of `n` filled stars out of 5, clamped, brand-green. */
function starRow(/** @type {any} */ score) {
  const n = Math.max(0, Math.min(5, Math.round(Number(score) ?? 5) || 5));
  return `<div class="tr-stars" aria-hidden="true">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</div>`;
}

/** "Today" / "N days ago" / a short date, from an ISO date string — no live clock needed. */
function relativeDay(/** @type {string|undefined} */ iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const days = Math.round((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    - Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/** The video testimonial thumbnail: just the poster image (its caption, subject name and
 * player chrome are already baked into that asset, screenshot-style — no synthetic overlay
 * needed on top). The whole thumbnail links out to `video_url` when set. */
function videoBlock(/** @type {any} */ e) {
  const tag = e.video_url ? 'a' : 'div';
  const href = e.video_url ? ` href="${esc(e.video_url)}" target="_blank" rel="noopener noreferrer"` : '';
  return `<${tag} class="tr-video"${href}>${img(e.video_poster, { placeholder: 'Video' })}</${tag}>`;
}
