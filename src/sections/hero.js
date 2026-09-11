// Hero — spec doc 30. Fixed anchor, slot 00.
// Deliberately outside the design-token system (SYS-01 §1.1): its own theme engine,
// background media and typography presets.
import { ACCENT_PRESETS, ARCHETYPE, BRONZE, CABIN_CLASSES, INK, INK_PRESETS, SCRIM_PRESETS } from '../model/enums.js';
import { assetUrl } from '../store/assets.js';
import { attr, blankRich, cls, esc, img, rich, style } from '../render/html.js';
import { RT_BASIC, RT_FULL, all, imgField, needMedia, needRich, needText } from './_common.js';

const EYEBROW_MODES = ['None', 'Text', 'Timer', 'Logo', 'Badge'];
/** @param {string} mode */
const onEyebrow = (mode) => (/** @type {any} */ p, /** @type {any} */ get) => get('eyebrow_mode') === mode;
const onEyebrowAny = (/** @type {string[]} */ ...modes) =>
  (/** @type {any} */ p, /** @type {any} */ get) => modes.includes(get('eyebrow_mode'));
/** Inline badge (doc 30 §4.3) is available on Text and Timer, gated by its own toggle. */
const inlineBadgeOn = (/** @type {any} */ p, /** @type {any} */ get) =>
  onEyebrowAny('Text', 'Timer')(p, get) && !!get('has_inline_badge');

/** Fallback fill when no background image is uploaded (doc 30 §5.3) — theme-dependent. */
const THEME_FALLBACK = { Dark: INK, Light: '#F7F2EE' };
/** Both themes' fallbacks offered as swatches, so switching between them is one click. */
const FALLBACK_PRESETS = [
  { value: THEME_FALLBACK.Dark, label: 'Ink (Dark theme)' },
  { value: THEME_FALLBACK.Light, label: 'Sand (Light theme)' },
];

