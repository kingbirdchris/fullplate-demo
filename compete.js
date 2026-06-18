/* FullPlate competitive layer — loaded LAST, after enhance.js. Self-contained:
   it only wraps globals (openOwner, ownerBody, openCheckout, openRestaurant) and
   adds window functions, so it never edits the core files. Adds the ten
   competitor-parity features as demo-functional workflows:
     1 Delivery via flat-fee dispatch   2 AI phone answering   3 Gift cards
     4 Automated AI marketing           5 Table QR + scheduled orders
     6 Catering & group ordering        7 Reservations & waitlist
     8 Smart checkout upsells           9 Express wallet pay
    10 Reports & analytics (new owner tab)
   All demo-only. No real money moves, no real dispatch, no real messages. */
(function(){
  if(window.__fpCompete) return; window.__fpCompete = true;

  /* ---------------- helpers ---------------- */
  function C(id){ try{ return RESTAURANTS.find(function(x){ return x.id === id; }); }catch(e){ return null; } }
  function cEsc(s){ return (typeof esc === 'function') ? esc(s) : String(s == null ? '' : s); }
  function cToast(m){ try{ showToast(m); }catch(e){} }
  function cHash(s){ var h = 0; s = String(s); for(var i = 0; i < s.length; i++){ h = (h * 31 + s.charCodeAt(i)) >>> 0; } return h; }
  function money(n){ return '$' + (Math.round(n * 100) / 100).toFixed(2); }
  var GB = ' style="background:#EAF5EE;color:#1F6B43;border:1px solid #CDEBD0"';
  var GY = ' style="background:#F3ECE2;color:var(--muted);border:1px solid var(--line)"';

  /* ---------------- demo state ---------------- */
  window.fpDelivery = window.fpDelivery || {};        /* rid -> {on,fee,partner,radius} */
  window.fpFulfill = window.fpFulfill || {};          /* rid -> 'pickup'|'delivery' */
  window.fpDeliveryAddr = window.fpDeliveryAddr || {};/* rid -> address string */
  window.fpWhen = window.fpWhen || {};                /* rid -> 'asap' | time label */
  window.fpScheduledOn = window.fpScheduledOn || {};  /* rid -> bool */
  window.fpGiftCredit = window.fpGiftCredit || 0;     /* global redeemable credit */
  window.fpPaidWith = '';                             /* wallet flag for confirmation */
  window.fpPhone = window.fpPhone || {};              /* rid -> {on} */
  window.fpGiftSell = window.fpGiftSell || {};        /* rid -> {on} */
  window.fpAuto = window.fpAuto || {};                /* rid -> lifecycle automations */
  window.fpPlan = window.fpPlan || {};                /* rid -> [campaigns] */
  window.fpReserveOn = window.fpReserveOn || {};
  window.fpWaitlistOn = window.fpWaitlistOn || {};
  window.fpCateringOn = window.fpCateringOn || {};
  window.fpBookings = window.fpBookings || {};        /* rid -> [reservations] */
  window.fpWaitlist = window.fpWaitlist || {};        /* rid -> [waitlist parties] */
  window.fpCatering = window.fpCatering || {};        /* rid -> [catering requests] */

  function deliv(r){ if(!fpDelivery[r.id]) fpDelivery[r.id] = { on:false, fee:7, partner:'Uber Direct', radius:5 }; return fpDelivery[r.id]; }
  function phone(r){ if(!fpPhone[r.id]) fpPhone[r.id] = { on:true }; return fpPhone[r.id]; }
  function giftSell(r){ if(!fpGiftSell[r.id]) fpGiftSell[r.id] = { on:true }; return fpGiftSell[r.id]; }
  function autoOf(r){ if(!fpAuto[r.id]) fpAuto[r.id] = { welcome:true, abandoned:false, birthday:true, postorder:true }; return fpAuto[r.id]; }
  function schedOn(r){ if(fpScheduledOn[r.id] === undefined) fpScheduledOn[r.id] = true; return fpScheduledOn[r.id]; }
  function items(r){ var out = []; try{ (r.menu || []).forEach(function(c){ c.items.forEach(function(i){ out.push(i); }); }); }catch(e){} return out; }

  /* ---------------- self-contained info sheet ---------------- */
  function cInfo(title, sub, html, footBtn, footCb){
    if(!document.getElementById('cpSheet')){
      var b = document.createElement('div'); b.className = 'sheet-backdrop'; b.id = 'cpBack'; b.onclick = cClose;
      var s = document.createElement('div'); s.className = 'sheet modsheet'; s.id = 'cpSheet'; s.setAttribute('role','dialog');
      s.innerHTML = '<div class="sheet-head"><div class="ht"><b id="cpTitle"></b><span id="cpSub"></span></div><button class="close" id="cpX" aria-label="Close">✕</button></div>'
        + '<div class="modbody" id="cpBody" style="padding:14px 16px 16px"></div><div class="modfoot"><button class="paybtn" id="cpDone">Done</button></div>';
      document.body.appendChild(b); document.body.appendChild(s);
      document.getElementById('cpX').onclick = cClose;
    }
    document.getElementById('cpTitle').textContent = title || '';
    document.getElementById('cpSub').textContent = sub || '';
    document.getElementById('cpBody').innerHTML = html;
    var done = document.getElementById('cpDone');
    done.textContent = footBtn || 'Done';
    done.onclick = footCb || cClose;
    var bk = document.getElementById('cpBack'); bk.style.display = 'block';
    requestAnimationFrame(function(){ bk.style.opacity = '1'; document.getElementById('cpSheet').classList.add('open'); });
  }
  function cClose(){ var s = document.getElementById('cpSheet'); if(s) s.classList.remove('open'); var b = document.getElementById('cpBack'); if(b){ b.style.opacity = '0'; setTimeout(function(){ b.style.display = 'none'; }, 200); } }
  window.cpClose = cClose;

  /* ====================================================================== */
  /* ============================ DINER SIDE ============================== */
  /* ====================================================================== */

  /* ---- #1 fulfillment + #3 gift redeem + #8 upsell + #9 wallet ---- */
  window.fpSetFulfill = function(rid, mode){ fpFulfill[rid] = mode; try{ openCheckout(); }catch(e){} };
  window.fpEditDeliveryAddr = function(rid){
    window.fpForm({ title:'Delivery address', sub:'Where should the courier bring it?', fields:[
      { key:'addr', label:'Address', type:'text', value:(fpDeliveryAddr[rid] || '123 W Roosevelt St, Phoenix AZ') }
    ]}, function(v){ fpDeliveryAddr[rid] = (v.addr || '').trim() || fpDeliveryAddr[rid]; try{ openCheckout(); }catch(e){} });
  };
  window.fpAddUpsell = function(id){ try{ addToCart(id); }catch(e){} try{ openCheckout(); }catch(e){} };
  window.fpApplyGiftField = function(){
    var el = document.getElementById('cpGiftIn'); var code = (el && el.value || '').trim().toUpperCase();
    if(!code){ cToast('Enter a gift card code'); return; }
    window.fpGiftCredit = 25; cToast('Gift card applied: $25.00 credit'); try{ openCheckout(); }catch(e){}
  };
  window.fpRedeemGift = function(){
    cInfo('Redeem a gift card', 'Demo code: GIFT25',
      '<div class="fppos-note" style="margin:0 0 10px">Enter a FullPlate gift card code to apply its balance to this order. Try the demo code <b>GIFT25</b> for a $25 credit.</div>'
      + '<input id="cpGiftIn" placeholder="Gift card code" value="GIFT25" style="width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:11px;font-size:14px;margin-bottom:12px">'
      + '<button class="embcopybtn" onclick="fpApplyGiftField()">Apply gift card</button>');
  };
  window.fpWalletPay = function(kind){ window.fpPaidWith = kind; cToast('Paid with ' + kind + ' (demo)'); try{ placeOrder(); }catch(e){} };

  function fulfillBlockHTML(r){
    var d = deliv(r); var mode = fpFulfill[r.id] || 'pickup';
    var seg = '<div style="display:flex;gap:8px;margin:2px 0 0">'
      + '<button onclick="fpSetFulfill(\'' + r.id + '\',\'pickup\')" style="flex:1;padding:11px;border-radius:11px;font-size:13.5px;font-weight:700;cursor:pointer;border:1px solid ' + (mode === 'pickup' ? 'var(--brand);background:#FDEEE7;color:var(--brand)' : 'var(--line);background:#fff;color:var(--ink)') + '">◷ Pickup</button>'
      + '<button onclick="fpSetFulfill(\'' + r.id + '\',\'delivery\')" style="flex:1;padding:11px;border-radius:11px;font-size:13.5px;font-weight:700;cursor:pointer;border:1px solid ' + (mode === 'delivery' ? 'var(--brand);background:#FDEEE7;color:var(--brand)' : 'var(--line);background:#fff;color:var(--ink)') + '">⚡ Delivery</button></div>';
    var addr = (mode === 'delivery')
      ? '<div class="fppos-row" style="margin-top:8px"><div class="pn">Deliver to<small>' + cEsc(fpDeliveryAddr[r.id] || '123 W Roosevelt St, Phoenix AZ') + '</small></div><button class="fppos-btn" onclick="fpEditDeliveryAddr(\'' + r.id + '\')">Change</button></div>'
        + '<div class="fppos-note">A ' + d.partner + ' courier brings it for a flat ' + money(d.fee) + ', paid by you. The restaurant still keeps 100% of the food total. No commission.</div>'
      : '';
    return '<div class="fppos" id="cpFulfill" style="margin:12px 0 4px"><div class="fppos-h">How do you want it?</div>' + seg + addr + '</div>';
  }
  function upsellHTML(r){
    var inCart = {}; try{ cart.forEach(function(c){ inCart[c.id] = 1; }); }catch(e){}
    var pool = items(r).filter(function(i){ return !inCart[i.id] && i.price > 0; }).slice(0, 6);
    if(!pool.length) return '';
    var pick = pool.slice(0, 3);
    return '<div class="fppos" id="cpUpsell" style="margin:0 0 4px"><div class="fppos-h">Add to your order <span' + GB + '>popular</span></div>'
      + '<div style="display:flex;gap:8px;overflow-x:auto;padding:2px 0 2px">'
      + pick.map(function(i){ return '<button onclick="fpAddUpsell(\'' + i.id + '\')" style="flex:0 0 auto;min-width:128px;text-align:left;border:1px solid var(--line);background:#fff;border-radius:12px;padding:10px 11px;cursor:pointer">'
        + '<div style="font-size:12.5px;font-weight:700;color:var(--ink);line-height:1.3">' + cEsc(i.name) + '</div>'
        + '<div style="font-size:12px;color:var(--muted);margin-top:3px">' + money(i.price) + ' &middot; <span style="color:var(--brand);font-weight:700">+ Add</span></div></button>'; }).join('')
      + '</div><div class="fppos-note">Smart add-ons lift the average order. Suggested from what pairs well, in your control.</div></div>';
  }

  function decorateCheckout(){
    try{
      if(typeof current === 'undefined' || !current) return;
      var r = current; var view = document.getElementById('view-checkout');
      if(!view || view.style.display === 'none') return;
      if(typeof cartTotals === 'function' && cartTotals().count === 0) return;
      var d = deliv(r); var mode = fpFulfill[r.id] || 'pickup';
      var delivOn = !!d.on; if(!delivOn && mode === 'delivery'){ mode = 'pickup'; fpFulfill[r.id] = 'pickup'; }

      /* insert blocks after the order lines, before the promo row */
      var promo = view.querySelector('.promorow');
      var anchor = promo || view.querySelector('.co-tot');
      if(anchor && anchor.parentNode && !document.getElementById('cpStack')){
        var stack = document.createElement('div'); stack.id = 'cpStack';
        stack.innerHTML = (delivOn ? fulfillBlockHTML(r) : '') + upsellHTML(r);
        anchor.parentNode.insertBefore(stack, anchor);
      }

      /* the owner's Order-ahead setting governs pitch.js's pickup-time picker */
      try{
        var schedule = schedOn(r); var ptBlock = null;
        Array.prototype.forEach.call(view.children, function(c){
          if(ptBlock || c.id === 'cpStack') return;
          var cl = c.className || '';
          if(/section-label|co-line|promorow|tiprow|tiplabel|co-tot|savecard|demo-note|cpExtras/.test(cl)) return;
          if(/Pickup time/i.test(c.textContent || '')) ptBlock = c;
        });
        if(ptBlock) ptBlock.style.display = schedule ? '' : 'none';
      }catch(e){}

      /* recompute the true total from source globals (this layer runs last) */
      var sub = cartTotals().sub;
      var disc = (typeof promoDiscount === 'function') ? promoDiscount(sub) : 0;
      var keptFood = Math.max(0, sub - disc);
      var rate = (window.fpTax && fpTax[r.id] != null) ? (fpTax[r.id] / 100) : 0.086;
      var tax = keptFood * rate;
      var tip = (typeof tipAmount === 'function') ? tipAmount(keptFood) : 0;
      var fee = (delivOn && mode === 'delivery') ? d.fee : 0;
      var preCredit = keptFood + tax + tip + fee;
      var credit = Math.min(window.fpGiftCredit || 0, preCredit);
      var total = Math.max(0, preCredit - credit);

      var bigRow = view.querySelector('.co-tot.big');
      if(bigRow && bigRow.parentNode){
        /* delivery fee + gift credit rows, inserted once, just above Total */
        if(fee > 0 && !document.getElementById('cpFeeRow')){
          var fr = document.createElement('div'); fr.className = 'co-tot'; fr.id = 'cpFeeRow';
          fr.innerHTML = '<span>Delivery (' + d.partner + ', flat fee)</span><span>' + money(fee) + '</span>';
          bigRow.parentNode.insertBefore(fr, bigRow);
        }
        if(credit > 0 && !document.getElementById('cpGiftRow')){
          var gr = document.createElement('div'); gr.className = 'co-tot'; gr.id = 'cpGiftRow';
          gr.innerHTML = '<span>Gift card</span><span style="color:var(--good);font-weight:700">−' + money(credit) + '</span>';
          bigRow.parentNode.insertBefore(gr, bigRow);
        }
        var bs = bigRow.querySelectorAll('span'); if(bs[1]) bs[1].textContent = money(total);
      }

      /* gift-card redeem link + wallet buttons + pay button label */
      var pay = view.querySelector('.paybtn');
      if(pay){
        var label = (mode === 'delivery') ? 'Place delivery order' : 'Place pickup order';
        pay.textContent = label + ' · ' + money(total);
        if(!document.getElementById('cpExtras')){
          var ex = document.createElement('div'); ex.id = 'cpExtras';
          ex.innerHTML =
            (window.fpGiftCredit > 0 ? '' : '<button class="fppos-btn" style="width:100%;margin:0 0 10px" onclick="fpRedeemGift()">🎁 Redeem a gift card</button>')
            + '<div style="display:flex;gap:8px;margin:0 0 10px">'
            + '<button onclick="fpWalletPay(\'Apple Pay\')" style="flex:1;padding:12px;border-radius:11px;border:0;background:#111;color:#fff;font-size:14px;font-weight:700;cursor:pointer"> Pay</button>'
            + '<button onclick="fpWalletPay(\'Google Pay\')" style="flex:1;padding:12px;border-radius:11px;border:1px solid var(--line);background:#fff;color:#111;font-size:14px;font-weight:700;cursor:pointer">G Pay</button>'
            + '</div>'
            + '<div style="text-align:center;font-size:11.5px;color:var(--muted);margin:0 0 6px">Express checkout · demo only</div>';
          pay.parentNode.insertBefore(ex, pay);
        }
      }
    }catch(e){}
  }

  var _openCheckout = window.openCheckout;
  window.openCheckout = function(){
    if(typeof _openCheckout === 'function') _openCheckout.apply(this, arguments);
    decorateCheckout();
  };

  /* ---- #3/#6/#7 storefront action chips: reserve, catering, gift, group ---- */
  window.fpReserve = function(rid){
    var r = C(rid) || {};
    window.fpForm({ title:'Reserve a table', sub:r.name || '', save:'Request booking', fields:[
      { key:'name', label:'Name', type:'text', value:'' },
      { key:'party', label:'Party size', type:'select', options:['1','2','3','4','5','6','7','8'].map(function(n){ return { label:n, value:n }; }), value:'2' },
      { key:'day', label:'Day', type:'select', options:[ {label:'Today',value:'Today'}, {label:'Tomorrow',value:'Tomorrow'}, {label:'Friday',value:'Friday'}, {label:'Saturday',value:'Saturday'} ], value:'Today' },
      { key:'time', label:'Time', type:'select', options:['5:00pm','5:30pm','6:00pm','6:30pm','7:00pm','7:30pm','8:00pm'].map(function(t){ return { label:t, value:t }; }), value:'7:00pm' }
    ]}, function(v){
      seedBookings(r); fpBookings[rid].unshift({ name:(v.name || 'Guest'), party:parseInt(v.party, 10) || 2, time:v.time, date:v.day, status:'confirmed', src:'online' });
      cToast('Table requested for ' + v.party + ' on ' + v.day + ' at ' + v.time);
    });
  };
  window.fpCateringReq = function(rid){
    var r = C(rid) || {};
    window.fpForm({ title:'Catering / large order', sub:r.name || '', save:'Send request', fields:[
      { key:'name', label:'Your name', type:'text', value:'' },
      { key:'date', label:'Event date', type:'text', value:'', placeholder:'e.g. Sat Jul 12' },
      { key:'head', label:'Headcount', type:'number', min:'10', value:'25' },
      { key:'budget', label:'Budget per person ($)', type:'number', min:'0', value:'18' },
      { key:'notes', label:'Notes', type:'textarea', value:'', placeholder:'Trays, setup time, dietary needs...' }
    ]}, function(v){
      seedCatering(r); fpCatering[rid].unshift({ name:(v.name || 'Guest'), date:(v.date || 'TBD'), head:parseInt(v.head, 10) || 25, budget:parseInt(v.budget, 10) || 18, notes:(v.notes || ''), status:'new' });
      var est = (parseInt(v.head, 10) || 25) * (parseInt(v.budget, 10) || 18);
      cToast('Catering request sent · est. ' + money(est));
    });
  };
  window.fpBuyGift = function(rid){
    var r = C(rid) || {};
    window.fpForm({ title:'Buy a gift card', sub:r.name || '', save:'Send gift card', fields:[
      { key:'amt', label:'Amount ($)', type:'select', options:['15','25','50','100'].map(function(n){ return { label:'$' + n, value:n }; }), value:'25' },
      { key:'to', label:'Recipient name', type:'text', value:'' },
      { key:'email', label:'Recipient email', type:'text', value:'' },
      { key:'note', label:'Message', type:'textarea', value:'Enjoy a meal on me!' }
    ]}, function(v){
      var amt = parseInt(v.amt, 10) || 25;
      cInfo('Gift card sent 🎁', money(amt) + ' to ' + (v.to || 'your friend'),
        '<div class="fppos-note" style="margin:0 0 10px">Your ' + money(amt) + ' gift card to <b>' + cEsc(r.name) + '</b> is on its way' + (v.to ? ' to ' + cEsc(v.to) : '') + '. They redeem it at checkout, the restaurant gets the money up front, and you both stay commission-free.</div>'
        + '<div class="fppos" style="margin:0"><div class="fppos-h">Their redeem code</div><div class="embsnippet">GIFT25</div>'
        + '<div class="fppos-note">Demo: try this code yourself at checkout to see the credit apply.</div></div>');
    });
  };
  window.fpGroupOrder = function(rid){
    var url = 'https://fullplate.app/g/' + rid + '/' + (1000 + (cHash(rid) % 9000));
    cInfo('Start a group order', 'Everyone adds to one cart',
      '<div class="fppos-note" style="margin:0 0 10px">Share this link with your group. Everyone adds their own items to the same order, you check out once, and pickup or delivery is a single trip. Perfect for offices and crews.</div>'
      + '<div class="embsnippet">' + url + '</div>'
      + '<button class="embcopybtn" style="margin-top:10px" onclick="(navigator.clipboard&&navigator.clipboard.writeText(\'' + url + '\'));showToast(\'Group order link copied\')">Copy group link</button>'
      + '<div class="fppos-note" style="margin-top:10px">3 people joined &middot; 7 items in the shared cart (demo)</div>');
  };

  function storefrontChips(r){
    var chip = function(icon, label, fn){
      return '<button onclick="' + fn + '" style="flex:0 0 auto;display:flex;align-items:center;gap:6px;border:1px solid var(--line);background:#fff;border-radius:999px;padding:9px 14px;font-size:13px;font-weight:700;color:var(--ink);cursor:pointer">'
        + '<span style="font-size:14px">' + icon + '</span>' + label + '</button>';
    };
    return '<div id="cpChips" style="display:flex;gap:8px;overflow-x:auto;padding:4px 16px 2px;margin:0 0 2px">'
      + chip('📅', 'Reserve', 'fpReserve(\'' + r.id + '\')')
      + chip('🍽️', 'Catering', 'fpCateringReq(\'' + r.id + '\')')
      + chip('🎁', 'Gift card', 'fpBuyGift(\'' + r.id + '\')')
      + chip('👥', 'Group order', 'fpGroupOrder(\'' + r.id + '\')')
      + '</div>';
  }

  var _openRestaurant = window.openRestaurant;
  window.openRestaurant = function(){
    if(typeof _openRestaurant === 'function') _openRestaurant.apply(this, arguments);
    try{
      var r = current; var view = document.getElementById('view-restaurant');
      if(!r || !view || document.getElementById('cpChips')) return;
      var firstCat = view.querySelector('.menucat');
      var box = document.createElement('div'); box.innerHTML = storefrontChips(r);
      var node = box.firstChild;
      if(firstCat && firstCat.parentNode){ firstCat.parentNode.insertBefore(node, firstCat); }
      else { view.appendChild(node); }
    }catch(e){}
  };

  /* ====================================================================== */
  /* ============================ OWNER SIDE ============================== */
  /* ====================================================================== */

  /* ---- #1 Settings: delivery / fulfillment ---- */
  window.fpToggleDelivery = function(rid){ var r = C(rid); if(!r) return; var d = deliv(r); d.on = !d.on; if(!d.on) fpFulfill[rid] = 'pickup'; cToast(d.on ? 'Delivery on · flat-fee dispatch' : 'Delivery off'); try{ openOwner(ownerRest, 'settings'); }catch(e){} };
  window.fpEditDeliveryFee = function(rid){
    var r = C(rid); if(!r) return; var d = deliv(r);
    window.fpForm({ title:'Delivery settings', sub:'Flat-fee dispatch, 0% commission', fields:[
      { key:'partner', label:'Dispatch partner', type:'select', options:[ {label:'Uber Direct',value:'Uber Direct'}, {label:'DoorDash Drive',value:'DoorDash Drive'} ], value:d.partner },
      { key:'fee', label:'Flat delivery fee ($, paid by diner)', type:'number', step:'0.5', min:'0', value:String(d.fee) },
      { key:'radius', label:'Delivery radius (miles)', type:'number', min:'1', value:String(d.radius) }
    ]}, function(v){ d.partner = v.partner || d.partner; var f = parseFloat(v.fee); if(f >= 0) d.fee = f; var rad = parseInt(v.radius, 10); if(rad > 0) d.radius = rad; cToast('Delivery settings saved'); try{ openOwner(ownerRest, 'settings'); }catch(e){} });
  };
  function deliveryCardHTML(r){
    var d = deliv(r);
    return '<div class="fppos"><div class="fppos-h">Delivery ' + (d.on ? '<span' + GB + '>On</span>' : '<span' + GY + '>off</span>') + '</div>'
      + '<div class="fppos-row"><div class="pn">Offer delivery by flat-fee dispatch<small>A ' + d.partner + ' courier delivers. Diner pays a flat ' + money(d.fee) + '. You keep 100% of the food, 0% commission.</small></div>'
      + '<button class="fppos-btn" onclick="fpToggleDelivery(\'' + r.id + '\')">' + (d.on ? 'Turn off' : 'Turn on') + '</button></div>'
      + (d.on ? '<div class="fppos-row"><div class="pn">Dispatch &amp; fee<small>' + d.partner + ' · ' + money(d.fee) + ' flat · ' + d.radius + ' mi radius</small></div><button class="fppos-btn" onclick="fpEditDeliveryFee(\'' + r.id + '\')">Edit</button></div>' : '')
      + '<div class="fppos-note">Pickup is always free and commission-free. Delivery uses on-demand couriers at a flat fee the diner pays, so you never give up a percentage of the order, the way the big apps take 15-30%.</div></div>';
  }

  /* ---- #5 Settings: order-ahead (governs the diner pickup-time picker) ---- */
  window.fpToggleScheduled = function(rid){ var cur = (fpScheduledOn[rid] === undefined) ? true : fpScheduledOn[rid]; fpScheduledOn[rid] = !cur; cToast(fpScheduledOn[rid] ? 'Order-ahead on' : 'Order-ahead off'); try{ openOwner(ownerRest, 'settings'); }catch(e){} };
  function scheduledCardHTML(r){
    var on = schedOn(r);
    return '<div class="fppos"><div class="fppos-h">Order ahead ' + (on ? '<span' + GB + '>On</span>' : '<span' + GY + '>off</span>') + '</div>'
      + '<div class="fppos-row"><div class="pn">Let diners schedule for later<small>Order now, ready at a chosen time. Great for lunch rushes and catering.</small></div>'
      + '<button class="fppos-btn" onclick="fpToggleScheduled(\'' + r.id + '\')">' + (on ? 'Turn off' : 'Turn on') + '</button></div>'
      + '<div class="fppos-note">When on, diners get a pickup-time picker at checkout (as soon as possible, or a future slot). Turn off to take same-day orders only. Scheduled orders land in your queue at the right moment.</div></div>';
  }

  /* ---- #2 Grow: AI phone answering ---- */
  window.fpTogglePhone = function(rid){ var p = phone(C(rid) || { id:rid }); p.on = !p.on; cToast(p.on ? 'AI phone answering on' : 'AI phone answering off'); try{ openOwner(ownerRest, 'grow'); }catch(e){} };
  window.fpPhonePreview = function(rid){
    var r = C(rid) || { name:'Your restaurant' };
    function b(who, txt, mine){ return '<div style="margin:6px 0;display:flex;' + (mine ? 'justify-content:flex-end' : '') + '"><div style="max-width:80%;background:' + (mine ? 'var(--brand);color:#fff' : '#fff;color:#111;border:1px solid var(--line)') + ';border-radius:14px;padding:9px 12px;font-size:13px;line-height:1.45">' + txt + '</div></div>'; }
    var html = '<div style="background:#F4F1EE;border-radius:14px;padding:12px">'
      + '<div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);text-align:center;margin-bottom:6px">Incoming call · 7:42pm (after hours)</div>'
      + b('caller', 'Hi, are you still open? Do you do online orders?')
      + b('ai', cEsc(r.name) + ' AI: We just closed, but I can take your pickup order right now and text you a link to pay. What can I get started?', true)
      + b('caller', 'Two chicken tacos and a horchata.')
      + b('ai', 'Got it, 2 chicken tacos and a horchata, ' + money(13.5) + '. I just texted you a secure FullPlate link to confirm and pay. Ready in about 15 minutes when we open at 11.', true)
      + b('caller', 'Perfect, thanks!')
      + '</div>'
      + '<div class="fppos-note" style="margin-top:10px">The AI answers in your restaurant’s voice, takes the order, and texts a pay link, so you capture calls you would have missed, including after hours.</div>';
    cInfo('AI phone answering', 'Sample inbound call', html);
  };
  function phoneCardHTML(r){
    var p = phone(r); var seed = cHash(r.id); var ans = 40 + seed % 60, after = 6 + seed % 10;
    return '<div class="fppos"><div class="fppos-h">AI phone answering ' + (p.on ? '<span' + GB + '>On</span>' : '<span' + GY + '>off</span>') + '</div>'
      + '<div class="fppos-row"><div class="pn">Answers your phone 24/7<small>Takes orders, answers hours and questions, texts a pay link, never puts a caller on hold.</small></div>'
      + '<button class="fppos-btn" onclick="fpTogglePhone(\'' + r.id + '\')">' + (p.on ? 'Turn off' : 'Turn on') + '</button></div>'
      + '<div class="fppos-row"><div class="pn">' + ans + ' calls answered<small>' + after + ' were after-hours orders you would have missed</small></div><button class="fppos-btn" onclick="fpPhonePreview(\'' + r.id + '\')">Hear a call</button></div>'
      + '<div class="fppos-note">Missed calls are missed orders. This is the same AI that powers your in-app ordering, now on the phone line.</div></div>';
  }

  /* ---- #3 Grow: gift cards (sell) ---- */
  window.fpToggleGiftSell = function(rid){ var g = giftSell(C(rid) || { id:rid }); g.on = !g.on; cToast(g.on ? 'Gift card sales on' : 'Gift card sales off'); try{ openOwner(ownerRest, 'grow'); }catch(e){} };
  window.fpGiftShareLink = function(rid){
    var url = 'https://fullplate.app/r/' + rid + '/gift';
    cInfo('Sell gift cards', 'Share this link', '<div class="fppos-note" style="margin:0 0 10px">Put this link on your site, social, and receipts. Customers buy a digital gift card, you get the money up front, and the recipient redeems it at checkout, commission-free.</div>'
      + '<div class="embsnippet">' + url + '</div>'
      + '<button class="embcopybtn" style="margin-top:10px" onclick="(navigator.clipboard&&navigator.clipboard.writeText(\'' + url + '\'));showToast(\'Gift link copied\')">Copy gift link</button>');
  };
  function giftCardHTML(r){
    var g = giftSell(r); var seed = cHash(r.id + 'g'); var sold = 12 + seed % 40, out = 80 + seed % 400;
    return '<div class="fppos"><div class="fppos-h">Gift cards ' + (g.on ? '<span' + GB + '>On</span>' : '<span' + GY + '>off</span>') + '</div>'
      + '<div class="fppos-row"><div class="pn">Sell digital gift cards<small>Prepaid revenue today, new customers when they redeem.</small></div>'
      + '<button class="fppos-btn" onclick="fpToggleGiftSell(\'' + r.id + '\')">' + (g.on ? 'Turn off' : 'Turn on') + '</button></div>'
      + '<div class="fppos-row"><div class="pn">' + sold + ' sold this month<small>' + money(out) + ' in outstanding balance</small></div><button class="fppos-btn" onclick="fpGiftShareLink(\'' + r.id + '\')">Share link</button></div>'
      + '<div class="fppos-note">Money in the bank before you cook, and a reason for someone new to walk in.</div></div>';
  }

  /* ---- #4 Grow: automated AI marketing (approve-and-send) ---- */
  function seedPlan(r){
    if(fpPlan[r.id]) return fpPlan[r.id];
    var nm = r.name || 'the restaurant';
    fpPlan[r.id] = [
      { title:'Taco Tuesday flash', when:'Tue', channel:'Email + SMS', msg:'Taco Tuesday at ' + nm + ': 2 for $5 all day. Order direct, skip the apps: fullplate.app/r/' + r.id, approved:false },
      { title:'Weekend pre-order', when:'Fri', channel:'Email', msg:'Beat the Saturday rush. Order ahead from ' + nm + ' and we will have it hot and ready at your time.', approved:false },
      { title:'Win back the lapsed', when:'Wed', channel:'SMS', msg:'We miss you at ' + nm + '. Here is 15% off your next direct order this week.', approved:false },
      { title:'New item drop', when:'Thu', channel:'Email + SMS', msg:'Just added to the menu at ' + nm + '. Be the first to try it, order direct.', approved:false }
    ];
    return fpPlan[r.id];
  }
  window.fpGenPlan = function(rid){
    var r = C(rid) || { id:rid }; fpPlan[rid] = null; seedPlan(r);
    cToast('AI drafted this month’s campaigns · review and approve'); try{ openOwner(ownerRest, 'grow'); }catch(e){}
  };
  window.fpApproveCampaign = function(rid, idx){
    var p = seedPlan(C(rid) || { id:rid })[idx]; if(!p) return; p.approved = true;
    window.fpCampaigns = window.fpCampaigns || [];
    fpCampaigns.unshift({ channel:p.channel, audience:'all customers', count:(120 + cHash(rid + idx) % 300), when:'Scheduled ' + p.when, msg:p.msg });
    cToast('Approved · “' + p.title + '” scheduled for ' + p.when); try{ openOwner(ownerRest, 'grow'); }catch(e){}
  };
  window.fpToggleAuto = function(rid, key){ var a = autoOf(C(rid) || { id:rid }); a[key] = !a[key]; cToast(a[key] ? 'Automation on' : 'Automation off'); try{ openOwner(ownerRest, 'grow'); }catch(e){} };
  function autoMktgHTML(r){
    var plan = seedPlan(r); var a = autoOf(r);
    var approved = plan.filter(function(p){ return p.approved; }).length;
    var rows = plan.map(function(p, i){ return '<div class="fppos-row"><div class="pn">' + cEsc(p.title) + '<small>' + p.when + ' · ' + p.channel + '</small></div>'
      + (p.approved ? '<span class="fppos-tag"' + GB + '>Scheduled</span>' : '<button class="fppos-btn" onclick="fpApproveCampaign(\'' + r.id + '\',' + i + ')">Approve</button>') + '</div>'; }).join('');
    var autorow = function(key, label, sub){ var on = !!a[key]; return '<div class="fppos-row"><div class="pn">' + label + '<small>' + sub + '</small></div><button class="fppos-btn" onclick="fpToggleAuto(\'' + r.id + '\',\'' + key + '\')">' + (on ? 'On' : 'Off') + '</button></div>'; };
    return '<div class="fppos"><div class="fppos-h">Automated marketing <span' + GB + '>AI drafted</span></div>'
      + '<div class="fppos-row"><div class="pn">This month’s plan<small>' + approved + ' of ' + plan.length + ' approved. AI writes them, you hit approve.</small></div><button class="fppos-btn" onclick="fpGenPlan(\'' + r.id + '\')">Regenerate</button></div>'
      + rows
      + '<div class="fppos-note" style="margin:10px 0 4px">Always-on automations</div>'
      + autorow('welcome', 'Welcome new diners', 'First order thank-you + invite back')
      + autorow('abandoned', 'Abandoned cart', 'Nudge diners who did not finish checkout')
      + autorow('birthday', 'Birthday treat', 'A reward on their birthday')
      + autorow('postorder', 'Post-order review ask', 'Request a review after pickup')
      + '<div class="fppos-note">Every message goes to the customer list you own. No commission, no middleman, and the AI does the writing.</div></div>';
  }

  /* ---- #5 Grow: order-at-table QR ---- */
  window.fpTableQR = function(rid){
    var r = C(rid) || { id:rid, name:'Your restaurant' };
    function draw(){
      var url = 'https://fullplate.app/t/' + rid + '/table-4';
      var html = '<div class="fppos-note" style="margin:0 0 10px">Print one of these per table. Guests scan, order, and pay from their seat. The ticket prints to your kitchen the same as any order, no waitstaff round trip.</div>'
        + '<div id="cpQRbox" style="display:flex;justify-content:center;padding:10px;background:#fff;border:1px solid var(--line);border-radius:12px"></div>'
        + '<div style="text-align:center;font-size:12px;color:var(--muted);margin-top:8px">Table 4 · ' + cEsc(r.name) + '</div>';
      cInfo('Order-at-table QR', 'Scan, order, pay from the seat', html);
      setTimeout(function(){ var box = document.getElementById('cpQRbox'); if(box && window.QRCode){ try{ new QRCode(box, { text:url, width:170, height:170, correctLevel:QRCode.CorrectLevel.M }); }catch(e){ box.textContent = 'QR'; } } else if(box){ box.textContent = 'QR code'; } }, 60);
    }
    if(window.QRCode){ draw(); return; }
    var ex = document.getElementById('fpQRLib') || document.getElementById('cpQRLib');
    if(!ex){ var s = document.createElement('script'); s.id = 'cpQRLib'; s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'; document.head.appendChild(s); }
    var tries = 0; var iv = setInterval(function(){ tries++; if(window.QRCode || tries > 40){ clearInterval(iv); draw(); } }, 150);
  };
  function tableQRHTML(r){
    return '<div class="fppos"><div class="fppos-h">Order at the table <span' + GB + '>dine-in</span></div>'
      + '<div class="fppos-row"><div class="pn">Per-table QR codes<small>Guests scan, order, and pay from their seat. Tickets print to your kitchen.</small></div><button class="fppos-btn" onclick="fpTableQR(\'' + r.id + '\')">Get table QR</button></div>'
      + '<div class="fppos-note">Turns every table into a register. No extra hardware, no commission.</div></div>';
  }

  /* ---- #7 + #6 Bookings tab: reservations, waitlist, catering ---- */
  function seedBookings(r){ if(!fpBookings[r.id]) fpBookings[r.id] = [ { name:'Marisol G.', party:4, time:'7:00pm', date:'Today', status:'confirmed', src:'online' }, { name:'Dev P.', party:2, time:'7:30pm', date:'Today', status:'confirmed', src:'online' }, { name:'The Okafors', party:6, time:'8:00pm', date:'Today', status:'pending', src:'online' } ]; return fpBookings[r.id]; }
  function seedWaitlist(r){ if(!fpWaitlist[r.id]) fpWaitlist[r.id] = [ { name:'Jordan', party:3, quoted:'25 min', waited:'12 min' }, { name:'Aisha', party:2, quoted:'20 min', waited:'5 min' } ]; return fpWaitlist[r.id]; }
  function seedCatering(r){ if(!fpCatering[r.id]) fpCatering[r.id] = [ { name:'Northside Realty', date:'Fri Jul 11', head:30, budget:16, notes:'Lunch trays, setup by 11:30', status:'new' }, { name:'Lopez wedding', date:'Sat Aug 2', head:80, budget:22, notes:'Buffet + 2 staff', status:'quoted' } ]; return fpCatering[r.id]; }

  window.fpToggleReservations = function(rid){ fpReserveOn[rid] = !fpReserveOn[rid]; cToast(fpReserveOn[rid] ? 'Reservations on' : 'Reservations off'); try{ openOwner(ownerRest, 'bookings'); }catch(e){} };
  window.fpToggleWaitlistFeat = function(rid){ fpWaitlistOn[rid] = !fpWaitlistOn[rid]; cToast(fpWaitlistOn[rid] ? 'Waitlist on' : 'Waitlist off'); try{ openOwner(ownerRest, 'bookings'); }catch(e){} };
  window.fpToggleCatering = function(rid){ fpCateringOn[rid] = !fpCateringOn[rid]; cToast(fpCateringOn[rid] ? 'Catering on' : 'Catering off'); try{ openOwner(ownerRest, 'bookings'); }catch(e){} };
  window.fpSeatBooking = function(rid, idx){ var b = (fpBookings[rid] || [])[idx]; if(!b) return; b.status = 'seated'; cToast(cEsc(b.name) + ' seated'); try{ openOwner(ownerRest, 'bookings'); }catch(e){} };
  window.fpSeatWait = function(rid, idx){ var w = (fpWaitlist[rid] || []); var party = w[idx]; if(!party) return; w.splice(idx, 1); cToast(cEsc(party.name) + ' seated · table ready'); try{ openOwner(ownerRest, 'bookings'); }catch(e){} };
  window.fpAddWait = function(rid){
    window.fpForm({ title:'Add to waitlist', sub:'Walk-in party', save:'Add', fields:[
      { key:'name', label:'Name', type:'text', value:'' },
      { key:'party', label:'Party size', type:'select', options:['1','2','3','4','5','6'].map(function(n){ return { label:n, value:n }; }), value:'2' },
      { key:'quote', label:'Quoted wait', type:'select', options:['10 min','15 min','20 min','30 min','45 min'].map(function(t){ return { label:t, value:t }; }), value:'20 min' }
    ]}, function(v){ seedWaitlist(C(rid) || { id:rid }); fpWaitlist[rid].push({ name:(v.name || 'Guest'), party:parseInt(v.party, 10) || 2, quoted:v.quote, waited:'just now' }); cToast('Added to waitlist'); try{ openOwner(ownerRest, 'bookings'); }catch(e){} });
  };
  window.fpQuoteCatering = function(rid, idx){ var c = (fpCatering[rid] || [])[idx]; if(!c) return; c.status = 'quoted'; cToast('Quote sent to ' + cEsc(c.name)); try{ openOwner(ownerRest, 'bookings'); }catch(e){} };

  function bookingsHTML(r){
    seedBookings(r); seedWaitlist(r); seedCatering(r);
    var resOn = fpReserveOn[r.id] !== false; if(fpReserveOn[r.id] === undefined) fpReserveOn[r.id] = true;
    var waitOn = fpWaitlistOn[r.id] !== false; if(fpWaitlistOn[r.id] === undefined) fpWaitlistOn[r.id] = true;
    var catOn = fpCateringOn[r.id] !== false; if(fpCateringOn[r.id] === undefined) fpCateringOn[r.id] = true;

    var pill = function(s){ if(s === 'seated') return '<span class="fppos-tag"' + GB + '>Seated</span>'; if(s === 'pending') return '<span class="fppos-tag" style="color:#9C6206;background:#FCEFD9;border-color:#EAD3A0">Pending</span>'; return '<span class="fppos-tag"' + GY + '>Confirmed</span>'; };

    var resCard = '<div class="fppos"><div class="fppos-h">Reservations ' + (resOn ? '<span' + GB + '>On</span>' : '<span' + GY + '>off</span>') + '<button class="fppos-btn" style="float:right" onclick="fpToggleReservations(\'' + r.id + '\')">' + (resOn ? 'Turn off' : 'Turn on') + '</button></div>'
      + fpBookings[r.id].map(function(b, i){ return '<div class="fppos-row"><div class="pn">' + cEsc(b.name) + ' · party of ' + b.party + '<small>' + cEsc(b.date) + ' at ' + cEsc(b.time) + (b.src === 'online' ? ' · booked online' : '') + '</small></div>' + (b.status === 'seated' ? pill('seated') : '<button class="fppos-btn" onclick="fpSeatBooking(\'' + r.id + '\',' + i + ')">Seat</button>') + '</div>'; }).join('')
      + '<div class="fppos-note">Diners book a table right from your FullPlate page. You own the guest, not a reservation middleman.</div></div>';

    var waitCard = '<div class="fppos" style="margin-top:14px"><div class="fppos-h">Waitlist ' + (waitOn ? '<span' + GB + '>On</span>' : '<span' + GY + '>off</span>') + '<button class="fppos-btn" style="float:right" onclick="fpToggleWaitlistFeat(\'' + r.id + '\')">' + (waitOn ? 'Turn off' : 'Turn on') + '</button></div>'
      + fpWaitlist[r.id].map(function(w, i){ return '<div class="fppos-row"><div class="pn">' + cEsc(w.name) + ' · party of ' + w.party + '<small>quoted ' + cEsc(w.quoted) + ' · waiting ' + cEsc(w.waited) + '</small></div><button class="fppos-btn" onclick="fpSeatWait(\'' + r.id + '\',' + i + ')">Table ready</button></div>'; }).join('')
      + '<button class="fppos-btn" style="width:100%;margin-top:10px" onclick="fpAddWait(\'' + r.id + '\')">+ Add walk-in</button>'
      + '<div class="fppos-note">Text guests the moment their table is ready. They wait wherever they want.</div></div>';

    var catStatus = function(s){ return s === 'quoted' ? '<span class="fppos-tag"' + GB + '>Quoted</span>' : '<span class="fppos-tag" style="color:#9C6206;background:#FCEFD9;border-color:#EAD3A0">New</span>'; };
    var catCard = '<div class="fppos" style="margin-top:14px"><div class="fppos-h">Catering requests ' + (catOn ? '<span' + GB + '>On</span>' : '<span' + GY + '>off</span>') + '<button class="fppos-btn" style="float:right" onclick="fpToggleCatering(\'' + r.id + '\')">' + (catOn ? 'Turn off' : 'Turn on') + '</button></div>'
      + fpCatering[r.id].map(function(c, i){ var est = c.head * c.budget; return '<div class="fppos-row"><div class="pn">' + cEsc(c.name) + ' · ' + money(est) + '<small>' + cEsc(c.date) + ' · ' + c.head + ' people · ' + cEsc(c.notes) + '</small></div>' + (c.status === 'quoted' ? catStatus('quoted') : '<button class="fppos-btn" onclick="fpQuoteCatering(\'' + r.id + '\',' + i + ')">Send quote</button>') + '</div>'; }).join('')
      + '<div class="fppos-note">Large orders are your highest-margin tickets. Capture them on your own page, commission-free.</div></div>';

    return '<div class="section-label" style="padding-left:0">Bookings &middot; ' + cEsc(r.name) + '</div>' + resCard + waitCard + catCard;
  }

  /* ---- #10 Reports tab: analytics ---- */
  function reportsHTML(r){
    var seed = cHash(r.id + 'rep');
    var orders = 180 + seed % 220, aov = 17 + seed % 12;
    var rev = Math.round(orders * aov);
    var commissionSaved = Math.round(rev * 0.27);
    var repeat = 38 + seed % 22;
    var newC = Math.round(orders * (0.18 + (seed % 10) / 100));
    var stat = function(big, lbl, good){ return '<div style="flex:1 1 40%;min-width:130px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px 13px"><div style="font-size:20px;font-weight:800;color:' + (good ? 'var(--good)' : 'var(--ink)') + ';line-height:1.1">' + big + '</div><div style="font-size:11.5px;color:var(--muted);margin-top:3px">' + lbl + '</div></div>'; };

    var its = items(r); var top = its.slice(0, 5).map(function(it, i){ return { name:it.name, n: 70 - i * 11 + (cHash(it.name) % 9) }; });
    var maxN = Math.max.apply(null, top.map(function(t){ return t.n; })) || 1;
    var topHTML = top.map(function(t){ return '<div style="display:flex;align-items:center;gap:10px;padding:5px 0"><span style="flex:1;font-size:12.5px;font-weight:700;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + cEsc(t.name) + '</span>'
      + '<span style="width:120px;height:10px;background:#F0E2D8;border-radius:99px;overflow:hidden"><span style="display:block;height:100%;width:' + Math.round(t.n / maxN * 100) + '%;background:var(--brand)"></span></span>'
      + '<span style="width:32px;text-align:right;font-size:12px;font-weight:800;color:var(--ink)">' + t.n + '</span></div>'; }).join('');

    var hours = ['11a','12p','1p','2p','3p','4p','5p','6p','7p','8p'];
    var hvals = hours.map(function(h, i){ var base = [60,90,70,35,25,30,65,100,85,55][i]; return Math.round(base * (0.7 + (cHash(r.id + h) % 60) / 100)); });
    var hmax = Math.max.apply(null, hvals) || 1;
    var heat = '<div style="display:flex;align-items:flex-end;gap:5px;height:90px;padding:4px 0">'
      + hvals.map(function(v, i){ var pct = Math.round(v / hmax * 100); var peak = pct > 80; return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px"><div style="width:100%;height:' + pct + '%;min-height:6px;background:' + (peak ? 'var(--brand)' : '#E7C9B8') + ';border-radius:5px 5px 0 0"></div><span style="font-size:9.5px;color:var(--muted)">' + hours[i] + '</span></div>'; }).join('')
      + '</div>';

    return '<div class="section-label" style="padding-left:0">Reports &middot; ' + cEsc(r.name) + ' <span class="fppos-tag"' + GB + '>last 30 days</span></div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:9px;margin:0 0 4px">'
      + stat(money(rev), 'Revenue (you keep 100%)', true)
      + stat(orders, 'Orders')
      + stat(money(aov), 'Average order')
      + stat(repeat + '%', 'Repeat customers')
      + stat(money(commissionSaved), 'Commission you did NOT pay', true)
      + stat(newC, 'New customers')
      + '</div>'
      + '<div class="fppos" style="margin-top:14px"><div class="fppos-h">Top items</div>' + topHTML + '<div class="fppos-note">Know your winners. Feature them, bundle them, upsell them at checkout.</div></div>'
      + '<div class="fppos" style="margin-top:14px"><div class="fppos-h">Busiest hours</div>' + heat + '<div class="fppos-note">Staff to your real rush. Peak bars are when order-ahead and delivery earn their keep.</div></div>'
      + '<div class="fppos" style="margin-top:14px"><div class="fppos-h">Customer mix</div>'
      + '<div class="fppos-row"><div class="pn">Repeat vs new<small>' + repeat + '% of orders are returning customers you own</small></div><span class="fppos-tag"' + GB + '>healthy</span></div>'
      + '<div class="fppos-row"><div class="pn">Lifetime value (avg)<small>' + money(aov * (4 + seed % 6)) + ' per repeat customer</small></div></div>'
      + '<div class="fppos-note">This is the data the delivery apps keep from you. On FullPlate it is yours, in full, every day.</div></div>';
  }

  /* ---- wrap ownerBody to route the two new tabs ---- */
  var _ownerBody = window.ownerBody;
  window.ownerBody = function(r){
    if(typeof ownerTab !== 'undefined' && ownerTab === 'reports') return reportsHTML(r);
    if(typeof ownerTab !== 'undefined' && ownerTab === 'bookings') return bookingsHTML(r);
    return (typeof _ownerBody === 'function') ? _ownerBody(r) : '';
  };

  /* ---- wrap openOwner: add tabs + inject cards into Grow/Settings/Overview ---- */
  var _openOwner = window.openOwner;
  window.openOwner = function(){
    if(typeof _openOwner === 'function') _openOwner.apply(this, arguments);
    try{
      var t = (typeof ownerTab !== 'undefined') ? ownerTab : null;
      var r = C(typeof ownerRest !== 'undefined' ? ownerRest : null) || RESTAURANTS[0];
      if(!r) return;
      var rid = r.id;

      /* add Reports + Bookings tab buttons to the strip */
      var bar = document.querySelector('#view-owner .otabs');
      if(bar && !bar.querySelector('[data-cptab]')){
        [['reports','Reports'], ['bookings','Bookings']].forEach(function(tb){
          var b = document.createElement('button');
          b.className = 'otab' + (t === tb[0] ? ' on' : '');
          b.setAttribute('data-cptab', tb[0]);
          b.textContent = tb[1];
          b.setAttribute('onclick', "openOwner('" + rid + "','" + tb[0] + "')");
          bar.appendChild(b);
        });
      }

      var body = document.getElementById('ownerBody');
      if(!body) return;

      /* Settings: delivery + order-ahead, grouped under a Fulfillment header */
      if(t === 'settings' && !document.getElementById('cpSettings')){
        var sd = document.createElement('div'); sd.id = 'cpSettings';
        sd.innerHTML = '<div class="section-label" style="padding-left:0">Fulfillment</div>' + deliveryCardHTML(r) + scheduledCardHTML(r);
        body.insertBefore(sd, body.firstChild);
      }

      /* Grow: AI phone, gift cards, automated marketing, table QR */
      if(t === 'grow' && !document.getElementById('cpGrow')){
        var gd = document.createElement('div'); gd.id = 'cpGrow';
        gd.innerHTML = '<div class="section-label" style="padding-left:0;margin-top:14px">More ways to grow</div>'
          + phoneCardHTML(r) + giftCardHTML(r) + autoMktgHTML(r) + tableQRHTML(r);
        body.appendChild(gd);
      }

      /* Overview: compact reports teaser */
      if(t === 'overview' && !document.getElementById('cpOvw')){
        var seed = cHash(rid + 'rep'); var orders = 180 + seed % 220, aov = 17 + seed % 12; var rev = Math.round(orders * aov); var saved = Math.round(rev * 0.27);
        var od = document.createElement('div'); od.id = 'cpOvw';
        od.innerHTML = '<div class="fppos" style="margin-top:14px"><div class="fppos-h">This month at a glance</div>'
          + '<div style="display:flex;gap:9px;margin:2px 0 2px">'
          + '<div style="flex:1;text-align:center"><div style="font-size:18px;font-weight:800;color:var(--good)">' + money(rev) + '</div><div style="font-size:11px;color:var(--muted)">kept</div></div>'
          + '<div style="flex:1;text-align:center"><div style="font-size:18px;font-weight:800">' + orders + '</div><div style="font-size:11px;color:var(--muted)">orders</div></div>'
          + '<div style="flex:1;text-align:center"><div style="font-size:18px;font-weight:800;color:var(--good)">' + money(saved) + '</div><div style="font-size:11px;color:var(--muted)">commission saved</div></div></div>'
          + '<button class="fppos-btn" style="width:100%;margin-top:8px" onclick="openOwner(\'' + rid + '\',\'reports\')">Open full reports →</button>'
          + '<div class="fppos-note">Top items, busiest hours, repeat rate, and lifetime value, all yours.</div></div>';
        body.appendChild(od);
      }
    }catch(e){}
  };
})();
