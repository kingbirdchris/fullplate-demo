/* FullPlate refinement layer. Loaded LAST, after compete.js. Owner-console depth
   and diner-side polish, all by overriding globals so the core files are never
   edited. Adds: realistic embed preview, photo upload, promo scheduling + push,
   richer Reviews, team management, smart prep-time, and stronger
   pause-state visibility for diners. Demo-only. */
(function(){
  if(window.__fpRefine) return; window.__fpRefine = true;

  function R(id){ try{ return RESTAURANTS.find(function(x){ return x.id === id; }); }catch(e){ return null; } }
  function rEsc(s){ return (typeof esc === 'function') ? esc(s) : String(s == null ? '' : s); }
  function rToast(m){ try{ showToast(m); }catch(e){} }
  function money(n){ return '$' + (Math.round(n * 100) / 100).toFixed(2); }
  function rHash(s){ var h = 0; s = String(s); for(var i = 0; i < s.length; i++){ h = (h * 31 + s.charCodeAt(i)) >>> 0; } return h; }
  function allItems(r){ var out = []; try{ (r.menu || []).forEach(function(c){ c.items.forEach(function(i){ out.push(i); }); }); }catch(e){} return out; }
  var GB = ' style="background:#EAF5EE;color:#1F6B43;border:1px solid #CDEBD0"';

  /* ---------------- state ---------------- */
  window.fpTeam = window.fpTeam || [{ name:'You', email:'owner@yourrestaurant.com', role:'Owner', status:'owner' }];
  window.fpPrepWeight = window.fpPrepWeight || {};   /* itemId -> quick|standard|slow */
  window.fpRvSeen = window.fpRvSeen || {};           /* rid -> {idx:true} */
  window.fpRvMeta = window.fpRvMeta || {};           /* rid -> {idx:{assignee}} */
  window.fpRvFilter = window.fpRvFilter || 'all';
  window.fpPromoMeta = window.fpPromoMeta || {};     /* code -> {start,end,audience,channel} */

  /* ---------------- form / info sheet (supports date + file) ---------------- */
  function rfBuild(){
    if(document.getElementById('rfSheet')) return;
    var b = document.createElement('div'); b.className = 'sheet-backdrop'; b.id = 'rfBack'; b.onclick = rfClose;
    var s = document.createElement('div'); s.className = 'sheet modsheet'; s.id = 'rfSheet'; s.setAttribute('role','dialog');
    s.innerHTML = '<div class="sheet-head"><div class="ht"><b id="rfTitle"></b><span id="rfSub"></span></div><button class="close" id="rfX" aria-label="Close">✕</button></div>'
      + '<div class="modbody" id="rfBody" style="padding:14px 16px 16px"></div><div class="modfoot"><button class="paybtn" id="rfSave">Save</button></div>';
    document.body.appendChild(b); document.body.appendChild(s);
    document.getElementById('rfX').onclick = rfClose;
  }
  var rfCb = null, rfFields = [];
  function rForm(opts, cb){
    rfBuild(); rfCb = cb || null; rfFields = opts.fields || [];
    document.getElementById('rfTitle').textContent = opts.title || '';
    document.getElementById('rfSub').textContent = opts.sub || '';
    document.getElementById('rfBody').innerHTML = rfFields.map(rfFieldHTML).join('');
    var save = document.getElementById('rfSave'); save.textContent = opts.save || 'Save'; save.style.display = ''; save.onclick = rfSubmit;
    var bk = document.getElementById('rfBack'); bk.style.display = 'block';
    requestAnimationFrame(function(){ bk.style.opacity = '1'; document.getElementById('rfSheet').classList.add('open'); });
  }
  function rInfo(title, sub, html){
    rfBuild(); rfCb = null; rfFields = [];
    document.getElementById('rfTitle').textContent = title || '';
    document.getElementById('rfSub').textContent = sub || '';
    document.getElementById('rfBody').innerHTML = html;
    var save = document.getElementById('rfSave'); save.textContent = 'Done'; save.style.display = ''; save.onclick = rfClose;
    var bk = document.getElementById('rfBack'); bk.style.display = 'block';
    requestAnimationFrame(function(){ bk.style.opacity = '1'; document.getElementById('rfSheet').classList.add('open'); });
  }
  function rfClose(){ rfCb = null; var s = document.getElementById('rfSheet'); if(s) s.classList.remove('open'); var b = document.getElementById('rfBack'); if(b){ b.style.opacity = '0'; setTimeout(function(){ b.style.display = 'none'; }, 200); } }
  window.rfClose = rfClose;
  function rfFieldHTML(f){
    var id = 'rff_' + f.key; var val = (f.value != null ? String(f.value) : '');
    var v = val.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
    if(f.type === 'note') return '<div class="fppos-note" style="margin:2px 0 10px">' + f.label + '</div>';
    var lbl = '<label for="' + id + '" style="display:block;font-size:12px;font-weight:700;color:var(--muted);margin:12px 0 5px">' + f.label + '</label>';
    var box = 'width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:11px;font-size:14px;background:#fff;color:var(--ink)';
    var ctrl;
    if(f.type === 'select'){
      ctrl = '<select id="' + id + '" style="' + box + '">' + (f.options || []).map(function(o){ var on = (String(o.value) === val) ? ' selected' : ''; return '<option value="' + String(o.value).replace(/"/g,'&quot;') + '"' + on + '>' + o.label + '</option>'; }).join('') + '</select>';
    } else if(f.type === 'textarea'){
      ctrl = '<textarea id="' + id + '" style="' + box + ';min-height:74px" placeholder="' + (f.placeholder || '') + '">' + v + '</textarea>';
    } else if(f.type === 'file'){
      ctrl = '<input id="' + id + '" type="file" accept="' + (f.accept || 'image/*') + '" style="width:100%;font-size:13px">';
    } else {
      var t = (f.type === 'number') ? 'number' : (f.type === 'date' ? 'date' : 'text');
      var extra = (f.type === 'number') ? (' inputmode="decimal"' + (f.step ? ' step="' + f.step + '"' : '') + (f.min != null ? ' min="' + f.min + '"' : '')) : '';
      ctrl = '<input id="' + id + '" type="' + t + '" value="' + v + '" placeholder="' + (f.placeholder || '') + '" style="' + box + '"' + extra + '>';
    }
    return '<div>' + lbl + ctrl + '</div>';
  }
  function rfSubmit(){
    var out = {}, fileField = null;
    rfFields.forEach(function(f){ if(f.type === 'note') return; var el = document.getElementById('rff_' + f.key); if(!el) return; if(f.type === 'file'){ fileField = f; out[f.key] = ''; } else out[f.key] = el.value; });
    function done(){ var cb = rfCb; rfClose(); if(cb) cb(out); }
    if(fileField){ var el = document.getElementById('rff_' + fileField.key); var file = el && el.files && el.files[0]; if(file){ var rd = new FileReader(); rd.onload = function(){ out[fileField.key] = rd.result; done(); }; rd.onerror = done; try{ rd.readAsDataURL(file); }catch(e){ done(); } return; } }
    done();
  }

  /* ====================================================================== */
  /* 1. EMBED ON YOUR SITE — realistic embedded ordering widget             */
  /* ====================================================================== */
  window.onboardEmbed = function(id){
    var r = R(id); if(!r) return;
    var domain = (r.name || 'yourrestaurant').toLowerCase().replace(/[^a-z0-9]+/g,'').slice(0,18) + '.com';
    var its = allItems(r).filter(function(i){ return i.price > 0; }).slice(0, 4);
    if(its.length < 2) its = allItems(r).slice(0, 4);
    var snippet = '<!-- FullPlate ordering (0% commission to FullPlate) -->\n<div data-fullplate="' + r.id + '"></div>\n<script src="https://embed.fullplate.app/v1.js" async></scr' + 'ipt>';
    window.__embSnippet = snippet;

    function ph(i){ try{ return photoFor(i); }catch(e){ return ''; } }
    function itemRow(i){
      var p = ph(i);
      return '<div style="display:flex;gap:11px;align-items:center;padding:10px 0;border-top:1px solid #F0E7DC">'
        + '<div style="width:54px;height:54px;border-radius:10px;flex:0 0 auto;background:' + (p ? ('center/cover no-repeat url(\'' + p + '\')') : (r.color || '#E7C9B8')) + '"></div>'
        + '<div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:700;color:#241b16;line-height:1.2">' + rEsc(i.name) + '</div>'
        + '<div style="font-size:11.5px;color:#8a7c6d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + rEsc(i.desc || 'Made fresh to order') + '</div></div>'
        + '<div style="text-align:right;flex:0 0 auto"><div style="font-size:13px;font-weight:800;color:#241b16">' + money(i.price) + '</div>'
        + '<button style="margin-top:4px;border:1px solid var(--brand);color:var(--brand);background:#fff;border-radius:999px;width:28px;height:28px;font-size:16px;font-weight:800;cursor:pointer" onclick="openRestaurant(\'' + r.id + '\')">+</button></div></div>';
    }
    var cartCount = Math.min(2, its.length);
    var cartTotal = its.slice(0, cartCount).reduce(function(s, i){ return s + i.price; }, 0);

    var widget = '<div style="border:1px solid #ECDFCF;border-radius:14px;background:#fff;box-shadow:0 10px 30px rgba(40,28,18,.10);overflow:hidden;max-width:380px;margin:0 auto">'
      + '<div style="background:linear-gradient(135deg,#E8623D,#C44A28);color:#fff;padding:13px 15px">'
      +   '<div style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:14px;font-weight:800">Order online</div><div style="font-size:10px;font-weight:800;background:rgba(255,255,255,.22);padding:3px 8px;border-radius:999px">Powered by FullPlate</div></div>'
      +   '<div style="display:flex;gap:7px;margin-top:10px">'
      +     '<button style="flex:1;border:0;border-radius:9px;padding:8px;font-size:12.5px;font-weight:800;cursor:pointer;background:#fff;color:#C44A28">◷ Pickup</button>'
      +     '<button style="flex:1;border:1px solid rgba(255,255,255,.5);border-radius:9px;padding:8px;font-size:12.5px;font-weight:700;cursor:pointer;background:transparent;color:#fff">⚡ Delivery</button>'
      +   '</div>'
      + '</div>'
      + '<div style="padding:6px 15px 2px;display:flex;gap:7px;overflow-x:auto">'
      +   ['Popular','Tacos','Sides','Drinks'].map(function(c, i){ return '<span style="flex:0 0 auto;font-size:11.5px;font-weight:700;padding:6px 11px;border-radius:999px;' + (i === 0 ? 'background:#FDEEE7;color:#C44A28' : 'background:#F4EEE6;color:#8a7c6d') + '">' + c + '</span>'; }).join('')
      + '</div>'
      + '<div style="padding:2px 15px 8px">' + its.map(itemRow).join('') + '</div>'
      + '<div style="position:sticky;bottom:0;padding:11px 15px;border-top:1px solid #F0E7DC;background:#fff">'
      +   '<button style="width:100%;background:var(--brand);color:#fff;border:0;border-radius:11px;padding:12px;font-size:13.5px;font-weight:800;cursor:pointer;display:flex;justify-content:space-between;align-items:center" onclick="openRestaurant(\'' + r.id + '\')">'
      +   '<span style="background:rgba(255,255,255,.22);border-radius:7px;padding:2px 8px;font-size:12px">' + cartCount + '</span><span>Checkout</span><span>' + money(cartTotal) + ' ›</span></button>'
      + '</div></div>';

    document.getElementById('view-onboard').innerHTML = '<div class="obwrap">'
      + '<div class="obeyebrow">Embed on your website</div>'
      + '<h2 class="obh">Your ordering, right on your own site</h2>'
      + '<p class="obsub">FullPlate is your storefront in the marketplace, and the exact same ordering drops into your existing website. Diners browse your menu and check out without ever leaving your site, and no marketplace takes a cut. Here is how it looks live on ' + rEsc(domain) + ':</p>'
      + '<div class="embframe">'
      +   '<div class="emburl"><span class="d3"><i></i><i></i><i></i></span><span class="ub">https://www.' + rEsc(domain) + '/order</span></div>'
      +   '<div style="background:#FBF7F1">'
      +     '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #EFE6DA">'
      +       '<div style="font-size:17px;font-weight:900;color:#241b16">' + rEsc(r.name) + '</div>'
      +       '<div style="display:flex;gap:14px;font-size:12px;color:#8a7c6d">' + ['Home','Menu','Order','Visit'].map(function(n, i){ return '<span style="' + (i === 2 ? 'color:var(--brand);font-weight:800' : '') + '">' + n + '</span>'; }).join('') + '</div>'
      +     '</div>'
      +     '<div style="padding:16px 16px 20px"><div style="font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#9c8a78;margin-bottom:10px">Order ' + rEsc(r.cuisine || 'pickup') + ' for pickup</div>' + widget + '</div>'
      +   '</div>'
      + '</div>'
      + '<div class="obcardlabel">Add this to your site</div>'
      + '<div class="embsnippet">' + rEsc(snippet) + '</div>'
      + '<button class="embcopybtn" onclick="(navigator.clipboard&&navigator.clipboard.writeText(window.__embSnippet));showToast(\'Embed code copied\')">Copy embed code</button>'
      + '<div class="obtiny">One source of truth: your menu, prices, hours, and sold-out items stay in sync between your FullPlate page and the embed automatically. Update once, it changes everywhere.</div>'
      + '<button class="obbtn2" onclick="onboardSuccessBack(\'' + r.id + '\')">Back</button>'
      + '</div>';
    window.scrollTo(0, 0);
  };

  /* ====================================================================== */
  /* 3. MENU — photo upload (file) or URL                                   */
  /* ====================================================================== */
  window.setPhoto = function(id){
    var it = findItem(id); if(!it) return;
    rForm({ title:'Set item photo', sub:it.name, save:'Save photo', fields:[
      { type:'note', label:'Upload a photo from this device, or paste an image URL. Leave both blank to remove the current photo.' },
      { key:'file', label:'Upload a photo', type:'file', accept:'image/*' },
      { key:'url', label:'…or paste an image URL', type:'text', value:(window.photoOverride && photoOverride[id] && !/^data:/.test(photoOverride[id]) ? photoOverride[id] : ''), placeholder:'https://…' }
    ]}, function(v){
      if(v.file){ photoOverride[id] = v.file; rToast('Photo uploaded'); }
      else if((v.url || '').trim()){ photoOverride[id] = v.url.trim(); rToast('Photo updated'); }
      else { delete photoOverride[id]; rToast('Photo removed'); }
      try{ openOwner(ownerRest, 'menu'); }catch(e){}
    });
  };

  /* ====================================================================== */
  /* 7. SMART PREP TIME                                                     */
  /* ====================================================================== */
  var PREPW = { quick:1, standard:2, slow:3.5 };
  function prepSpeedOf(it){ return (it && window.fpPrepWeight[it.id]) || 'standard'; }
  function parsePrepBase(r){
    var s = ''; try{ s = storeOf(r).prep || r.eta || '15–25 min'; }catch(e){ s = '15–25 min'; }
    var m = s.match(/(\d+)\D+(\d+)/); if(m) return [parseInt(m[1], 10), parseInt(m[2], 10)];
    var m2 = s.match(/(\d+)/); return m2 ? [parseInt(m2[1], 10), parseInt(m2[1], 10) + 10] : [15, 25];
  }
  function estimatePrep(cartArr, r){
    var base = parsePrepBase(r), work = 0, qty = 0;
    (cartArr || []).forEach(function(c){ var it = findItem(c.id) || {}; work += (PREPW[prepSpeedOf(it)] || 2) * (c.qty || 1); qty += (c.qty || 1); });
    var extra = Math.max(0, Math.round((work - 3) * 1.3));
    return { lo:base[0] + extra, hi:base[1] + extra, label:(base[0] + extra) + '–' + (base[1] + extra) + ' min', qty:qty, work:work };
  }
  window.fpSetPrepSpeed = function(id){
    var it = findItem(id); if(!it) return;
    rForm({ title:'Prep speed', sub:it.name, save:'Save', fields:[
      { type:'note', label:'How long this item takes to make, relative to others. The pickup estimate scales up automatically for larger or slower orders.' },
      { key:'speed', label:'Prep speed', type:'select', value:prepSpeedOf(it), options:[ {label:'Quick (drinks, sides)',value:'quick'}, {label:'Standard',value:'standard'}, {label:'Slow / made to order',value:'slow'} ] }
    ]}, function(v){ window.fpPrepWeight[id] = v.speed || 'standard'; rToast('Prep speed set to ' + (v.speed || 'standard')); try{ openOwner(ownerRest, 'menu'); }catch(e){} });
  };
  /* confirmation message reflects the dynamic estimate */
  var _placeOrder = window.placeOrder;
  window.placeOrder = function(){
    var s = null, saved = null;
    try{ if(typeof current !== 'undefined' && current && typeof cart !== 'undefined' && cart.length){ s = storeOf(current); saved = s.prep; s.prep = estimatePrep(cart, current).label; } }catch(e){}
    if(typeof _placeOrder === 'function') _placeOrder.apply(this, arguments);
    try{ if(s) s.prep = saved; }catch(e){}
  };

  /* ====================================================================== */
  /* 4. PROMOS — scheduling + audience push + channel                       */
  /* ====================================================================== */
  function audLabel(a){ return a === 'all' ? 'all customers' : a === 'top' ? 'top customers' : a === 'lapsed' ? 'customers not seen in 30+ days' : ''; }
  function audCount(r, a){ var t = Math.max(60, Math.round(((r && r.reviews) || 200) * 0.85)); return a === 'top' ? Math.round(t * 0.2) : a === 'lapsed' ? Math.round(t * 0.18) : t; }
  function pushPromo(r, code, audience, channel){
    if(audience === 'none' || channel === 'none') return;
    var n = audCount(r, audience);
    window.fpCampaigns = window.fpCampaigns || [];
    fpCampaigns.unshift({ channel:(channel === 'both' ? 'Email + SMS' : channel === 'email' ? 'Email' : 'SMS'), audience:audLabel(audience), count:n, when:'Just now', msg:'Promo code ' + code });
    rToast('Code ' + code + ' pushed to ' + n + ' ' + audLabel(audience));
  }
  window.createPromo = function(){
    var r = R(ownerRest) || {};
    rForm({ title:'Create promo code', save:'Create', fields:[
      { key:'code', label:'Promo code', type:'text', placeholder:'e.g. TACOTUES' },
      { key:'kind', label:'Type', type:'select', value:'pct', options:[ {label:'Percent off (%)',value:'pct'}, {label:'Dollars off ($)',value:'amt'} ] },
      { key:'val', label:'Amount', type:'number', min:'0', placeholder:'e.g. 15' },
      { key:'start', label:'Starts', type:'date', value:'' },
      { key:'end', label:'Ends', type:'date', value:'' },
      { type:'note', label:'Optional: announce this code to your customers now.' },
      { key:'audience', label:'Push to', type:'select', value:'none', options:[ {label:'Do not announce',value:'none'}, {label:'All customers',value:'all'}, {label:'Top customers',value:'top'}, {label:'Customers not seen in 30+ days',value:'lapsed'} ] },
      { key:'channel', label:'Send by', type:'select', value:'both', options:[ {label:'Email + SMS',value:'both'}, {label:'Email only',value:'email'}, {label:'SMS only',value:'sms'} ] }
    ]}, function(v){
      var code = (v.code || '').trim().toUpperCase(); if(!code){ rToast('Enter a code'); return; }
      var val = parseFloat(v.val); if(!(val > 0)){ rToast('Enter an amount'); return; }
      var isPct = v.kind === 'pct';
      promos.push({ code:code, type:isPct ? 'pct' : 'amt', value:val, label:isPct ? (val + '% off') : ('$' + val.toFixed(2) + ' off') });
      window.fpPromoMeta[code] = { start:v.start || '', end:v.end || '', audience:v.audience, channel:v.channel };
      rToast('Promo ' + code + ' created');
      pushPromo(r, code, v.audience, v.channel);
      try{ openOwner(ownerRest, 'promos'); }catch(e){}
    });
  };
  function fmtDate(d){ if(!d) return ''; var p = d.split('-'); if(p.length !== 3) return d; var mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(p[1], 10) - 1] || p[1]; return mo + ' ' + parseInt(p[2], 10); }
  window.promosTab = function(r){
    var rows = promos.length ? promos.map(function(p, idx){
      var m = window.fpPromoMeta[p.code] || {};
      var range = (m.start || m.end) ? (fmtDate(m.start) || 'now') + ' to ' + (fmtDate(m.end) || 'no end') : 'Always on';
      var pushed = (m.audience && m.audience !== 'none') ? '<span class="fppos-tag"' + GB + '>Pushed to ' + audLabel(m.audience) + '</span>' : '';
      return '<div class="ocard"><div class="ohd"><b>' + rEsc(p.code) + ' · ' + rEsc(p.label) + '</b><span class="otime">' + rEsc(range) + '</span></div>'
        + (pushed ? '<div style="margin-bottom:8px">' + pushed + '</div>' : '')
        + '<div class="ofoot"><button class="ebtn" onclick="fpPushPromo(' + idx + ')">Push to customers</button><button class="ebtn del" onclick="deletePromo(' + idx + ')">Delete</button></div></div>';
    }).join('') : '<div class="empty">No promo codes yet.</div>';
    return '<button class="addbtn2" onclick="createPromo()">+ Create promo code</button>' + rows
      + '<div class="realnote" style="margin-top:14px">Codes apply at checkout instantly. As a diner, try <b>LOCAL10</b> in the promo box. Set a start and end date, and announce a code by email or text to all customers, your top customers, or those you have not seen in a while. The restaurant keeps the rest, with 0% commission.</div>';
  };
  window.fpPushPromo = function(idx){
    var p = promos[idx]; if(!p) return; var r = R(ownerRest) || {};
    rForm({ title:'Push ' + p.code, sub:p.label, save:'Send', fields:[
      { key:'audience', label:'Push to', type:'select', value:'all', options:[ {label:'All customers',value:'all'}, {label:'Top customers',value:'top'}, {label:'Customers not seen in 30+ days',value:'lapsed'} ] },
      { key:'channel', label:'Send by', type:'select', value:'both', options:[ {label:'Email + SMS',value:'both'}, {label:'Email only',value:'email'}, {label:'SMS only',value:'sms'} ] }
    ]}, function(v){
      window.fpPromoMeta[p.code] = window.fpPromoMeta[p.code] || {}; window.fpPromoMeta[p.code].audience = v.audience; window.fpPromoMeta[p.code].channel = v.channel;
      pushPromo(r, p.code, v.audience, v.channel); try{ openOwner(ownerRest, 'promos'); }catch(e){}
    });
  };

  /* ====================================================================== */
  /* 5. REVIEWS — new/seen, replied filter, history, assign, email          */
  /* ====================================================================== */
  function seenMap(rid){ if(!window.fpRvSeen[rid]) window.fpRvSeen[rid] = {}; return window.fpRvSeen[rid]; }
  function rvMeta(rid){ if(!window.fpRvMeta[rid]) window.fpRvMeta[rid] = {}; return window.fpRvMeta[rid]; }
  window.fpRvSetFilter = function(f){ window.fpRvFilter = f; try{ openOwner(ownerRest, 'reviews'); }catch(e){} };
  window.fpRvMarkSeen = function(rid, idx){ seenMap(rid)[idx] = true; try{ openOwner(rid, 'reviews'); }catch(e){} };
  window.fpRvMarkAllSeen = function(rid){ var rv = reviews[rid] || []; var m = seenMap(rid); rv.forEach(function(_, i){ m[i] = true; }); rToast('All reviews marked seen'); try{ openOwner(rid, 'reviews'); }catch(e){} };
  window.replyReview = function(rid, idx){
    var rv = (reviews[rid] || [])[idx]; if(!rv) return;
    rForm({ title:'Reply to review', sub:rv.name + ' · ' + '★'.repeat(rv.stars), save:'Post reply', fields:[
      { type:'note', label:rEsc(rv.text) },
      { key:'reply', label:'Your public reply', type:'textarea', value:(rv.reply || ''), placeholder:'Thanks so much, we appreciate you!' }
    ]}, function(v){ var t = (v.reply || '').trim(); if(!t) return; reviews[rid][idx].reply = t; seenMap(rid)[idx] = true; rToast('Reply posted'); try{ openOwner(rid, 'reviews'); }catch(e){} });
  };
  window.fpRvAssign = function(rid, idx){
    var team = (window.fpTeam || []).filter(function(t){ return t.status !== 'invited'; });
    var opts = [{ label:'Unassigned', value:'' }].concat(team.map(function(t){ return { label:t.name + ' (' + t.role + ')', value:t.name }; }));
    rForm({ title:'Assign review', sub:'Route to a team member', fields:[
      { key:'who', label:'Assign to', type:'select', value:(rvMeta(rid)[idx] && rvMeta(rid)[idx].assignee) || '', options:opts }
    ]}, function(v){ rvMeta(rid)[idx] = rvMeta(rid)[idx] || {}; rvMeta(rid)[idx].assignee = v.who || ''; rToast(v.who ? ('Assigned to ' + v.who) : 'Unassigned'); try{ openOwner(rid, 'reviews'); }catch(e){} });
  };
  window.fpRvEmail = function(rid, idx){
    var rv = (reviews[rid] || [])[idx]; if(!rv) return;
    var team = (window.fpTeam || []).filter(function(t){ return t.email && t.status !== 'invited'; });
    var def = team.length > 1 ? team[1].email : (team[0] ? team[0].email : '');
    rForm({ title:'Email this review', sub:'Share with management', save:'Send', fields:[
      { type:'note', label:'<b>' + '★'.repeat(rv.stars) + '</b> ' + rEsc(rv.name) + ': ' + rEsc(rv.text) },
      { key:'to', label:'Send to', type:'text', value:def, placeholder:'manager@email.com' },
      { key:'note2', label:'Add a note (optional)', type:'textarea', value:'', placeholder:'FYI — can we follow up with this guest?' }
    ]}, function(v){ var to = (v.to || '').trim(); if(!to){ rToast('Enter a recipient'); return; } rToast('Review emailed to ' + to); });
  };
  window.fpRvHistory = function(rid, idx){
    var r = R(rid); var rv = (reviews[rid] || [])[idx]; if(!r || !rv) return;
    var its = allItems(r); var seed = rHash(rv.name + rid);
    function pick(k){ return its.length ? its[(seed + k) % its.length] : { name:'Item' }; }
    var orders = 2 + seed % 6, ltv = 40 + seed % 220, last = ['3 days ago','2 weeks ago','last month'][seed % 3];
    var hist = [{ when:last, its:[pick(0), pick(2)] }, { when:'a few weeks ago', its:[pick(1)] }];
    rInfo('Customer history', rv.name, '<div style="font-size:13.5px;line-height:1.6;color:var(--ink)"><div><b>' + rEsc(rv.name) + '</b> · left ' + '★'.repeat(rv.stars) + '</div>'
      + '<div style="color:var(--muted)">' + orders + ' orders · ' + money(ltv) + ' lifetime · last order ' + rEsc(last) + '</div></div>'
      + '<div style="font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:14px 0 6px">Recent orders</div>'
      + hist.map(function(o){ return '<div class="orow" style="cursor:default"><div><b>' + o.its.map(function(i){ return rEsc(i.name); }).join(', ') + '</b><span>' + rEsc(o.when) + '</span></div></div>'; }).join('')
      + '<div class="fppos-note" style="margin-top:10px">In a live account this links to the full customer profile in Customers, so you can reply, reward, or win them back.</div>');
  };
  window.reviewsTab = function(r){
    ensureReviews(r); var rv = reviews[r.id] || [];
    if(!rv.length) return '<div class="empty">No reviews yet. They appear here the moment a diner rates an order.</div>';
    var avg = (rv.reduce(function(s, x){ return s + x.stars; }, 0) / rv.length).toFixed(1);
    var seen = seenMap(r.id), meta = rvMeta(r.id);
    var nNew = rv.filter(function(_, i){ return !seen[i]; }).length;
    var nNeed = rv.filter(function(x){ return !x.reply; }).length;
    var f = window.fpRvFilter;
    function tab(key, label){ return '<button class="ebtn' + (f === key ? ' on' : '') + '" style="' + (f === key ? 'background:var(--brand);color:#fff;border-color:var(--brand)' : '') + '" onclick="fpRvSetFilter(\'' + key + '\')">' + label + '</button>'; }
    var bar = '<div class="oqsum">★ ' + avg + ' average · ' + rv.length + ' reviews · ' + nNew + ' new · ' + nNeed + ' need a reply</div>'
      + '<div class="rvbar" style="display:flex;flex-wrap:wrap;gap:7px;margin:0 0 10px;align-items:center">'
      + tab('all', 'All') + tab('new', 'New (' + nNew + ')') + tab('needs', 'Needs reply (' + nNeed + ')')
      + '<button class="ebtn" style="margin-left:auto" onclick="fpRvMarkAllSeen(\'' + r.id + '\')">Mark all seen</button></div>';
    var cards = rv.map(function(x, idx){
      var isNew = !seen[idx], needs = !x.reply, assignee = meta[idx] && meta[idx].assignee;
      if(f === 'new' && !isNew) return '';
      if(f === 'needs' && !needs) return '';
      var badges = (isNew ? '<span class="fppos-tag" style="color:#C44A28;background:#FBEAE5;border-color:#E1B8AD">New</span> ' : '')
        + (needs ? '<span class="fppos-tag" style="color:#9C6206;background:#FCEFD9;border-color:#EAD3A0">Needs reply</span>' : '<span class="fppos-tag"' + GB + '>Replied</span>')
        + (assignee ? ' <span class="fppos-tag" style="background:#EDE7F6;color:#5b4a8a;border-color:#D6CCEF">' + rEsc(assignee) + '</span>' : '');
      return '<div class="ocard"><div class="ohd"><b>' + rEsc(x.name) + '</b><span class="otime" style="color:#B8740B">' + '★'.repeat(x.stars) + '☆'.repeat(5 - x.stars) + '</span></div>'
        + '<div style="margin-bottom:7px">' + badges + '</div>'
        + '<div class="oitems" style="font-weight:500">' + rEsc(x.text) + '</div>'
        + (x.reply ? '<div class="rvreply"><b>You replied:</b> ' + rEsc(x.reply) + '</div>' : '')
        + '<div class="ofoot" style="flex-wrap:wrap;justify-content:flex-start;gap:7px;margin-top:9px">'
        +   '<button class="ebtn" onclick="replyReview(\'' + r.id + '\',' + idx + ')">' + (x.reply ? 'Edit reply' : 'Reply') + '</button>'
        +   '<button class="ebtn" onclick="fpRvHistory(\'' + r.id + '\',' + idx + ')">Customer history</button>'
        +   '<button class="ebtn" onclick="fpRvAssign(\'' + r.id + '\',' + idx + ')">Assign</button>'
        +   '<button class="ebtn" onclick="fpRvEmail(\'' + r.id + '\',' + idx + ')">Email</button>'
        +   (isNew ? '<button class="ebtn" onclick="fpRvMarkSeen(\'' + r.id + '\',' + idx + ')">Mark seen</button>' : '')
        + '</div></div>';
    }).join('');
    if(!cards) cards = '<div class="empty">Nothing in this filter right now.</div>';
    return bar + cards;
  };

  /* ====================================================================== */
  /* 8/9. TEAM MANAGEMENT (feeds review assignment)                         */
  /* ====================================================================== */
  function roleAccess(role){ return role === 'Owner' ? 'Full access · billing, payouts, menu, reports' : role === 'Manager' ? 'Menu, hours, orders, customers, reviews. No payouts or billing' : role === 'Cashier' ? 'Orders queue only' : 'Custom access'; }
  function teamRosterHTML(){
    var rows = (window.fpTeam || []).map(function(t, i){
      var pill = t.status === 'owner' ? '<span class="fppos-tag">Owner</span>' : t.status === 'invited' ? '<span class="fppos-tag" style="color:#9C6206;background:#FCEFD9;border-color:#EAD3A0">Invite sent</span>' : '<span class="fppos-tag"' + GB + '>Active</span>';
      var actions = t.status === 'owner' ? ''
        : '<div class="ofoot" style="justify-content:flex-start;gap:7px;margin-top:8px">'
          + (t.status === 'invited' ? '<button class="ebtn" onclick="fpResendInvite(' + i + ')">Resend invite</button>' : '<button class="ebtn" onclick="fpChangeRole(' + i + ')">Change role</button>')
          + '<button class="ebtn del" onclick="fpRemoveUser(' + i + ')">Remove</button></div>';
      return '<div class="fppos-row" style="display:block"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div class="pn">' + rEsc(t.name || t.email) + ' · ' + rEsc(t.role) + '<small>' + (t.email ? rEsc(t.email) + ' · ' : '') + roleAccess(t.role) + '</small></div>' + pill + '</div>' + actions + '</div>';
    }).join('');
    return '<div class="fppos"><div class="fppos-h">Team &amp; roles</div>' + rows
      + '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:10px"><button class="fppos-btn" onclick="fpInviteStaff(\'Manager\')">+ Invite manager</button><button class="fppos-btn" onclick="fpInviteStaff(\'Cashier\')">+ Invite cashier</button></div>'
      + '<div class="fppos-note">Role-based access, per location. Invites go out by email and each person signs in to only what their role allows. Resend or remove access anytime, and assign reviews to anyone on the team.</div></div>';
  }
  window.fpInviteStaff = function(role){
    rForm({ title:'Invite ' + role, save:'Send invite', fields:[
      { key:'name', label:'Name', type:'text', placeholder:'First name' },
      { key:'email', label:'Their email', type:'text', placeholder:'name@email.com' },
      { key:'role', label:'Role', type:'select', value:role, options:[ {label:'Manager',value:'Manager'}, {label:'Cashier / line',value:'Cashier'}, {label:'Custom',value:'Custom'} ] }
    ]}, function(v){ var e = (v.email || '').trim(); if(!e){ rToast('Enter an email'); return; } window.fpTeam.push({ name:(v.name || '').trim() || e.split('@')[0], email:e, role:v.role || role, status:'invited' }); rToast('Invite sent to ' + e + ' (' + (v.role || role) + ')'); try{ openOwner(ownerRest, 'settings'); }catch(e2){} });
  };
  window.fpResendInvite = function(i){ var t = window.fpTeam[i]; if(!t) return; rToast('Invite re-sent to ' + (t.email || t.name)); };
  window.fpRemoveUser = function(i){ var t = window.fpTeam[i]; if(!t || t.status === 'owner') return; window.fpTeam.splice(i, 1); rToast((t.name || t.email) + ' removed'); try{ openOwner(ownerRest, 'settings'); }catch(e){} };
  window.fpChangeRole = function(i){
    var t = window.fpTeam[i]; if(!t) return;
    rForm({ title:'Change role', sub:t.name || t.email, fields:[
      { key:'role', label:'Role', type:'select', value:t.role, options:[ {label:'Manager',value:'Manager'}, {label:'Cashier / line',value:'Cashier'}, {label:'Custom',value:'Custom'} ] }
    ]}, function(v){ t.role = v.role || t.role; rToast('Role updated to ' + t.role); try{ openOwner(ownerRest, 'settings'); }catch(e){} });
  };

  /* ====================================================================== */
  /* 6. PAUSE — stronger diner-side visibility                              */
  /* ====================================================================== */
  var _renderHome = window.renderHome;
  window.renderHome = function(){
    if(typeof _renderHome === 'function') _renderHome.apply(this, arguments);
    try{
      document.querySelectorAll('#rlist .rcard').forEach(function(card){
        if(card.querySelector('.rpausebadge')) return;
        var oc = card.getAttribute('onclick') || ''; var m = oc.match(/openRestaurant\('([^']+)'\)/); if(!m) return;
        var r = R(m[1]); if(!r) return; var s; try{ s = storeOf(r); }catch(e){ return; }
        var liveOk = r.type !== 'truck' || r.live;
        if(s.open && !s.paused && liveOk) return;
        var msg = !s.open ? 'Closed' : (!liveOk ? 'Offline' : 'Paused · not taking orders');
        var bd = document.createElement('div'); bd.className = 'rpausebadge';
        bd.style.cssText = 'background:#FBEAE5;color:#8A3A22;font-size:11px;font-weight:800;letter-spacing:.03em;padding:5px 12px;text-align:center;border-bottom:1px solid #E8C7BD';
        bd.textContent = msg;
        card.insertBefore(bd, card.firstChild);
      });
    }catch(e){}
  };

  /* ====================================================================== */
  /* wrap openOwner: data-otab, menu prep buttons, team-card swap           */
  /* ====================================================================== */
  var _openOwner = window.openOwner;
  window.openOwner = function(){
    if(typeof _openOwner === 'function') _openOwner.apply(this, arguments);
    try{
      var t = (typeof ownerTab !== 'undefined') ? ownerTab : null;
      var body = document.getElementById('ownerBody');
      if(body) body.setAttribute('data-otab', t || 'overview');

      /* Menu: add a Prep-speed button to each item row */
      if(t === 'menu' && body){
        body.querySelectorAll('.medit').forEach(function(grid){
          if(grid.querySelector('.prepbtnx')) return;
          var pr = grid.querySelector('button[onclick^="editPrice"]'); if(!pr) return;
          var mm = (pr.getAttribute('onclick') || '').match(/editPrice\('([^']+)'\)/); if(!mm) return;
          var id = mm[1]; var it = findItem(id);
          var b = document.createElement('button'); b.className = 'ebtn prepbtnx';
          b.setAttribute('onclick', "fpSetPrepSpeed('" + id + "')");
          b.textContent = 'Prep: ' + prepSpeedOf(it);
          var sold = grid.querySelector('.soldbtn'); if(sold) grid.insertBefore(b, sold); else grid.appendChild(b);
        });
      }

      /* Settings: replace pitch's static Team card with the managed roster */
      if(t === 'settings' && body){
        var cards = body.querySelectorAll('.fppos');
        for(var i = 0; i < cards.length; i++){
          var h = cards[i].querySelector('.fppos-h');
          if(h && h.textContent.indexOf('Team') === 0 && !cards[i].getAttribute('data-rteam')){
            var wrap = document.createElement('div'); wrap.setAttribute('data-rteam', '1'); wrap.innerHTML = teamRosterHTML();
            cards[i].parentNode.replaceChild(wrap.firstChild, cards[i]);
            break;
          }
        }
      }
    }catch(e){}
  };

  /* ====================================================================== */
  /* wrap openCheckout: prep estimate, paused notice, fee wording           */
  /* ====================================================================== */
  var _openCheckout = window.openCheckout;
  window.openCheckout = function(){
    if(typeof _openCheckout === 'function') _openCheckout.apply(this, arguments);
    try{
      var view = document.getElementById('view-checkout');
      if(!view || typeof current === 'undefined' || !current) return;

      /* smart pickup estimate */
      if(!document.getElementById('rfPrepLine') && typeof cart !== 'undefined' && cart.length){
        var est = estimatePrep(cart, current);
        var anchor = view.querySelector('.promorow') || view.querySelector('#cpStack') || view.querySelector('.co-tot');
        if(anchor && anchor.parentNode){
          var pl = document.createElement('div'); pl.id = 'rfPrepLine'; pl.className = 'fppos'; pl.style.cssText = 'margin:12px 0 4px';
          pl.innerHTML = '<div class="fppos-row" style="border:0;padding:0"><div class="pn">◷ Estimated pickup in ' + est.label + '<small>Scales with your order (' + est.qty + ' item' + (est.qty === 1 ? '' : 's') + '). Made-to-order items add time.</small></div></div>';
          anchor.parentNode.insertBefore(pl, anchor);
        }
      }

      /* paused notice + block pay */
      var s; try{ s = storeOf(current); }catch(e){ s = null; }
      if(s && (s.paused || !s.open)){
        if(!document.getElementById('rfPausedNote')){
          var pn = document.createElement('div'); pn.id = 'rfPausedNote'; pn.className = 'dinerbanner'; pn.style.margin = '0 0 10px';
          pn.textContent = s.paused ? '⏸ This restaurant just paused new orders. You can still build your order, but checkout is on hold for a few minutes.' : '🚫 This restaurant is closed right now. Ordering resumes when they reopen.';
          view.insertBefore(pn, view.firstChild);
        }
        var pay = view.querySelector('.paybtn'); if(pay){ pay.disabled = true; pay.style.opacity = '.5'; pay.style.pointerEvents = 'none'; }
      }

      /* diner-facing wording: "Service / commission fee" reads as plain "Service fee" */
      view.querySelectorAll('.co-tot').forEach(function(row){ var sp = row.querySelector('span'); if(sp && /commission fee/i.test(sp.textContent)) sp.textContent = 'Service fee'; });
    }catch(e){}
  };
})();