/** @type {import('../model/types.js').SectionType} */
export default {
  key: 'SECTION_HERO',
  doc: 30,
  name: 'Hero',
  archetype: ARCHETYPE.ANCHOR,
  icon: '▤',
  description: 'Above-the-fold anchor: value proposition, featured price and the lead form.',

  // Four groups, Content first. Theme used to open the panel — a control set once per page,
  // sitting above the words the author came here to write — and the price logos and the CTA
  // label were two more groups to open for two more fields. Everything that changes what the
  // Hero SAYS is now in one place; everything that changes how it looks is in the last two.
  fields: [
    { title: 'Content', open: true, fields: [
      // S → M → L, the one direction every size control in the editor runs (see SIZE_OPTS).
      { key: 'title_preset', kind: 'segmented', label: 'Title size', default: 'L',
        options: [{ value: 'S', label: 'S' }, { value: 'M', label: 'M' }, { value: 'L', label: 'L' }] },
      { key: 'title_text', kind: 'richtext', label: 'Title', required: true, tools: RT_BASIC, singleLine: false },
      { key: 'paragraph_text', kind: 'richtext', label: 'Text', tools: RT_FULL },

      { key: 'price_top_label', kind: 'richtext', label: 'Label above price', tools: RT_BASIC, inline: true },
      { key: 'price_main_value', kind: 'text', label: 'Price', required: true, placeholder: '1,234',
        help: 'Digits and separators only — the currency symbol comes from the page.' },
      { key: 'price_bottom_label', kind: 'richtext', label: 'Label below price', tools: RT_BASIC, inline: true },
      { key: '_footnote_note', kind: 'note', label: '',
        text: 'The price footnote/disclaimer lives in the Footer\'s legal text (Global Settings > Footer) — one disclaimer, shared by every page, instead of one per Hero.' },

      { key: 'cta_button_text', kind: 'text', label: 'Lead form button', default: 'Check Your Price' },
      { key: '_form_note', kind: 'note', label: '',
        text: 'The form fields are fixed by the lead contract (doc 21) and shared with the modal.' },
    ] },

    { title: 'Eyebrow', open: false, fields: [
      { key: 'eyebrow_mode', kind: 'select', label: 'Mode', default: 'None',
        options: EYEBROW_MODES.map((v) => ({ value: v, label: v })) },

      // Text
      { key: 'eyebrow_text', kind: 'text', label: 'Text', required: true, when: onEyebrow('Text') },

      // Timer
      { key: 'timer_prefix', kind: 'text', label: 'Timer prefix', default: 'Offer ends in:', when: onEyebrow('Timer') },
      { key: 'end_date', kind: 'datetime-tz', label: 'Ends at', required: true, tzKey: 'end_timezone', when: onEyebrow('Timer'),
        help: 'Entered and shown in the timezone below — every visitor sees the same deadline.' },
      { key: 'end_timezone', kind: 'text', label: 'Timezone', default: 'UTC', when: onEyebrow('Timer'),
        help: 'IANA name, e.g. "Europe/London". Invalid names fall back to UTC.' },
      { key: 'on_expiry', kind: 'select', label: 'When it ends', default: 'HideEyebrow', when: onEyebrow('Timer'),
        options: [{ value: 'HideEyebrow', label: 'Hide the eyebrow' },
                  { value: 'ShowExpiredLabel', label: 'Show "Offer ended"' },
                  { value: 'FreezeAtZero', label: 'Freeze at zero' }] },

      // Text & Timer share an optional inline badge (doc 30 §4.3)
      { key: 'has_inline_badge', kind: 'toggle', label: 'Inline badge', default: false, when: onEyebrowAny('Text', 'Timer') },
      imgField('inline_badge_icon', 'Badge icon', { decorative: true, when: inlineBadgeOn }),
      { key: 'inline_badge_label', kind: 'text', label: 'Badge label', required: true, when: inlineBadgeOn },
      { key: 'inline_badge_color', kind: 'color', label: 'Badge colour', default: BRONZE,
        presets: ACCENT_PRESETS, when: inlineBadgeOn },

      // Logo
      imgField('logo_image', 'Logo', { hint: 'Ratio 10:1, e.g. 560×56.', decorative: true, when: onEyebrow('Logo') }),

      // Standalone Badge
      imgField('badge_icon', 'Badge icon', { decorative: true, when: onEyebrow('Badge') }),
      { key: 'badge_label', kind: 'text', label: 'Badge label', required: true, when: onEyebrow('Badge') },
      { key: 'badge_color', kind: 'color', label: 'Badge colour', default: BRONZE,
        presets: ACCENT_PRESETS, when: onEyebrow('Badge') },
    ] },

    // Every image the Hero holds, in the order they stack: each background followed by its
    // own scrim, then the two marks that sit with the price. The overlay is a property of
    // the photograph above it, not a styling decision taken somewhere else — so it needs no
    // "Desktop"/"Mobile" in its label either, the background it follows already said which.
    { title: 'Media', open: false, fields: [
      imgField('desktop_bg_image', 'Desktop background', { hint: 'PNG, JPG or WebP.', decorative: true }),
      { key: 'desktop_overlay_color', kind: 'overlay', label: 'Overlay', default: '#000000',
        presets: SCRIM_PRESETS, opacityKey: 'desktop_overlay_opacity', opacityDefault: 50 },
      imgField('mobile_bg_image', 'Mobile background', { hint: 'Falls back to the desktop image when empty.', decorative: true }),
      { key: 'mobile_overlay_color', kind: 'overlay', label: 'Overlay', default: '#000000',
        presets: SCRIM_PRESETS, opacityKey: 'mobile_overlay_opacity', opacityDefault: 50 },
      { key: 'has_price_aside_logo', kind: 'toggle', label: 'Logo beside the price', default: false },
      imgField('price_aside_logo', 'Aside logo', { ratio: '2:1', decorative: true, when: (/** @type {any} */ p) => p.has_price_aside_logo }),
      { key: 'has_price_bottom_logo', kind: 'toggle', label: 'Logo under the price', default: false },
      imgField('price_bottom_logo', 'Bottom logo', { ratio: '10:1', decorative: true, when: (/** @type {any} */ p) => p.has_price_bottom_logo }),
    ] },

    { title: 'Appearance', open: false, fields: [
      { key: 'theme_mode', kind: 'segmented', label: 'Theme', default: 'Dark',
        options: [{ value: 'Light', label: 'Light' }, { value: 'Dark', label: 'Dark' }],
        help: 'Drives the header logo, accreditation badges, nav colours and default text colour.',
        // Doc 30 §5.6: a colour still sitting at the OTHER theme's default re-defaults when
        // the theme switches; a colour the admin actually chose is left alone.
        onChange: (value, ctx) => {
          const other = value === 'Dark' ? 'Light' : 'Dark';
          const current = ctx.get('desktop_fallback_color');
          if (current == null || current === THEME_FALLBACK[other]) {
            ctx.set('desktop_fallback_color', THEME_FALLBACK[value]);
          }
        } },
      { key: 'desktop_fallback_color', kind: 'color', label: 'Background fallback',
        default: THEME_FALLBACK.Dark, presets: FALLBACK_PRESETS,
        help: 'Used when no image is uploaded. Dark theme defaults to ink, Light theme to sand.' },
      { key: 'cta_button_color', kind: 'color', label: 'Button colour', default: BRONZE, presets: ACCENT_PRESETS },
      { key: 'cta_button_text_color', kind: 'color', label: 'Button text colour', default: '#FFFFFF', presets: INK_PRESETS },
    ] },
  ],

  defaults: {
    theme_mode: 'Dark',
    desktop_fallback_color: THEME_FALLBACK.Dark,
    desktop_overlay_color: '#000000', desktop_overlay_opacity: 50,
    mobile_overlay_color: '#000000', mobile_overlay_opacity: 50,
    eyebrow_mode: 'None',
    end_timezone: 'UTC', on_expiry: 'HideEyebrow',
    has_inline_badge: false, inline_badge_color: '#B8876E',
    badge_color: '#B8876E',
    title_preset: 'L',
    title_text: 'Unrivalled comfort across the Atlantic',
    paragraph_text: '<p>Wholesale business and first class fares, managed end to end by a dedicated specialist.</p>',
    price_top_label: 'Fares starting from',
    price_main_value: '1,234',
    price_bottom_label: 'all taxes included',
    has_price_aside_logo: false,
    has_price_bottom_logo: false,
    cta_button_text: 'Check Your Price',
    cta_button_color: '#B8876E',
    cta_button_text_color: '#FFFFFF',
  },

  validate(props) {
    return all(
      needRich(props, 'title_text', 'Hero title'),
      needText(props, 'price_main_value', 'Price'),
      props.eyebrow_mode === 'Text' ? needText(props, 'eyebrow_text', 'Eyebrow text') : [],
      props.eyebrow_mode === 'Timer' ? needText(props, 'end_date', 'Countdown end date') : [],
      props.eyebrow_mode === 'Badge'
        ? all(needMedia(props, 'badge_icon', 'Badge icon', { decorative: true }), needText(props, 'badge_label', 'Badge label'))
        : [],
      (props.eyebrow_mode === 'Text' || props.eyebrow_mode === 'Timer') && props.has_inline_badge
        ? needText(props, 'inline_badge_label', 'Inline badge label')
        : [],
      props.has_price_aside_logo ? needMedia(props, 'price_aside_logo', 'Aside logo', { decorative: true }) : [],
      props.has_price_bottom_logo ? needMedia(props, 'price_bottom_logo', 'Bottom logo', { decorative: true }) : [],
    );
  },

  css: `
.hero{position:relative;overflow:hidden;color:#fff}
.hero.light{color:var(--ink)}
.hero-bg{position:absolute;inset:0;background-size:cover;background-position:center}
.hero-ov{position:absolute;inset:0}
.hero-in{position:relative;padding:24px 0 80px}
/* Hero gets its own container spec — wider and more generously padded than the site's
   default .wrap (--container/--gutter) — rather than changing those globally. */
.hero .wrap{max-width:1280px;padding:0 80px}
.hero-top{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:20px;
  padding-bottom:40px}
.hero-brand{display:flex;justify-self:start}
.hero-brand svg{height:44px;width:auto;display:block;color:inherit}
.hero.light .hero-brand{color:var(--bronze)}
.hero-accs{display:flex;justify-self:center}
.hero-accs svg{height:34px;width:auto;display:block;opacity:.75}
.hero-nav{display:flex;align-items:center;gap:10px;justify-self:end}
.hero-phone{display:flex;align-items:center;gap:12px;text-decoration:none;color:inherit;
  padding:7px 18px;border-radius:var(--radius-pill);background:rgba(255,255,255,.1);
  white-space:nowrap}
.hero.light .hero-phone{background:rgba(0,0,0,.05)}
.hp-text{display:flex;flex-direction:column;line-height:1.3}
.hp-label{font-size:11px;font-weight:var(--body-weight);opacity:.62}
.hp-num{font-size:15px;font-weight:var(--title-weight);letter-spacing:-.01em}
.hp-div{width:1px;align-self:stretch;background:currentColor;opacity:.2}
.hp-chevron{font-size:9px;opacity:.55}
.hero-menu{display:flex;align-items:center;justify-content:center;flex:0 0 auto;
  width:40px;height:40px;border-radius:50%;background:var(--ink);color:#fff}
.hero-menu svg{width:18px;height:18px}
/* The card is a fixed 400px, so it takes its own track rather than half the row. */
.hero-grid{display:grid;grid-template-columns:1fr 400px;gap:56px;align-items:center}
.hero-eyebrow{display:flex;align-items:center;gap:10px;margin-bottom:24px;flex-wrap:wrap;
  font-size:14px;letter-spacing:.06em;text-transform:uppercase;opacity:.9}
.hero-eyebrow .logo-box{height:56px;max-width:560px}
.hero-eyebrow .logo-box img{height:100%;width:auto;object-fit:contain}
.pill{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:var(--radius-pill);
  font-size:12px;letter-spacing:.04em;color:#fff}
.pill img{width:14px;height:14px;object-fit:contain;flex:0 0 auto}
.pill .ph{width:14px;height:14px;min-height:0;border-radius:3px;flex:0 0 auto}
.timer{display:inline-flex;align-items:center;gap:10px;font-variant-numeric:tabular-nums;
  letter-spacing:normal;border:1px solid rgba(255,255,255,.28);border-radius:10px;padding:6px 14px}
.hero.light .timer{border-color:rgba(0,0,0,.16)}
.timer .t-seg{display:inline-flex;align-items:baseline;gap:5px}
.timer .t-num{font-weight:800;font-size:15px}
.timer .t-unit{font-weight:600;opacity:.72}
.timer .t-div{width:1px;height:14px;background:rgba(255,255,255,.28)}
.hero.light .timer .t-div{background:rgba(0,0,0,.16)}
.hero h1{margin:0 0 24px;font-weight:var(--headline-weight);word-wrap:break-word}
.hero h1 b,.hero h1 strong{font-weight:var(--display-weight)}
.hero.t-l h1{font-size:56px;line-height:60.48px;letter-spacing:normal}
.hero.t-m h1{font-size:48px;line-height:49.92px;letter-spacing:.48px}
.hero.t-s h1{font-size:40px;line-height:44px;letter-spacing:normal}
.hero-p{font-size:var(--body-l);opacity:.86;max-width:56ch}
.hero-p p{margin:0 0 10px}
/* Solid white in both themes, and a fixed 400px. The notched field labels sit ON the
   border and hide the part behind them with their own background — which only works if
   that background is a known, opaque colour, so the card can no longer be translucent. */
.hero-card{background:#fff;border-radius:20px;padding:24px;
  width:400px;max-width:100%;margin:0 auto;
  box-shadow:0 24px 48px -20px rgba(0,0,0,.45)}
.hero.light .hero-card{box-shadow:0 24px 48px -20px rgba(0,0,0,.18)}
.hero-price{margin-top:24px}
.price-row{display:flex;align-items:stretch;gap:12px}
/* The top/bottom rules bracket the price+labels container itself, not the full price row —
   they must never extend under the logos column, so they live on .price-main's own border,
   not on a full-width wrapper. Capped at 50% even with no logo alongside it, so the price
   block never grows to fill the whole row on its own. */
.price-main{flex:1 1 auto;max-width:50%;min-width:0;display:flex;flex-direction:column;gap:4px;
  padding:16px 0;border-top:1px solid rgba(255,255,255,.18);border-bottom:1px solid rgba(255,255,255,.18)}
.hero.light .price-main{border-color:rgba(0,0,0,.1)}
.price-top{font-size:14px;opacity:.75}
.price-val{font-size:44px;font-weight:var(--headline-weight);letter-spacing:-.02em;line-height:1.05}
.price-star{font-size:.45em;vertical-align:top;opacity:.65}
.price-bottom{font-size:13px;opacity:.7}
/* With a logo alongside, price and logo split the row exactly in half (flex:1 1 0 on both
   sides) — the top/bottom rules and vertical padding stay exactly as in the no-logo case,
   just narrower. No vertical rule between them — the row gap alone separates the two. */
.price-main.has-aside{flex:1 1 0}
.price-aside{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center}
.price-aside img{width:100%;height:100%;object-fit:contain}
/* No boxed/filled placeholder here — a solid card would sit right next to the real divider
   and read as a second one. A plain label keeps the "nothing uploaded yet" cue without it. */
.price-aside .ph{width:100%;height:100%;min-height:0;background:none;border-radius:0;color:rgba(255,255,255,.5)}
.hero.light .price-aside .ph{color:rgba(0,0,0,.4)}
.price-below{height:56px;width:100%;margin-top:24px}
.price-below img{height:100%;width:auto;max-width:100%;object-fit:contain}
.hero-trustpilot{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:32px;
  font-size:13.5px;opacity:.9}
.hero-tp-stars{display:inline-flex;gap:2px}
.hero-tp-stars span{display:inline-flex;align-items:center;justify-content:center;width:18px;
  height:18px;background:#00b67a;color:#fff;font-size:10px;border-radius:3px}
.hero-tp-logo{display:inline-flex;align-items:center;gap:4px;font-weight:700}
.hero-tp-logo .mark{color:#00b67a}
/* ---- lead form ----
   Two shapes only: a pill (the trip selectors at the top) and an outlined box whose label
   is notched into its own top border. Everything below the pills is the same box, so a
   pair (From/To) is one box split by a rule rather than two boxes side by side — which is
   what makes the row read as one control instead of two. */
.lead-form{display:grid;gap:18px;min-width:0;--lf-line:#dcdcda;--lf-lab:#78787a}
/* Static, and equal halves. As <select>s they could not be both: a select is as wide as its
   widest option, so "Premium Economy" and "6 Travelers" reserved room that "Business /
   1 Traveler" then had to fit around, and the two pills could never balance. As plain text
   the width is the pill's, not the option list's. Display only — nothing was submitting
   them anyway; the lead engine arrives with doc 21 phase 5. */
.lf-pills{display:grid;grid-template-columns:1fr 1fr;gap:10px;min-width:0}
.lf-pill{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0;
  height:40px;padding:0 14px;border-radius:999px;background:#f1f1ef;color:var(--ink);
  font-size:13.5px;font-weight:600}
.lf-pill span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lf-pill svg{flex:0 0 auto;width:10px;height:6px;color:#222}

.lf-field{position:relative;display:grid;border:1px solid var(--lf-line);border-radius:10px;
  min-width:0;background:#fff}
.lf-pair{grid-template-columns:1fr 1fr}
.lf-cell{position:relative;min-width:0;display:flex;align-items:center;height:50px}
.lf-cell + .lf-cell{border-left:1px solid var(--lf-line)}
/* The notch: the label paints over the border it sits on, in the card's own white. */
.lf-lab{position:absolute;top:-7px;left:11px;padding:0 5px;background:#fff;
  font-size:11.5px;line-height:1.2;color:var(--lf-lab);pointer-events:none;white-space:nowrap}
.lf-lab i{font-style:normal}
.lead-form input{width:100%;min-width:0;height:100%;border:0;background:transparent;outline:0;
  font:inherit;font-size:15px;color:var(--ink);padding:0 14px;text-overflow:ellipsis}
.lead-form input::placeholder{color:#a6a6a6}
.lf-field:focus-within{border-color:var(--ink)}
.lead-form input[type="date"]{cursor:pointer}

/* Sits on the rule between From and To, punched out of it by its own white background. */
.lf-swap{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:1;
  width:30px;height:26px;display:flex;align-items:center;justify-content:center;
  border:0;background:#fff;color:var(--ink);cursor:pointer;padding:0}
.lf-swap svg{width:16px;height:16px}
.lf-swap:hover{color:var(--bronze)}

.lf-phone{grid-template-columns:auto 1fr}
.lf-cc{display:flex;align-items:center;gap:6px;height:50px;padding:0 12px 0 14px;
  border-right:1px solid var(--lf-line);position:relative}
.lf-cc .flag{font-size:17px;line-height:1}
.lf-cc select{border:0;background:transparent;font:inherit;font-size:15px;color:var(--ink);
  cursor:pointer;-webkit-appearance:none;appearance:none;outline:0;padding:0 18px 0 0;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23222' stroke-width='1.6' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 2px center}

.lead-form .btn{width:100%;height:54px;margin-top:6px;display:flex;align-items:center;
  justify-content:center;gap:10px;padding:0;border-radius:999px;font-size:16px;font-weight:600;
  box-shadow:0 10px 24px -8px rgba(0,0,0,.4);transition:filter .12s,box-shadow .15s}
.lead-form .btn:hover{box-shadow:0 12px 28px -8px rgba(0,0,0,.48)}
@media (max-width:1023px){
  .hero-grid{grid-template-columns:1fr;gap:36px}
  /* The card keeps its 400px when the grid stacks — "static 400" means static, and its own
     max-width:100% is what saves it on a phone narrower than that. The old width:100% here
     stretched it to whatever the column happened to be. */
}
@media (max-width:767px){
  .hero-in{padding:32px 0 56px}
  .hero .wrap{max-width:var(--container);padding:0 var(--gutter)}
  .hero-top{display:flex;flex-wrap:wrap;justify-content:space-between}
  .hero.t-l h1{font-size:34px;line-height:1.1;letter-spacing:normal}
  .hero.t-m h1{font-size:31px;line-height:1.1;letter-spacing:normal}
  .hero.t-s h1{font-size:28px;line-height:1.1;letter-spacing:normal}
  .price-val{font-size:36px}
  .hero-bg.desktop{display:none}
}
@media (min-width:768px){ .hero-bg.mobile{display:none} }
`,

  render(section, ctx) {
    const p = section.props || {};
    const light = p.theme_mode === 'Light';
    const currency = currencySymbol(ctx.page?.route?.currency_code);

    const desktopSrc = mediaSrc(p.desktop_bg_image);
    const mobileSrc = mediaSrc(p.mobile_bg_image) || desktopSrc;
    const fallback = p.desktop_fallback_color || THEME_FALLBACK[light ? 'Light' : 'Dark'];

    const bg = [
      desktopSrc ? `<div class="hero-bg desktop" style="background-image:url('${esc(desktopSrc)}')"></div>` : '',
      mobileSrc ? `<div class="hero-bg mobile" style="background-image:url('${esc(mobileSrc)}')"></div>` : '',
      desktopSrc || mobileSrc
        ? `<div class="hero-ov"${style({ background: p.desktop_overlay_color || '#000',
            opacity: String((Number(p.desktop_overlay_opacity ?? 50)) / 100) })}></div>`
        : '',
    ].join('');

    const titleSize = p.title_preset === 'M' ? 't-m' : p.title_preset === 'S' ? 't-s' : 't-l';
    return `<section class="${esc(cls('hero', light ? 'light' : 'dark', titleSize))}"`
      + attr('id', section.anchor_id) + style({ background: fallback }) + `>
${bg}
<div class="hero-in"><div class="wrap">
  ${header()}
  <div class="hero-grid">
    <div>
      ${eyebrow(p)}
      <h1>${rich(p.title_text)}</h1>
      ${blankRich(p.paragraph_text) ? '' : `<div class="hero-p">${rich(p.paragraph_text)}</div>`}
      <div class="hero-price">
        ${priceBlock(p, currency, ctx)}
      </div>
    </div>
    <div class="hero-card">
      ${leadForm(p, ctx)}
    </div>
  </div>
</div></div>
</section>`;
  },
};

