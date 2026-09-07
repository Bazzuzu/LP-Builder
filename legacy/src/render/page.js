// Assembles a complete standalone HTML document from a PageDoc.
// `mode: 'preview'` adds the click-to-select bridge; 'export' produces the shippable file.
import { esc } from '../util.js';
import { THEME_CSS } from './theme.js';
import { TYPES } from '../schema/registry.js';

export function renderPage(doc, { mode = 'export', selected = null } = {}) {
  if (!doc) return '<!doctype html><html><body></body></html>';

  const body = doc.sections
    .filter((s) => s.visible !== false)
    .map((s) => {
      const t = TYPES[s.type];
      if (!t?.render) return `<!-- unknown section type: ${esc(s.type)} -->`;
      try { return t.render(s); }
      catch (err) {
        console.error('Render failed for', s.type, err);
        return `<!-- render error in ${esc(s.type)}: ${esc(err.message)} -->`;
      }
    })
    .join('\n');

  const heroTheme = doc.sections.find((s) => s.type === 'hero')?.props?.theme || 'dark';

  return `<!doctype html>
<html lang="en" data-theme="${esc(heroTheme)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(doc.meta?.title || doc.name || 'Landing page')}</title>
${doc.meta?.description ? `<meta name="description" content="${esc(doc.meta.description)}">` : ''}
<style>${THEME_CSS}</style>
</head>
<body${mode === 'preview' ? ' class="lpb-edit"' : ''}>
${body}
${LEAD_MODAL}
<script>${RUNTIME}</script>
${mode === 'preview' ? `<script>${bridge(selected)}</script>` : ''}
</body>
</html>`;
}

const LEAD_MODAL = `<div class="lead" id="lead-modal" hidden>
  <div class="lead-box" role="dialog" aria-modal="true" aria-label="Request a quote">
    <button class="close" type="button" data-lead-close aria-label="Close">&times;</button>
    <h3>Request a quote</h3>
    <p>A travel expert replies within 15 minutes.</p>
    <form data-lead novalidate>
      <input name="destination" placeholder="Destination" data-lead-dest>
      <input name="name" placeholder="Full name" required>
      <input name="email" type="email" placeholder="Email" required>
      <input name="phone" placeholder="Phone">
      <button class="btn" type="submit">Send request</button>
    </form>
    <div class="msg" data-msg role="status"></div>
  </div>
</div>`;

/** Frontend behaviour of the published page. Kept dependency-free and small. */
const RUNTIME = `
(function(){
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};

  // --- countdown ------------------------------------------------------------
  $$('[data-countdown]').forEach(function(el){
    var end=new Date(el.getAttribute('data-countdown')).getTime();
    if(!end){el.textContent='';return}
    var tick=function(){
      var d=end-Date.now();
      if(d<=0){el.textContent='Offer ended';clearInterval(t);return}
      var s=Math.floor(d/1000), u=[Math.floor(s/86400),Math.floor(s%86400/3600),Math.floor(s%3600/60),s%60];
      el.innerHTML=['d','h','m','s'].map(function(k,i){
        return '<b>'+String(u[i]).padStart(2,'0')+'</b>'+k}).join('');
    };
    tick(); var t=setInterval(tick,1000);
  });

  // --- region tabs ----------------------------------------------------------
  $$('[data-tabs]').forEach(function(tabs){
    var table=tabs.parentNode.querySelector('.ptable');
    tabs.addEventListener('click',function(e){
      var b=e.target.closest('button'); if(!b)return;
      $$('button',tabs).forEach(function(x){x.setAttribute('aria-selected',String(x===b))});
      var r=b.getAttribute('data-region');
      $$('.prow',table).forEach(function(row){
        row.style.display=(r==='All'||row.getAttribute('data-region')===r)?'':'none';
      });
    });
  });

  // --- logo marquee: only animate when the row actually overflows -----------
  var syncMarquee=function(){
    $$('[data-marquee]').forEach(function(w){
      var track=$('.logos-track',w), dup=$('.dup',track);
      if(!track)return;
      dup.hidden=true; w.classList.remove('marquee');
      if(track.scrollWidth>w.clientWidth+2){ dup.hidden=false; w.classList.add('marquee'); }
    });
  };
  syncMarquee(); addEventListener('resize',syncMarquee);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(syncMarquee);

  // --- lead modal -----------------------------------------------------------
  var modal=$('#lead-modal');
  var openLead=function(dest){
    if(!modal)return;
    modal.hidden=false;
    var d=$('[data-lead-dest]',modal); if(d&&dest)d.value=dest;
    var f=modal.querySelector('input[name=name]'); if(f)f.focus();
  };
  var closeLead=function(){ if(modal)modal.hidden=true };
  document.addEventListener('click',function(e){
    var row=e.target.closest('.prow');
    if(row){ openLead(row.getAttribute('data-dest')||''); return }
    var a=e.target.closest('a[href="#lead-modal"]');
    if(a){ e.preventDefault(); openLead(''); return }
    if(e.target.closest('[data-lead-close]')||e.target===modal) closeLead();
  });
  addEventListener('keydown',function(e){ if(e.key==='Escape')closeLead() });

  // --- forms ----------------------------------------------------------------
  var EMAIL=/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/;
  var say=function(form,text,ok){
    var m=form.parentNode.querySelector('[data-msg]')||form.querySelector('[data-msg]');
    if(m){ m.textContent=text; m.className='msg '+(ok?'ok':'err'); }
  };
  document.addEventListener('submit',function(e){
    var form=e.target;
    if(!form.matches('[data-newsletter],[data-lead]'))return;
    e.preventDefault();
    var email=(form.querySelector('input[type=email]')||{}).value||'';
    if(!EMAIL.test(email.trim())){ say(form,'Please enter a valid email address.',false); return }
    if(form.hasAttribute('data-lead')){
      var name=(form.querySelector('input[name=name]')||{}).value||'';
      if(!name.trim()){ say(form,'Please enter your name.',false); return }
    }
    // Prototype: no backend. Wire this to the CRM endpoint in production.
    say(form,'Thanks — we will be in touch shortly.',true);
    form.reset();
  });
})();`;

/** Preview-only: keeps the canvas and the admin outline in sync. */
const bridge = (selected) => `
(function(){
  var sel=${JSON.stringify(selected)};
  if(sel){var n=document.querySelector('[data-sec="'+sel+'"]');
    if(n){n.classList.add('lpb-sel');n.scrollIntoView({block:'nearest'})}}
  document.addEventListener('click',function(e){
    var s=e.target.closest('[data-sec]');
    if(!s)return;
    e.preventDefault();
    parent.postMessage({lpb:'select',id:s.getAttribute('data-sec')},'*');
  },true);
})();`;
