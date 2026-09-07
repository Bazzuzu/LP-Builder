import { esc, rt, blank, imgTag, shell, header, style, src, ctaBtn, placeholder } from '../html.js';

export function quickFacts(section) {
  const p = section.props || {};
  const cards = (p.cards || []).filter((c) => c.title || c.text);
  const media = `<div class="qf-media">
      ${p.imgBig ? imgTag(p.imgBig, '', 'big') : placeholder('Big image', 'big')}
      ${imgTag(p.imgSmall1, '') || placeholder('Small 1')}
      ${imgTag(p.imgSmall2, '') || placeholder('Small 2')}
    </div>`;
  const text = `<div class="qf-text">
      ${p.title ? `<h2 class="sec-title">${esc(p.title)}</h2>` : ''}
      ${!blank(p.intro) ? rt(p.intro) : ''}
      ${cards.length ? `<div class="qf-cards">${cards.map((c) =>
        `<div class="qf-card"><b>${esc(c.title || '')}</b><span>${esc(c.text || '')}</span></div>`).join('')}</div>` : ''}
      ${!blank(p.outro) ? rt(p.outro) : ''}
    </div>`;
  return shell(section, `<div class="qf">${text}${media}</div>`);
}

export function cardsGrid(section) {
  const p = section.props || {};
  const n = +(p.count || 3);
  const cards = (p.cards || []).slice(0, n);
  const inner = header(p) + `<div class="cards-${n}">${cards.map((c) => `<div class="gcard">
      ${imgTag(c.image, c.title || '') || placeholder('Image')}
      ${c.title ? `<h3>${esc(c.title)}</h3>` : ''}
      ${c.text ? `<p>${esc(c.text)}</p>` : ''}
    </div>`).join('')}</div>`;
  return shell(section, inner);
}

export function bigImage(section) {
  const p = section.props || {};
  const u = src(p.image);
  const inner = `<div class="bigimg${p.boxed ? ' boxed' : ''}">
      <div class="bg"${style({ 'background-image': u ? `url(${u})` : '', background: u ? '' : '#3a3a3a' })}></div>
      <div class="ov"${style({ opacity: (p.overlay ?? 35) / 100 })}></div>
      <div class="inner">
        ${p.title ? `<h2>${esc(p.title)}</h2>` : ''}
        ${!blank(p.subheading) ? `<div class="sub">${rt(p.subheading)}</div>` : ''}
        ${ctaBtn(p.cta)}
      </div>
    </div>`;
  // Boxed sits inside .wrap; full-bleed escapes it.
  return p.boxed
    ? shell(section, inner)
    : `<section class="sec sec-bigImage" data-sec="${esc(section.id)}"${p.anchorId ? ` id="${esc(p.anchorId)}"` : ''}${style({ background: p.bg, padding: '0' })}>${inner}</section>`;
}

export function textMedia(section) {
  const p = section.props || {};
  const mode = p.media ?? '1';
  const media = mode === '0' ? '' : `<div class="tm-media${mode === '2' ? ' two' : ''}">
      ${imgTag(p.image1, p.title || '') || placeholder('Image')}
      ${mode === '2' ? (imgTag(p.image2, '') || placeholder('Image')) : ''}
    </div>`;
  const body = `<div class="tm-body">
      ${p.title ? `<h2>${esc(p.title)}</h2>` : ''}
      ${!blank(p.text) ? `<div class="rtx">${rt(p.text)}</div>` : ''}
      ${ctaBtn(p.cta)}
    </div>`;
  const cls = ['tm', mode === '0' ? 'one-col' : '', p.orientation === 'right' ? 'rev' : ''].filter(Boolean).join(' ');
  return shell(section, `<div class="${cls}">${media}${body}</div>`);
}
