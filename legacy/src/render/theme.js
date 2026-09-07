// Landing-page stylesheet, shipped as a string so preview and export share it byte for byte.
// Phase 1 is deliberately plain; phase 2 replaces this file and nothing else.
export const THEME_CSS = `
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:#fff;color:rgba(0,0,0,.88);
  font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,Helvetica,Arial,sans-serif;
  -webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}
a{color:inherit}
.wrap{max-width:1180px;margin:0 auto;padding:0 24px}
.sec{padding:72px 0}
.sec.a-center{text-align:center}
.sec-head{margin-bottom:36px;max-width:760px}
.sec.a-center .sec-head{margin-left:auto;margin-right:auto}
.sec-title{margin:0 0 12px;font-weight:650;letter-spacing:-.02em;line-height:1.15}
.h-s .sec-title{font-size:24px}
.h-m .sec-title{font-size:32px}
.h-l .sec-title{font-size:42px}
.sec-sub{color:rgba(0,0,0,.62);font-size:17px}
.sec-sub p{margin:0 0 8px}
.ph{background:repeating-linear-gradient(45deg,#eee 0 8px,#f6f6f6 8px 16px);color:#9a9a9a;
  display:flex;align-items:center;justify-content:center;font-size:12px;letter-spacing:.04em;
  text-transform:uppercase;min-height:120px;border-radius:10px}
.btn{display:inline-block;background:rgba(0,0,0,.88);color:#fff;text-decoration:none;
  padding:13px 26px;border-radius:8px;font-weight:600;font-size:15px;border:0;cursor:pointer;
  transition:transform .12s,filter .12s}
.btn:hover{filter:brightness(1.15)}
.btn:active{transform:translateY(1px)}
.btn-outline{background:transparent;border:1px solid currentColor}

/* ---------------- hero ---------------- */
.hero{position:relative;min-height:640px;display:flex;flex-direction:column;overflow:hidden}
.hero.dark{background:#1b1b1b}
.hero.light{background:#efe9e4}
.hero-bg,.hero-ov{position:absolute;inset:0}
.hero-bg{background-size:cover;background-position:center}
.hero-bg.m{display:none}
.hero-content{position:relative;flex:1;display:flex;align-items:center;padding:64px 0}
.hero .wrap{position:relative;display:grid;grid-template-columns:1.15fr .85fr;gap:56px;align-items:center;width:100%}
.hero.light{color:rgba(0,0,0,.88)}
.hero.dark{color:#fff}
.hero-header{position:relative}
.hero-header-in{display:flex;align-items:center;justify-content:space-between;gap:20px;
  flex-wrap:wrap;padding:20px 24px}
.hero-logo{font-weight:700;font-size:15px;letter-spacing:.01em}
.hero.dark .hero-logo{color:#fff}
.hero.light .hero-logo{color:#7C5C3E}
.hero-accs{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
.hero-accs .acc{font-size:10.5px;letter-spacing:.07em;font-weight:700;opacity:.75}
.hero-header-right{display:flex;align-items:center;gap:10px}
.hero-phone{font-size:13px;font-weight:600;text-decoration:none;padding:7px 15px;
  border-radius:999px;border:1px solid currentColor;opacity:.92;white-space:nowrap}
.hero-menu-btn{width:34px;height:34px;border-radius:50%;flex:0 0 auto;display:flex;
  align-items:center;justify-content:center;text-decoration:none;font-size:15px;
  background:rgba(0,0,0,.88);color:#fff}
.hero.light .hero-menu-btn{background:rgba(0,0,0,.88);color:#fff}
.hero-eyebrow{display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap;
  font-size:14px;letter-spacing:.06em;text-transform:uppercase;opacity:.9}
.hero-eyebrow .logo-box{height:56px;max-width:560px}
.hero-eyebrow .logo-box img{height:100%;width:auto;object-fit:contain}
.pill{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:999px;
  background:currentColor;font-size:12px;letter-spacing:.04em;line-height:1.6}
.pill span{color:#fff;mix-blend-mode:normal}
.pill img{width:14px;height:14px}
.timer{display:inline-flex;gap:6px;font-variant-numeric:tabular-nums;font-weight:600}
.timer b{background:rgba(255,255,255,.14);padding:2px 8px;border-radius:6px;font-weight:650}
.hero.light .timer b{background:rgba(0,0,0,.08)}
.hero h1{margin:0 0 18px;font-weight:680;letter-spacing:-.03em;line-height:1.08}
.hero.t1 h1{font-size:56px}
.hero.t2 h1{font-size:48px}
.hero-p{font-size:18px;opacity:.86;max-width:56ch}
.hero-p ul,.hero-p ol{padding-left:22px}
.hero-card{background:rgba(255,255,255,.1);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.18);
  border-radius:16px;padding:28px}
.hero.light .hero-card{background:rgba(255,255,255,.72);border-color:rgba(0,0,0,.08)}
.price-row{display:flex;gap:18px;align-items:center}
.price-main{flex:1;min-width:0}
.price-top{font-size:14px;opacity:.75;margin-bottom:2px}
.price-val{font-size:44px;font-weight:680;letter-spacing:-.02em;line-height:1.05}
.price-star{font-size:.45em;vertical-align:top;opacity:.65;margin-left:1px}
.price-bottom{font-size:13px;opacity:.7;margin-top:4px}
.price-aside{width:72px;aspect-ratio:1/2;display:flex;align-items:center;justify-content:center;flex:0 0 auto}
.price-aside img{max-height:100%;width:auto;object-fit:contain}
.price-below{height:56px;max-width:560px;margin-top:16px}
.price-below img{height:100%;width:auto;object-fit:contain}
.hero-card .btn{margin-top:20px;width:100%;text-align:center}

/* ---------------- prices ---------------- */
.prices-grid{display:grid;grid-template-columns:360px 1fr;gap:48px;align-items:start}
.prices-grid.no-media{grid-template-columns:1fr}
.prices-media{position:sticky;top:24px;display:grid;gap:14px}
.prices-media img{aspect-ratio:1/1;object-fit:cover;border-radius:14px;width:100%}
.prices-media.two{grid-template-columns:1fr 1fr}
.prices-media.two img:first-child{grid-column:1/-1}
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px}
.tabs button{border:1px solid rgba(0,0,0,.14);background:#fff;padding:6px 14px;border-radius:999px;
  cursor:pointer;font-size:13.5px;color:rgba(0,0,0,.66)}
.tabs button[aria-selected=true]{background:rgba(0,0,0,.88);border-color:transparent;color:#fff}
.ptable{border-top:1px solid rgba(0,0,0,.1)}
.ptable-head{display:flex;justify-content:space-between;gap:16px;padding:12px 4px;
  font-size:12px;letter-spacing:.07em;text-transform:uppercase;color:rgba(0,0,0,.45);
  border-bottom:1px solid rgba(0,0,0,.1)}
.prow{display:flex;align-items:center;gap:16px;padding:18px 4px;width:100%;text-align:left;
  border:0;border-bottom:1px solid rgba(0,0,0,.08);background:transparent;cursor:pointer;
  font:inherit;color:inherit;transition:background .12s}
.prow:hover{background:rgba(0,0,0,.025)}
.prow-logo{width:40px;height:40px;flex:0 0 auto;display:flex;align-items:center;justify-content:center}
.prow-logo img{max-width:100%;max-height:100%;object-fit:contain}
.prow-main{flex:1;min-width:0}
.prow-title{font-weight:600;font-size:17px}
.prow-labels{font-size:13.5px;opacity:.6;margin-top:2px}
.prow-labels span+span::before{content:"·";margin:0 6px;opacity:.6}
.prow-price{text-align:right;flex:0 0 auto}
.prow-l3{font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;opacity:.6}
.prow-anchor{font-size:14px;opacity:.5;text-decoration:line-through;margin-right:8px}
.prow-val{font-size:22px;font-weight:660;letter-spacing:-.01em}
.prices-note{margin-top:22px;font-size:13px;color:rgba(0,0,0,.55)}
.prices-empty{padding:36px 4px;color:rgba(0,0,0,.4)}

/* ---------------- trust ---------------- */
.trust-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;align-items:center}
.trust.compact .trust-grid{display:flex;flex-wrap:wrap;justify-content:center;gap:14px 36px}
.trust.compact{padding:36px 0}
.tp{display:flex;flex-direction:column;gap:6px;align-items:inherit}
.tp-score{font-size:36px;font-weight:680;letter-spacing:-.02em;line-height:1}
.trust.compact .tp{flex-direction:row;align-items:center;gap:10px}
.trust.compact .tp-score{font-size:20px}
.stars{color:#00b67a;letter-spacing:2px;font-size:18px}
.tp-count{font-size:13.5px;opacity:.6}
.accs{display:flex;gap:14px;flex-wrap:wrap;align-items:center;justify-content:inherit}
.acc{border:1px solid rgba(0,0,0,.12);border-radius:8px;padding:8px 14px;font-size:12px;
  letter-spacing:.08em;font-weight:600;opacity:.72}
.celeb{display:flex;gap:14px;align-items:flex-start;text-align:left;
  border-left:2px solid rgba(0,0,0,.14);padding-left:18px;padding-right:28px}
.celeb img{width:56px;height:56px;border-radius:50%;object-fit:cover;flex:0 0 auto}
.celeb-name{font-weight:600;margin-top:6px;font-size:13.5px;opacity:.7}

/* ---------------- logos / marquee ---------------- */
.logos-track{display:flex;align-items:center;gap:52px;justify-content:center;flex-wrap:wrap}
.logos-track img{height:36px;width:auto;object-fit:contain;filter:grayscale(1);opacity:.68}
.marquee{overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.marquee .logos-track{flex-wrap:nowrap;justify-content:flex-start;width:max-content;
  animation:mq var(--mq,30s) linear infinite}
.marquee:hover .logos-track{animation-play-state:paused}
@keyframes mq{to{transform:translateX(-50%)}}

/* ---------------- cards ---------------- */
.cards-3,.cards-4,.cards-2{display:grid;gap:28px}
.cards-2{grid-template-columns:repeat(2,1fr)}
.cards-3{grid-template-columns:repeat(3,1fr)}
.cards-4{grid-template-columns:repeat(4,1fr)}
.fcard-icon{width:64px;height:64px;margin-bottom:16px;object-fit:contain}
.sec.a-center .fcard-icon{margin-left:auto;margin-right:auto}
.fcard-icon.sm{width:48px;height:48px;margin-bottom:12px}
.fcard h3{margin:0 0 8px;font-size:19px;font-weight:640;letter-spacing:-.01em}
.fcard div{color:rgba(0,0,0,.62);font-size:15px}
.fcard div p{margin:0 0 6px}
.bullets{display:grid;gap:20px 32px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.bullet{display:flex;gap:14px;align-items:center}
.bullet img{width:48px;height:48px;flex:0 0 auto;object-fit:contain}
.bullet span{font-size:16px;font-weight:520}
.gcard img,.gcard .ph{aspect-ratio:4/3;object-fit:cover;border-radius:12px;width:100%}
.gcard h3{margin:14px 0 6px;font-size:18px;font-weight:620}
.gcard p{margin:0;color:rgba(0,0,0,.62);font-size:15px}

/* ---------------- quick facts ---------------- */
.qf{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:start}
.qf-media{display:grid;grid-template-columns:1fr 1fr;gap:12px;min-height:400px;max-height:640px}
.qf-media img,.qf-media .ph{width:100%;height:100%;object-fit:cover;border-radius:12px}
.qf-media .big{grid-column:1/-1}
.qf-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:18px;margin:28px 0}
.qf-card{border-top:2px solid rgba(0,0,0,.12);padding-top:12px}
.qf-card b{display:block;font-size:30px;font-weight:680;letter-spacing:-.02em;line-height:1.1}
.qf-card span{font-size:13.5px;color:rgba(0,0,0,.6)}
.qf-text p{margin:0 0 12px}

/* ---------------- big image ---------------- */
.bigimg{position:relative;min-height:420px;display:flex;align-items:center;justify-content:center;
  overflow:hidden;color:#fff;text-align:center}
.bigimg.boxed{border-radius:16px}
.bigimg .bg{position:absolute;inset:0;background-size:cover;background-position:center}
.bigimg .ov{position:absolute;inset:0;background:#000}
.bigimg .inner{position:relative;padding:64px 24px;max-width:760px}
.bigimg h2{margin:0 0 12px;font-size:40px;font-weight:660;letter-spacing:-.02em;line-height:1.15}
.bigimg .sub{opacity:.9;font-size:17px;margin-bottom:22px}
.bigimg .btn{background:#fff;color:rgba(0,0,0,.88)}

/* ---------------- text & media ---------------- */
.tm{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
.tm.one-col{grid-template-columns:1fr;max-width:800px}
.tm.rev .tm-media{order:2}
.tm-media{display:grid;gap:14px}
.tm-media.two{grid-template-columns:2fr 1fr;align-items:start}
.tm-media img,.tm-media .ph{width:100%;border-radius:14px;object-fit:cover;aspect-ratio:4/3}
.tm-body h2{margin:0 0 14px;font-size:34px;font-weight:650;letter-spacing:-.02em;line-height:1.18}
.tm-body .rtx{color:rgba(0,0,0,.68);font-size:16.5px}
.tm-body .rtx p{margin:0 0 12px}
.tm-body .btn{margin-top:18px}

/* ---------------- newsletter / contact / footer ---------------- */
.nl{background:#f7f2ee;padding:56px 0;text-align:center}
.nl h2{margin:0 0 8px;font-size:28px;font-weight:650;letter-spacing:-.02em}
.nl p{margin:0 0 20px;color:rgba(0,0,0,.6)}
.nl form{display:flex;gap:8px;max-width:440px;margin:0 auto}
.nl input{flex:1;border:1px solid rgba(0,0,0,.16);border-radius:8px;padding:12px 14px;font:inherit}
.nl .msg{margin-top:10px;font-size:13.5px;min-height:20px}
.nl .msg.ok{color:#15803d}
.nl .msg.err{color:#b91c1c}
.contact{padding:56px 0;border-top:1px solid rgba(0,0,0,.08)}
.contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:28px}
.contact h3{margin:0 0 6px;font-size:13px;letter-spacing:.07em;text-transform:uppercase;color:rgba(0,0,0,.45)}
.contact a{font-size:18px;font-weight:600;text-decoration:none}
.contact a:hover{text-decoration:underline}
.foot{background:#161616;color:rgba(255,255,255,.72);padding:44px 0;font-size:14px}
.foot-grid{display:flex;flex-wrap:wrap;gap:18px 40px;justify-content:space-between;align-items:flex-start}
.foot b{color:#fff;font-size:15px}
.foot a{color:#fff;text-decoration:none}
.foot .legal{max-width:620px;opacity:.62;font-size:12.5px;margin-top:16px}

/* ---------------- lead modal ---------------- */
.lead{position:fixed;inset:0;z-index:99;background:rgba(0,0,0,.55);display:flex;
  align-items:center;justify-content:center;padding:20px}
.lead[hidden]{display:none}
.lead-box{background:#fff;border-radius:16px;padding:28px;max-width:420px;width:100%}
.lead-box h3{margin:0 0 4px;font-size:22px;font-weight:650}
.lead-box p{margin:0 0 18px;color:rgba(0,0,0,.58);font-size:14px}
.lead-box input{width:100%;border:1px solid rgba(0,0,0,.16);border-radius:8px;padding:11px 13px;
  font:inherit;margin-bottom:10px}
.lead-box .btn{width:100%}
.lead-box .close{float:right;border:0;background:transparent;font-size:20px;cursor:pointer;
  color:rgba(0,0,0,.4);margin:-6px -6px 0 0}

/* ---------------- responsive ---------------- */
@media (max-width:900px){
  .sec{padding:52px 0}
  .hero .wrap,.prices-grid,.qf,.tm{grid-template-columns:1fr;gap:32px}
  .prices-media{position:static}
  .cards-3,.cards-4{grid-template-columns:repeat(2,1fr)}
  .hero.t1 h1{font-size:40px}.hero.t2 h1{font-size:36px}
  .h-l .sec-title{font-size:32px}.h-m .sec-title{font-size:27px}
  .bigimg h2{font-size:30px}
  .tm.rev .tm-media{order:0}
}
@media (max-width:768px){
  /* The mobile image replaces the desktop one only when it exists; otherwise the
     desktop background keeps rendering rather than falling back to a flat colour. */
  .hero.mbg .hero-bg.d{display:none}
  .hero.mbg .hero-bg.m{display:block}
}
@media (max-width:600px){
  .wrap{padding:0 18px}
  .cards-2,.cards-3,.cards-4,.qf-media{grid-template-columns:1fr}
  .hero{min-height:0}
  .hero-content{padding:48px 0}
  .hero-header-in{padding:16px 18px}
  .prow{flex-wrap:wrap}
  .nl form{flex-direction:column}
}
/* Preview-only affordance: click a section in the canvas to select it in the admin. */
body.lpb-edit [data-sec]{position:relative;cursor:pointer}
body.lpb-edit [data-sec]::after{content:"";position:absolute;inset:0;pointer-events:none;
  outline:2px solid transparent;outline-offset:-2px;transition:outline-color .12s}
body.lpb-edit [data-sec]:hover::after{outline-color:rgba(124,92,62,.45)}
body.lpb-edit [data-sec].lpb-sel::after{outline-color:#7c5c3e}
`;
