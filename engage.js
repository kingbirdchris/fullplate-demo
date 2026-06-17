/* FullPlate engagement layer: owner-side Grow toolkit and Customers panel, plus
   a "switching from another provider" option in onboarding. Loaded after
   growth.js. Wraps ownerBody / openOwner / openOnboard so it needs no edits to
   owner.js or core.js. Embodies the review's strategic conclusions: FullPlate
   wins by helping a restaurant convert the demand it already has (commission-
   free) and by giving it the customer list and data the delivery apps withhold. */
(function(){
  if(window.__fpEngage) return; window.__fpEngage = true;

  var css = ''
  + '.growlink{display:flex;gap:8px;align-items:center;margin:8px 0 2px}'
  + '.growurl{flex:1;background:rgba(255,255,255,.16);border-radius:8px;padding:9px 11px;font-size:13px;font-weight:700;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
  + '.growcopy{background:#fff;color:var(--ink);border:0;border-radius:8px;padding:9px 15px;font-size:12.5px;font-weight:800;cursor:pointer;white-space:nowrap}'
  + '.growgrid{display:flex;flex-direction:column;gap:9px}'
  + '.growcard{display:flex;gap:11px;align-items:flex-start;border:1px solid var(--line);border-radius:13px;padding:12px 13px;background:#fff}'
  + '.growcard .gci{font-size:20px;line-height:1.2}'
  + '.growcard b{font-size:13.5px;display:block;color:var(--ink)}'
  + '.growcard span{font-size:12px;color:var(--muted);display:block;margin-top:2px;line-height:1.45}'
  + '.growcard a{color:var(--brand);font-weight:700;cursor:pointer}'
  + '.ownednote{font-size:12.5px;background:#EAF6EE;border:1px solid #CDEBD0;color:#1F6B43;border-radius:11px;padding:10px 12px;margin:10px 0;font-weight:600;line-height:1.45}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---- mock customer data (deterministic per restaurant) ---- */
  function custData(r){
    var base = Math.max(60, Math.round((r.reviews || 200) * 0.85));
    var repeat = Math.max(34, Math.min(72, 36 + (r.rating ? Math.round((r.rating - 4) * 34) : 12)));
    var list = [
      {n:'Maria L.', o:12, l:'2 days ago', s:184},
      {n:'James K.', o:7, l:'5 days ago', s:98},
      {n:'Priya R.', o:5, l:'1 week ago', s:71},
      {n:'Devin S.', o:9, l:'3 days ago', s:132},
      {n:'Ana G.', o:4, l:'2 weeks ago', s:56}
    ];
    return { total: base, repeat: repeat, month: Math.round(base * 0.14), list: list };
  }

  function growcard(ic, t, b){
    return '<div class="growcard"><div class="gci">' + ic + '</div><div><b>' + t + '</b><span>' + b + '</span></div></div>';
  }
  function growHTML(r){
    var url = 'fullplate.app/r/' + r.id;
    return '<div class="ohero">'
      + '<div class="lbl">Your commission-free ordering link</div>'
      + '<div class="growlink"><span class="growurl">' + url + '</span><button class="growcopy" onclick="fpCopyOrderLink(\'' + r.id + '\')">Copy</button></div>'
      + '<div class="osub">Put this anywhere your customers already are. Every order through it is 0% commission, and the customer is yours.</div>'
      + '</div>'
      + '<div class="section-label" style="padding-left:0">Drive your own orders</div>'
      + '<div class="growgrid">'
      + growcard('🔎', 'Add to your Google listing', 'Turn on an Order button on your Google profile so searchers order direct, commission-free.')
      + growcard('🌐', 'Embed on your website', 'Drop FullPlate ordering onto your own site so diners never leave it. <a onclick="fpShowEmbed(\'' + r.id + '\')">Preview ›</a>')
      + growcard('📲', 'Share to social', 'Post your link to Instagram and Facebook in one tap.')
      + growcard('🪧', 'QR table tents and flyers', 'We generate printable QR codes for tables, windows, and to-go bags.')
      + '</div>'
      + '<div class="realnote" style="margin-top:14px">FullPlate turns the customers you already have into direct, commission-free orders. You bring the demand, you keep 100%. As more spots near you join FullPlate, the local marketplace sends extra discovery on top, but your own channels are the engine.</div>';
  }
  function custHTML(r){
    var d = custData(r);
    return '<div class="ostatrow">'
      + '<div class="ostat"><b>' + d.total.toLocaleString() + '</b><span>customers</span></div>'
      + '<div class="ostat"><b>' + d.repeat + '%</b><span>repeat rate</span></div>'
      + '<div class="ostat"><b>' + d.month + '</b><span>new this month</span></div>'
      + '</div>'
      + '<div class="ownednote">✓ You own this list. On a delivery app the customer belongs to the app. On FullPlate they are yours, with contact info, for loyalty and marketing.</div>'
      + '<div class="section-label" style="padding-left:0">Recent customers</div>'
      + d.list.map(function(c){ return '<div class="orow"><div><b>' + esc(c.n) + '</b><span>' + c.o + ' orders · last ' + esc(c.l) + '</span></div><div class="okept">$' + c.s + ' lifetime</div></div>'; }).join('')
      + '<button class="addbtn2" style="margin-top:12px" onclick="fpSendBlast(\'' + r.id + '\')">✦ Send a promo to your customers</button>'
      + '<div class="realnote" style="margin-top:10px">Email and SMS campaigns, win-back offers, and loyalty all run on the customer list you own here. This is the retention engine the delivery apps keep from you.</div>';
  }

  /* ---- wrap ownerBody to route the two new tabs ---- */
  var _ownerBody = window.ownerBody;
  window.ownerBody = function(r){
    if(typeof ownerTab !== 'undefined' && ownerTab === 'grow') return growHTML(r);
    if(typeof ownerTab !== 'undefined' && ownerTab === 'customers') return custHTML(r);
    return _ownerBody(r);
  };

  /* ---- wrap openOwner to inject the Grow + Customers tabs into the bar ---- */
  var _openOwner = window.openOwner;
  window.openOwner = function(id, tab){
    _openOwner(id, tab);
    try{
      var bar = document.querySelector('#view-owner .otabs');
      if(!bar) return;
      var rid = (typeof ownerRest !== 'undefined') ? ownerRest : id;
      [['grow','Grow'], ['customers','Customers']].forEach(function(t){
        var b = document.createElement('button');
        b.className = 'otab' + ((typeof ownerTab !== 'undefined' && ownerTab === t[0]) ? ' on' : '');
        b.textContent = t[1];
        b.setAttribute('onclick', "openOwner('" + rid + "','" + t[0] + "')");
        bar.appendChild(b);
      });
    }catch(e){}
  };

  /* ---- actions ---- */
  window.fpCopyOrderLink = function(id){
    var u = 'https://fullplate.app/r/' + id;
    try{ if(navigator.clipboard) navigator.clipboard.writeText(u); }catch(e){}
    showToast('Ordering link copied');
  };
  window.fpSendBlast = function(id){
    var r = RESTAURANTS.find(function(x){ return x.id === id; }) || {};
    var code = 'COMEBACK' + Math.floor(Math.random() * 90 + 10);
    try{ promos.push({ code: code, type: 'pct', value: 10, label: '10% win-back' }); }catch(e){}
    var n = custData(r).total;
    showToast('Promo ' + code + ' sent to ' + n.toLocaleString() + ' customers by email + SMS');
  };
  window.fpShowEmbed = function(id){
    if(typeof onboardEmbed === 'function'){
      onboardEmbed(id);
      show('view-onboard');
      var bb = document.getElementById('backBtn'); if(bb) bb.style.display = 'flex';
    }
  };

  /* ---- switching-from-provider option in onboarding ---- */
  var _openOnboard = window.openOnboard;
  if(typeof _openOnboard === 'function'){
    window.openOnboard = function(){
      _openOnboard();
      try{
        var wrap = document.querySelector('#view-onboard .obwrap');
        var urlField = document.getElementById('obUrl');
        if(wrap && urlField && !document.getElementById('obProvider')){
          var div = document.createElement('div');
          div.innerHTML = '<label class="oblabel">Coming from another provider? (optional)</label>'
            + '<select id="obProvider" class="obselect"><option>Not switching</option><option>ChowNow</option><option>GloriaFood</option><option>Toast Online Ordering</option><option>Square Online</option><option>Owner.com</option><option>Other</option></select>'
            + '<div class="obtiny" style="margin-top:6px">Switching is easy. We import your menu and you keep your customers and your phone number. (GloriaFood is winding down, so we make that move painless.)</div>';
          var cityRow = wrap.querySelector('.obrow3');
          if(cityRow) wrap.insertBefore(div, cityRow); else wrap.appendChild(div);
        }
      }catch(e){}
    };
  }
})();
