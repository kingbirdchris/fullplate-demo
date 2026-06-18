/* FullPlate deals layer. Loaded after tune.js. Adds daily deals (BOGO, happy
   hour, combos, etc.) that owners manage under Promos and diners can search for
   and see on the storefront. All by overriding globals; no core files edited. */
(function(){
  if(window.__fpDeals) return; window.__fpDeals = true;

  function R(id){ try{ return RESTAURANTS.find(function(x){ return x.id === id; }); }catch(e){ return null; } }
  function dEsc(s){ return (typeof esc === 'function') ? esc(s) : String(s == null ? '' : s); }
  function dToast(m){ try{ showToast(m); }catch(e){} }
  var GB = ' style="background:#EAF5EE;color:#1F6B43;border:1px solid #CDEBD0"';
  var GY = ' style="background:#F3ECE2;color:var(--muted);border:1px solid var(--line)"';
  window.fpDeals = window.fpDeals || {};
  var dseq = 0;

  var TYPES = [
    { value:'bogo',      label:'BOGO — buy one get one free',     icon:'🎁', kw:'bogo buy one get one free 2 for 1 two for one' },
    { value:'bogo50',    label:'Buy one get one 50% off',         icon:'🎁', kw:'bogo buy one get one 50% off half price second' },
    { value:'pct',       label:'% off an item or order',          icon:'🏷️', kw:'percent off discount sale % off' },
    { value:'combo',     label:'Combo / meal deal',               icon:'🍱', kw:'combo meal deal lunch bundle' },
    { value:'free',      label:'Free item with purchase',         icon:'🎁', kw:'free gift bonus freebie' },
    { value:'amount',    label:'$ off over a threshold',          icon:'💵', kw:'discount dollars off save coupon' },
    { value:'happyhour', label:'Happy hour',                      icon:'🕒', kw:'happy hour discount afternoon % off' }
  ];
  function typeOf(t){ for(var i = 0; i < TYPES.length; i++){ if(TYPES[i].value === t) return TYPES[i]; } return TYPES[0]; }
  function dealIcon(t){ return typeOf(t).icon; }
  function dealKw(t){ return typeOf(t).kw; }
  function firstItemName(r){ try{ for(var c = 0; c < r.menu.length; c++){ if(r.menu[c].items.length) return r.menu[c].items[0].name; } }catch(e){} return 'item'; }
  function defTitle(t){ return ({ bogo:'Buy one get one free', bogo50:'Buy one get one 50% off', pct:'20% off', combo:'Lunch combo', free:'Free side with your order', amount:'$5 off', happyhour:'Happy hour 20% off' })[t] || 'Daily deal'; }
  function defDesc(t, r){ var it = firstItemName(r || {}); return ({ bogo:'Order any ' + it + ', get a second free', bogo50:'Your second ' + it + ' is half price', pct:'20% off your order', combo:it + ' plus a drink for $9', free:'A free side on any order over $20', amount:'$5 off orders over $30', happyhour:'20% off your whole order' })[t] || ''; }

  /* ---- seed a couple of deals per restaurant so the demo is searchable ---- */
  try{
    var SEED = [
      function(r){ return { type:'bogo', title:'Buy one get one free', desc:'Order any ' + firstItemName(r) + ', get a second free', avail:'Tuesdays', time:'' }; },
      function(r){ return { type:'happyhour', title:'Happy hour 20% off', desc:'20% off your whole order', avail:'Mon to Fri', time:'3:00–5:00pm' }; },
      function(r){ return { type:'bogo50', title:'Buy one get one 50% off', desc:'Your second ' + firstItemName(r) + ' is half price', avail:'Everyday', time:'' }; },
      function(r){ return { type:'combo', title:'Lunch combo $9', desc:firstItemName(r) + ' plus a drink for $9', avail:'Mon to Fri', time:'11:00am–2:00pm' }; },
      function(r){ return { type:'amount', title:'$5 off $30', desc:'$5 off orders over $30', avail:'Everyday', time:'' }; },
      function(r){ return { type:'free', title:'Free side over $20', desc:'A free side on any order over $20', avail:'Everyday', time:'' }; }
    ];
    (typeof RESTAURANTS !== 'undefined' ? RESTAURANTS : []).forEach(function(r, i){
      if(window.fpDeals[r.id]) return;
      var a = SEED[i % SEED.length](r), b = SEED[(i + 2) % SEED.length](r);
      a.id = 'ds' + (++dseq); a.active = true; a.kw = dealKw(a.type);
      b.id = 'ds' + (++dseq); b.active = true; b.kw = dealKw(b.type);
      window.fpDeals[r.id] = [a, b];
    });
  }catch(e){}

  /* ====================================================================== */
  /* OWNER — Daily deals under Promos                                       */
  /* ====================================================================== */
  function dealCardHTML(rid, d, i){
    var on = d.active !== false;
    return '<div class="ocard"><div class="ohd"><b>' + dealIcon(d.type) + ' ' + dEsc(d.title) + '</b><span class="otime">' + dEsc(d.avail || 'Everyday') + (d.time ? ' · ' + dEsc(d.time) : '') + '</span></div>'
      + '<div style="margin-bottom:8px">' + (on ? '<span class="fppos-tag"' + GB + '>Active</span>' : '<span class="fppos-tag"' + GY + '>Paused</span>') + '</div>'
      + '<div class="oitems" style="font-weight:500">' + dEsc(d.desc) + '</div>'
      + '<div class="ofoot" style="flex-wrap:wrap;justify-content:flex-start;gap:7px;margin-top:9px">'
      +   '<button class="ebtn" onclick="fpDealToggle(\'' + rid + '\',' + i + ')">' + (on ? 'Pause' : 'Activate') + '</button>'
      +   '<button class="ebtn" onclick="fpDealEdit(\'' + rid + '\',' + i + ')">Edit</button>'
      +   '<button class="ebtn del" onclick="fpDealDelete(\'' + rid + '\',' + i + ')">Delete</button>'
      + '</div></div>';
  }
  function dealsOwnerHTML(r){
    var deals = window.fpDeals[r.id] || [];
    return '<div class="section-label" style="padding-left:0;margin-top:20px">Daily deals</div>'
      + '<button class="addbtn2" onclick="fpDealCreate(\'' + r.id + '\')">+ Create deal</button>'
      + (deals.length ? deals.map(function(d, i){ return dealCardHTML(r.id, d, i); }).join('') : '<div class="empty">No deals yet. Add BOGO, happy hour, combos and more. Diners can search for them.</div>')
      + '<div class="realnote" style="margin-top:14px">Deals show on your storefront and are searchable across FullPlate. Someone searching “BOGO”, “happy hour”, or “50% off” will find you. Pause or delete anytime.</div>';
  }
  function dealForm(opts){
    return [
      { key:'type', label:'Deal type', type:'select', value:opts.type || 'bogo', options:TYPES.map(function(t){ return { label:t.label, value:t.value }; }) },
      { key:'title', label:'Title (what diners see)', type:'text', value:opts.title || '', placeholder:'e.g. Taco Tuesday BOGO' },
      { key:'desc', label:'Details', type:'text', value:opts.desc || '', placeholder:'e.g. Buy any taco, get one free' },
      { key:'avail', label:'Available', type:'select', value:opts.avail || 'Everyday', options:['Everyday','Mon to Fri','Weekends','Mondays','Tuesdays','Wednesdays','Thursdays','Fridays','Saturdays','Sundays'].map(function(d){ return { label:d, value:d }; }) },
      { key:'time', label:'Time window (optional)', type:'text', value:opts.time || '', placeholder:'e.g. 3:00–5:00pm' }
    ];
  }
  window.fpDealCreate = function(rid){
    var r = R(rid) || {};
    window.fpForm({ title:'New daily deal', save:'Create deal', fields:dealForm({}) }, function(v){
      var t = v.type || 'bogo';
      window.fpDeals[rid] = window.fpDeals[rid] || [];
      window.fpDeals[rid].unshift({ id:'d' + (++dseq), type:t, title:(v.title || '').trim() || defTitle(t), desc:(v.desc || '').trim() || defDesc(t, r), avail:v.avail || 'Everyday', time:(v.time || '').trim(), active:true, kw:dealKw(t) });
      dToast('Deal created'); try{ openOwner(ownerRest, 'promos'); }catch(e){}
    });
  };
  window.fpDealEdit = function(rid, i){
    var d = (window.fpDeals[rid] || [])[i]; if(!d) return;
    window.fpForm({ title:'Edit deal', save:'Save', fields:dealForm(d) }, function(v){
      var t = v.type || d.type;
      d.type = t; d.title = (v.title || '').trim() || d.title; d.desc = (v.desc || '').trim() || d.desc; d.avail = v.avail || d.avail; d.time = (v.time || '').trim(); d.kw = dealKw(t);
      dToast('Deal updated'); try{ openOwner(ownerRest, 'promos'); }catch(e){}
    });
  };
  window.fpDealDelete = function(rid, i){ var arr = window.fpDeals[rid] || []; if(!arr[i]) return; arr.splice(i, 1); dToast('Deal deleted'); try{ openOwner(ownerRest, 'promos'); }catch(e){} };
  window.fpDealToggle = function(rid, i){ var d = (window.fpDeals[rid] || [])[i]; if(!d) return; d.active = (d.active === false); dToast(d.active ? 'Deal active' : 'Deal paused'); try{ openOwner(ownerRest, 'promos'); }catch(e){} };

  /* append the deals section to the Promos tab */
  var _promosTab = window.promosTab;
  window.promosTab = function(r){
    var promo = (typeof _promosTab === 'function') ? _promosTab(r) : '';
    return '<div class="section-label" style="padding-left:0">Promo codes</div>' + promo + dealsOwnerHTML(r);
  };

  /* ====================================================================== */
  /* CONSUMER — deals on the storefront, in search, and on home cards       */
  /* ====================================================================== */
  function dealsConsumerHTML(deals){
    return '<div id="rcpDeals" style="margin:6px 16px 2px;padding:12px 14px;background:linear-gradient(135deg,#FFF4EC,#FDEEE7);border:1px solid #F4D6C6;border-radius:14px">'
      + '<div style="font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--brand);margin-bottom:8px">🔥 Today’s deals</div>'
      + deals.map(function(d){ return '<div style="display:flex;gap:9px;align-items:flex-start;padding:5px 0">'
        + '<span style="font-size:16px;line-height:1.3">' + dealIcon(d.type) + '</span>'
        + '<div><div style="font-size:13.5px;font-weight:700;color:var(--ink);line-height:1.25">' + dEsc(d.title) + '</div>'
        + '<div style="font-size:12px;color:var(--muted)">' + dEsc(d.desc) + (d.avail ? ' · ' + dEsc(d.avail) : '') + (d.time ? ' · ' + dEsc(d.time) : '') + '</div></div></div>'; }).join('')
      + '</div>';
  }
  var _openRestaurant = window.openRestaurant;
  window.openRestaurant = function(){
    if(typeof _openRestaurant === 'function') _openRestaurant.apply(this, arguments);
    try{
      var r = current, view = document.getElementById('view-restaurant');
      if(!r || !view || document.getElementById('rcpDeals')) return;
      var deals = (window.fpDeals[r.id] || []).filter(function(d){ return d.active !== false; });
      if(!deals.length) return;
      var box = document.createElement('div'); box.innerHTML = dealsConsumerHTML(deals); var node = box.firstChild;
      var chips = document.getElementById('cpChips'), firstCat = view.querySelector('.menucat');
      if(chips && chips.parentNode){ chips.parentNode.insertBefore(node, chips.nextSibling); }
      else if(firstCat && firstCat.parentNode){ firstCat.parentNode.insertBefore(node, firstCat); }
      else view.appendChild(node);
    }catch(e){}
  };

  /* make deals searchable from the home search box */
  var _matchSearch = window.matchSearch;
  window.matchSearch = function(r, q){
    try{ if(typeof _matchSearch === 'function' && _matchSearch(r, q)) return true; }catch(e){}
    var deals = window.fpDeals[r.id] || [];
    return deals.some(function(d){ return d.active !== false && ((d.title + ' ' + d.desc + ' ' + (d.kw || '') + ' ' + d.type + ' deal deals').toLowerCase().indexOf(q) >= 0); });
  };

  /* small deal chip on home restaurant cards for discoverability */
  var _renderHome = window.renderHome;
  window.renderHome = function(){
    if(typeof _renderHome === 'function') _renderHome.apply(this, arguments);
    try{
      document.querySelectorAll('#rlist .rcard').forEach(function(card){
        if(card.querySelector('.rdealchip')) return;
        var oc = card.getAttribute('onclick') || '', m = oc.match(/openRestaurant\('([^']+)'\)/); if(!m) return;
        var deals = (window.fpDeals[m[1]] || []).filter(function(d){ return d.active !== false; }); if(!deals.length) return;
        var meta = card.querySelector('.rmeta'); if(!meta) return;
        var chip = document.createElement('span'); chip.className = 'rdealchip';
        chip.style.cssText = 'color:#C44A28;font-weight:800;font-size:11.5px;background:#FDEEE7;border:1px solid #F4D6C6;border-radius:999px;padding:1px 8px;margin-left:6px;white-space:nowrap';
        chip.textContent = '🔥 ' + deals.length + ' deal' + (deals.length > 1 ? 's' : '');
        meta.appendChild(chip);
      });
    }catch(e){}
  };
})();
