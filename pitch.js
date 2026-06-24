/* FullPlate pitch layer — owner-first demo helpers. Loaded LAST (after
   ownerbar.js), so it can wrap any global without touching the other files.
   Adds: deep-link entry; inline form sheets replacing prompt(); Settings
   build-out (POS, printer, business hours, holiday hours, team/roles, tips
   inline under Accept tips, pricing); Payouts connect-bank (simulated Stripe
   Connect); Grow (actionable cards + real QR); Customers (segments, detail,
   CSV); buyer-conversion (savings calculator, comparison, proof stats, go-live
   checklist + test-order, sales-trend chart); diner order-ahead pickup.
   All demo-only; resets on refresh. */
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
      + '<div class="fpplan-row"><span>Multi-location &amp; franchise — per-location rate that drops as you grow</span><b>volume pricing</b></div>'
      + '<div class="fpplan-row"><span>Pro — custom site/app + managed service</span><b>by assessment</b></div>'
      + '<div class="fpplan-note">Software only — run it on any tablet, laptop, or printer you already have. You keep 100% of every order and every tip. Only standard card processing (2.9% + 30¢) is passed through at cost — never a commission. No contract, cancel anytime. Indicative pricing for this demo.</div>'
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
      + '<div class="fppos-note">No POS required — orders chime and print to a tablet and receipt printer, so you can go live in days with no new hardware. Square and Clover connect directly; Toast and the rest come through one integration partner. Payments always run on your own Stripe account, so FullPlate never holds your money.</div>'
      + '</div>';
  }
  window.fpConnectPOS = function(name){ showToast(name.replace(/&amp;/g,'&') + ': POS connection is set up during onboarding in production'); };

  /* --- shared state for the build-out cards --- */
  window.fpTips    = window.fpTips    || { presets:[15, 18, 20] };
  window.fpPrinter = window.fpPrinter || { connected:false, name:'' };
  window.fpBank    = window.fpBank    || { connected:false, bankName:'', mask:'' };
  var GREENBADGE = ' style="background:#EAF5EE;color:#1F6B43;border:1px solid #CDEBD0"';

  /* --- kitchen printer (simulated; production = cloud print, no drivers) --- */
  function printerCardHTML(){
    if(fpPrinter.connected){
      return '<div class="fppos">'
        + '<div class="fppos-h">Kitchen printer <span' + GREENBADGE + '>Connected</span></div>'
        + '<div class="fppos-row"><div class="pn">' + esc(fpPrinter.name) + '<small>New orders auto-print and chime</small></div>'
        + '<button class="fppos-btn" onclick="fpTestPrint()">Send test print</button></div>'
        + '<div class="fppos-row"><div class="pn">Remove this device</div><button class="fppos-btn" onclick="fpDisconnectPrinter()">Disconnect</button></div>'
        + '<div class="fppos-note">Production prints through the cloud (PrintNode, Star CloudPRNT, or Epson ePOS) — no drivers, prints from anywhere the order lands.</div>'
        + '</div>';
    }
    return '<div class="fppos">'
      + '<div class="fppos-h">Kitchen printer <span>optional</span></div>'
      + '<div class="fppos-row"><div class="pn">No printer connected<small>Pair a receipt printer, or use the FullPlate tablet app</small></div>'
      + '<button class="fppos-btn" onclick="fpConnectPrinter()">Connect</button></div>'
      + '<div class="fppos-note">No printer? The FullPlate tablet app shows and chimes every order, so you’re live in days with no new hardware. Add a receipt printer any time; production prints via the cloud (PrintNode / Star CloudPRNT / Epson ePOS), no drivers.</div>'
      + '</div>';
  }
  window.fpConnectPrinter = function(){
    fpForm({ title:'Connect a printer', sub:'Pair a receipt printer or the tablet app', fields:[
      { key:'type', label:'Device', type:'select', options:[
        { label:'FullPlate tablet app (no hardware)', value:'FullPlate Tablet app' },
        { label:'Star Micronics receipt printer', value:'Star TSP143 · kitchen' },
        { label:'Epson receipt printer', value:'Epson TM-m30 · kitchen' },
        { label:'Other receipt printer', value:'Receipt printer · kitchen' }
      ], value:'Star TSP143 · kitchen' },
      { key:'code', label:'Pairing code (shown on the device)', type:'text', value:('FP-' + Math.floor(1000 + Math.random()*9000)) }
    ]}, function(v){
      fpPrinter.connected = true; fpPrinter.name = v.type || 'Receipt printer';
      try{ ownerSettings.autoprint = true; }catch(e){}
      showToast('Printer connected · ' + fpPrinter.name);
      openOwner(ownerRest, 'settings');
    });
  };
  window.fpTestPrint = function(){ showToast('🖨 Test ticket sent to ' + (fpPrinter.name || 'your printer')); };
  window.fpDisconnectPrinter = function(){ fpPrinter.connected = false; fpPrinter.name = ''; showToast('Printer removed'); openOwner(ownerRest, 'settings'); };

  /* --- diner tip presets (owner-editable, wired to the checkout) --- */
  window.fpEditTips = function(){
    fpForm({ title:'Suggested tip amounts', sub:'Three presets diners see at checkout', fields:[
      { key:'t1', label:'Preset 1 (%)', type:'number', min:'0', value:fpTips.presets[0] },
      { key:'t2', label:'Preset 2 (%)', type:'number', min:'0', value:fpTips.presets[1] },
      { key:'t3', label:'Preset 3 (%)', type:'number', min:'0', value:fpTips.presets[2] }
    ]}, function(v){
      var arr = [v.t1, v.t2, v.t3].map(function(x){ var n = parseInt(x, 10); return Math.max(0, Math.min(100, isFinite(n) ? n : 0)); });
      fpTips.presets = arr; showToast('Tip options updated'); openOwner(ownerRest, 'settings');
    });
  };
  /* rebuild the checkout tip row from the owner's presets + add order-ahead pickup */
  var _openCheckout = window.openCheckout;
  window.openCheckout = function(){
    if(typeof _openCheckout === 'function') _openCheckout.apply(this, arguments);
    try{
      var row = document.querySelector('#view-checkout .tiprow');
      if(row){
        var ps = [0].concat(fpTips.presets);
        row.innerHTML = ps.map(function(p){
          var sel = (typeof tipAmt !== 'undefined' && tipAmt == null && tipPct === p) ? 'on' : '';
          return '<button class="tipbtn ' + sel + '" onclick="setTip(' + p + ')">' + (p === 0 ? 'No tip' : p + '%') + '</button>';
        }).join('')
        + '<button class="tipbtn ' + ((typeof tipAmt !== 'undefined' && tipAmt != null) ? 'on' : '') + '" onclick="setTipCustom()">Custom</button>';
      }
      var sl = document.querySelector('#view-checkout .section-label');
      if(sl && !document.getElementById('fpPickRow')){
        var pk = document.createElement('div'); pk.innerHTML = pickupRowHTML();
        sl.parentNode.insertBefore(pk, sl.nextSibling);
      }
    }catch(e){}
  };

  /* --- bank / payouts (simulated Stripe Connect; no real bank is linked) --- */
  function bankCardHTML(){
    if(fpBank.connected){
      return '<div class="fppos" style="margin:0 0 12px">'
        + '<div class="fppos-h">Payouts <span' + GREENBADGE + '>Enabled</span></div>'
        + '<div class="fppos-row"><div class="pn">' + esc(fpBank.bankName || 'Bank account') + ' ••••' + esc(fpBank.mask) + '<small>Daily deposits · you keep 100%, 0% commission</small></div>'
        + '<button class="fppos-btn" onclick="fpManageBank()">Manage</button></div>'
        + '<div class="fppos-note">Demo only — no real bank is connected. Production uses Stripe Connect Express: each location is its own connected account and merchant of record, so FullPlate never holds your money.</div>'
        + '</div>';
    }
    return '<div class="fppos" style="margin:0 0 12px">'
      + '<div class="fppos-h">Get paid <span>action needed</span></div>'
      + '<div class="fppos-row"><div class="pn">Connect your bank to enable payouts<small>Secure setup through Stripe · about 2 minutes</small></div>'
      + '<button class="fppos-btn" onclick="fpConnectBank()">Connect bank</button></div>'
      + '<div class="fppos-note">Demo only — this simulates Stripe Connect onboarding and collects no real bank details. In production each location connects its own Stripe account and is its own merchant of record.</div>'
      + '</div>';
  }
  window.fpConnectBank = function(){
    showToast('Opening secure Stripe onboarding…');
    setTimeout(function(){ showToast('Verifying your business and linking your bank…'); }, 700);
    setTimeout(function(){
      fpBank.connected = true; fpBank.bankName = 'Business Checking'; fpBank.mask = '4321';
      showToast('✓ Payouts enabled — first deposit in ~2 days');
      if(typeof ownerRest !== 'undefined') openOwner(ownerRest, 'payouts');
    }, 1600);
  };
  window.fpManageBank = function(){ showToast('Demo: in production this opens your Stripe Express dashboard'); };

  /* inline tip controls shown directly under the "Accept tips" toggle */
  function tipInlineHTML(){
    return '<div><b>Suggested tip amounts</b><span>Shown at checkout · diners also see “No tip” and a custom amount</span></div>'
      + '<div class="prepwrap">'
      + fpTips.presets.map(function(p){ return '<button class="prepbtn on" onclick="fpEditTips()">' + p + '%</button>'; }).join('')
      + '<button class="prepbtn" onclick="fpEditTips()">Edit ✎</button>'
      + '</div>';
  }

  /* wrap openOwner (outermost, since this file loads last) to inject per tab */
  var _openOwner = window.openOwner;
  window.openOwner = function(){
    if(typeof _openOwner === 'function') _openOwner.apply(this, arguments);
    try{
      var t = (typeof ownerTab !== 'undefined') ? ownerTab : null;
      var r = R(ownerRest) || RESTAURANTS[0];
      var body = document.getElementById('ownerBody');
      if(!body) return;
      if(t === 'settings'){
        if(!document.getElementById('fpSettingsCards')){
          var h = document.createElement('div'); h.id = 'fpSettingsCards';
          h.innerHTML = posCardHTML() + printerCardHTML() + hoursCardHTML() + holidayCardHTML() + teamCardHTML() + planCardHTML();
          body.appendChild(h);
        }
        if(typeof ownerSettings !== 'undefined' && ownerSettings.tips && !document.getElementById('fpTipInline')){
          var rows = body.querySelectorAll('.hrow'); var tipRow = null;
          for(var i = 0; i < rows.length; i++){ var bt = rows[i].querySelector('button.tgl'); if(bt && /toggleSetting\(['"]tips['"]\)/.test(bt.getAttribute('onclick') || '')){ tipRow = rows[i]; break; } }
          if(tipRow){ var d = document.createElement('div'); d.id = 'fpTipInline'; d.className = 'hrow col'; d.innerHTML = tipInlineHTML(); tipRow.parentNode.insertBefore(d, tipRow.nextSibling); }
        }
      }
      if(t === 'payouts' && !document.getElementById('fpBankCard')){
        var b = document.createElement('div'); b.id = 'fpBankCard'; b.innerHTML = bankCardHTML();
        body.insertBefore(b, body.firstChild);
      }
      if(t === 'overview' && r && !document.getElementById('fpOverviewExtras')){
        var hero = body.querySelector('.ohero');
        var to = document.createElement('div'); to.innerHTML = testOrderHTML(r);
        if(hero && hero.parentNode){ hero.parentNode.insertBefore(to.firstChild, hero.nextSibling); }
        else { body.insertBefore(to.firstChild, body.firstChild); }
        var ex = document.createElement('div'); ex.id = 'fpOverviewExtras';
        ex.innerHTML = checklistHTML(r) + trendHTML(r);
        body.appendChild(ex);
      }
    }catch(e){}
  };

  /* ================= read-only info sheet (reuses the form shell) ================= */
  function fpInfo(title, sub, bodyHTML){
    buildSheet(); formCb = null;
    document.getElementById('fpFormTitle').textContent = title || '';
    document.getElementById('fpFormSub').textContent = sub || '';
    var b = document.getElementById('fpFormBody'); b.innerHTML = bodyHTML; b.setAttribute('data-keys', '');
    document.getElementById('fpFormSave').textContent = 'Done';
    var back = document.getElementById('fpFormBack'); back.style.display = 'block';
    requestAnimationFrame(function(){ back.style.opacity = '1'; document.getElementById('fpFormSheet').classList.add('open'); });
  }
  window.fpCloseInfo = function(){ closeForm(); };

  /* ================= Settings build-out: business hours + team/roles ================= */
  window.fpHours = window.fpHours || {};
  var DAYS = [['mon','Mon'],['tue','Tue'],['wed','Wed'],['thu','Thu'],['fri','Fri'],['sat','Sat'],['sun','Sun']];
  function hoursOf(r){
    if(!fpHours[r.id]) fpHours[r.id] = { mon:'11:00am–9:00pm', tue:'11:00am–9:00pm', wed:'11:00am–9:00pm', thu:'11:00am–9:00pm', fri:'11:00am–10:00pm', sat:'11:00am–10:00pm', sun:'12:00pm–8:00pm' };
    return fpHours[r.id];
  }
  function hoursCardHTML(){
    var r = R(ownerRest) || { id:ownerRest }; var h = hoursOf(r);
    return '<div class="fppos"><div class="fppos-h">Business hours</div>'
      + DAYS.map(function(d){ return '<div class="fppos-row"><div class="pn">' + d[1] + '</div><span style="font-size:12.5px;color:var(--muted)">' + esc(h[d[0]] || 'Closed') + '</span></div>'; }).join('')
      + '<div class="fppos-row"><div class="pn" style="font-weight:600;color:var(--muted);font-size:12px">Pickup ordering follows these hours</div><button class="fppos-btn" onclick="fpEditHours(\'' + r.id + '\')">Edit</button></div>'
      + '</div>';
  }
  window.fpEditHours = function(rid){
    var r = R(rid); if(!r) return; var h = hoursOf(r);
    fpForm({ title:'Business hours', sub:'Enter hours, or type “Closed”', fields: DAYS.map(function(d){ return { key:d[0], label:d[1], type:'text', value:(h[d[0]] || '') }; }) }, function(v){
      DAYS.forEach(function(d){ h[d[0]] = (v[d[0]] || '').trim() || 'Closed'; });
      showToast('Hours updated'); openOwner(ownerRest, 'settings');
    });
  };
  function teamCardHTML(){
    return '<div class="fppos"><div class="fppos-h">Team &amp; roles <span>optional</span></div>'
      + '<div class="fppos-row"><div class="pn">You (Owner)<small>Full access · billing, payouts, menu, reports</small></div><span class="fppos-tag">Owner</span></div>'
      + '<div class="fppos-row"><div class="pn">Manager<small>Menu, hours, orders, customers — no payouts or billing</small></div><button class="fppos-btn" onclick="fpInviteStaff(\'Manager\')">Invite</button></div>'
      + '<div class="fppos-row"><div class="pn">Cashier / line<small>Orders queue only</small></div><button class="fppos-btn" onclick="fpInviteStaff(\'Cashier\')">Invite</button></div>'
      + '<div class="fppos-note">Role-based access, per location. In production invites go out by email and each person signs in to only what their role allows.</div>'
      + '</div>';
  }
  window.fpInviteStaff = function(role){
    fpForm({ title:'Invite ' + role, fields:[{ key:'email', label:'Their email', type:'text', placeholder:'name@email.com' }] }, function(v){
      var e = (v.email || '').trim(); if(!e) return; showToast('Invite sent to ' + e + ' (' + role + ')');
    });
  };

  /* ================= Settings: holiday hours (set & forget) ================= */
  window.fpHoliday = window.fpHoliday || {};
  function holidayDefaults(){
    return [
      { name:'New Year’s Day', date:'Jan 1', status:'closed' },
      { name:'Easter Sunday', date:'Spring', status:'closed' },
      { name:'Memorial Day', date:'Late May', status:'open' },
      { name:'Independence Day', date:'Jul 4', status:'open' },
      { name:'Labor Day', date:'Early Sep', status:'open' },
      { name:'Thanksgiving', date:'Late Nov', status:'closed' },
      { name:'Christmas Eve', date:'Dec 24', status:'custom', hours:'11:00am–4:00pm' },
      { name:'Christmas Day', date:'Dec 25', status:'closed' },
      { name:'New Year’s Eve', date:'Dec 31', status:'custom', hours:'11:00am–6:00pm' }
    ];
  }
  function holidaysOf(r){ if(!fpHoliday[r.id]) fpHoliday[r.id] = holidayDefaults(); return fpHoliday[r.id]; }
  function holidayPill(h){
    if(h.status === 'closed') return '<span class="fppos-tag" style="color:#C44A28;background:#FBEAE5;border-color:#E1B8AD">Closed</span>';
    if(h.status === 'custom') return '<span class="fppos-tag" style="color:#9C6206;background:#FCEFD9;border-color:#EAD3A0">' + esc(h.hours || 'Reduced') + '</span>';
    return '<span class="fppos-tag" style="color:var(--muted);background:#F3ECE2;border-color:var(--line)">Open</span>';
  }
  function holidayCardHTML(){
    var r = R(ownerRest) || { id:ownerRest }; var hs = holidaysOf(r);
    var closed = hs.filter(function(h){ return h.status === 'closed'; }).length;
    return '<div class="fppos"><div class="fppos-h">Holiday hours <span' + GREENBADGE + '>set &amp; forget</span></div>'
      + hs.map(function(h, i){ return '<div class="fppos-row" style="cursor:pointer" onclick="fpHolidayEdit(\'' + r.id + '\',' + i + ')"><div class="pn">' + esc(h.name) + '<small>' + esc(h.date) + '</small></div>' + holidayPill(h) + '</div>'; }).join('')
      + '<div class="fppos-row" style="border-top:0;padding-top:12px"><div class="pn" style="color:var(--muted);font-weight:600;font-size:12px">' + closed + ' days closed · pre-filled with what most restaurants do</div><button class="fppos-btn" onclick="fpHolidayReset(\'' + r.id + '\')">Reset to typical</button></div>'
      + '<div class="fppos-note">Set these once and forget them. On each holiday your page automatically shows closed or your holiday hours, and ordering pauses for that day. Tap any holiday to change it.</div>'
      + '</div>';
  }
  window.fpHolidayEdit = function(rid, idx){
    var r = R(rid); if(!r) return; var h = holidaysOf(r)[idx]; if(!h) return;
    fpForm({ title:h.name, sub:'Holiday hours', fields:[
      { key:'status', label:'On this day', type:'select', options:[
        { label:'Open — normal hours', value:'open' },
        { label:'Closed', value:'closed' },
        { label:'Custom hours', value:'custom' }
      ], value:h.status },
      { key:'hours', label:'Custom hours (used if “Custom” above)', type:'text', value:(h.hours || '11:00am–4:00pm'), placeholder:'e.g. 11:00am–4:00pm' }
    ]}, function(v){
      h.status = v.status || 'open';
      if(h.status === 'custom') h.hours = (v.hours || '').trim() || h.hours || 'Reduced hours';
      showToast(h.name + ' updated'); openOwner(ownerRest, 'settings');
    });
  };
  window.fpHolidayReset = function(rid){ fpHoliday[rid] = holidayDefaults(); showToast('Holiday hours reset to typical'); openOwner(ownerRest, 'settings'); };

  /* ================= Grow build-out: actionable cards + real QR ================= */
  function growHTML2(r){
    var url = 'fullplate.app/r/' + r.id;
    function card(ic, t, b, onclick){
      return '<div class="growcard" style="cursor:pointer" onclick="' + onclick + '"><div class="gci">' + ic + '</div><div><b>' + t + '</b><span>' + b + '</span></div></div>';
    }
    return '<div class="ohero">'
      + '<div class="lbl">Your commission-free ordering link</div>'
      + '<div class="growlink"><span class="growurl">' + url + '</span><button class="growcopy" onclick="fpCopyOrderLink(\'' + r.id + '\')">Copy</button></div>'
      + '<div class="osub">Put this anywhere your customers already are. Every order through it is 0% commission, and the customer is yours.</div>'
      + '</div>'
      + '<div class="section-label" style="padding-left:0">Drive your own orders</div>'
      + '<div class="growgrid">'
      + card('🔎', 'Add an Order button to Google', 'Turn on “Order online” on your Google Business Profile so searchers order direct.', 'fpGrowGoogle(\'' + r.id + '\')')
      + card('🌐', 'Embed on your website', 'Drop FullPlate ordering onto your own site so diners never leave it.', 'fpShowEmbed(\'' + r.id + '\')')
      + card('📲', 'Share to social', 'Post your link to Instagram and Facebook with a ready-to-go caption.', 'fpGrowSocial(\'' + r.id + '\')')
      + card('🪧', 'QR table tents & flyers', 'Generate a printable QR for tables, windows, and to-go bags.', 'fpShowQR(\'' + r.id + '\')')
      + '</div>'
      + '<div class="realnote" style="margin-top:14px">FullPlate turns the customers you already have into direct, commission-free orders. You bring the demand, you keep 100%. As more spots near you join FullPlate, the local marketplace sends extra discovery on top.</div>';
  }
  window.fpGrowGoogle = function(rid){
    var r = R(rid); if(!r) return; var url = 'https://fullplate.app/r/' + r.id;
    var body = '<div style="font-size:13px;line-height:1.6;color:var(--ink)">In production FullPlate adds an <b>Order online</b> link to your Google Business Profile through Google’s food-ordering setup, so anyone who finds you on Search or Maps orders direct, commission-free.</div>'
      + '<div class="embsnippet" style="margin-top:10px">' + url + '</div>'
      + '<button class="embcopybtn" onclick="(navigator.clipboard&&navigator.clipboard.writeText(\'' + url + '\'));showToast(\'Order link copied\')">Copy order link</button>';
    fpInfo('Add to Google', r.name, body);
  };
  window.fpGrowSocial = function(rid){
    var r = R(rid); if(!r) return; var url = 'https://fullplate.app/r/' + r.id;
    var tag = (r.cuisine || 'local').replace(/[^a-z0-9]/gi, '');
    var cap = 'Skip the delivery fees 🙌 Order ' + r.name + ' direct — same great food, and we keep 100%. Order here: ' + url + ' #orderlocal #' + tag;
    var body = '<div class="fppos-note" style="margin:0 0 8px">Ready-to-post caption — edit freely:</div>'
      + '<textarea class="fptextarea" id="fpCapBox" style="min-height:120px">' + esc(cap) + '</textarea>'
      + '<button class="embcopybtn" style="margin-top:10px" onclick="(navigator.clipboard&&navigator.clipboard.writeText(document.getElementById(\'fpCapBox\').value));showToast(\'Caption copied\')">Copy caption</button>';
    fpInfo('Share to social', r.name, body);
  };
  function withQR(cb){
    if(window.QRCode) return cb();
    var ex = document.getElementById('fpQRLib');
    if(ex){ var iv = setInterval(function(){ if(window.QRCode){ clearInterval(iv); cb(); } }, 150); setTimeout(function(){ clearInterval(iv); if(!window.QRCode) cb(); }, 6000); return; }
    var s = document.createElement('script'); s.id = 'fpQRLib'; s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    s.onload = function(){ cb(); }; s.onerror = function(){ cb(); }; document.head.appendChild(s);
  }
  window.fpShowQR = function(rid){
    var r = R(rid); if(!r) return; var url = 'https://fullplate.app/r/' + r.id;
    var body = '<div id="fpQRBox" style="display:flex;justify-content:center;align-items:center;min-height:180px;padding:8px 0"></div>'
      + '<div class="embsnippet" style="text-align:center">' + url + '</div>'
      + '<button class="embcopybtn" id="fpQRDl" style="margin-top:10px">Download QR (PNG)</button>'
      + '<div class="fppos-note">Print it on table tents, the window, and to-go bags. Scanning opens your commission-free ordering page.</div>';
    fpInfo('Your order QR', r.name, body);
    withQR(function(){
      var box = document.getElementById('fpQRBox'); if(!box) return; box.innerHTML = '';
      if(window.QRCode){
        try{ new QRCode(box, { text:url, width:180, height:180, correctLevel:QRCode.CorrectLevel.M }); }catch(e){ box.textContent = 'QR unavailable'; }
        var dl = document.getElementById('fpQRDl');
        if(dl) dl.onclick = function(){
          var cv = box.querySelector('canvas'); var data = cv ? cv.toDataURL('image/png') : ((box.querySelector('img') || {}).src);
          if(!data) return; var a = document.createElement('a'); a.href = data; a.download = (r.name || 'order').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '-qr.png';
          document.body.appendChild(a); a.click(); a.remove(); showToast('QR downloaded');
        };
      } else { box.textContent = 'QR needs a connection to generate.'; }
    });
  };

  /* ================= Customers build-out: segments, detail, CSV export ================= */
  window.fpCust = window.fpCust || {};
  function custList(r){
    if(fpCust[r.id]) return fpCust[r.id];
    var seed = [
      { n:'Maria L.', o:12, lastDays:2,  ltv:184, ph:'(602) 555-0142' },
      { n:'Devin S.', o:9,  lastDays:3,  ltv:132, ph:'(602) 555-0188' },
      { n:'James K.', o:7,  lastDays:5,  ltv:98,  ph:'(480) 555-0119' },
      { n:'Priya R.', o:5,  lastDays:9,  ltv:71,  ph:'(602) 555-0173' },
      { n:'Tomas V.', o:3,  lastDays:1,  ltv:46,  ph:'(623) 555-0150' },
      { n:'Ana G.',   o:4,  lastDays:26, ltv:56,  ph:'(480) 555-0107' },
      { n:'Kevin M.', o:2,  lastDays:33, ltv:28,  ph:'(602) 555-0164' }
    ];
    seed.forEach(function(c){
      c.seg = c.o >= 6 ? 'regulars' : (c.lastDays >= 21 ? 'lapsed' : 'new');
      c.last = c.lastDays === 1 ? 'yesterday' : (c.lastDays + ' days ago');
      c.email = c.n.toLowerCase().replace(/[^a-z]/g, '') + '@example.com';
    });
    fpCust[r.id] = seed; return seed;
  }
  function segLabel(s){ return s === 'regulars' ? 'regular' : (s === 'lapsed' ? 'lapsed' : 'new'); }
  function custHTML2(r){
    var list = custList(r);
    var seg = window.fpCustSeg || 'all';
    var counts = { all:list.length, regulars:0, new:0, lapsed:0 };
    list.forEach(function(c){ counts[c.seg]++; });
    var total = Math.max(60, Math.round((r.reviews || 200) * 0.85));
    var repeat = Math.max(34, Math.min(72, 36 + (r.rating ? Math.round((r.rating - 4) * 34) : 12)));
    var month = Math.round(total * 0.14);
    var shown = list.filter(function(c){ return seg === 'all' || c.seg === seg; });
    var segrow = [['all','All'],['regulars','Regulars'],['new','New'],['lapsed','Lapsed']].map(function(s){
      return '<button class="kindtab ' + (seg === s[0] ? 'on' : '') + '" onclick="fpSetSeg(\'' + s[0] + '\')">' + s[1] + ' (' + counts[s[0]] + ')</button>';
    }).join('');
    return '<div class="ostatrow">'
      + '<div class="ostat"><b>' + total.toLocaleString() + '</b><span>customers</span></div>'
      + '<div class="ostat"><b>' + repeat + '%</b><span>repeat rate</span></div>'
      + '<div class="ostat"><b>' + month + '</b><span>new this month</span></div></div>'
      + '<div class="ownednote">✓ You own this list. On a delivery app the customer belongs to the app. On FullPlate they are yours, with contact info, for loyalty and marketing.</div>'
      + '<div class="kindrow" style="padding:8px 0 2px">' + segrow + '</div>'
      + shown.map(function(c){ return '<div class="orow" style="cursor:pointer" onclick="fpCustDetail(\'' + r.id + '\',' + list.indexOf(c) + ')"><div><b>' + esc(c.n) + '</b><span>' + c.o + ' orders · last ' + esc(c.last) + ' · ' + segLabel(c.seg) + '</span></div><div class="okept">$' + c.ltv + ' lifetime</div></div>'; }).join('')
      + '<div style="display:flex;gap:8px;margin-top:12px">'
      + '<button class="addbtn2" style="margin:0" onclick="fpSendBlast(\'' + r.id + '\')">✦ Send a promo</button>'
      + '<button class="addbtn2" style="margin:0" onclick="fpExportCustomers(\'' + r.id + '\')">⤓ Export CSV</button>'
      + '</div>'
      + '<div class="realnote" style="margin-top:10px">Email and SMS campaigns, win-back offers, and loyalty all run on the list you own here. Tap a customer for their history. This is the retention engine the delivery apps keep from you.</div>';
  }
  window.fpSetSeg = function(s){ window.fpCustSeg = s; openOwner(ownerRest, 'customers'); };
  window.fpCustDetail = function(rid, idx){
    var r = R(rid); if(!r) return; var c = custList(r)[idx]; if(!c) return;
    var body = '<div style="font-size:13.5px;line-height:1.7;color:var(--ink)">'
      + '<div><b>' + esc(c.n) + '</b> · ' + segLabel(c.seg) + '</div>'
      + '<div style="color:var(--muted)">' + c.o + ' orders · $' + c.ltv + ' lifetime · last order ' + esc(c.last) + '</div>'
      + '<div style="color:var(--muted)">' + esc(c.ph) + ' · ' + esc(c.email) + '</div></div>'
      + '<div class="fppos-note" style="margin:10px 0 0">You own this contact. Reach them directly, commission-free.</div>'
      + '<div style="display:flex;gap:8px;margin-top:12px">'
      + '<button class="fppos-btn" style="flex:1" onclick="showToast(\'Demo: SMS composer opens for ' + esc(c.n) + '\');fpCloseInfo()">Text a promo</button>'
      + '<button class="fppos-btn" style="flex:1" onclick="showToast(\'Demo: email composer opens for ' + esc(c.n) + '\');fpCloseInfo()">Email</button>'
      + '</div>';
    fpInfo('Customer', c.n, body);
  };
  window.fpExportCustomers = function(rid){
    var r = R(rid); if(!r) return; var list = custList(r);
    var rows = [['Name','Orders','Last order','Lifetime $','Segment','Phone','Email']].concat(list.map(function(c){ return [c.n, c.o, c.last, c.ltv, c.seg, c.ph, c.email]; }));
    var csv = rows.map(function(row){ return row.map(function(x){ var s = String(x); return /[",\n]/.test(s) ? ('"' + s.replace(/"/g, '""') + '"') : s; }).join(','); }).join('\n');
    try{
      var blob = new Blob([csv], { type:'text/csv' }); var url = URL.createObjectURL(blob);
      var a = document.createElement('a'); a.href = url; a.download = (r.brandName || r.name || 'customers').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '-customers.csv';
      document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 500);
      showToast('Exported ' + list.length + ' customers to CSV');
    }catch(e){ showToast('Export ready (' + list.length + ' customers)'); }
  };

  /* route the Grow + Customers tabs to the built-out versions */
  var _ownerBody = window.ownerBody;
  window.ownerBody = function(r){
    if(typeof ownerTab !== 'undefined' && ownerTab === 'grow') return growHTML2(r);
    if(typeof ownerTab !== 'undefined' && ownerTab === 'customers') return custHTML2(r);
    return (typeof _ownerBody === 'function') ? _ownerBody(r) : '';
  };

  /* ================= pricing + persuasion on the onboarding success screen ================= */
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
          var bw = document.createElement('div'); bw.style.cssText = 'display:flex;gap:8px;margin-top:10px';
          bw.innerHTML = '<button class="obbtn2" style="margin:0" onclick="fpSavingsCalc()">See your savings</button><button class="obbtn2" style="margin:0" onclick="fpCompare()">How we compare</button>';
          succ.appendChild(bw);
        }
      }catch(e){}
    });
    mo.observe(moTarget, { childList:true, subtree:true });
  }

  /* ================= owner persuasion: savings calc, comparison, proof ================= */
  var PROOF = [
    ['~70%', 'of diners say they prefer ordering direct from the restaurant, not a third-party app'],
    ['30–40%', 'of each order is what delivery apps take once commission, fees, and promos stack up'],
    ['$0', 'is what FullPlate takes in commission — you keep 100% and the customer is yours']
  ];
  function proofStripHTML(){
    return '<div style="display:flex;flex-direction:column;gap:8px;margin:0 0 12px">'
      + PROOF.map(function(p){ return '<div class="fppos" style="margin:0;padding:11px 13px"><div style="display:flex;gap:11px;align-items:baseline"><b style="font-size:18px;color:var(--good);white-space:nowrap">' + p[0] + '</b><span style="font-size:12px;color:var(--muted);line-height:1.4">' + p[1] + '</span></div></div>'; }).join('')
      + '</div>';
  }
  window.fpSavingsCalc = function(){
    var body = proofStripHTML()
      + '<div class="fpfield"><label class="oblabel">Orders per month</label><input class="obinput" id="fpcOrders" type="number" inputmode="numeric" value="600" oninput="fpCalcRun()"></div>'
      + '<div class="fpfield"><label class="oblabel">Average order ($)</label><input class="obinput" id="fpcAov" type="number" inputmode="decimal" value="22" oninput="fpCalcRun()"></div>'
      + '<div class="fpfield"><label class="oblabel">FullPlate plan</label><select class="obselect" id="fpcPlan" onchange="fpCalcRun()"><option value="99">Starter — $99/mo</option><option value="199">Growth — $199/mo</option></select></div>'
      + '<div id="fpcOut"></div>'
      + '<button class="embcopybtn" style="margin-top:12px" onclick="fpCompare()">See how FullPlate compares ›</button>'
      + '<div class="fppos-note" style="text-align:center">No contract, cancel anytime · we build your page from your website for you.</div>';
    fpInfo('See your savings', 'Plug in your numbers', body);
    fpCalcRun();
  };
  window.fpCalcRun = function(){
    var g = function(id){ var el = document.getElementById(id); return el ? el.value : ''; };
    var o = Math.max(0, parseFloat(g('fpcOrders')) || 0);
    var a = Math.max(0, parseFloat(g('fpcAov')) || 0);
    var plan = parseFloat(g('fpcPlan')) || 99;
    var gross = o * a;
    var appCost = gross * 0.30;
    var fpCost = plan + gross * 0.029 + o * 0.30;
    var save = appCost - fpCost;
    var out = document.getElementById('fpcOut'); if(!out) return;
    out.innerHTML = '<div class="savecard" style="margin:6px 0 0"><h4>✓ You keep about <span class="big">$' + Math.max(0, Math.round(save)).toLocaleString() + '/mo</span></h4>'
      + '<p>' + o.toLocaleString() + ' orders at $' + a.toFixed(2) + ' is about $' + Math.round(gross).toLocaleString() + '/mo in sales. On delivery apps that costs roughly <b>$' + Math.round(appCost).toLocaleString() + '</b> in commission and fees. On FullPlate your only costs are the $' + plan + ' plan plus card processing at cost (about $' + Math.round(fpCost).toLocaleString() + '/mo) — roughly <b>$' + Math.max(0, Math.round(save * 12)).toLocaleString() + ' a year</b> back in your pocket.</p></div>'
      + '<div class="fppos-note">Uses a 30% all-in delivery-app cost (commission + fees + promos), the defensible mid-range. Your real number depends on your delivery mix.</div>';
  };
  window.fpCompare = function(){
    var rowsT = [
      ['', 'FullPlate', 'DoorDash / Uber', 'ChowNow'],
      ['Commission per order', '0%', '15–30%', '0%'],
      ['Who owns the customer', 'You', 'The app', 'You'],
      ['AI ordering (chat / voice)', 'Yes', 'Limited', 'No'],
      ['Ordering on your own site', 'Yes', 'No', 'Yes'],
      ['Built from your website', 'Yes', '—', 'Self-serve'],
      ['Monthly cost', '$99–199', 'Commission', '~$199+']
    ];
    var tbl = '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">'
      + rowsT.map(function(rw, i){
          var cells = rw.map(function(c, ci){
            var head = (i === 0 || ci === 0);
            var fp = ci === 1;
            var style = 'padding:8px 8px;border-bottom:1px solid var(--line);text-align:' + (ci === 0 ? 'left' : 'center') + ';'
              + (head && !fp ? 'font-weight:800;color:var(--ink);' : 'color:var(--muted);')
              + (fp ? 'color:var(--good);font-weight:800;background:#F4FBF4;' : '');
            return '<td style="' + style + '">' + c + '</td>';
          }).join('');
          return '<tr>' + cells + '</tr>';
        }).join('')
      + '</table></div>'
      + '<div class="fppos-note">vs delivery apps, you keep 100% and own the customer. vs ChowNow (also commission-free), FullPlate adds AI ordering, costs less, and we build your page from your website for you.</div>';
    fpInfo('How FullPlate compares', 'Independent restaurants, US', tbl);
  };

  /* ================= owner Overview: test order, go-live checklist, trend ================= */
  function testOrderHTML(r){
    return '<div class="ai-launch" style="margin:14px 0 0" onclick="openRestaurant(\'' + r.id + '\')"><div class="spark">▶</div><div class="t"><b>Try it: place a test order</b><span>See exactly what your customers do — and watch it land in your queue.</span></div><div class="go">›</div></div>';
  }
  function checklistHTML(r){
    var steps = [
      { done:true, label:'Build & publish your page' },
      { done:!!(window.fpBank && fpBank.connected), label:'Connect your bank for payouts', tab:'payouts' },
      { done:!!(window.fpPrinter && fpPrinter.connected), label:'Connect a printer or tablet', tab:'settings' },
      { done:false, label:'Share your order link', tab:'grow' },
      { done:false, label:'Place a test order', act:'order' }
    ];
    var left = steps.filter(function(s){ return !s.done; }).length;
    if(left === 0) return '<div class="fppos" style="margin-top:14px"><div class="fppos-h">✓ You’re all set</div><div class="fppos-note">Bank, printer, link, and a test order are done. New orders print and chime.</div></div>';
    return '<div class="fppos" style="margin-top:14px"><div class="fppos-h">Finish setup <span>' + left + ' left</span></div>'
      + steps.map(function(s){
          var act = s.done ? '' : (s.act === 'order' ? ('onclick="openRestaurant(\'' + r.id + '\')"') : ('onclick="openOwner(\'' + r.id + '\',\'' + s.tab + '\')"'));
          return '<div class="fppos-row" style="cursor:' + (s.done ? 'default' : 'pointer') + '" ' + act + '><div class="pn" style="' + (s.done ? 'color:var(--muted);font-weight:600' : '') + '">' + (s.done ? '✓ ' : '○ ') + s.label + '</div>' + (s.done ? '' : '<span style="color:var(--brand);font-weight:800;font-size:18px">›</span>') + '</div>';
        }).join('')
      + '</div>';
  }
  function hashId(s){ var h = 0; s = String(s); for(var i = 0; i < s.length; i++){ h = (h * 31 + s.charCodeAt(i)) >>> 0; } return h; }
  function trendHTML(r){
    var seed = hashId(r.id), vals = [], base = 40 + (seed % 30);
    for(var i = 0; i < 30; i++){ var d = ((seed >> (i % 16)) % 17) - 6; var weekend = (i % 7 === 5 || i % 7 === 6) ? 14 : 0; vals.push(Math.max(8, base + d + weekend + Math.round(i * 0.5))); }
    var max = Math.max.apply(null, vals), W = 320, H = 64, bw = W / vals.length;
    var bars = vals.map(function(v, i){ var bh = Math.round((v / max) * (H - 6)); return '<rect x="' + (i * bw + 1).toFixed(1) + '" y="' + (H - bh) + '" width="' + (bw - 2).toFixed(1) + '" height="' + bh + '" rx="1.5" fill="#2E7D52" opacity="' + (0.45 + 0.55 * (v / max)).toFixed(2) + '"></rect>'; }).join('');
    var total = vals.reduce(function(a, b){ return a + b; }, 0);
    return '<div class="fppos" style="margin-top:14px"><div class="fppos-h">Direct orders, last 30 days <span' + GREENBADGE + '>+' + (8 + seed % 12) + '%</span></div>'
      + '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" style="width:100%;height:64px;display:block;margin:6px 0 2px">' + bars + '</svg>'
      + '<div class="fppos-note">' + total.toLocaleString() + ' orders this month, all commission-free. Trend is illustrative for this location.</div></div>';
  }

  /* ================= diner order-ahead (scheduled pickup) ================= */
  window.fpPickup = window.fpPickup || 'ASAP';
  var FP_SLOTS = ['ASAP', '5:30pm', '6:00pm', '6:30pm', '7:00pm', '7:30pm'];
  window.fpSetPickup = function(t){ window.fpPickup = t; if(typeof openCheckout === 'function') openCheckout(); };
  function pickupRowHTML(){
    return '<div class="tiplabel">Pickup time</div><div class="tiprow" id="fpPickRow">'
      + FP_SLOTS.map(function(t){ return '<button class="tipbtn ' + (window.fpPickup === t ? 'on' : '') + '" onclick="fpSetPickup(\'' + t + '\')">' + t + '</button>'; }).join('')
      + '</div>';
  }
  var _placeOrder = window.placeOrder;
  window.placeOrder = function(){
    if(typeof _placeOrder === 'function') _placeOrder.apply(this, arguments);
    try{
      if(window.fpPickup && window.fpPickup !== 'ASAP'){
        var rl = document.querySelector('#view-done .readyline');
        if(rl){ rl.innerHTML = rl.innerHTML.replace(/◷ <b>Estimated ready in[^<]*<\/b>/, '◷ <b>Scheduled pickup at ' + esc(window.fpPickup) + '</b>'); }
      }
    }catch(e){}
    window.fpPickup = 'ASAP';
  };

  /* a "See your savings" button on the home owner banner */
  setTimeout(function(){
    try{
      var bn = document.querySelector('.obbanner');
      if(bn && !document.getElementById('fpCalcBtn')){
        var btn = document.createElement('button'); btn.id = 'fpCalcBtn'; btn.className = 'obb-btn';
        btn.style.background = '#fff'; btn.style.color = '#2B1E17';
        btn.textContent = 'See your savings';
        btn.onclick = function(e){ e.stopPropagation(); fpSavingsCalc(); };
        bn.appendChild(btn);
      }
    }catch(e){}
  }, 140);

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
