/* FullPlate clean-capture mode. Opt-in via ?clean=1 (persists for the session;
   ?clean=0 turns it off). Hides the demo-only scaffolding so the app looks like
   the shipping product on camera: the home concept-demo footer, the .realnote
   "illustrative / built from public info" notes, the checkout "Demo only" line,
   the owner "Try it: place a test order" CTA, the green "Live: includes your
   test orders" note, and any "Demo:" helper text. Hiding happens synchronously
   on each render (no on-camera flash). The live interactive demo (no ?clean)
   keeps all of it. No core files edited. */
(function(){
  if(window.__fpClean) return;
  var on = false;
  try{
    var p = new URLSearchParams(location.search);
    if(p.get('clean') === '0'){ try{ localStorage.removeItem('fpClean'); }catch(e){} on = false; }
    else if(p.get('clean') === '1' || p.get('clean') === 'true'){ on = true; try{ localStorage.setItem('fpClean', '1'); }catch(e){} }
    else { try{ on = (localStorage.getItem('fpClean') === '1'); }catch(e){} }
  }catch(e){}
  if(!on) return;
  window.__fpClean = true;

  try{ document.documentElement.classList.add('fpclean'); }catch(e){}
  try{
    var st = document.createElement('style');
    st.textContent = 'html.fpclean .realnote,html.fpclean .demo-note,html.fpclean #view-home > .footer,html.fpclean #view-owner .ai-launch{display:none!important}';
    (document.head || document.documentElement).appendChild(st);
  }catch(e){}

  /* text-only scaffolding (the green "Live: ... test orders" note, stray "Demo:" helper notes) */
  var PAT = /place a test order|these figures include the|listing was built from public info|^\s*demo:/i;
  function sweep(){
    try{
      Array.prototype.forEach.call(document.querySelectorAll('.fppos-note,.obtiny,.realnote,.demo-note,.ai-launch'), function(el){
        if(el.getAttribute('data-cln')) return;
        if(PAT.test(el.textContent || '')){ el.style.display = 'none'; el.setAttribute('data-cln', '1'); }
      });
    }catch(e){}
  }

  /* run sweep synchronously right after each screen renders (so nothing flashes) */
  ['openOwner', 'openRestaurant', 'openCheckout', 'openAccount', 'renderHome'].forEach(function(fn){
    var orig = window[fn];
    if(typeof orig === 'function'){ window[fn] = function(){ var r = orig.apply(this, arguments); try{ sweep(); }catch(e){} return r; }; }
  });

  /* fallback for modals / sheets that open without a nav call */
  var sched = false;
  function go(){ sched = false; sweep(); }
  try{
    var obs = new MutationObserver(function(){ if(!sched){ sched = true; setTimeout(go, 0); } });
    obs.observe(document.documentElement, { childList:true, subtree:true });
  }catch(e){}
  setTimeout(go, 0); setTimeout(go, 250);
})();
