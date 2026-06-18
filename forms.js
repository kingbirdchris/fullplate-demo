/* FullPlate forms polish. Loaded after groups.js, before nav.js. Turns short
   dropdowns inside the form sheets into one-tap segmented pill controls (the
   hidden <select> still backs the value, so submit logic is unchanged). Watches
   both form systems (fpForm #fpFormBody and rForm #rfBody). No core files
   edited. Demo-only. */
(function(){
  if(window.__fpForms) return; window.__fpForms = true;

  function active(b){ b.style.background = 'var(--brand)'; b.style.color = '#fff'; b.style.borderColor = 'var(--brand)'; }
  function inactive(b){ b.style.background = '#fff'; b.style.color = 'var(--ink)'; b.style.borderColor = 'var(--line)'; }

  function segmentize(container){
    if(!container) return;
    Array.prototype.forEach.call(container.querySelectorAll('select'), function(sel){
      if(sel.getAttribute('data-seg')) return;
      var opts = Array.prototype.map.call(sel.options, function(o){ return { v:o.value, l:o.textContent }; });
      if(opts.length < 2 || opts.length > 5) return;           /* only short option sets */
      var maxLen = 0; opts.forEach(function(o){ if(o.l.length > maxLen) maxLen = o.l.length; });
      if(maxLen > 22) return;                                   /* keep a dropdown for long labels */
      sel.setAttribute('data-seg', '1'); sel.style.display = 'none';
      var wrap = document.createElement('div'); wrap.className = 'fpseg';
      wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:7px;margin-top:2px';
      opts.forEach(function(o){
        var b = document.createElement('button'); b.type = 'button'; b.textContent = o.l;
        b.style.cssText = 'flex:1 1 auto;min-width:62px;padding:9px 12px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;border:1px solid var(--line);background:#fff;color:var(--ink)';
        if(o.v === sel.value) active(b); else inactive(b);
        b.onclick = function(){
          sel.value = o.v;
          Array.prototype.forEach.call(wrap.children, inactive); active(b);
          try{ sel.dispatchEvent(new Event('change', { bubbles:true })); }catch(e){}
        };
        wrap.appendChild(b);
      });
      sel.parentNode.insertBefore(wrap, sel.nextSibling);
    });
  }

  var scheduled = false;
  function scan(){ scheduled = false; segmentize(document.getElementById('fpFormBody')); segmentize(document.getElementById('rfBody')); }
  try{
    var obs = new MutationObserver(function(){ if(!scheduled){ scheduled = true; (window.requestAnimationFrame || function(f){ setTimeout(f, 0); })(scan); } });
    obs.observe(document.body, { childList:true, subtree:true });
  }catch(e){}
})();
