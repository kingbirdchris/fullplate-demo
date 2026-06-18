/* FullPlate owner-tab strip helper (loaded LAST, after engage.js).
   Two fixes:
   (1) "More" affordance: a chevron + edge fade appears on the owner-console tab
       strip when tabs (Payouts, Settings, Grow, Customers) are scrolled off to
       the right past Hours, so it is obvious there are more selections.
   (2) Scroll persistence: selecting a tab re-renders the whole owner console,
       which used to reset the tab strip back to its original (start) position.
       We capture the strip's scrollLeft before the re-render and restore it
       after, so the tabs stay where they are. Wraps window.openOwner; no edits
       to owner.js or engage.js. */
(function(){
  if(window.__fpOwnerBar) return; window.__fpOwnerBar = true;

  var css = ''
  + '.otabswrap{position:relative}'
  + '.otabswrap:after{content:"";position:absolute;top:0;right:0;bottom:0;width:44px;pointer-events:none;opacity:0;transition:opacity .15s;background:linear-gradient(90deg,rgba(250,247,240,0),rgba(250,247,240,.96))}'
  + '.otabswrap.canright:after{opacity:1}'
  + '.otabsmore{position:absolute;top:50%;right:3px;transform:translateY(-50%);width:28px;height:28px;border-radius:50%;border:1px solid var(--line);background:#fff;color:var(--brand);font-size:19px;font-weight:800;line-height:1;display:none;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(13,14,15,.18);z-index:4}'
  + '.otabswrap.canright .otabsmore{display:flex}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var saved = 0;

  function strip(){ return document.querySelector('#view-owner .otabs'); }

  function update(s, wrap){
    var more = (s.scrollLeft + s.clientWidth) < (s.scrollWidth - 2);
    wrap.classList.toggle('canright', more);
  }

  function decorate(){
    var s = strip(); if(!s) return;
    var wrap = s.parentNode;
    if(!(wrap && wrap.classList && wrap.classList.contains('otabswrap'))){
      var w = document.createElement('div'); w.className = 'otabswrap';
      s.parentNode.insertBefore(w, s); w.appendChild(s);
      var chev = document.createElement('button');
      chev.type = 'button'; chev.className = 'otabsmore';
      chev.setAttribute('aria-label', 'Show more owner tabs');
      chev.textContent = '›';
      chev.onclick = function(e){ e.preventDefault(); e.stopPropagation(); s.scrollBy({ left: 150, behavior: 'smooth' }); };
      w.appendChild(chev);
      s.addEventListener('scroll', function(){ update(s, w); });
      wrap = w;
    }
    if(saved) s.scrollLeft = saved;
    update(s, wrap);
  }

  var _openOwner = window.openOwner;
  window.openOwner = function(){
    var s = strip(); if(s) saved = s.scrollLeft;
    if(typeof _openOwner === 'function') _openOwner.apply(this, arguments);
    decorate();
    requestAnimationFrame(decorate);
  };
})();
