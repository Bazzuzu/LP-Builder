import { esc, rt, blank, imgTag, shell, header } from '../html.js';

export function logos(section) {
  const p = section.props || {};
  const items = (p.items || []).filter((i) => i.logo);
  const one = items.map((i) => {
    const im = imgTag(i.logo, i.alt || '');
    return i.href ? `<a href="${esc(i.href)}">${im}</a>` : im;
  }).join('');
  // Duplicated track: the runtime script flips on .marquee only when the row overflows.
  const inner = header(p) + `<div class="logos-wrap" data-marquee style="--mq:${+(p.speed || 30)}s">
      <div class="logos-track">${one}<span class="dup" hidden>${one}</span></div>
    </div>`;
  return shell(section, inner);
}

const fcard = (c, iconCls) => `<div class="fcard">
    ${c.icon ? imgTag(c.icon, '', 'fcard-icon ' + iconCls) : ''}
    ${c.title ? `<h3>${esc(c.title)}</h3>` : ''}
    ${!blank(c.text) ? `<div>${rt(c.text)}</div>` : ''}
  </div>`;

export function primaryCards(section) {
  const p = section.props || {};
  const cards = (p.cards || []).slice(0, 3);
  return shell(section, header(p) + `<div class="cards-3">${cards.map((c) => fcard(c, '')).join('')}</div>`);
}

export function secondaryCards(section) {
  const p = section.props || {};
  const n = +(p.count || 3);
  const cards = (p.cards || []).slice(0, n);
  return shell(section, header(p) + `<div class="cards-${n}">${cards.map((c) => fcard(c, 'sm')).join('')}</div>`);
}

export function bullets(section) {
  const p = section.props || {};
  const n = +(p.count || 3);
  const items = (p.items || []).slice(0, n);
  const inner = header(p) + `<div class="bullets">${
    items.map((i) => `<div class="bullet">${imgTag(i.icon, '')}<span>${esc(i.label || '')}</span></div>`).join('')
  }</div>`;
  return shell(section, inner);
}
