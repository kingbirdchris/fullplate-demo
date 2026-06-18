/* FullPlate enhancement layer — loaded AFTER pitch.js. Self-contained: it only
   wraps globals (openOwner, openCheckout) and adds window functions, so it never
   edits pitch.js. Adds demo-functional depth to Settings, Grow, and Customers so
   each control shows how it behaves in the live product. All demo-only. */
(function(){
  if(window.__fpEnhance) return; window.__fpEnhance = true;

  var GB = ' style="background:#EAF5EE;color:#1F6B43;border:1px solid #CDEBD0"';
  function ER(id){ try{ return RESTAURANTS.find(function(x){ return x.id === id; }); }catch(e){ return null; } }
  function eEsc(s){ return (typeof esc === 'function') ? esc(s) : String(s == null ? '' : s); }
  function eToast(m){ try{ showToast(m); }catch(e){} }
  function hashE(s){ var h = 0; s = String(s); for(var i = 0; i < s.length; i++){ h = (h * 31 + s.charCodeAt(i)) >>> 0; } return h; }
  function segLbl(s){ return s === 'regulars' ? 'regular' : (s === 'lapsed' ? 'lapsed' : 'new'); }
  function custTotal(r){ return Math.max(60, Math.round(((r && r.reviews) || 200) * 0.85)); }
  function audienceCount(r, aud){
    var t = custTotal(r);
    if(aud === 'regulars') return Math.round(t * 0.45);
    if(aud === 'new') return Math.round(t * 0.20);
    if(aud === 'lapsed') return Math.round(t * 0.18);
    return t;
  }
  window.fpCampaigns = window.fpCampaigns || [];
  window.fpTax = window.fpTax || {};
  window.fpWinback = window.fpWinback || {};

  /* ---------------- lightweight read-only info sheet ---------------- */
  function eInfo(title, sub, html){
    if(!document.getElementById('feSheet')){
      var b = document.createElement('div'); b.className = 'sheet-backdrop'; b.id = 'feBack'; b.onclick = eClose;
      var s = document.createElement('div'); s.className = 'sheet modsheet'; s.id = 'feSheet'; s.setAttribute('role','dialog');
      s.innerHTML = '<div class="sheet-head"><div class="ht"><b id="feTitle"></b><span id="feSub"></span></div><button class="close" id="feX" aria-label="Close">✕</button></div>'
        + '<div class="modbody" id="feBody" style="padding:14px 16px 16px"></div><div class="modfoot"><button class="paybtn" id="feSave">Done</button></div>';
      document.body.appendChild(b); document.body.appendChild(s);
      document.getElementById('feX').onclick = eClose; document.getElementById('feSave').onclick = eClose;
    }
    document.getElementById('feTitle').textContent = title || '';
    document.getElementById('feSub').textContent = sub || '';
    document.getElementById('feBody').innerHTML = html;
    var bk = document.getElementById('feBack'); bk.style.display = 'block';
    requestAnimationFrame(function(){ bk.style.opacity = '1'; document.getElementById('feSheet').classList.add('open'); });
  }
  function eClose(){ var s = document.getElementById('feSheet'); if(s) s.classList.remove('open'); var b = document.getElementById('feBack'); if(b){ b.style.opacity = '0'; setTimeout(function(){ b.style.display = 'none'; }, 200); } }
  window.eClose = eClose;

  /* ================= SETTINGS: alerts, tax, receipt ================= */
  function alertsCardHTML(r){
    return '<div class="fppos"><div class="fppos-h">Test your alerts</div>'
      + '<div class="fppos-row"><div class="pn">Customer “order ready” text<small>What diners get when you mark an order ready</small></div><button class="fppos-btn" onclick="fpTestSMS(\'' + r.id + '\')">Preview</button></div>'
      + '<div class="fppos-row"><div class="pn">Your nightly recap email<small>Sales, orders, and top item every night</small></div><button class="fppos-btn" onclick="fpPreviewEmail(\'' + r.id + '\')">Preview</button></div>'
      + '<div class="fppos-note">Turn these on or off with the toggles above. In production they send over SMS and email automatically.</div></div>';
  }
  window.fpTestSMS = function(rid){
    var r = ER(rid) || { name:'Your restaurant' };
    var html = '<div style="background:#E9E9EB;border-radius:18px;padding:16px;max-width:300px;margin:0 auto">'
      + '<div style="background:#fff;border-radius:16px;padding:11px 14px;font-size:13.5px;line-height:1.5;color:#111;box-shadow:0 1px 2px rgba(0,0,0,.12)">'
      + eEsc(r.name) + ': your order is ready for pickup! 🎉 Come to the counter — just show this text or give your name. Thanks for ordering direct.</div>'
      + '<div style="font-size:10.5px;color:#8a8a8a;text-align:center;margin-top:7px">SMS · sent the instant you tap “Ready”</div></div>';
    eInfo('Order-ready text', 'What the diner receives', html);
  };
  window.fpPreviewEmail = function(rid){
    var r = ER(rid) || { name:'Your restaurant' }; var seed = hashE(r.id || 'x');
    var orders = 28 + seed % 30, rev = 640 + seed % 480, nu = 4 + seed % 7;
    var top = 'Most-ordered item';
    try{ var items = []; (r.menu || []).forEach(function(c){ c.items.forEach(function(i){ items.push(i.name); }); }); if(items.length) top = items[seed % items.length]; }catch(e){}
    var html = '<div style="border:1px solid var(--line);border-radius:12px;overflow:hidden">'
      + '<div style="background:var(--ink);color:#fff;padding:12px 14px;font-weight:800">FullPlate · Nightly recap</div>'
      + '<div style="padding:14px;font-size:13px;line-height:1.7;color:var(--ink)">Hi ' + eEsc(r.name) + ', here’s your day:<br><br>'
      + '<b>' + orders + ' orders</b> · <b>$' + rev.toLocaleString() + '</b> kept (0% commission)<br>'
      + 'Most ordered: <b>' + eEsc(top) + '</b><br>New customers today: <b>' + nu + '</b><br><br>'
      + '<span style="color:var(--muted)">Full reports are in your owner console.</span></div></div>';
    eInfo('Nightly recap email', 'Sent every night', html);
  };

  function taxOf(r){ if(fpTax[r.id] == null) fpTax[r.id] = 8.6; return fpTax[r.id]; }
  function taxCardHTML(r){
    return '<div class="fppos"><div class="fppos-h">Sales tax</div>'
      + '<div class="fppos-row"><div class="pn">Tax rate<small>Applied to the order at checkout</small></div><button class="fppos-btn" onclick="fpEditTax(\'' + r.id + '\')">' + taxOf(r).toFixed(2) + '%</button></div>'
      + '<div class="fppos-note">Set your local rate per location — it flows straight into the diner’s checkout total.</div></div>';
  }
  window.fpEditTax = function(rid){
    var r = ER(rid); if(!r) return;
    window.fpForm({ title:'Sales tax rate', sub:'Per location', fields:[
      { key:'rate', label:'Rate (%)', type:'number', step:'0.01', min:'0', value:taxOf(r).toFixed(2) }
    ]}, function(v){ var n = parseFloat(v.rate); if(n >= 0) fpTax[r.id] = Math.min(20, n); eToast('Tax rate updated'); try{ openOwner(ownerRest, 'settings'); }catch(e){} });
  };

  function receiptCardHTML(r){
    return '<div class="fppos"><div class="fppos-h">Receipt &amp; kitchen ticket</div>'
      + '<div class="fppos-row"><div class="pn">See what prints<small>Kitchen ticket and customer receipt</small></div><button class="fppos-btn" onclick="fpReceiptPreview(\'' + r.id + '\')">Preview</button></div>'
      + '<div class="fppos-note">Your name, order number, items, and pickup time — prints to your tablet or receipt printer the instant an order lands.</div></div>';
  }
  window.fpReceiptPreview = function(rid){
    var r = ER(rid) || { name:'Your Restaurant', menu:[] };
    var lines = []; try{ (r.menu || []).forEach(function(c){ c.items.forEach(function(i){ lines.push(i.name); }); }); }catch(e){}
    var a = lines[0] || 'Item one', b = lines[1] || 'Item two';
    var mono = 'font-family:ui-monospace,Menlo,monospace';
    var html = '<div style="background:#fff;border:1px dashed var(--line);border-radius:8px;padding:16px;max-width:240px;margin:0 auto;' + mono + ';font-size:12px;line-height:1.8;color:#111">'
      + '<div style="text-align:center;font-weight:800;font-size:14px">' + eEsc(r.name) + '</div>'
      + '<div style="text-align:center;color:#777;font-size:10.5px">FullPlate · Pickup</div>'
      + '<div style="border-top:1px dashed #ccc;margin:8px 0"></div>'
      + 'Order #1042 · 6:14pm<br>You (demo)'
      + '<div style="border-top:1px dashed #ccc;margin:8px 0"></div>'
      + '2× ' + eEsc(a) + '<br>1× ' + eEsc(b)
      + '<div style="border-top:1px dashed #ccc;margin:8px 0"></div>'
      + '<b>Ready in 15–20 min</b><br>0% commission · paid in full</div>';
    eInfo('Receipt preview', 'Kitchen ticket', html);
  };

  /* ================= GROW: channel stats, loyalty/referral, campaign ================= */
  function channelStatsHTML(r){
    var seed = hashE(r.id);
    var ch = [['QR codes', 38 + seed % 30], ['Direct link', 58 + seed % 40], ['Google', 28 + seed % 24], ['Social', 18 + seed % 20]];
    var max = Math.max.apply(null, ch.map(function(c){ return c[1]; }));
    return '<div class="fppos" style="margin:14px 0 2px"><div class="fppos-h">Where your orders come from <span' + GB + '>last 30 days</span></div>'
      + ch.map(function(c){ return '<div style="display:flex;align-items:center;gap:10px;padding:6px 0"><span style="width:82px;font-size:12px;font-weight:700;color:var(--ink)">' + c[0] + '</span>'
        + '<span style="flex:1;height:10px;background:#F0E2D8;border-radius:99px;overflow:hidden"><span style="display:block;height:100%;width:' + Math.round(c[1] / max * 100) + '%;background:var(--brand)"></span></span>'
        + '<span style="width:34px;text-align:right;font-size:12px;font-weight:800;color:var(--ink)">' + c[1] + '</span></div>'; }).join('')
      + '<div class="fppos-note">Every channel is commission-free. Lean into what works — see which QR or link drives the most direct orders.</div></div>';
  }
  function loyaltyCardHTML(r){
    return '<div class="fppos" style="margin-top:14px"><div class="fppos-h">Loyalty &amp; referrals <span' + GB + '>active</span></div>'
      + '<div class="fppos-row"><div class="pn">Diners earn 1 point per $1<small>$5 reward at 50 points — keeps them coming back to you</small></div><span class="fppos-tag">On</span></div>'
      + '<div class="fppos-row"><div class="pn">Refer a friend<small>Give $5, get $5 — one shareable link</small></div><button class="fppos-btn" onclick="fpReferral(\'' + r.id + '\')">Get link</button></div>'
      + '<div class="fppos-note">Loyalty and referrals run on the customers you own — something the delivery apps can’t offer.</div></div>';
  }
  window.fpReferral = function(rid){
    var url = 'https://fullplate.app/r/' + rid + '?ref=YOU';
    var html = '<div class="fppos-note" style="margin:0 0 8px">Share this link. Your customer’s friend gets $5 off their first order, and your customer gets $5 back when they order — all commission-free.</div>'
      + '<div class="embsnippet">' + url + '</div>'
      + '<button class="embcopybtn" style="margin-top:10px" onclick="(navigator.clipboard&&navigator.clipboard.writeText(\'' + url + '\'));showToast(\'Referral link copied\')">Copy referral link</button>';
    eInfo('Refer a friend', 'Give $5, get $5', html);
  };
  function campaignCardHTML(r){
    return '<div class="fppos" style="margin-top:14px"><div class="fppos-h">Email &amp; SMS campaign</div>'
      + '<div class="fppos-row"><div class="pn">Reach your customers directly<small>Announce specials, events, or new items</small></div><button class="fppos-btn" onclick="fpCampaign(\'' + r.id + '\',\'all\')">Compose</button></div>'
      + '<div class="fppos-note">Goes to the customer list you own — no commission, no middleman.</div></div>';
  }
  window.fpCampaign = function(rid, seg){
    var r = ER(rid) || {}; var aud = (seg && seg !== 'all') ? seg : 'all';
    var audLabel = (aud === 'all') ? 'all customers' : (aud + ' customers');
    var n = audienceCount(r, aud);
    window.fpForm({ title:'New campaign', sub:'To ' + audLabel + ' (' + n + ')', save:'Send', fields:[
      { key:'channel', label:'Send via', type:'select', options:[
        { label:'Email + SMS', value:'Email + SMS' }, { label:'Email only', value:'Email' }, { label:'SMS only', value:'SMS' }
      ], value:'Email + SMS' },
      { key:'msg', label:'Message', type:'textarea', value:'', placeholder:'e.g. Taco Tuesday is back — 2 for $5 all day. Order direct: fullplate.app/r/' + rid }
    ]}, function(v){
      var msg = (v.msg || '').trim(); if(!msg){ eToast('Add a message first'); return; }
      window.fpCampaigns.unshift({ channel:v.channel, audience:audLabel, count:n, when:'Just now', msg:msg });
      eToast('Sent to ' + n + ' ' + audLabel + ' via ' + v.channel);
      try{ openOwner(ownerRest, 'customers'); }catch(e){}
    });
  };

  /* ================= CUSTOMERS: win-back, import, history, richer detail ================= */
  function winbackCardHTML(r){
    var on = !!fpWinback[r.id]; var n = audienceCount(r, 'lapsed');
    return '<div class="fppos" style="margin:0 0 6px"><div class="fppos-h">Auto win-back ' + (on ? '<span' + GB + '>On</span>' : '<span>off</span>') + '</div>'
      + '<div class="fppos-row"><div class="pn">Win back lapsed customers automatically<small>Sends 10% off to anyone who hasn’t ordered in 30 days</small></div>'
      + '<button class="fppos-btn" onclick="fpToggleWinback(\'' + r.id + '\')">' + (on ? 'Turn off' : 'Turn on') + '</button></div>'
      + '<div class="fppos-note">' + (on ? ('On — about ' + n + ' lapsed customers will get the offer automatically.') : 'Set it once and FullPlate sends the offer on its own — retention on autopilot.') + '</div></div>';
  }
  window.fpToggleWinback = function(rid){ var r = ER(rid) || {}; var on = !fpWinback[rid]; fpWinback[rid] = on; var n = audienceCount(r, 'lapsed'); eToast(on ? ('Auto win-back on — ' + n + ' lapsed customers will get 10% off') : 'Auto win-back off'); try{ openOwner(ownerRest, 'customers'); }catch(e){} };

  function importCardHTML(r){
    return '<button class="addbtn2" style="margin:12px 0 0" onclick="fpImportCustomers(\'' + r.id + '\')">⤒ Import customers (CSV)</button>';
  }
  window.fpImportCustomers = function(rid){
    var html = '<div class="fppos-note" style="margin:0 0 10px">Upload a CSV (name, phone, email) to bring your existing customers into the list you own.</div>'
      + '<input type="file" accept=".csv,text/csv" id="feImp" style="width:100%;font-size:13px;margin-bottom:12px">'
      + '<button class="embcopybtn" onclick="fpDoImport(\'' + rid + '\')">Import</button>'
      + '<div class="fppos-note">Demo: in production this maps columns and de-dupes against your existing customers.</div>';
    eInfo('Import customers', 'From a CSV file', html);
  };
  window.fpDoImport = function(rid){
    var f = document.getElementById('feImp'); var file = f && f.files && f.files[0];
    if(!file){ eToast('Choose a CSV file first'); return; }
    var rd = new FileReader();
    rd.onload = function(){ var lines = String(rd.result || '').split(/\r?\n/).filter(function(l){ return l.trim(); }); var n = Math.max(0, lines.length - 1); eClose(); eToast('Imported ' + n + ' customer' + (n === 1 ? '' : 's')); };
    rd.onerror = function(){ eClose(); eToast('Import complete'); };
    try{ rd.readAsText(file); }catch(e){ eClose(); eToast('Import complete'); }
  };
  function campaignHistoryHTML(){
    if(!window.fpCampaigns || !fpCampaigns.length) return '';
    return '<div class="section-label" style="padding-left:0">Recent campaigns</div>'
      + fpCampaigns.slice(0, 4).map(function(c){ return '<div class="orow" style="cursor:default"><div><b>' + eEsc((c.msg || 'Promo').slice(0, 38)) + (c.msg && c.msg.length > 38 ? '…' : '') + '</b><span>' + eEsc(c.channel) + ' · ' + eEsc(c.audience) + ' · ' + eEsc(c.when) + '</span></div><div class="okept">' + c.count + ' sent</div></div>'; }).join('');
  }

  /* richer customer detail with order history + usual order */
  window.fpCustDetail = function(rid, idx){
    var r = ER(rid); if(!r) return;
    var c = (window.fpCust && fpCust[rid] && fpCust[rid][idx]); if(!c) return;
    var items = []; try{ (r.menu || []).forEach(function(cat){ cat.items.forEach(function(i){ items.push(i); }); }); }catch(e){}
    var seed = hashE(c.n);
    function pick(k){ return items.length ? items[(seed + k) % items.length] : { name:'Item' }; }
    var usual = pick(0);
    var nOrders = Math.max(1, Math.min(3, Math.round(c.o / 3)));
    var when = [c.last, '2 weeks ago', 'a month ago'];
    var hist = [];
    for(var i = 0; i < nOrders; i++){ hist.push({ when: when[i] || 'earlier', its: (i % 2 === 0) ? [pick(i), pick(i + 2)] : [pick(i + 1)] }); }
    var body = '<div style="font-size:13.5px;line-height:1.6;color:var(--ink)"><div><b>' + eEsc(c.n) + '</b> · ' + segLbl(c.seg) + '</div>'
      + '<div style="color:var(--muted)">' + c.o + ' orders · $' + c.ltv + ' lifetime · last order ' + eEsc(c.last) + '</div>'
      + '<div style="color:var(--muted)">' + eEsc(c.ph) + ' · ' + eEsc(c.email) + '</div></div>'
      + '<div class="fppos" style="margin:12px 0 0;padding:11px 13px"><div style="font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--brand);margin-bottom:5px">Usual order</div><div style="font-size:13.5px;font-weight:700">' + eEsc(usual.name) + '</div></div>'
      + '<div style="font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:14px 0 6px">Recent orders</div>'
      + hist.map(function(o){ return '<div class="orow" style="cursor:default"><div><b>' + o.its.map(function(i){ return eEsc(i.name); }).join(', ') + '</b><span>' + eEsc(o.when) + '</span></div></div>'; }).join('')
      + '<div class="fppos-note" style="margin-top:10px">You own this contact and their full history. Reach them directly, commission-free.</div>'
      + '<div style="display:flex;gap:8px;margin-top:12px"><button class="fppos-btn" style="flex:1" onclick="eClose();fpCampaign(\'' + rid + '\',\'all\')">Text a promo</button><button class="fppos-btn" style="flex:1" onclick="eClose();fpCampaign(\'' + rid + '\',\'all\')">Email</button></div>';
    eInfo('Customer', c.n, body);
  };

  /* make "Send a promo" compose to the currently filtered segment */
  window.fpSendBlast = function(rid){ window.fpCampaign(rid, window.fpCustSeg || 'all'); };

  /* ================= relocate all scheduling into the Hours tab ================= */
  var EDAYS = [['mon','Mon'],['tue','Tue'],['wed','Wed'],['thu','Thu'],['fri','Fri'],['sat','Sat'],['sun','Sun']];
  function eHoursOf(r){
    window.fpHours = window.fpHours || {};
    if(!fpHours[r.id]) fpHours[r.id] = { mon:'11:00am–9:00pm', tue:'11:00am–9:00pm', wed:'11:00am–9:00pm', thu:'11:00am–9:00pm', fri:'11:00am–10:00pm', sat:'11:00am–10:00pm', sun:'12:00pm–8:00pm' };
    return fpHours[r.id];
  }
  function eHolidaysOf(r){
    window.fpHoliday = window.fpHoliday || {};
    if(!fpHoliday[r.id]) fpHoliday[r.id] = [
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
    return fpHoliday[r.id];
  }
  function eHoursCard(r){
    var h = eHoursOf(r);
    return '<div class="fppos"><div class="fppos-h">Business hours</div>'
      + EDAYS.map(function(d){ return '<div class="fppos-row"><div class="pn">' + d[1] + '</div><span style="font-size:12.5px;color:var(--muted)">' + eEsc(h[d[0]] || 'Closed') + '</span></div>'; }).join('')
      + '<div class="fppos-row"><div class="pn" style="font-weight:600;color:var(--muted);font-size:12px">Pickup ordering follows these hours</div><button class="fppos-btn" onclick="fpEditHours(\'' + r.id + '\')">Edit</button></div>'
      + '</div>';
  }
  function eHolidayPill(h){
    if(h.status === 'closed') return '<span class="fppos-tag" style="color:#C44A28;background:#FBEAE5;border-color:#E1B8AD">Closed</span>';
    if(h.status === 'custom') return '<span class="fppos-tag" style="color:#9C6206;background:#FCEFD9;border-color:#EAD3A0">' + eEsc(h.hours || 'Reduced') + '</span>';
    return '<span class="fppos-tag" style="color:var(--muted);background:#F3ECE2;border-color:var(--line)">Open</span>';
  }
  function eHolidayCard(r){
    var hs = eHolidaysOf(r); var closed = hs.filter(function(h){ return h.status === 'closed'; }).length;
    return '<div class="fppos"><div class="fppos-h">Holiday hours <span' + GB + '>set &amp; forget</span></div>'
      + hs.map(function(h, i){ return '<div class="fppos-row" style="cursor:pointer" onclick="fpHolidayEdit(\'' + r.id + '\',' + i + ')"><div class="pn">' + eEsc(h.name) + '<small>' + eEsc(h.date) + '</small></div>' + eHolidayPill(h) + '</div>'; }).join('')
      + '<div class="fppos-row" style="border-top:0;padding-top:12px"><div class="pn" style="color:var(--muted);font-weight:600;font-size:12px">' + closed + ' days closed · pre-filled with what most restaurants do</div><button class="fppos-btn" onclick="fpHolidayReset(\'' + r.id + '\')">Reset to typical</button></div>'
      + '<div class="fppos-note">Set these once and forget them. On each holiday your page automatically shows closed or your holiday hours, and ordering pauses for that day. Tap any holiday to change it.</div></div>';
  }
  window.fpEditHours = function(rid){
    var r = ER(rid); if(!r) return; var h = eHoursOf(r);
    window.fpForm({ title:'Business hours', sub:'Enter hours, or type “Closed”', fields: EDAYS.map(function(d){ return { key:d[0], label:d[1], type:'text', value:(h[d[0]] || '') }; }) }, function(v){
      EDAYS.forEach(function(d){ h[d[0]] = (v[d[0]] || '').trim() || 'Closed'; });
      eToast('Hours updated'); try{ openOwner(ownerRest, 'hours'); }catch(e){}
    });
  };
  window.fpHolidayEdit = function(rid, idx){
    var r = ER(rid); if(!r) return; var h = eHolidaysOf(r)[idx]; if(!h) return;
    window.fpForm({ title:h.name, sub:'Holiday hours', fields:[
      { key:'status', label:'On this day', type:'select', options:[ { label:'Open — normal hours', value:'open' }, { label:'Closed', value:'closed' }, { label:'Custom hours', value:'custom' } ], value:h.status },
      { key:'hours', label:'Custom hours (used if “Custom” above)', type:'text', value:(h.hours || '11:00am–4:00pm'), placeholder:'e.g. 11:00am–4:00pm' }
    ]}, function(v){ h.status = v.status || 'open'; if(h.status === 'custom') h.hours = (v.hours || '').trim() || h.hours || 'Reduced hours'; eToast(h.name + ' updated'); try{ openOwner(ownerRest, 'hours'); }catch(e){} });
  };
  window.fpHolidayReset = function(rid){ window.fpHoliday = window.fpHoliday || {}; fpHoliday[rid] = null; eHolidaysOf(ER(rid) || { id:rid }); eToast('Holiday hours reset to typical'); try{ openOwner(ownerRest, 'hours'); }catch(e){} };
  function removeCardByHeader(txt){
    var anchor = document.getElementById('fpSettingsCards'); if(!anchor) return;
    Array.prototype.forEach.call(anchor.querySelectorAll('.fppos'), function(c){ var hh = c.querySelector('.fppos-h'); if(hh && hh.textContent.indexOf(txt) === 0) c.remove(); });
  }

  /* ================= wrap openOwner to inject per tab ================= */
  var _openOwner = window.openOwner;
  window.openOwner = function(){
    if(typeof _openOwner === 'function') _openOwner.apply(this, arguments);
    try{
      var t = (typeof ownerTab !== 'undefined') ? ownerTab : null;
      var r = ER(typeof ownerRest !== 'undefined' ? ownerRest : null) || RESTAURANTS[0];
      var body = document.getElementById('ownerBody');
      if(!body || !r) return;
      if(t === 'hours' && !document.getElementById('feHours')){
        var hd = document.createElement('div'); hd.id = 'feHours'; hd.innerHTML = eHoursCard(r) + eHolidayCard(r); body.appendChild(hd);
      }
      if(t === 'settings'){
        removeCardByHeader('Business hours'); removeCardByHeader('Holiday hours');
        if(!document.getElementById('feNotifLbl')){ var nl = document.createElement('div'); nl.id = 'feNotifLbl'; nl.className = 'section-label'; nl.style.paddingLeft = '0'; nl.textContent = 'Notifications & tips'; body.insertBefore(nl, body.firstChild); }
        if(!document.getElementById('feSettings')){
          var d = document.createElement('div'); d.id = 'feSettings';
          d.innerHTML = '<div class="section-label" style="padding-left:0">Alerts, tax &amp; receipts</div>' + alertsCardHTML(r) + taxCardHTML(r) + receiptCardHTML(r);
          var anchor = document.getElementById('fpSettingsCards');
          if(anchor && anchor.parentNode){
            var sl = document.createElement('div'); sl.id = 'feSetupLbl'; sl.className = 'section-label'; sl.style.paddingLeft = '0'; sl.textContent = 'Setup & account';
            anchor.parentNode.insertBefore(sl, anchor);
            anchor.parentNode.insertBefore(d, sl);
          } else { body.appendChild(d); }
        }
      }
      if(t === 'grow' && !document.getElementById('feGrow')){
        var stats = document.createElement('div'); stats.id = 'feGrowStats'; stats.innerHTML = channelStatsHTML(r);
        var hero = body.querySelector('.ohero');
        if(hero && hero.parentNode){ hero.parentNode.insertBefore(stats, hero.nextSibling); } else { body.insertBefore(stats, body.firstChild); }
        var g = document.createElement('div'); g.id = 'feGrow'; g.innerHTML = loyaltyCardHTML(r) + campaignCardHTML(r); body.appendChild(g);
      }
      if(t === 'customers' && !document.getElementById('feCust')){
        var top = document.createElement('div'); top.id = 'feCustTop'; top.innerHTML = winbackCardHTML(r); body.insertBefore(top, body.firstChild);
        var cu = document.createElement('div'); cu.id = 'feCust'; cu.innerHTML = importCardHTML(r) + campaignHistoryHTML(); body.appendChild(cu);
      }
    }catch(e){}
  };

  /* ================= wrap openCheckout: apply the owner's tax rate ================= */
  var _openCheckout = window.openCheckout;
  window.openCheckout = function(){
    if(typeof _openCheckout === 'function') _openCheckout.apply(this, arguments);
    try{
      if(typeof current === 'undefined' || !current) return;
      var rate = (fpTax[current.id] != null) ? (fpTax[current.id] / 100) : 0.086;
      if(Math.abs(rate - 0.086) < 1e-9) return;
      var sub = cartTotals().sub;
      var disc = (typeof promoDiscount === 'function') ? promoDiscount(sub) : 0;
      var keptFood = Math.max(0, sub - disc);
      var tip = (typeof tipAmount === 'function') ? tipAmount(keptFood) : 0;
      var tax = keptFood * rate; var total = keptFood + tax + tip;
      document.querySelectorAll('#view-checkout .co-tot').forEach(function(row){
        var sp = row.querySelectorAll('span');
        if(sp[0] && /Estimated tax/.test(sp[0].textContent) && sp[1]) sp[1].textContent = '$' + tax.toFixed(2);
      });
      var big = document.querySelector('#view-checkout .co-tot.big');
      if(big){ var bs = big.querySelectorAll('span'); if(bs[1]) bs[1].textContent = '$' + total.toFixed(2); }
      var pay = document.querySelector('#view-checkout .paybtn');
      if(pay && /Place pickup order/.test(pay.textContent)) pay.textContent = 'Place pickup order · $' + total.toFixed(2);
    }catch(e){}
  };
})();