/* ------------------------------------------------------------- fragments */

/**
 * The site header. It is drawn here because SITE_HEADER is not yet its own object — the
 * cascade in doc 30 §4.1 describes it and nothing else does (see BACKLOG.md).
 */
const header = () => `<div class="hero-top">
  <div class="hero-brand">${LOGO_SVG}</div>
  <div class="hero-accs">${BADGES_SVG}</div>
  <div class="hero-nav">
    <a class="hero-phone" href="tel:+18885550199">
      <span class="hp-text">
        <span class="hp-label">24/7 Phone Deals</span>
        <span class="hp-num">+1 888-555-0199</span>
      </span>
      <span class="hp-div" aria-hidden="true"></span>
      <span class="hp-chevron" aria-hidden="true">▾</span>
    </a>
    <span class="hero-menu" aria-hidden="true">${MENU_ICON_SVG}</span>
  </div>
</div>`;

const LOGO_SVG = `<svg width="280" height="56" viewBox="0 0 280 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M25.9072 43.2908C24.0459 42.3813 22.3421 41.5461 21.2644 41.0235C18.173 39.5236 15.369 37.6783 13.4989 34.0084C12.7412 32.5214 11.9304 30.1553 12.0048 27.3472C12.052 25.5963 12.3466 24.5329 12.3466 24.5329L27.4068 31.8884C34.5172 35.2875 35.4241 41.1564 35.6578 42.3474C36.2207 45.2126 35.5259 48 35.5259 48C35.5259 48 30.2816 45.4305 25.9072 43.2908Z" fill="currentColor"/><path d="M27.5354 15.3556C34.6395 18.7556 35.5439 24.6235 35.7794 25.8124C36.3436 28.68 35.6475 31.4696 35.6475 31.4696C35.6475 31.4696 24.9949 26.2425 21.3882 24.4906C18.2932 22.9879 15.4904 21.147 13.623 17.4752C12.8628 15.9882 12.052 13.6206 12.1297 10.8134C12.1728 9.06217 12.4692 8 12.4692 8L27.5354 15.3556Z" fill="currentColor"/><path d="M58.4333 28.5167C59.5495 28.8358 60.4148 29.3967 61.0434 30.1961C61.6694 30.9956 61.9831 32.0566 61.9831 33.375C61.9831 35.0065 61.5019 36.3073 60.5418 37.2793C59.5821 38.2534 58.2367 38.7405 56.5034 38.7405H48V19.2766H54.9108C56.7092 19.2766 58.1178 19.7468 59.1333 20.6932C60.1502 21.6416 60.659 22.9145 60.659 24.5176C60.659 25.4256 60.4648 26.2245 60.0861 26.9171C59.7044 27.6106 59.1536 28.1438 58.4333 28.5167ZM54.9252 22.0323H50.9703V27.5056H55.2335C56.0278 27.5056 56.6574 27.2409 57.1149 26.7141C57.5746 26.1831 57.8047 25.521 57.8047 24.7216C57.8047 23.9297 57.5527 23.2826 57.0454 22.7793C56.5411 22.2817 55.8313 22.0323 54.9252 22.0323ZM55.9511 35.9014C56.9384 35.9014 57.6914 35.6265 58.2125 35.0768C58.7368 34.5254 58.9975 33.8398 58.9975 33.0232C58.9975 32.1638 58.732 31.4633 58.1954 30.911C57.6585 30.3619 56.8719 30.0857 55.8358 30.0857H50.9703V35.9014H55.9511Z" fill="currentColor"/><path d="M75.9191 38.2479C74.8904 38.7496 73.7108 38.9997 72.3834 38.9997C71.0536 38.9997 69.876 38.7496 68.8522 38.2479C67.8277 37.7494 67.0052 36.9699 66.3841 35.915C65.7659 34.8607 65.4525 33.5894 65.4525 32.1052V19.2765H68.5393V31.6563C68.5393 33.13 68.892 34.2368 69.6001 34.973C70.3054 35.7095 71.2364 36.0766 72.3834 36.0766C73.5298 36.0766 74.4616 35.7098 75.1787 34.973C75.8951 34.2371 76.2517 33.13 76.2517 31.6563V19.2765H79.3262V32.1052C79.3262 33.5894 79.014 34.8603 78.3914 35.915C77.7738 36.9702 76.9468 37.7494 75.9191 38.2479Z" fill="currentColor"/><path d="M90.0743 39C88.1018 39 86.4544 38.5244 85.1252 37.5735C83.7954 36.6232 82.9834 35.2968 82.6937 33.5938L85.8578 32.8169C86.0187 33.9186 86.4945 34.7732 87.279 35.3735C88.0631 35.9783 89.0324 36.2843 90.189 36.2843C91.1649 36.2843 91.9782 36.0515 92.6191 35.5806C93.2621 35.1126 93.5812 34.3943 93.5701 33.4303C93.5614 33.0313 93.4688 32.6667 93.2885 32.3394C93.1096 32.0095 92.9076 31.7435 92.6835 31.5386C92.4627 31.3341 92.1154 31.1295 91.6432 30.9182C91.1703 30.7099 90.7871 30.5536 90.4875 30.455C90.1824 30.3545 89.7252 30.2097 89.0984 30.016C89.0196 29.9912 88.9611 29.9702 88.915 29.9619C88.4272 29.806 88.0308 29.6797 87.7233 29.5725C87.4117 29.4691 87.0372 29.324 86.5964 29.1341C86.1548 28.9493 85.794 28.7689 85.5219 28.5907C85.2457 28.4132 84.9562 28.1857 84.6425 27.9096C84.3297 27.6286 84.0855 27.3372 83.9096 27.0274C83.7301 26.7191 83.5851 26.3507 83.4649 25.9279C83.3448 25.5054 83.2839 25.0412 83.2839 24.543C83.2839 22.7948 83.8784 21.4373 85.0677 20.46C86.2539 19.4871 87.7554 19 89.5736 19C90.4039 19 91.1898 19.0964 91.9242 19.2866C92.6622 19.4804 93.3523 19.7658 93.9911 20.1479C94.6272 20.5309 95.1678 21.0441 95.6127 21.6896C96.0613 22.3367 96.3696 23.0824 96.5413 23.9293L93.5698 24.7211C93.3715 23.7203 92.9337 22.9726 92.2511 22.4748C91.5707 21.9794 90.7302 21.729 89.7261 21.729C88.784 21.729 87.9906 21.9594 87.3551 22.4133C86.7169 22.8677 86.3978 23.5618 86.3978 24.4876C86.3978 24.7437 86.4394 24.9782 86.5251 25.191C86.6108 25.4042 86.71 25.5922 86.8223 25.7522C86.9329 25.9094 87.1094 26.0701 87.3479 26.2298C87.5867 26.3898 87.7962 26.5167 87.9714 26.6119C88.1455 26.7054 88.4146 26.8174 88.7745 26.9466C89.1334 27.0725 89.4151 27.1661 89.6179 27.2243C89.8202 27.2841 90.1339 27.3789 90.5636 27.5052C90.9648 27.6245 91.2887 27.7238 91.532 27.7982C91.7771 27.8765 92.0947 27.9856 92.4902 28.1265C92.8828 28.2684 93.2034 28.3966 93.4494 28.5163C93.6927 28.634 93.9794 28.7886 94.3093 28.9804C94.6371 29.1716 94.9101 29.3597 95.1171 29.5528C95.3284 29.7437 95.5486 29.9743 95.7757 30.2422C96.002 30.5123 96.1784 30.7932 96.3043 31.0891C96.4259 31.3856 96.5353 31.7196 96.6186 32.0925C96.7046 32.4657 96.7466 32.8681 96.7466 33.2932C96.7466 34.2673 96.5617 35.1285 96.2027 35.8739C95.833 36.6212 95.3398 37.2178 94.7147 37.6625C94.0873 38.1098 93.3828 38.442 92.6017 38.665C91.8152 38.8896 90.9735 39 90.0743 39Z" fill="currentColor"/><path d="M100.692 38.7404V19.2765H103.767V38.7404H100.692Z" fill="currentColor"/><path d="M121.432 19.2768H124.503V38.7407H121.058L112.06 23.8883V38.7407H109.013V19.2768H112.419L121.432 34.0297V19.2768Z" fill="currentColor"/><path d="M139.986 22.1808H132.862V27.5746H139.162V30.4553H132.862V35.8202H139.985V38.7407H129.749V19.2768H139.985L139.986 22.1808Z" fill="currentColor"/><path d="M150.064 39C148.091 39 146.442 38.5244 145.115 37.5735C143.785 36.6232 142.975 35.2968 142.684 33.5938L145.846 32.8169C146.011 33.9186 146.483 34.7732 147.267 35.3735C148.05 35.9783 149.023 36.2843 150.181 36.2843C151.156 36.2843 151.966 36.0515 152.61 35.5806C153.252 35.1126 153.57 34.3943 153.561 33.4303C153.554 33.0313 153.458 32.6667 153.278 32.3394C153.099 32.0095 152.9 31.7435 152.677 31.5386C152.452 31.3341 152.103 31.1295 151.633 30.9182C151.16 30.7099 150.777 30.5536 150.476 30.455C150.176 30.3545 149.712 30.2097 149.086 30.016C149.009 29.9912 148.95 29.9702 148.906 29.9619C148.42 29.806 148.018 29.6797 147.711 29.5725C147.405 29.4691 147.029 29.324 146.587 29.1341C146.148 28.9493 145.789 28.7689 145.514 28.5907C145.238 28.4132 144.947 28.1857 144.632 27.9096C144.321 27.6286 144.077 27.3372 143.9 27.0274C143.721 26.7191 143.574 26.3507 143.456 25.9279C143.338 25.5054 143.277 25.0412 143.277 24.543C143.277 22.7948 143.868 21.4373 145.058 20.46C146.244 19.4871 147.748 19 149.562 19C150.394 19 151.18 19.0964 151.916 19.2866C152.651 19.4804 153.342 19.7658 153.979 20.1479C154.619 20.5309 155.159 21.0441 155.603 21.6896C156.05 22.3367 156.358 23.0824 156.532 23.9293L153.561 24.7211C153.364 23.7203 152.925 22.9726 152.242 22.4748C151.563 21.9794 150.719 21.729 149.718 21.729C148.774 21.729 147.983 21.9594 147.346 22.4133C146.707 22.8677 146.389 23.5618 146.389 24.4876C146.389 24.7437 146.429 24.9782 146.518 25.191C146.602 25.4042 146.7 25.5922 146.813 25.7522C146.925 25.9094 147.099 26.0701 147.339 26.2298C147.578 26.3898 147.785 26.5167 147.96 26.6119C148.137 26.7054 148.407 26.8174 148.767 26.9466C149.128 27.0725 149.407 27.1661 149.609 27.2243C149.809 27.2841 150.123 27.3789 150.555 27.5052C150.957 27.6245 151.279 27.7238 151.523 27.7982C151.768 27.8765 152.087 27.9856 152.482 28.1265C152.873 28.2684 153.197 28.3966 153.439 28.5163C153.683 28.634 153.972 28.7886 154.299 28.9804C154.629 29.1716 154.898 29.3597 155.11 29.5528C155.321 29.7437 155.538 29.9743 155.766 30.2422C155.992 30.5123 156.17 30.7932 156.294 31.0891C156.417 31.3856 156.52 31.7196 156.608 32.0925C156.693 32.4657 156.737 32.8681 156.737 33.2932C156.737 34.2673 156.554 35.1285 156.19 35.8739C155.826 36.6212 155.332 37.2178 154.707 37.6625C154.077 38.1098 153.373 38.442 152.589 38.665C151.806 38.8896 150.965 39 150.064 39Z" fill="currentColor"/><path d="M166.469 39C164.496 39 162.847 38.5244 161.519 37.5735C160.19 36.6232 159.381 35.2968 159.088 33.5938L162.249 32.8169C162.414 33.9186 162.887 34.7732 163.673 35.3735C164.457 35.9783 165.427 36.2843 166.584 36.2843C167.563 36.2843 168.373 36.0515 169.015 35.5806C169.657 35.1126 169.974 34.3943 169.967 33.4303C169.957 33.0313 169.863 32.6667 169.682 32.3394C169.504 32.0095 169.302 31.7435 169.078 31.5386C168.858 31.3341 168.508 31.1295 168.036 30.9182C167.567 30.7099 167.18 30.5536 166.881 30.455C166.578 30.3545 166.119 30.2097 165.492 30.016C165.414 29.9912 165.353 29.9702 165.311 29.9619C164.825 29.806 164.424 29.6797 164.115 29.5725C163.81 29.4691 163.434 29.324 162.991 29.1341C162.548 28.9493 162.192 28.7689 161.919 28.5907C161.643 28.4132 161.35 28.1857 161.037 27.9096C160.724 27.6286 160.484 27.3372 160.303 27.0274C160.129 26.7191 159.984 26.3507 159.862 25.9279C159.739 25.5054 159.683 25.0412 159.683 24.543C159.683 22.7948 160.275 21.4373 161.462 20.46C162.65 19.4871 164.152 19 165.969 19C166.799 19 167.583 19.0964 168.323 19.2866C169.056 19.4804 169.747 19.7658 170.385 20.1479C171.024 20.5309 171.567 21.0441 172.01 21.6896C172.457 22.3367 172.765 23.0824 172.937 23.9293L169.967 24.7211C169.769 23.7203 169.332 22.9726 168.648 22.4748C167.967 21.9794 167.126 21.729 166.123 21.729C165.179 21.729 164.389 21.9594 163.749 22.4133C163.11 22.8677 162.793 23.5618 162.793 24.4876C162.793 24.7437 162.834 24.9782 162.921 25.191C163.004 25.4042 163.103 25.5922 163.216 25.7522C163.327 25.9094 163.505 26.0701 163.745 26.2298C163.984 26.3898 164.19 26.5167 164.367 26.6119C164.543 26.7054 164.814 26.8174 165.168 26.9466C165.531 27.0725 165.811 27.1661 166.013 27.2243C166.214 27.2841 166.531 27.3789 166.957 27.5052C167.361 27.6245 167.683 27.7238 167.927 27.7982C168.173 27.8765 168.49 27.9856 168.886 28.1265C169.28 28.2684 169.599 28.3966 169.846 28.5163C170.09 28.634 170.375 28.7886 170.707 28.9804C171.035 29.1716 171.304 29.3597 171.514 29.5528C171.726 29.7437 171.946 29.9743 172.17 30.2422C172.399 30.5123 172.573 30.7932 172.699 31.0891C172.821 31.3856 172.926 31.7196 173.014 32.0925C173.098 32.4657 173.142 32.8681 173.142 33.2932C173.142 34.2673 172.957 35.1285 172.593 35.8739C172.23 36.6212 171.737 37.2178 171.112 37.6625C170.484 38.1098 169.779 38.442 168.996 38.665C168.213 38.8896 167.369 39 166.469 39Z" fill="currentColor"/><path d="M191.911 39C190.602 39 189.377 38.7668 188.241 38.295C187.107 37.8276 186.128 37.1707 185.305 36.3247C184.48 35.4766 183.836 34.4254 183.363 33.1646C182.893 31.9016 182.658 30.5142 182.658 28.9948C182.658 26.9819 183.06 25.2143 183.87 23.691C184.683 22.1649 185.782 21.0024 187.182 20.2039C188.578 19.4018 190.154 19.0006 191.911 19.0006C193.843 19.0006 195.552 19.4903 197.042 20.4749C198.535 21.4577 199.623 22.819 200.31 24.5576L197.441 25.716C196.97 24.5602 196.243 23.6605 195.262 23.014C194.28 22.3679 193.165 22.0456 191.911 22.0456C191.047 22.0456 190.235 22.2047 189.483 22.5237C188.729 22.8425 188.073 23.2908 187.515 23.8733C186.958 24.4574 186.521 25.1866 186.206 26.0656C185.888 26.9434 185.727 27.9194 185.727 28.9948C185.727 30.065 185.888 31.048 186.206 31.9353C186.521 32.8233 186.958 33.5575 187.515 34.1417C188.073 34.7213 188.729 35.1689 189.483 35.4848C190.236 35.7985 191.047 35.9582 191.911 35.9582C193.173 35.9582 194.291 35.6363 195.268 34.9927C196.246 34.351 196.97 33.4548 197.441 32.2974L200.31 33.458C199.623 35.1979 198.536 36.5532 197.05 37.5311C195.562 38.5104 193.85 39 191.911 39Z" fill="currentColor"/><path d="M206.93 35.8202H212.983V38.7407H203.857V19.2768H206.93V35.8202Z" fill="currentColor"/><path d="M228.656 38.7404L227.205 34.4124H219.194L217.753 38.7404H214.577L221.326 19.2765H225.07L231.819 38.7404H228.656ZM220.133 31.6137H226.278L223.206 22.414L220.133 31.6137Z" fill="currentColor"/><path d="M240.922 39C238.951 39 237.302 38.5244 235.974 37.5735C234.642 36.6232 233.834 35.2968 233.544 33.5938L236.704 32.8169C236.868 33.9186 237.342 34.7732 238.125 35.3735C238.91 35.9783 239.88 36.2843 241.039 36.2843C242.018 36.2843 242.825 36.0515 243.469 35.5806C244.113 35.1126 244.428 34.3943 244.418 33.4303C244.412 33.0313 244.317 32.6667 244.136 32.3394C243.958 32.0095 243.756 31.7435 243.531 31.5386C243.31 31.3341 242.963 31.1295 242.492 30.9182C242.021 30.7099 241.635 30.5536 241.336 30.455C241.036 30.3545 240.57 30.2097 239.945 30.016C239.868 29.9912 239.807 29.9702 239.765 29.9619C239.275 29.806 238.879 29.6797 238.571 29.5725C238.261 29.4691 237.886 29.324 237.444 29.1341C237.002 28.9493 236.647 28.7689 236.372 28.5907C236.097 28.4132 235.803 28.1857 235.49 27.9096C235.176 27.6286 234.932 27.3372 234.759 27.0274C234.581 26.7191 234.433 26.3507 234.313 25.9279C234.193 25.5054 234.135 25.0412 234.135 24.543C234.135 22.7948 234.729 21.4373 235.915 20.46C237.102 19.4871 238.605 19 240.422 19C241.252 19 242.037 19.0964 242.774 19.2866C243.513 19.4804 244.2 19.7658 244.838 20.1479C245.474 20.5309 246.02 21.0441 246.465 21.6896C246.91 22.3367 247.219 23.0824 247.39 23.9293L244.418 24.7211C244.224 23.7203 243.783 22.9726 243.104 22.4748C242.42 21.9794 241.579 21.729 240.575 21.729C239.632 21.729 238.843 21.9594 238.205 22.4133C237.565 22.8677 237.246 23.5618 237.246 24.4876C237.246 24.7437 237.288 24.9782 237.375 25.191C237.461 25.4042 237.555 25.5922 237.669 25.7522C237.782 25.9094 237.957 26.0701 238.197 26.2298C238.438 26.3898 238.644 26.5167 238.822 26.6119C238.996 26.7054 239.265 26.8174 239.626 26.9466C239.983 27.0725 240.264 27.1661 240.467 27.2243C240.667 27.2841 240.983 27.3789 241.413 27.5052C241.815 27.6245 242.138 27.7238 242.382 27.7982C242.627 27.8765 242.947 27.9856 243.341 28.1265C243.735 28.2684 244.053 28.3966 244.297 28.5163C244.541 28.634 244.828 28.7886 245.16 28.9804C245.49 29.1716 245.761 29.3597 245.97 29.5528C246.177 29.7437 246.398 29.9743 246.625 30.2422C246.853 30.5123 247.029 30.7932 247.152 31.0891C247.275 31.3856 247.379 31.7196 247.467 32.0925C247.553 32.4657 247.595 32.8681 247.595 33.2932C247.595 34.2673 247.412 35.1285 247.049 35.8739C246.688 36.6212 246.19 37.2178 245.565 37.6625C244.94 38.1098 244.235 38.442 243.451 38.665C242.664 38.8896 241.822 39 240.922 39Z" fill="currentColor"/><path d="M257.328 39C255.356 39 253.71 38.5244 252.377 37.5735C251.052 36.6232 250.238 35.2968 249.949 33.5938L253.111 32.8169C253.273 33.9186 253.748 34.7732 254.533 35.3735C255.318 35.9783 256.286 36.2843 257.447 36.2843C258.422 36.2843 259.233 36.0515 259.876 35.5806C260.517 35.1126 260.836 34.3943 260.825 33.4303C260.818 33.0313 260.721 32.6667 260.543 32.3394C260.364 32.0095 260.161 31.7435 259.94 31.5386C259.716 31.3341 259.367 31.1295 258.896 30.9182C258.426 30.7099 258.039 30.5536 257.74 30.455C257.44 30.3545 256.977 30.2097 256.351 30.016C256.273 29.9912 256.216 29.9702 256.171 29.9619C255.683 29.806 255.283 29.6797 254.977 29.5725C254.666 29.4691 254.291 29.324 253.851 29.1341C253.411 28.9493 253.053 28.7689 252.778 28.5907C252.502 28.4132 252.209 28.1857 251.897 27.9096C251.584 27.6286 251.34 27.3372 251.166 27.0274C250.988 26.7191 250.841 26.3507 250.72 25.9279C250.599 25.5054 250.543 25.0412 250.543 24.543C250.543 22.7948 251.133 21.4373 252.321 20.46C253.506 19.4871 255.011 19 256.828 19C257.659 19 258.444 19.0964 259.18 19.2866C259.917 19.4804 260.606 19.7658 261.244 20.1479C261.881 20.5309 262.424 21.0441 262.869 21.6896C263.314 22.3367 263.624 23.0824 263.799 23.9293L260.826 24.7211C260.628 23.7203 260.19 22.9726 259.508 22.4748C258.828 21.9794 257.985 21.729 256.983 21.729C256.042 21.729 255.249 21.9594 254.609 22.4133C253.973 22.8677 253.654 23.5618 253.654 24.4876C253.654 24.7437 253.696 24.9782 253.781 25.191C253.869 25.4042 253.965 25.5922 254.075 25.7522C254.188 25.9094 254.363 26.0701 254.604 26.2298C254.845 26.3898 255.054 26.5167 255.228 26.6119C255.403 26.7054 255.67 26.8174 256.032 26.9466C256.392 27.0725 256.673 27.1661 256.871 27.2243C257.076 27.2841 257.388 27.3789 257.818 27.5052C258.22 27.6245 258.546 27.7238 258.789 27.7982C259.034 27.8765 259.349 27.9856 259.745 28.1265C260.139 28.2684 260.462 28.3966 260.706 28.5163C260.949 28.634 261.236 28.7886 261.565 28.9804C261.893 29.1716 262.165 29.3597 262.376 29.5528C262.585 29.7437 262.804 29.9743 263.032 30.2422C263.257 30.5123 263.435 30.7932 263.56 31.0891C263.686 31.3856 263.788 31.7196 263.873 32.0925C263.959 32.4657 264 32.8681 264 33.2932C264 34.2673 263.819 35.1285 263.458 35.8739C263.091 36.6212 262.597 37.2178 261.972 37.6625C261.341 38.1098 260.641 38.442 259.856 38.665C259.069 38.8896 258.228 39 257.328 39Z" fill="currentColor"/></svg>`;
const BADGES_SVG = `<svg width="369" height="48" viewBox="0 0 369 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_404_30001)"><path d="M7.11111 40.0002L9.14779 29.8398H12.4617L10.4365 40.0002H7.11111ZM17.1104 36.6748H19.2161L18.6753 32.9466L17.1104 36.6748ZM12.4617 40.0002L17.4786 29.8398H20.7465L22.8062 40.0002H19.7339L19.5498 38.792H16.2819L15.7641 40.0002H12.4617ZM25.8554 40.0002L26.9946 32.3598H24.0949L24.5897 29.7938H33.4959L33.0011 32.3598H30.2395L29.1233 40.0002H25.8554ZM36.9939 36.6748H39.0996L38.5588 32.9466L36.9939 36.6748ZM32.3567 40.0002L37.3621 29.8398H40.63L42.6897 40.0002H39.5944L39.4448 38.792H36.1769L35.6591 40.0002H32.3567ZM49.9274 18.3562H34.3358C33.7605 21.2098 31.7814 23.5917 27.8346 25.2372C28.2834 26.5949 29.8137 27.8492 31.4017 27.8492H39.859C41.1478 27.8492 42.1719 26.7675 42.5861 25.893H33.9907C33.4613 25.801 33.4383 25.3752 33.9676 25.3292H42.4135C43.5067 25.3292 44.4962 24.3972 45.0716 23.3846H35.2334C34.7386 23.304 34.7386 22.8898 35.2334 22.8093H45.1521C46.1532 22.8093 47.0622 21.6471 47.4419 20.8646H36.5566C36.0158 20.7956 36.0158 20.2893 36.5566 20.2778H47.6375C48.5005 20.2778 49.3405 19.3342 49.9274 18.3562ZM0 18.3562H15.5915C16.1553 21.2098 18.146 23.5917 22.0813 25.2372C21.6325 26.5949 20.1021 27.8492 18.5142 27.8492H10.0683C8.77958 27.8492 7.75548 26.7675 7.34124 25.893H15.9367C16.4545 25.801 16.489 25.3752 15.9597 25.3292H7.50234C6.40921 25.3292 5.41963 24.3972 4.85581 23.3846H14.7055C15.2003 23.304 15.2003 22.8898 14.7055 22.8093H4.78677C3.78569 22.8093 2.87666 21.6471 2.49694 20.8646H13.3822C13.923 20.7956 13.923 20.2893 13.3822 20.2778H2.30133C1.42682 20.2778 0.586839 19.3342 0 18.3562ZM19.9065 9.79523C20.4818 10.29 21.1262 10.7273 21.8166 11.0034C22.4035 9.85276 23.2204 8.86319 24.164 7.98868C22.6106 8.1958 21.1492 8.78264 19.9065 9.79523ZM17.1449 15.468H20.6199C20.7005 14.0412 20.9996 12.787 21.5635 11.4982C20.7925 11.153 20.1251 10.7388 19.4808 10.1865C18.0424 11.6248 17.2485 13.4774 17.1449 15.468ZM24.6933 12.2116V15.468H21.2183C21.2413 14.1908 21.5405 12.879 22.0813 11.6938C22.9097 11.993 23.8073 12.1886 24.6933 12.2116ZM30.0209 9.79523C29.457 10.29 28.7896 10.7273 28.1108 11.0034C27.4894 9.82975 26.7184 8.8862 25.7519 8.00019C27.3168 8.1958 28.7781 8.78264 30.0209 9.79523ZM32.7709 15.468H29.3074C29.2614 14.0642 28.9392 12.7524 28.3869 11.4982C29.1233 11.153 29.8252 10.7158 30.4351 10.1865C31.931 11.6823 32.7019 13.5234 32.7709 15.468ZM25.2571 12.2116V15.468H28.7091C28.7091 14.1562 28.3869 12.902 27.8461 11.6938C27.0176 11.993 26.1316 12.1886 25.2571 12.2116ZM19.9065 21.7161C20.4818 21.2674 21.1492 20.7726 21.8166 20.5309C22.438 21.6931 23.2089 22.6482 24.164 23.5112C22.6106 23.304 21.1262 22.7172 19.9065 21.7161ZM17.1449 16.0318H20.6199C20.7005 17.4702 20.9996 18.7359 21.5635 20.0361C20.7925 20.3813 20.1251 20.7956 19.4808 21.3364C18.0654 19.9096 17.2485 18.057 17.1449 16.0318ZM24.6933 19.2997V16.0318H21.2183C21.2413 17.3436 21.5405 18.6438 22.0813 19.806C22.9097 19.5068 23.8073 19.3227 24.6933 19.2997ZM30.0209 21.7161C29.48 21.2443 28.7896 20.8071 28.1108 20.5309C27.4894 21.6931 26.7184 22.6482 25.7519 23.5112C27.3168 23.304 28.7781 22.7172 30.0209 21.7161ZM32.7709 16.0318H29.3074C29.2614 17.4702 28.9507 18.7474 28.3869 20.0361C29.1233 20.3813 29.7907 20.7956 30.4351 21.3364C31.8619 19.9096 32.7019 18.011 32.7709 16.0318ZM25.2571 19.2997V16.0318H28.7091C28.7091 17.3436 28.3869 18.6208 27.8461 19.806C27.0406 19.5068 26.1086 19.3227 25.2571 19.2997ZM24.6933 8.32237C23.7497 9.08181 22.9097 10.1174 22.3574 11.199C23.1054 11.4522 23.8993 11.6593 24.6933 11.6593V8.32237ZM25.2571 8.32237C26.1776 9.08181 27.0176 10.0829 27.5699 11.199C26.822 11.4752 26.028 11.6593 25.2571 11.6593V8.32237ZM24.6933 23.189C23.7497 22.441 22.9097 21.4054 22.3574 20.3008C23.1054 20.0361 23.8993 19.8866 24.6933 19.8866V23.189ZM25.2571 23.212C26.1776 22.441 27.0176 21.4054 27.5699 20.3008C26.822 20.0592 26.028 19.8866 25.2571 19.8866V23.212Z" fill="currentColor"/></g><path d="M100.302 25.1103H101.64L101.417 22.7067L100.302 25.1103Z" fill="currentColor"/><path d="M110.234 25.1103H111.664L111.438 22.7067L110.234 25.1103Z" fill="currentColor"/><path d="M120.656 22.7983L120.43 21.5967L119.49 26.6383H117.65L116.894 24.8052L116.668 24.1326L116.441 23.3788L116.257 24.4486L115.859 26.6383H114.244L115.228 21.2401H117.108L117.956 23.2465L118.14 23.9186L118.367 24.5912L118.408 24.0496L118.498 23.377L118.948 21.2383H120.378L120.245 20.6167C118.817 14.0183 112.647 9.19107 105.891 9.23124H105.308L106.248 10.0356C108.339 12.0746 110.103 14.4207 111.48 16.9925L112.236 18.4184L111.163 17.0841C109.262 14.782 106.617 12.0737 104.134 10.3922L102.928 9.49621L101.763 9.85236L100.557 10.209L101.63 10.8305C104.195 12.3278 106.339 14.4155 108.343 16.5853L109.467 17.9296L108.129 16.8602C105.676 15.0064 102.795 12.9182 99.9849 11.6859L98.6871 11.1442L97.6129 11.8182L96.5402 12.572L97.7868 12.9385C100.632 14.0148 103.301 15.5052 105.707 17.3613L107.056 18.4306L105.533 17.6768C102.695 16.1743 99.6912 15.0054 96.5823 14.1934L95.1926 13.8368L94.7022 14.3667C89.9927 19.6629 89.961 28.3003 94.7022 33.596L95.1518 34.1377L96.5823 33.7811C99.5456 33.1902 102.774 31.6013 105.533 30.3505L107.056 29.5457L105.666 30.6561C103.256 32.4841 100.605 33.9717 97.7868 35.0766L96.5298 35.4332L97.603 36.1866L98.6757 36.8592L99.9749 36.2746C102.883 34.8737 105.617 33.1369 108.119 31.0998L109.457 30.0711L108.345 31.3644C106.322 33.5134 104.207 35.663 101.632 37.1602L100.556 37.7407V37.7814L101.67 38.138L102.927 38.4539L104.134 37.6085C106.76 35.6776 109.123 33.4142 111.163 30.8755L112.236 29.5412L111.48 31.0082C110.092 33.5606 108.329 35.8917 106.248 37.924L105.308 38.7288L105.891 38.7695C107.936 38.7618 109.957 38.3336 111.829 37.5118C113.7 36.6899 115.381 35.492 116.767 33.993C118.153 32.494 119.213 30.7261 119.883 28.7999C120.552 26.8737 120.815 24.8306 120.656 22.7983ZM95.1111 26.6803L96.0919 21.2821H97.8394L96.8074 26.6789L95.1111 26.6803ZM101.865 26.6803L101.774 25.9269H99.8522L99.4944 26.6803H97.6129L100.699 21.2821H102.712L103.693 26.6803H101.865ZM106.473 26.6803H104.726L105.533 22.6177H104.103L104.42 21.2324H108.896L108.63 22.6177H107.24L106.473 26.6803ZM111.838 26.6803L111.747 25.9269H109.867L109.51 26.6803H107.587L110.724 21.2821H112.696L113.728 26.6803H111.838Z" fill="currentColor"/><path d="M176.494 21.9284L174.298 27.045H178.748L176.494 21.9284ZM180.357 31.2992H172.685L171.547 33.7453H166.356L166.679 33.0209L175.437 14.2811H177.579L186.365 33.0223L186.689 33.7467H181.498L180.357 31.2992Z" fill="currentColor"/><path d="M186.064 23.597H190.802C193.499 23.597 193.638 18.7592 190.802 18.733C189.634 18.7057 184.871 18.733 183.703 18.733L181.542 14.2829H190.802C198.448 14.3105 199.838 23.5129 194.917 26.8501L198.726 33.0216L199.158 33.746H193.166L189.829 28.0195H188.211L186.064 23.597Z" fill="currentColor"/><path d="M209.776 14.0604C213.807 14.0604 218.172 16.2578 218.922 21.4565H214.03C213.334 19.4829 211.861 18.5933 209.776 18.5933C206.857 18.5933 204.938 20.7893 204.938 24.0144C204.938 26.8777 206.829 29.3798 209.776 29.4084C211.889 29.4084 213.585 28.3521 214.113 26.2654H219.007C218.283 31.7714 213.919 33.9399 209.776 33.9399C204.828 33.9685 199.822 30.6316 199.794 24.0144C199.822 17.3976 204.828 14.0604 209.776 14.0604Z" fill="currentColor"/><path d="M280.272 32.094C281.399 32.094 282.428 32.608 282.428 33.8645C282.428 34.4949 282.096 34.951 281.564 35.2639C282.266 35.5769 282.616 35.7824 282.75 36.6585C282.982 38.1876 281.57 38.7697 280.246 38.7698H277.134V32.094H280.272ZM291.08 38.7698H290.157V9.2317H291.08V38.7698ZM267.802 32.094C268.929 32.094 269.957 32.608 269.957 33.8645C269.957 34.4903 269.631 34.9461 269.099 35.259C269.805 35.572 270.149 35.7782 270.283 36.6546C270.511 38.1836 269.103 38.7648 267.775 38.7649H264.663V32.094H267.802ZM274.035 32.094C275.162 32.094 276.19 32.6081 276.19 33.8645C276.19 34.4902 275.864 34.9461 275.332 35.259C276.038 35.572 276.382 35.7782 276.517 36.6546C276.745 38.1837 275.336 38.7649 274.008 38.7649H270.896V32.094H274.035ZM266.08 37.5042H267.904C269.161 37.5042 269.241 35.9837 267.904 35.9837H266.08V37.5042ZM272.318 37.5042H274.138C275.394 37.5042 275.475 35.9837 274.138 35.9837H272.318V37.5042ZM278.551 37.5042H280.371C281.627 37.5041 281.708 35.9837 280.371 35.9837H278.551V37.5042ZM266.08 34.7903H267.779C268.772 34.7903 268.736 33.3674 267.717 33.3674H266.08V34.7903ZM272.318 34.7903H274.018C275.01 34.7899 274.973 33.3674 273.954 33.3674H272.322L272.318 34.7903ZM278.547 34.7903H280.241C281.234 34.7903 281.198 33.3674 280.179 33.3674H278.556L278.547 34.7903ZM332.523 25.8421C333.378 25.8421 334.084 26.0984 334.615 26.5911L333.978 27.427C333.548 27.0454 332.992 26.8373 332.417 26.8421C331.929 26.8421 331.653 27.0594 331.653 27.3782C331.653 27.726 332.141 27.8377 332.721 27.9729C333.6 28.1806 334.73 28.4459 334.73 29.6633C334.73 30.644 334.03 31.383 332.586 31.3831C331.562 31.3734 330.823 31.0349 330.32 30.5276L330.938 29.6585C331.383 30.1222 332.001 30.383 332.644 30.3831C333.271 30.3831 333.576 30.0935 333.576 29.7893C333.576 29.398 333.079 29.2819 332.489 29.137C331.61 28.9389 330.489 28.6971 330.489 27.4749C330.489 26.5812 331.263 25.8421 332.523 25.8421ZM350.33 25.8421C351.18 25.8421 351.891 26.0983 352.422 26.5911L351.789 27.427C351.359 27.0454 350.803 26.8372 350.229 26.8421C349.741 26.8421 349.465 27.0594 349.465 27.3782C349.465 27.726 349.958 27.8376 350.533 27.9729C351.412 28.1806 352.543 28.4461 352.543 29.6633C352.543 30.644 351.842 31.3831 350.397 31.3831C349.364 31.3734 348.624 31.0348 348.122 30.5276L348.74 29.6585C349.185 30.1222 349.804 30.3831 350.446 30.3831C351.074 30.3829 351.378 30.0935 351.378 29.7893C351.378 29.398 350.88 29.2819 350.296 29.137C349.417 28.9389 348.296 28.697 348.296 27.4749C348.296 26.5812 349.069 25.8421 350.33 25.8421ZM355.214 25.8421C356.069 25.8421 356.774 26.0983 357.306 26.5911L356.668 27.427C356.238 27.0454 355.682 26.8372 355.107 26.8421C354.62 26.8421 354.345 27.0595 354.345 27.3782C354.345 27.726 354.837 27.8376 355.412 27.9729C356.291 28.1806 357.422 28.446 357.422 29.6633C357.422 30.644 356.721 31.3831 355.276 31.3831C354.248 31.3733 353.503 31.0348 353.011 30.5276L353.63 29.6585C354.074 30.1221 354.693 30.3831 355.335 30.3831C355.963 30.383 356.267 30.0935 356.268 29.7893C356.268 29.3981 355.77 29.2818 355.181 29.137C354.301 28.9389 353.181 28.6971 353.181 27.4749C353.181 26.5812 353.953 25.8421 355.214 25.8421ZM325.895 29.1028C325.895 29.8516 326.335 30.3635 327.156 30.3635C327.977 30.3633 328.412 29.8466 328.412 29.1028V25.9192H329.581V29.137C329.581 30.4702 328.793 31.3782 327.16 31.3782C325.533 31.3828 324.726 30.4653 324.726 29.1467V25.9192H325.895V29.1028ZM322.165 25.9192C323.189 25.9192 323.711 26.5714 323.711 27.2864C323.711 27.9626 323.291 28.4124 322.789 28.5188C323.359 28.606 323.812 29.161 323.812 29.8323C323.812 30.6342 323.276 31.2815 322.252 31.2815L319.344 31.2864V25.9192H322.165ZM341.484 29.2815V25.9192H342.625V31.2815H341.523V31.2864L338.968 27.7893V31.2864H337.827V25.9192H338.996L341.484 29.2815ZM347.542 26.9241H344.886V28.0598H347.484V29.0647H344.886V30.2766H347.538V31.2815L343.74 31.2864V25.9192H347.542V26.9241ZM336.707 31.2815H335.566V25.9192H336.707V31.2815ZM279.794 29.1067H276.758L276.217 30.9485H271.254L270.713 29.1067H267.677L268.074 27.7522H279.396L279.794 29.1067ZM320.489 30.2962H321.958C322.388 30.296 322.648 30.0594 322.648 29.678C322.648 29.3399 322.407 29.0502 321.958 29.0501H320.489V30.2962ZM307.367 29.2825H305.151L304.531 27.4212H300.41L299.79 29.2825H297.59L301.208 18.9436H303.733L307.367 29.2825ZM320.489 28.0696H321.919C322.305 28.0696 322.547 27.8276 322.547 27.4895V27.4846C322.547 27.1611 322.282 26.8999 321.963 26.8997H320.489V28.0696ZM312.311 23.2122H314.747V24.9993H312.311V27.4358H310.523V24.9993H308.101V23.2122H310.523V20.7903H312.311V23.2122ZM271.741 18.469C271.562 18.8401 271.598 19.1758 271.925 19.4172L274.679 21.4251C275.944 22.3506 276.02 23.956 275.166 25.1409L273.784 27.054L273.387 26.759C273.61 26.4059 273.575 26.0704 273.105 25.7307L270.377 23.763C269.371 23.0384 269.143 21.2368 269.881 20.2219L271.353 18.1917L271.741 18.469ZM301.061 25.5159H303.896L302.479 21.2922L301.061 25.5159ZM274.058 9.47682C273.588 10.1429 273.87 10.8404 274.433 11.2473L278.462 14.177C280.295 15.505 280.362 17.9326 279.195 19.5735L276.597 23.2268L276.279 22.9856C276.834 22.2568 276.735 20.8258 275.971 20.2669L272.206 17.5032C270.74 16.421 270.351 13.8861 271.424 12.4016L273.713 9.23072L274.058 9.47682ZM327.499 16.6145C328.436 16.5904 329.305 17.1029 329.74 17.929L328.76 18.4124C328.518 17.9438 328.035 17.6389 327.504 17.6292C326.533 17.6292 325.822 18.3782 325.822 19.3831C325.822 20.3879 326.528 21.137 327.504 21.137C328.035 21.132 328.523 20.832 328.765 20.3587L329.74 20.8469C329.354 21.5135 328.678 22.1603 327.499 22.1604C325.895 22.1652 324.644 21.0449 324.644 19.3928C324.644 17.7455 325.89 16.6145 327.499 16.6145ZM333.078 16.6145C334.015 16.5904 334.886 17.1029 335.32 17.929L334.34 18.4124C334.093 17.9389 333.61 17.6388 333.078 17.6292C332.107 17.6294 331.397 18.3784 331.397 19.3831C331.397 20.3877 332.103 21.1367 333.078 21.137C333.61 21.1321 334.098 20.8321 334.34 20.3587L335.32 20.8323C334.934 21.499 334.257 22.1467 333.078 22.1467C331.475 22.1659 330.224 21.0448 330.224 19.3928C330.224 17.7456 331.47 16.6147 333.078 16.6145ZM338.571 16.7112C339.687 16.7112 340.373 17.4408 340.373 18.4407C340.373 19.3876 339.779 19.905 339.204 20.0354L340.412 22.0833L339.093 22.0735L338.04 20.1751H337.204V22.0735H336.064V16.7112H338.571ZM324.349 22.0735H323.045L322.716 21.1653H320.417L320.078 22.0735H318.774L320.852 16.7112H322.281L324.349 22.0735ZM345.093 17.7161H342.432V18.8518H345.03V19.8567H342.432V21.0686H345.084V22.0735H341.291V16.7112H345.093V17.7161ZM348.151 16.7112C349.832 16.7113 350.997 17.7794 350.997 19.3977C350.997 21.0159 349.828 22.0734 348.151 22.0735H346.035V16.7112H348.151ZM353.006 22.0735H351.866V16.7112H353.006V22.0735ZM358.074 17.7161H356.514V22.0735H355.364V17.7161H353.794V16.7112H358.074V17.7161ZM362.663 17.7161H360.002V18.8518H362.596V19.8567H360.002V21.0686H362.653V22.0735H358.861V16.7112H362.663V17.7161ZM365.722 16.7112C367.403 16.7113 368.566 17.7794 368.566 19.3977C368.566 21.0159 367.398 22.0734 365.722 22.0735H363.605V16.7112H365.722ZM347.185 21.0686H348.156C349.209 21.0685 349.827 20.3058 349.827 19.3977H349.837C349.837 18.4509 349.253 17.7162 348.156 17.7161H347.185V21.0686ZM364.755 21.0686H365.727C366.779 21.0684 367.397 20.3057 367.397 19.3977H367.407C367.407 18.4509 366.823 17.7162 365.727 17.7161H364.755V21.0686ZM320.73 20.1604H322.402L321.566 17.8518L320.73 20.1604ZM337.204 19.1604H338.402C338.861 19.1604 339.204 18.8899 339.204 18.4358C339.204 17.9867 338.861 17.7112 338.402 17.7112H337.204V19.1604Z" fill="currentColor"/><defs><clipPath id="clip0_404_30001"><rect width="49.9274" height="32" fill="currentColor" transform="translate(0 8.00017)"/></clipPath></defs></svg>`;

