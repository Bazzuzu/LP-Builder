// Behaviour of the published page. Ships as a string inside the exported HTML, so it must
// stay dependency-free and small. Everything here degrades to static markup without JS.
export const RUNTIME_JS = `
(function(){
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function(s, r){ return (r||document).querySelector(s); };
  var $$ = function(s, r){ return [].slice.call((r||document).querySelectorAll(s)); };

  /* ---------------- lead modal (doc 21) ---------------- */
  var modal = $('#lead-modal');
  var lastTrigger = null;

  function openLead(prefill){
    if(!modal) return;
    var dest = $('[data-lead-dest]', modal);
    if(dest && prefill && prefill.destination) dest.value = prefill.destination;
    var cabin = $('[data-lead-cabin]', modal);
    if(cabin && prefill && prefill.cabin_class) cabin.value = prefill.cabin_class;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    // Doc 21 §5: focus lands on the first field, not on the close button that precedes it
    // in the DOM — otherwise the first Tab of every visitor is spent leaving the X.
    var first = $('input,select,textarea', modal) || $('button', modal);
    if(first) first.focus();
  }
  function closeLead(){
    if(!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if(lastTrigger && lastTrigger.focus) lastTrigger.focus();
    lastTrigger = null;
  }

  document.addEventListener('click', function(e){
    var openBtn = e.target.closest && e.target.closest('a[href="#lead-modal"],[data-lead-open]');
    if(openBtn){
      e.preventDefault();
      lastTrigger = openBtn;
      openLead({
        destination: openBtn.getAttribute('data-destination'),
        cabin_class: openBtn.getAttribute('data-cabin')
      });
      return;
    }
    if(e.target.closest && e.target.closest('[data-lead-close]')) { closeLead(); return; }
    if(modal && e.target === modal) closeLead();
  });

  document.addEventListener('keydown', function(e){
    if(!modal || modal.hidden) return;
    if(e.key === 'Escape'){ closeLead(); return; }
    if(e.key !== 'Tab') return;
    // Focus trap: a dialog the keyboard can walk out of is not a dialog.
    var f = $$('a[href],button,input,select,textarea', modal).filter(function(n){ return !n.disabled; });
    if(!f.length) return;
    var first = f[0], last = f[f.length-1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });

  var form = modal && $('[data-lead-form]', modal);
  if(form) form.addEventListener('submit', function(e){
    e.preventDefault();
    var msg = $('[data-msg]', modal);
    if(msg) msg.textContent = 'Thank you — a travel specialist will contact you shortly.';
    form.style.display = 'none';
  });

  /* ---------------- price rows (doc 31 §5.4) ---------------- */
  // Rows are real buttons in the markup, so keyboard activation is free; this only carries
  // the row payload into the modal.
  $$('[data-row-quote]').forEach(function(row){
    row.addEventListener('click', function(){
      lastTrigger = row;
      openLead({
        destination: row.getAttribute('data-destination'),
        cabin_class: row.getAttribute('data-cabin')
      });
    });
  });

  /* ---------------- region tabs (doc 31 §5.3) ---------------- */
  $$('[data-region-tabs]').forEach(function(bar){
    var scope = bar.closest('[data-prices]') || document;
    bar.addEventListener('click', function(e){
      var tab = e.target.closest('[data-region]');
      if(!tab) return;
      var want = tab.getAttribute('data-region');
      $$('[data-region]', bar).forEach(function(t){
        var on = t === tab;
        t.classList.toggle('on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      $$('[data-row-region]', scope).forEach(function(row){
        var r = row.getAttribute('data-row-region');
        // 'Global' rows apply everywhere, so they survive every filter.
        row.hidden = !(want === 'all' || r === want || r === 'Global');
      });
    });
  });

  /* ---------------- countdown (doc 30 §4.3) ---------------- */
  $$('[data-countdown]').forEach(function(node){
    var end = Date.parse(node.getAttribute('data-countdown'));
    var onExpiry = node.getAttribute('data-on-expiry') || 'HideEyebrow';
    if(isNaN(end)) return;
    var pad = function(n){ return (n<10?'0':'') + n; };
    function tick(){
      var left = end - Date.now();
      if(left <= 0){
        if(onExpiry === 'HideEyebrow'){ var box = node.closest('[data-eyebrow]') || node; box.hidden = true; }
        else if(onExpiry === 'ShowExpiredLabel'){ node.textContent = 'Offer ended'; }
        else { node.innerHTML = '<b>00</b><b>00</b><b>00</b>'; }
        clearInterval(timer);
        return;
      }
      var s = Math.floor(left/1000), d = Math.floor(s/86400);
      node.innerHTML = (d>0 ? '<b>'+d+'d</b>' : '')
        + '<b>'+pad(Math.floor(s/3600)%24)+'</b><b>'+pad(Math.floor(s/60)%60)+'</b><b>'+pad(s%60)+'</b>';
    }
    var timer = setInterval(tick, 1000);
    tick();
  });

  /* ---------------- trust: review carousel + testimonial pager (doc 32) ---------------- */
  $$('[data-tr-scroll]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var track = document.getElementById(btn.getAttribute('data-tr-scroll'));
      if(!track) return;
      var dir = btn.getAttribute('data-dir') === 'prev' ? -1 : 1;
      track.scrollBy({ left: dir * track.clientWidth * 0.9, behavior: reduced ? 'auto' : 'smooth' });
    });
  });
  $$('[data-tr-celeb-for]').forEach(function(btn){
    var track = document.getElementById(btn.getAttribute('data-tr-celeb-for'));
    if(!track) return;
    var slides = [].slice.call(track.children);
    if(slides.length < 2) return;
    track.__i = track.__i || 0;
    btn.addEventListener('click', function(){
      slides[track.__i].hidden = true;
      var dir = btn.getAttribute('data-tr-celeb-nav') === 'prev' ? -1 : 1;
      track.__i = (track.__i + dir + slides.length) % slides.length;
      slides[track.__i].hidden = false;
    });
  });

  /* ---------------- logo marquee (doc 40 §6.1) ---------------- */
  $$('[data-marquee]').forEach(function(box){
    var track = $('[data-marquee-track]', box);
    if(!track) return;
    function measure(){
      var overflows = track.scrollWidth > box.clientWidth + 1;
      // Reduced motion never animates: a continuous ticker is a vestibular trigger.
      // It falls back to a scrollable row instead.
      box.classList.toggle('is-marquee', overflows && !reduced);
      box.classList.toggle('is-scroll', overflows && reduced);
      if(overflows && !reduced && !track.dataset.cloned){
        track.innerHTML += track.innerHTML;   // seamless loop
        track.dataset.cloned = '1';
      }
    }
    measure();
    window.addEventListener('resize', measure);
  });
})();
`;

/** Preview-only bridge: click a section in the iframe, select it in the editor. */
export const previewBridge = (selectedId) => `
(function(){
  var sel = ${JSON.stringify(selectedId || null)};
  document.querySelectorAll('[data-section-id]').forEach(function(node){
    if(node.getAttribute('data-section-id') === sel) node.classList.add('lpb-selected');
    node.addEventListener('click', function(e){
      var inner = e.target.closest('[data-section-id]');
      if(inner !== node) return;
      e.preventDefault();
      parent.postMessage({ type:'lpb:select', id: node.getAttribute('data-section-id') }, '*');
    }, true);
  });
})();
`;
