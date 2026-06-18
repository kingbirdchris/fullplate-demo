/* FullPlate pitch layer — owner-first demo helpers. Loaded LAST (after
   ownerbar.js), so it can wrap any global without touching the other files.
   Adds:
   (1) Deep-link entry: ?site=<url>&name=&city=&state=&zip=&cuisine= opens the
       onboarding flow pre-filled and auto-runs the live website import, so AJ
       can bookmark a link per prospect and "build their page" in front of them.
       ?pitch=1 just opens the onboarding form. Add &go=0 to fill but not scan.
   (2) Inline form sheets that replace the browser prompt() dialogs in the owner
       console (add item, edit price, add category, add modifier group, set
       photo, create promo, update truck spot) so the console looks finished.
   (3) An indicative pricing card on the onboarding success screen and a
       "Connect your POS" + plan card in owner Settings — the two things a
       restaurant owner asks about in a pitch. */
(function(){
  if(window.__fpPitch) return; window.__fpPitch = true;

  /* ---------------- styles ---------------- */
  var css = ''
  + '#fpFormSheet .modbody{padding:14px 16px 12px}'
  + '.fpfield{margin:0 0 12px}'
  + '.fptextarea{width:100%;border:1px solid var(--line);border-radius:11px;padding:11px 12px;font-size:14px;background:#fff;color:var(--ink);min-height:70px;resize:vertical;font-family:inherit}'
  + '.fpplan{margin:18px 0 4px;border:1px solid var(--line);border-radius:14px;padding:14px;background:#fff}'
  + '.fpplan-h{font-size:13px;font-weight:800;color:var(--good);margin-bottom:10px;display:flex;align-items:center;gap:7px}'
  + '.fpplan-row{display:flex;justify-content:space-between;gap:10px;font-size:13px;padding:7px 0;border-top:1px solid var(--line)}'
  + '.fpplan-row span{color:var(--ink)}.fpplan-row b{color:var(--ink);white-space:nowrap}'
  + '.fpplan-note{font-size:11px;color:var(--muted);margin-top:9px;line-height:1.45}'
  + '.fppos{margin:14px 0 4px;border:1px solid var(--line);border-radius:14px;padding:14px;background:#fff}'
  + '.fppos-h{font-size:14px;font-weight:800;margin-bottom:4px;display:flex;align-items:center;gap:8px}'
  + '.fppos-h span{font-size:10.5px;font-weight:700;color:var(--muted);background:#F3ECE2;border-radius:999px;padding:2px 8px;text-transform:uppercase;letter-spacing:.04em}'
  + '.fppos-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-top:1px solid var(--line)}'
  + '.fppos-row .pn{font-size:13.5px;font-weight:700;color:var(--ink)}'
  + '.fppos-row .pn small{display:block;font-size:11px;font-weight:500;color:var(--muted);margin-top:1px}'
  + '.fppos-btn{border:1px solid var(--brand);background:#fff;color:var(--brand);border-radius:999px;padding:7px 13px;font-size:12px;font-weight:800;cursor:pointer;white-space:nowrap}'
  + '.fppos-tag{font-size:11px;font-weight:800;color:#1F6B43;background:#EAF5EE;border:1px solid #CDEBD0;border-radius:999px;padding:5px 10px;white-space:nowrap}'
  + '.fppos-note{font-size:11px;color:var(--muted);margin-top:10px;line-height:1.45}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ================= reusable inline form sheet ================= */
  var formCb = null;
  function buildSheet(){
    if(document.getElementById('fpFormSheet')) return;
    var back = document.createElement('div'); back.className = 'sheet-backdrop'; back.id = 'fpFormBack';
    back.onclick = closeForm;
    var sheet = document.createElement('div'); sheet.className = 'sheet modsheet'; sheet.id = 'fpFormSheet';
    sheet.setAttribute('role','dialog');
    sheet.innerHTML = ''
      + '<div class="sheet-head"><div class="ht"><b id="fpFormTitle">Edit</b><span id="fpFormSub"></span></div>'
      + '<button class="close" id="fpFormX" aria-label="Close">✕</button></div>'
      + '<div class="modbody" id="fpFormBody"></div>'
      + '<div class="modfoot"><button class="paybtn" id="fpFormSave">Save</button></div>';
    document.body.appendChild(back); document.body.appendChild(sheet);
    document.getElementById('fpFormX').onclick = closeForm;
    document.getElementById('fpFormSave').onclick = submitForm;
  }
  function fieldHTML(f){
    var id = 'fpf_' + f.key, val = (f.value != null ? String(f.value) : '');
    var v = val.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
    var lbl = '<label class="oblabel" for="' + id + '">' + f.label + '</label>';
    var ctrl;
    if(f.type === 'select'){
      ctrl = '<select class="obselect" id="' + id + '">' + (f.options||[]).map(function(o){
        var on = (String(o.value) === val) ? ' selected' : '';
        return '<option value="' + String(o.value).replace(/"/g,'&quot;') + '"' + on + '>' + o.label + '</option>';
      }).join('') + '</select>';
    } else if(f.type === 'textarea'){
      ctrl = '<textarea class="fptextarea" id="' + id + '" placeholder="' + (f.placeholder||'') + '">' + v + '</textarea>';
    } else {
      var extra = (f.type === 'number') ? (' inputmode="decimal"' + (f.step?(' step="'+f.step+'"'):'') + (f.min!=null?(' min="'+f.min+'"'):'')) : '';
      ctrl = '<input class="obinput" id="' + id + '" type="' + (f.type==='number'?'number':'text') + '" value="' + v + '" placeholder="' + (f.placeholder||'') + '"' + extra + '>';
    }
    return '<div class="fpfield">' + lbl + ctrl + '</div>';
  }
  function fpForm(opts, cb){
    buildSheet();
    formCb = cb || null;
    document.getElementById('fpFormTitle').textContent = opts.title || 'Edit';
    document.getElementById('fpFormSub').textContent = opts.sub || '';
    document.getElementById('fpFormBody').innerHTML = (opts.fields||[]).map(fieldHTML).join('');
    document.getElementById('fpFormSave').textContent = opts.save || 'Save';
    document.getElementById('fpFormBody').setAttribute('data-keys', (opts.fields||[]).map(function(f){return f.key;}).join(','));
    var back = document.getElementById('fpFormBack');
    back.style.display = 'block';
    requestAnimationFrame(function(){ back.style.opacity = '1'; document.getElementById('fpFormSheet').classList.add('open'); });
    setTimeout(function(){ var first = document.querySelector('#fpFormBody input,#fpFormBody select,#fpFormBody textarea'); if(first){ try{ first.focus(); }catch(e){} } }, 80);
  }
  function closeForm(){
    formCb = null;
    var sh = document.getElementById('fpFormSheet'); if(sh) sh.classList.remove('open');
    var b = document.getElementById('fpFormBack'); if(b){ b.style.opacity = '0'; setTimeout(function(){ b.style.display='none'; }, 200); }
  }
  function submitForm(){
    var keys = (document.getElementById('fpFormBody').getAttribute('data-keys') || '').split(',').filter(Boolean);
    var out = {};
    keys.forEach(function(k){ var el = document.getElementById('fpf_' + k); out[k] = el ? el.value : ''; });
    var cb = formCb; closeForm();
    if(cb) cb(out);
  }
  window.fpForm = fpForm;

  /* ================= replace owner-console prompt() dialogs ================= */
  function R(id){ return RESTAURANTS.find(function(x){ return x.id === id; }); }

  window.editPrice = function(id){
    var it = findItem(id); if(!it) return;
    fpForm({ title:'Edit price', sub:it.name, fields:[
      { key:'price', label:'Price ($)', type:'number', step:'0.01', min:'0', value:it.price.toFixed(2) }
    ]}, function(v){ var n = parseFloat(v.price); if(n >= 0){ it.price = n; showToast('Price updated'); } openOwner(ownerRest,'menu'); });
  };

  window.addMenuItem = function(rid){
    var r = R(rid); if(!r) return;
    var cats = r.menu.map(function(c, i){ return { label:c.cat, value:String(i) }; });
    if(!cats.length) cats = [{ label:'Menu', value:'0' }];
    fpForm({ title:'Add menu item', fields:[
      { key:'name', label:'Item name', type:'text', placeholder:'e.g. Al Pastor Taco' },
      { key:'price', label:'Price ($)', type:'number', step:'0.01', min:'0', placeholder:'0.00' },
      { key:'desc', label:'Description (optional)', type:'text', placeholder:'Short description' },
      { key:'cat', label:'Category', type:'select', options:cats, value:String(Math.max(0, r.menu.length - 1)) }
    ]}, function(v){
      if(!v.name || !v.name.trim()) return;
      var price = parseFloat(v.price); if(!(price >= 0)) price = 0;
      var ci = parseInt(v.cat, 10) || 0;
      var cat = r.menu[ci] || r.menu[r.menu.length - 1] || (r.menu[0] = { cat:'Menu', items:[] });
      cat.items.push({ id:'x' + (++__oid), name:v.name.trim(), price:price, desc:(v.desc||'').trim(), tags:[], emoji:'🍽️' });
      showToast('Added ' + v.name.trim() + ' to ' + cat.cat); openOwner(rid,'menu');
    });
  };

  window.addCategory = function(rid){
    var r = R(rid); if(!r) return;
    fpForm({ title:'Add category', fields:[
      { key:'name', label:'Category name', type:'text', placeholder:'e.g. Specials' }
    ]}, function(v){ if(!v.name || !v.name.trim()) return; r.menu.push({ cat:v.name.trim(), items:[] }); showToast('Category "' + v.name.trim() + '" added'); openOwner(rid,'menu'); });
  };

  window.addModGroup = function(id){
    var it = findItem(id); if(!it) return;
    fpForm({ title:'Add modifier group', sub:it.name, fields:[
      { key:'gname', label:'Group name', type:'text', placeholder:'e.g. Add-ons, Choose a size' },
      { key:'multi', label:'Selection', type:'select', options:[{label:'Pick one',value:'no'},{label:'Pick more than one',value:'yes'}], value:'no' },
      { key:'opts', label:'Options — name:price, comma separated', type:'textarea', placeholder:'Bacon:2, Avocado:1.5, Egg:1.5' }
    ]}, function(v){
      if(!v.gname || !v.gname.trim()) return;
      var multi = /^y/i.test(v.multi || '');
      var options = (v.opts || '').split(',').map(function(s){ var p = s.split(':'); return { name:(p[0]||'').trim(), price:parseFloat(p[1])||0 }; }).filter(function(o){ return o.name; });
      if(!options.length){ showToast('Add at least one option'); return; }
      if(!it.mods) it.mods = [];
      it.mods.push(multi ? { name:v.gname.trim(), multi:true, max:options.length, options:options } : { name:v.gname.trim(), options:options });
      showToast('Modifier group added to ' + it.name); openOwner(ownerRest,'menu');
    });
  };

  window.setPhoto = function(id){
    var it = findItem(id); if(!it) return;
    fpForm({ title:'Set item photo', sub:it.name, fields:[
      { key:'url', label:'Image URL (leave blank to clear)', type:'text', value:(photoOverride[id]||''), placeholder:'https://…' }
    ]}, function(v){ var url = (v.url||'').trim(); if(url) photoOverride[id] = url; else delete photoOverride[id]; showToast('Photo updated'); openOwner(ownerRest,'menu'); });
  };

  window.createPromo = function(){
    fpForm({ title:'Create promo code', fields:[
      { key:'code', label:'Promo code', type:'text', placeholder:'e.g. TACOTUES' },
      { key:'kind', label:'Type', type:'select', options:[{label:'Percent off (%)',value:'pct'},{label:'Dollars off ($)',value:'amt'}], value:'pct' },
      { key:'val', label:'Amount', type:'number', min:'0', placeholder:'e.g. 15' }
    ]}, function(v){
      var code = (v.code||'').trim().toUpperCase(); if(!code) return;
      var val = parseFloat(v.val); if(!(val > 0)){ showToast('Enter an amount'); return; }
      var isPct = v.kind === 'pct';
      promos.push({ code:code, type:isPct?'pct':'amt', value:val, label:isPct ? (val + '% off') : ('$' + val.toFixed(2) + ' off') });
      showToast('Promo ' + code + ' created'); openOwner(ownerRest,'promos');
    });
  };

  if(typeof window.setTruckSpot === 'function'){
    window.setTruckSpot = function(id){
      var r = R(id); if(!r) return;
      fpForm({ title:'Update your spot', sub:'Diners see this while you are live', fields:[
        { key:'spot', label:'Where are you parked right now?', type:'text', value:(r.spot||''), placeholder:'e.g. 1st St & Roosevelt' },
        { key:'until', label:'Serving until', type:'text', value:(r.until||''), placeholder:'e.g. 8:00pm' }
      ]}, function(v){ r.spot = (v.spot||'').trim() || r.spot; r.until = (v.until||'').trim() || r.until; r.live = true; showToast('Location updated — you are live'); openOwner(id,'overview'); });
    };
  }

  /* ================= owner pricing + POS stub (Settings tab) ================= */
  function planCardHTML(){
    return '<div class="fpplan">'
      + '<div class="fpplan-h">✓ Flat monthly · 0% commission, ever</div>'
      + '<div class="fpplan-row"><span>Starter — listing, AI ordering, pickup</span><b>$99/mo</b></div>'
      + '<div class="fpplan-row"><span>Growth — loyalty, promos, email + SMS, analytics</span><b>$199/mo</b></div>'
      + '<div class="fpplan-row"><span>Pro — custom site/app + managed service</span><b>by assessment</b></div>'
      + '<div class="fpplan-note">You keep 100% of every order and every tip. Only standard card processing (2.9% + 30¢) is passed through at cost — never a commission. Indicative pricing for this demo.</div>'
      + '</div>';
  }
  function posCardHTML(){
    var row = function(name, sub, tag, btn){
      return '<div class="fppos-row"><div class="pn">' + name + (sub?('<small>'+sub+'</small>'):'') + '</div>'
        + (tag ? ('<span class="fppos-tag">' + tag + '</span>') : ('<button class="fppos-btn" onclick="fpConnectPOS(\'' + name + '\')">' + (btn||'Connect') + '</button>')) + '</div>';
    };
    return '<div class="fppos">'
      + '<div class="fppos-h">Connect your POS <span>optional</span></div>'
      + row('No POS / tablet', 'Orders chime &amp; print to a tablet and receipt printer', 'Included', '')
      + row('Square', 'Direct two-way menu &amp; order sync', '', 'Connect')
      + row('Clover', 'Direct two-way menu &amp; order sync', '', 'Connect')
      + row('Toast &amp; others', 'Via one integration partner', '', 'Connect')
      + '<div class="fppos-note">Live in days with no new hardware — orders print to a tablet. Square and Clover connect directly; Toast and the long tail come through a single integration partner. Payments always run on your own Stripe account, so FullPlate never holds your money.</div>'
      + '</div>';
  }
  window.fpConnectPOS = function(name){ showToast(name.replace(/&amp;/g,'&') + ': POS connection is set up during onboarding in production'); };

  /* wrap openOwner (outermost, since this file loads last) to inject into Settings */
  var _openOwner = window.openOwner;
  window.openOwner = function(){
    if(typeof _openOwner === 'function') _openOwner.apply(this, arguments);
    try{
      if(typeof ownerTab !== 'undefined' && ownerTab === 'settings'){
        var body = document.getElementById('ownerBody');
        if(body && !document.getElementById('fpPlanCard')){
          var holder = document.createElement('div');
          holder.innerHTML = posCardHTML() + planCardHTML();
          holder.firstChild.id = 'fpPlanCard';
          while(holder.firstChild){ body.appendChild(holder.firstChild); }
        }
      }
    }catch(e){}
  };

  /* ================= pricing on the onboarding success screen ================= */
  var moTarget = document.getElementById('view-onboard');
  if(moTarget && typeof MutationObserver !== 'undefined'){
    var mo = new MutationObserver(function(){
      try{
        var succ = moTarget.querySelector('.obsuccess');
        if(succ && !succ.querySelector('#fpPlanS')){
          var actions = succ.querySelector('.obactions');
          var div = document.createElement('div'); div.id = 'fpPlanS'; div.innerHTML = planCardHTML();
          var card = div.firstChild;
          if(actions && actions.parentNode){ actions.parentNode.insertBefore(card, actions); }
          else { succ.appendChild(card); }
        }
      }catch(e){}
    });
    mo.observe(moTarget, { childList:true, subtree:true });
  }

  /* ================= deep-link owner-first entry ================= */
  function normUrl(u){ u = (u||'').trim(); if(!u) return ''; return /^https?:\/\//i.test(u) ? u : ('https://' + u.replace(/^\/+/, '')); }
  function setVal(id, val){ var el = document.getElementById(id); if(el && val != null && val !== '') el.value = val; }
  function runDeepLink(){
    var q; try{ q = new URLSearchParams(location.search); }catch(e){ return; }
    var site = q.get('site') || q.get('url');
    var pitch = q.get('pitch');
    if(!site && !pitch) return;
    if(typeof fpStartListing !== 'function') return;
    fpStartListing();
    setTimeout(function(){
      if(site) setVal('obUrl', normUrl(site));
      setVal('obName', q.get('name'));
      setVal('obCity', q.get('city'));
      setVal('obState', q.get('state'));
      setVal('obZip', q.get('zip'));
      var cz = q.get('cuisine');
      if(cz){ var sel = document.getElementById('obCuisine'); if(sel){ for(var i=0;i<sel.options.length;i++){ if(sel.options[i].value.toLowerCase() === cz.toLowerCase()){ sel.selectedIndex = i; break; } } } }
      if(site && q.get('go') !== '0' && typeof onboardScan === 'function'){ onboardScan(); }
    }, 90);
  }
  setTimeout(runDeepLink, 60);
})();