const MENU_ICON_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" `
  + `stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/>`
  + `<line x1="4" y1="17" x2="20" y2="17"/></svg>`;

/** @param {Record<string, any>} p */
function eyebrow(p) {
  const mode = p.eyebrow_mode || 'None';
  if (mode === 'None') return '';
  let inner = '';
  if (mode === 'Text') inner = esc(p.eyebrow_text || '');
  else if (mode === 'Logo') inner = `<div class="logo-box">${img(p.logo_image, { decorative: true, placeholder: 'Logo' })}</div>`;
  else if (mode === 'Badge') {
    inner = `<span class="pill"${style({ background: p.badge_color || '#B8876E' })}>`
      + img(p.badge_icon, { decorative: true, placeholder: '' })
      + `<span>${esc(p.badge_label || '')}</span></span>`;
  } else if (mode === 'Timer') {
    inner = `${esc(p.timer_prefix || '')} <span class="timer" data-countdown="${esc(p.end_date || '')}"`
      + attr('data-on-expiry', p.on_expiry || 'HideEyebrow') + `></span>`;
  }
  // Text and Timer additionally carry an optional inline badge pill (doc 30 §4.3).
  const badge = (mode === 'Text' || mode === 'Timer') && p.has_inline_badge
    ? `<span class="pill"${style({ background: p.inline_badge_color || '#B8876E' })}>`
      + img(p.inline_badge_icon, { decorative: true, placeholder: '' })
      + `<span>${esc(p.inline_badge_label || '')}</span></span>`
    : '';
  return `<div class="hero-eyebrow" data-eyebrow>${inner}${badge}</div>`;
}

