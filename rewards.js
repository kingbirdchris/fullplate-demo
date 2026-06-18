/* FullPlate rewards + referrals layer. Loaded after deals.js (before nav.js).
   Adds: (1) consumers refer a restaurant/food truck for FullPlate credit,
   (2) owners refer other owners/operators for a free month, (3) a cleaner
   redemption flow where rewards become FullPlate credit that auto-applies at
   checkout (no codes to type), and (4) removes the pricing card from Settings.
   All by overriding globals; no core files edited. Demo-only. */
(function(){
  if(window.__fpRewards) return; window.__fpRewards = true;

  function rEsc(s){ return (typeof esc === 'function') ? esc(s) : String(s == null ? '' : s); }
  function rToast(m){ try{ showToast(m); }catch(e){} }
  function money(n){ return '$' + (Math.round(n * 100) / 100).toFixed(2); }
  var GB = ' style="background:#EAF5EE;color:#1F6B43;border:1px solid #CDEBD0"';
  var AMB = ' style="color:#9C6206;background:#FCEFD9;border-color:#EAD3A0"';

  /* ---- state (seed one joined referral so the credit story is visible) ---- */
  if(window.fpCredit == null) window.fpCredit = 10;
  window.fpBizReferrals = window.fpBizReferrals || [
    { name:'El Sabor Poblano', city:'Phoenix', type:'restaurant', status:'joined', reward:10 }
  ];
  window.fpOwnerRefs = window.fpOwnerRefs || [
    { name:'Saffron & Sage', type:'restaurant', status:'joined', reward:'1 free month' }
  ];
  window.__fpAppliedCredit = 0;

  /* ====================================================================== */
  /* CONSUMER — refer a restaurant / food truck                              */
  /* ====================================================================== */
  window.fpReferBiz = function(){
    window.fpForm({ title:'Refer a restaurant or truck', sub:'Get $10 credit when they join', save:'Send referral', fields:[
      { key:'name', label:'Restaurant or food truck name', type:'text', placeholder:'e.g. Rosa’s Tacos' },
      { key:'type', label:'Type', type:'select', value:'restaurant', options:[ {label:'Restaurant',value:'restaurant'}, {label:'Food truck',value:'food truck'} ] },
      { key:'city', label:'City', type:'text', placeholder:'e.g. Phoenix' },
      { key:'contact', label:'How can we reach them? (optional)', type:'text', placeholder:'Instagram, phone, or website' }
    ] }, function(v){
      var n = (v.name || '').trim(); if(!n){ rToast('Add a name'); return; }
      window.fpBizReferrals.unshift({ name:n, city:(v.city || '').trim(), type:v.type || 'restaurant', status:'invited', reward:10 });
      rToast('Referral sent. You get $10 in credit when ' + n + ' joins.');
      try{ openAccount(); }catch(e){}
    });
  };
  function bizReferHTML(){
    var refs = window.fpBizReferrals || [];
    var earned = refs.filter(function(r){ return r.status === 'joined'; }).reduce(function(s, r){ return s + (r.reward || 0); }, 0);
    return '<div class="section-label" style="padding-left:0">Refer a restaurant</div>'
      + '<div class="fppos"><div class="fppos-h">Know a spot that should be on FullPlate? <span' + GB + '>$10 credit</span></div>'
      + '<div class="fppos-row"><div class="pn">Refer your favorite restaurant or food truck<small>When they join, you get $10 in FullPlate credit. They keep 100% of their sales, you keep eating local.</small></div><button class="fppos-btn" onclick="fpReferBiz()">Refer a spot</button></div>'
      + refs.map(function(r){ return '<div class="fppos-row"><div class="pn">' + rEsc(r.name) + (r.city ? ' · ' + rEsc(r.city) : '') + '<small>' + rEsc(r.type || 'restaurant') + '</small></div>' + (r.status === 'joined' ? '<span class="fppos-tag"' + GB + '>Joined · +$' + (r.reward || 10) + '</span>' : '<span class="fppos-tag"' + AMB + '>Invited</span>') + '</div>'; }).join('')
      + '<div class="fppos-note">' + (earned > 0 ? ('You have earned $' + earned + ' in credit so far. ') : '') + 'Help your neighborhood spots skip the 15–30% delivery-app commission.</div></div>';
  }

  /* ====================================================================== */
  /* IMPROVED REDEMPTION — points become auto-applying FullPlate credit      */
  /* ====================================================================== */
  window.redeemReward = function(){
    if(typeof loyaltyPts === 'undefined' || loyaltyPts < 50) return;
    loyaltyPts -= 50; window.fpCredit = (window.fpCredit || 0) + 5;
    rToast('Redeemed. $5 FullPlate credit added — it applies automatically at your next checkout.');
    try{ openAccount(); }catch(e){}
  };

  /* inject credit + referral into the Account view */
  var _openAccount = window.openAccount;
  window.openAccount = function(){
    if(typeof _openAccount === 'function') _openAccount.apply(this, arguments);
    try{
      var view = document.getElementById('view-account'); var dash = view && view.querySelector('.odash'); if(!dash) return;
      var loyal = dash.querySelector('.loyalcard');
      if(loyal && !loyal.querySelector('.rwcredit') && (window.fpCredit > 0)){
        var c = document.createElement('div'); c.className = 'rwcredit';
        c.style.cssText = 'margin-top:11px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.25);border-radius:11px;padding:9px 12px;font-size:13px;font-weight:700';
        c.innerHTML = '💳 ' + money(window.fpCredit) + ' FullPlate credit<div style="font-weight:500;font-size:11.5px;opacity:.92;margin-top:2px">Applied automatically at checkout. No code to enter.</div>';
        loyal.appendChild(c);
      }
      if(!document.getElementById('rwBizRefer')){
        var box = document.createElement('div'); box.id = 'rwBizRefer'; box.innerHTML = bizReferHTML();
        if(loyal && loyal.parentNode){ loyal.parentNode.insertBefore(box, loyal.nextSibling); } else dash.appendChild(box);
      }
    }catch(e){}
  };

  /* ====================================================================== */
  /* OWNER — refer another owner / operator; remove Settings pricing         */
  /* ====================================================================== */
  window.fpReferOwner = function(){
    window.fpForm({ title:'Refer another owner', sub:'You both get a free month', save:'Send referral', fields:[
      { key:'name', label:'Their restaurant or truck', type:'text', placeholder:'e.g. Mama Lou’s BBQ' },
      { key:'type', label:'Type', type:'select', value:'restaurant', options:[ {label:'Restaurant',value:'restaurant'}, {label:'Food truck',value:'food truck'} ] },
      { key:'owner', label:'Owner / operator name (optional)', type:'text', placeholder:'Who runs it?' },
      { key:'contact', label:'Their email or phone', type:'text', placeholder:'So we can send the invite' }
    ] }, function(v){
      var n = (v.name || '').trim(); if(!n){ rToast('Add a name'); return; }
      window.fpOwnerRefs.unshift({ name:n, type:v.type || 'restaurant', owner:(v.owner || '').trim(), status:'invited', reward:'1 free month' });
      rToast('Invite sent to ' + n + '. You both get a free month when they join.');
      try{ openOwner(ownerRest, 'grow'); }catch(e){}
    });
  };
  function ownerReferHTML(){
    var refs = window.fpOwnerRefs || [];
    var joined = refs.filter(function(r){ return r.status === 'joined'; }).length;
    return '<div class="fppos" style="margin-top:14px"><div class="fppos-h">Refer another owner <span' + GB + '>free month</span></div>'
      + '<div class="fppos-row"><div class="pn">Know a restaurant or food truck tired of delivery-app fees?<small>Refer the owner. When they join FullPlate, you both get a free month. No limit on how many you refer.</small></div><button class="fppos-btn" onclick="fpReferOwner()">Refer an owner</button></div>'
      + refs.map(function(r){ return '<div class="fppos-row"><div class="pn">' + rEsc(r.name) + '<small>' + rEsc(r.type || 'restaurant') + (r.owner ? ' · ' + rEsc(r.owner) : '') + '</small></div>' + (r.status === 'joined' ? '<span class="fppos-tag"' + GB + '>Joined · free month</span>' : '<span class="fppos-tag"' + AMB + '>Invited</span>') + '</div>'; }).join('')
      + '<div class="fppos-note">' + (joined > 0 ? (joined + ' owner' + (joined === 1 ? '' : 's') + ' you referred have joined. ') : '') + 'Operators trust other operators. This is how good tools spread.</div></div>';
  }

  var _openOwner = window.openOwner;
  window.openOwner = function(){
    if(typeof _openOwner === 'function') _openOwner.apply(this, arguments);
    try{
      var t = (typeof ownerTab !== 'undefined') ? ownerTab : null;
      var body = document.getElementById('ownerBody'); if(!body) return;
      if(t === 'settings'){ Array.prototype.forEach.call(body.querySelectorAll('.fpplan'), function(el){ if(el.parentNode) el.parentNode.removeChild(el); }); }
      if(t === 'grow' && !document.getElementById('rwOwnerRefer')){
        var d = document.createElement('div'); d.id = 'rwOwnerRefer'; d.innerHTML = ownerReferHTML(); body.appendChild(d);
      }
    }catch(e){}
  };

  /* ====================================================================== */
  /* CHECKOUT — auto-apply FullPlate credit (runs last, owns the final total) */
  /* ====================================================================== */
  var _openCheckout = window.openCheckout;
  window.openCheckout = function(){
    if(typeof _openCheckout === 'function') _openCheckout.apply(this, arguments);
    try{
      var view = document.getElementById('view-checkout');
      if(!view || view.style.display === 'none') return;
      if(typeof cartTotals === 'function' && cartTotals().count === 0) return;
      var big = view.querySelector('.co-tot.big'); if(!big) return;
      var bs = big.querySelectorAll('span');
      var cur = parseFloat(((bs[1] && bs[1].textContent) || '').replace(/[^0-9.]/g, '')) || 0;
      var credit = Math.min(window.fpCredit || 0, cur);
      window.__fpAppliedCredit = credit;
      if(credit > 0 && !document.getElementById('rwCreditRow')){
        var row = document.createElement('div'); row.className = 'co-tot'; row.id = 'rwCreditRow';
        row.innerHTML = '<span>FullPlate credit</span><span style="color:var(--good);font-weight:700">−' + money(credit) + '</span>';
        big.parentNode.insertBefore(row, big);
      }
      var total = Math.max(0, cur - credit);
      if(bs[1]) bs[1].textContent = money(total);
      var pay = view.querySelector('.paybtn');
      if(pay && /\$[0-9.]+/.test(pay.textContent)) pay.textContent = pay.textContent.replace(/\$[0-9.]+/, money(total));
    }catch(e){}
  };

  /* deduct used credit once the order is placed */
  var _placeOrder = window.placeOrder;
  window.placeOrder = function(){
    var used = window.__fpAppliedCredit || 0;
    if(typeof _placeOrder === 'function') _placeOrder.apply(this, arguments);
    try{ window.fpCredit = Math.max(0, (window.fpCredit || 0) - used); window.__fpAppliedCredit = 0; }catch(e){}
  };
})();
