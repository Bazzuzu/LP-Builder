import { esc, rt, blank, imgTag, style, shell } from '../html.js';

const row = (r, show) => {
  const labels = [show.labels12 !== false && r.label1, show.labels12 !== false && r.label2]
    .filter(Boolean).map((t) => `<span>${esc(t)}</span>`).join('');
  return `<button class="prow" type="button" data-region="${esc(r.region || 'Global')}" data-dest="${esc(r.title || '')}"${style({ color: r.color })}>
    ${show.logo !== false && r.logo ? `<span class="prow-logo">${imgTag(r.logo, '')}</span>` : ''}
    <span class="prow-main">
      <span class="prow-title">${esc(r.title || '')}</span>
      ${labels ? `<span class="prow-labels">${labels}</span>` : ''}
    </span>
    <span class="prow-price">
      ${show.label3 !== false && r.label3 ? `<span class="prow-l3">${esc(r.label3)}</span><br>` : ''}
      ${show.anchorPrice !== false && r.anchorPrice ? `<span class="prow-anchor">$${esc(r.anchorPrice)}</span>` : ''}
      <span class="prow-val">${r.price ? '$' + esc(r.price) : ''}</span>
    </span>
  </button>`;
};

export default function prices(section) {
  const p = section.props || {};
  const show = p.show || {};
  const rows = p.rows || [];
  const mode = p.mediaMode ?? '1';

  const media = mode === '0' ? '' : `<div class="prices-media${mode === '2' ? ' two' : ''}"${style({ position: p.sticky === false ? 'static' : '' })}>
      ${imgTag(p.media1, '') || '<div class="ph">Image 1:1</div>'}
      ${mode === '2' ? (imgTag(p.media2, '') || '<div class="ph">Image 1:1</div>') : ''}
    </div>`;

  const regions = [...new Set(rows.map((r) => r.region || 'Global'))];
  const tabs = p.regionTabs && regions.length > 1
    ? `<div class="tabs" data-tabs>${['All', ...regions].map((r, i) =>
        `<button type="button" role="tab" aria-selected="${i === 0}" data-region="${esc(r)}">${esc(r)}</button>`).join('')}</div>`
    : '';

  const head = (p.head1 || p.head2)
    ? `<div class="ptable-head"><span>${esc(p.head1 || '')}</span><span>${esc(p.head2 || '')}</span></div>` : '';

  const title = p.title
    ? `<h2 class="sec-title"${style({ color: p.titleColor, 'font-style': p.titleItalic ? 'italic' : '' })}>${esc(p.title)}</h2>` : '';
  const sub = !blank(p.subheading) ? `<div class="sec-sub">${rt(p.subheading)}</div>` : '';

  const inner = `<div class="prices-grid${mode === '0' ? ' no-media' : ''}">
    ${media}
    <div>
      ${title || sub ? `<div class="sec-head">${title}${sub}</div>` : ''}
      ${tabs}
      <div class="ptable">${head}${rows.length ? rows.map((r) => row(r, show)).join('') : '<div class="prices-empty">No price rows yet.</div>'}</div>
      ${!blank(p.disclaimer) ? `<div class="prices-note">${rt(p.disclaimer)}</div>` : ''}
    </div>
  </div>`;

  return shell(section, inner);
}