/** @param {Record<string, any>} p @param {string} currency @param {import('../model/types.js').RenderCtx} ctx */
function priceBlock(p, currency, ctx) {
  // The asterisk points at the Footer's legal disclaimer (doc 33 §4.2), not a page-local
  // footnote — a site-wide "subject to availability" note is the classic pattern, and it
  // means every page's price disclaimer stays in sync from one place. An asterisk with
  // nothing to point at is still worse than none, so it stays conditional on that text
  // actually existing.
  const star = blankRich(ctx?.globals?.footer?.legal_disclaimers) ? '' : '<span class="price-star">*</span>';
  // Same convention as the footnote asterisk above: no page-level toggle, just conditional
  // on the global data actually existing — one less switch an admin can leave off by
  // accident, since this is a trust signal every page wants whenever it's available.
  const tp = ctx?.globals?.trust?.trustpilot;
  const trustpilot = tp?.review_count ? `<div class="hero-trustpilot">
    <span class="hero-tp-stars" aria-hidden="true">${'<span>★</span>'.repeat(5)}</span>
    <span>${esc(Number(tp.review_count).toLocaleString('en-US'))} reviews on</span>
    <span class="hero-tp-logo"><span class="mark" aria-hidden="true">★</span>Trustpilot</span>
  </div>` : '';
  return `<div class="price-row">
    <div class="${esc(cls('price-main', p.has_price_aside_logo && 'has-aside'))}">
      ${p.price_top_label ? `<div class="price-top">${rich(p.price_top_label)}</div>` : ''}
      <div class="price-val">${esc(currency)}${esc(p.price_main_value || '')}${star}</div>
      ${p.price_bottom_label ? `<div class="price-bottom">${rich(p.price_bottom_label)}</div>` : ''}
    </div>
    ${p.has_price_aside_logo ? `<div class="price-aside">${img(p.price_aside_logo, { decorative: true, placeholder: '' })}</div>` : ''}
  </div>
  ${trustpilot}
  ${p.has_price_bottom_logo ? `<div class="price-below">${img(p.price_bottom_logo, { decorative: true, placeholder: '' })}</div>` : ''}`;
}

