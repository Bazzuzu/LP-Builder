// Base stylesheet: reset, page shell, the section wrapper and shared primitives.
// Section-specific CSS is NOT here — each section module ships its own `css`, and
// `renderPage` includes only the ones the page actually uses.
export const BASE_CSS = `
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg-white);color:var(--ink);font-family:var(--font);
  font-size:var(--body-l);line-height:1.6;font-weight:var(--body-weight);-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}
a{color:inherit}
:focus-visible{outline:2px solid var(--bronze);outline-offset:3px}

.wrap{max-width:var(--container);margin:0 auto;padding:0 var(--gutter)}

/* ---- section shell (11_ABSTRACT) ---- */
.sec{padding:var(--section-y) 0}
.sec.a-center{text-align:center}
.sec-head{margin-bottom:36px;max-width:760px}
.sec.a-center .sec-head{margin-left:auto;margin-right:auto}
.sec-title{margin:0 0 12px;font-weight:var(--h-weight);letter-spacing:-.02em;line-height:1.2}
.h-s .sec-title{font-size:var(--h-s)}
.h-m .sec-title{font-size:var(--h-m)}
.h-l .sec-title{font-size:var(--h-l);line-height:1.15}
.sec-sub{color:var(--ink-soft);font-size:17px}
.sec-sub p{margin:0 0 8px}
.sec-sub p:last-child{margin-bottom:0}
@media (max-width:767px){
  .h-s .sec-title{font-size:var(--h-s-mobile)}
  .h-m .sec-title{font-size:var(--h-m-mobile)}
  .h-l .sec-title{font-size:var(--h-l-mobile)}
  .sec-head{margin-bottom:28px}
}

/* ---- primitives ---- */
.btn{display:inline-block;background:var(--ink);color:#fff;text-decoration:none;
  padding:13px 26px;border-radius:var(--radius-pill);font-weight:600;font-size:15px;
  border:0;cursor:pointer;transition:transform .12s,filter .12s}
.btn:hover{filter:brightness(1.15)}
.btn:active{transform:translateY(1px)}
.btn-outline{background:transparent;border:1px solid currentColor;color:inherit}
/* Secondary — light neutral fill, dark text. A section opts in per CTA, not global default. */
.btn-secondary{background:rgba(0,0,0,.06);color:var(--ink)}
.btn-secondary:hover{filter:none;background:rgba(0,0,0,.1)}
.ph{background:repeating-linear-gradient(45deg,#eee 0 8px,#f6f6f6 8px 16px);color:#9a9a9a;
  display:flex;align-items:center;justify-content:center;font-size:12px;letter-spacing:.04em;
  text-transform:uppercase;min-height:120px;border-radius:var(--radius)}
/* Seam between two consecutive sections that share the same flat background. A mid-grey at
   low opacity, not a black tint — the divider can now land between two dark sections
   (Footer, Trust) too, where a black-on-black line would be invisible. */
.lpb-divider{height:1px;background:rgba(128,128,128,.25)}

/* ---- lead modal (21_OBJECT_FLIGHT_QUOTE_MODAL) ---- */
.lead{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;
  background:rgba(0,0,0,.55);padding:20px}
.lead[hidden]{display:none}
.lead-box{background:#fff;border-radius:14px;padding:28px;max-width:440px;width:100%;
  position:relative;max-height:90vh;overflow:auto}
.lead-box h3{margin:0 0 6px;font-size:22px;letter-spacing:-.02em}
.lead-box p.lead-intro{margin:0 0 18px;color:var(--ink-soft);font-size:15px}
.lead-box .close{position:absolute;top:12px;right:12px;border:0;background:transparent;
  font-size:22px;line-height:1;cursor:pointer;color:var(--ink-faint);padding:6px}
.lead-box input,.lead-box select{width:100%;padding:11px 13px;margin-bottom:10px;
  border:1px solid var(--line);border-radius:var(--radius-sm);font:inherit;font-size:15px}
.lead-box .btn{width:100%;margin-top:6px}
.lead-box .msg{margin-top:12px;font-size:14px;color:var(--bronze);min-height:1.2em}

/* ---- accessibility ---- */
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;
    transition-duration:.001ms!important}
}
`;
