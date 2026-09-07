import { esc, rt, src, blank, attr, style, imgTag } from '../html.js';

const badge = (b) => {
  if (!b?.on || !b.label) return '';
  return `<span class="pill"${style({ background: b.color || '#7C5C3E' })}>${
    b.icon ? imgTag(b.icon, '') : ''}<span>${esc(b.label)}</span></span>`;
};

const ACCS = ['IATA', 'IATAN', 'ARC', 'BBB'];

function headerBar(p) {
  const h = p.header || {};
  if (h.on === false) return '';
  const acc = h.accreditations !== false
    ? `<div class="hero-accs">${ACCS.map((a) => `<span class="acc">${a}</span>`).join('')}</div>` : '';
  const phone = h.phone
    ? `<a class="hero-phone" href="tel:${esc(String(h.phone).replace(/[^+\d]/g, ''))}">${esc(h.phone)}</a>` : '';
  const menu = h.menu !== false
    ? `<a class="hero-menu-btn" href="#lead-modal" aria-label="Menu">☰</a>` : '';
  return `<div class="hero-header"><div class="wrap hero-header-in">
      ${h.logoText ? `<div class="hero-logo">${esc(h.logoText)}</div>` : '<span></span>'}
      ${acc}
      <div class="hero-header-right">${phone}${menu}</div>
    </div></div>`;
}

function eyebrow(p) {
  const e = p.eyebrow || {};
  switch (e.mode) {
    case 'text':
      return e.text || e.badge?.on ? `<div class="hero-eyebrow"><span>${esc(e.text || '')}</span>${badge(e.badge)}</div>` : '';
    case 'timer':
      return `<div class="hero-eyebrow"><span>${esc(e.prefix || '')}</span>` +
        `<span class="timer" data-countdown="${esc(e.endsAt || '')}"></span>${badge(e.badge)}</div>`;
    case 'logo':
      return e.logo ? `<div class="hero-eyebrow"><span class="logo-box">${imgTag(e.logo, '')}</span></div>` : '';
    case 'badge':
      return e.soloLabel
        ? `<div class="hero-eyebrow">${badge({ on: true, label: e.soloLabel, icon: e.soloIcon, color: e.soloColor })}</div>`
        : '';
    default:
      return '';
  }
}

export default function hero(section) {
  const p = section.props || {};
  const theme = p.theme === 'light' ? 'light' : 'dark';
  const bgD = src(p.bgDesktop), bgM = src(p.bgMobile);

  // Currency prefix and the footnote asterisk mirror the `prefix`/`suffix` set on this
  // field in src/schema/hero.js — the admin never types either one.
  const priceVal = !blank(p.price?.value)
    ? `$${rt(p.price.value)}<span class="price-star">*</span>` : '';

  const price = `<div class="price-row">
      <div class="price-main">
        ${!blank(p.price?.top) ? `<div class="price-top">${rt(p.price.top)}</div>` : ''}
        <div class="price-val">${priceVal}</div>
        ${!blank(p.price?.bottom) ? `<div class="price-bottom">${rt(p.price.bottom)}</div>` : ''}
      </div>
      ${p.price?.asideOn && p.price.aside ? `<div class="price-aside">${imgTag(p.price.aside, '')}</div>` : ''}
    </div>
    ${p.price?.belowOn && p.price.below ? `<div class="price-below">${imgTag(p.price.below, '')}</div>` : ''}
    <a class="btn" href="#lead-modal"${style({ background: p.cta?.bg, color: p.cta?.fg })}>${esc(p.cta?.label || 'Get My Quote')}</a>`;

  return `<section class="hero ${theme} ${p.titlePreset === 't2' ? 't2' : 't1'}${bgM ? ' mbg' : ''}" data-sec="${esc(section.id)}"${attr('id', p.anchorId)}>
    <div class="hero-bg d"${style({ 'background-image': bgD ? `url(${bgD})` : '' })}></div>
    <div class="hero-bg m${bgM ? ' has' : ''}"${style({ 'background-image': bgM ? `url(${bgM})` : '' })}></div>
    ${bgD || bgM ? `<div class="hero-ov"${style({ background: p.overlayColor || '#000', opacity: (p.overlayOpacity ?? 50) / 100 })}></div>` : ''}
    ${headerBar(p)}
    <div class="hero-content"><div class="wrap">
      <div>
        ${eyebrow(p)}
        <h1>${rt(p.title || 'Your headline goes here')}</h1>
        ${!blank(p.paragraph) ? `<div class="hero-p">${rt(p.paragraph)}</div>` : ''}
      </div>
      <div class="hero-card">${price}</div>
    </div></div>
  </section>`;
}
