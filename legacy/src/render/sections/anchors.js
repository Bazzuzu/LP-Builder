import { esc, rt, blank, imgTag, shell, attr } from '../html.js';

const ACCS = ['IATA', 'IATAN', 'ARC', 'BBB'];

export function trust(section) {
  const p = section.props || {};
  const compact = p.mode === 'compact';

  const tp = p.trustpilot !== false ? `<div class="tp">
      <div class="tp-score">${esc(p.tpScore || '4.8')}</div>
      <div><div class="stars">★★★★★</div><div class="tp-count">${esc(p.tpCount || '')}</div></div>
    </div>` : '';

  const accs = p.accreditations !== false
    ? `<div class="accs">${ACCS.map((a) => `<span class="acc">${a}</span>`).join('')}</div>` : '';

  const celeb = p.celebrity && p.celebName ? `<div class="celeb">
      ${imgTag(p.celebPhoto, p.celebName)}
      <div>${!blank(p.celebQuote) ? rt(p.celebQuote) : ''}<div class="celeb-name">${esc(p.celebName)}</div></div>
    </div>` : '';

  const head = p.title && !compact ? `<div class="sec-head"><h2 class="sec-title">${esc(p.title)}</h2></div>` : '';
  return shell(section, `${head}<div class="trust-grid">${tp}${accs}${celeb}</div>`,
    { class: 'trust ' + (compact ? 'compact' : 'extended') });
}

export function footer(section) {
  const p = section.props || {};
  return `<footer class="foot" data-sec="${esc(section.id)}"${attr('id', p.anchorId)}><div class="wrap">
    <div class="foot-grid">
      <b>${esc(p.company || '')}</b>
      <div>
        ${p.phone ? `<div><a href="tel:${esc(String(p.phone).replace(/[^+\d]/g, ''))}">${esc(p.phone)}</a></div>` : ''}
        ${p.email ? `<div><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></div>` : ''}
      </div>
    </div>
    ${!blank(p.legal) ? `<div class="legal">${rt(p.legal)}</div>` : ''}
  </div></footer>`;
}

export function newsletter(section) {
  return `<section class="nl" data-sec="${esc(section.id)}"><div class="wrap">
    <h2>Fare alerts, straight to your inbox</h2>
    <p>Unpublished business class deals, at most twice a month.</p>
    <form data-newsletter novalidate>
      <input type="email" name="email" placeholder="you@company.com" required>
      <button class="btn" type="submit">Subscribe</button>
    </form>
    <div class="msg" data-msg role="status"></div>
  </div></section>`;
}

export function contact(section) {
  return `<section class="contact" data-sec="${esc(section.id)}"><div class="wrap">
    <div class="contact-grid">
      <div><h3>Call us</h3><a href="tel:+18000000000">+1 (800) 000-0000</a></div>
      <div><h3>Email</h3><a href="mailto:support@example.com">support@example.com</a></div>
      <div><h3>Hours</h3><a href="#lead-modal">24/7 concierge support</a></div>
      <div><h3>Get a quote</h3><a href="#lead-modal">Request a callback</a></div>
    </div>
  </div></section>`;
}