/**
 * The embedded half of the lead engine. Field set per doc 21 §3 — identical to the modal.
 * Submission, validation and the CRM payload arrive in phase 5.
 */
function leadForm(p, ctx) {
  const origin = ctx.page?.route?.default_origin || '';
  const destination = ctx.page?.route?.default_destination || '';
  return `<form class="lead-form" data-hero-lead novalidate>
    <div class="lf-pills" aria-hidden="true">
      ${pill('Round-trip')}
      ${pill(`${CABIN_CLASSES[0]} / 1 Traveler`)}
    </div>

    <div class="lf-field lf-pair">
      <span class="lf-cell">
        <span class="lf-lab">From</span>
        <input aria-label="From" placeholder="City or airport" value="${esc(origin)}">
      </span>
      <span class="lf-cell">
        <span class="lf-lab">To</span>
        <input aria-label="To" placeholder="City or airport" value="${esc(destination)}">
      </span>
      <button class="lf-swap" type="button" data-lead-swap aria-label="Swap origin and destination">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M2 5.5h11M10.5 3 13 5.5 10.5 8M14 10.5H3M5.5 8 3 10.5 5.5 13"/>
        </svg>
      </button>
    </div>

    <div class="lf-field lf-pair">
      <span class="lf-cell">
        <span class="lf-lab">Departure</span>
        <input aria-label="Departure" type="date">
      </span>
      <span class="lf-cell">
        <span class="lf-lab">Return</span>
        <input aria-label="Return" type="date">
      </span>
    </div>

    <div class="lf-field">
      <span class="lf-cell"><span class="lf-lab">Name<i>*</i></span>
        <input aria-label="Full name" placeholder="Your name" required></span>
    </div>
    <div class="lf-field">
      <span class="lf-cell"><span class="lf-lab">Email<i>*</i></span>
        <input aria-label="Email" type="email" placeholder="Contact email" required></span>
    </div>
    <div class="lf-field lf-phone">
      <span class="lf-lab">Phone number<i>*</i></span>
      <span class="lf-cc">
        <span class="flag" aria-hidden="true">&#127482;&#127480;</span>
        <select aria-label="Country code">${
          DIAL_CODES.map((c) => `<option>${esc(c)}</option>`).join('')
        }</select>
      </span>
      <span class="lf-cell"><input aria-label="Phone" placeholder="XXX XXX XXXX" required></span>
    </div>

    <button class="btn" type="submit"${style({ background: p.cta_button_color, color: p.cta_button_text_color })}>
      ${esc(p.cta_button_text || 'Check Your Price')}
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor"
           stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 3.5 10.5 8 6 12.5"/>
      </svg>
    </button>
  </form>`;
}

/**
 * A trip selector, drawn but not wired. `aria-hidden` on the row: these carry no value a
 * screen-reader user could change or submit, and announcing a control that does nothing is
 * worse than not announcing it. They become real when the lead engine does.
 * @param {string} text
 */
const pill = (text) => `<span class="lf-pill"><span>${esc(text)}</span>`
  + `<svg viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.6"`
  + ` stroke-linecap="round" stroke-linejoin="round"><path d="M1 1l4 4 4-4"/></svg></span>`;

/** Enough to look like a real picker without shipping a country database. */
const DIAL_CODES = ['+1', '+44', '+33', '+49', '+34', '+39', '+971', '+65', '+81', '+61'];

/* --------------------------------------------------------------- helpers */

/** Background images need a URL, not an <img> tag, so they resolve the asset directly. */
const mediaSrc = (/** @type {any} */ m) => m?.url || (m?.asset ? assetUrl(m.asset) : '');

/**
 * Currency symbol for the page's ISO 4217 code (doc 20 §4.3). Formatting of the number
 * itself stays with the author: the field stores digits and separators as typed.
 * @param {string|undefined} code
 */
function currencySymbol(code) {
  try {
    const parts = new Intl.NumberFormat('en', { style: 'currency', currency: code || 'USD' })
      .formatToParts(0);
    return parts.find((x) => x.type === 'currency')?.value || '$';
  } catch { return '$'; }
}
