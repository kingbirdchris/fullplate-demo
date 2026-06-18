/* FullPlate polish layer. Loaded after why.js, before nav.js. Implements the
   P0 fixes from the UX review: reconcile the owner Overview numbers with the
   Reports tab, lift the menu above secondary blocks on the restaurant page
   (with an inline "Why FullPlate" line), put fulfillment before time at
   checkout and drop the $0 clutter rows, and tidy the consumer Account.
   Also handles ?view=owner / ?view=why deep links for the marketing embed.
   All by overriding globals; no core files edited. Demo-only. */
(function(){
  if(window.__fpPolish) return; window.__fpPolish = true;

  function R(id){ try{ return RESTAURANTS.find(function(x){ return x.id === id; }); }catch(e){ return null; } }
  function rHash(s){ var h = 0; s = String(s); for(var i = 0; i < s.length; i++){ h = (h * 31 + s.charCodeAt(i)) >>> 0; } return h; }

  /* same formula as the Reports tab (tune.js) so every surface agrees */
  function reportStats(r){
    var seed = rHash(r.id + 'rep');
    var baseOrders = 180 + seed % 220, baseAov = 17 + seed % 12;
    var sess = []; try{ sess = (typeof placedOrders !== 'undefined' ? placedOrders.filter(function(o){ return o.id === r.id; }) : []); }catch(e){}
    var sc = sess.length, sr = sess.reduce(function(s, o){ return s + (o.total || 0); }, 0);
    var orders = baseOrders + sc;
    var revenue = Math.round(baseOrders * baseAov + sr);
    var aov = orders ? revenue / orders : baseAov;
    return { orders:orders, revenue:revenue, aov:aov, saved:Math.round(revenue * 0.27) };
  }

  /* brand-align the consumer rewards card (was the only purple in the app) */
  try{ var stl = document.createElement('style'); stl.textContent = '.loyalcard{background:linear-gradient(135deg,#E8623D,#C44A28)!important}'; document.head.appendChild(stl); }catch(e){}

  /* ============ Overview hero: reconcile with Reports ============ */
  var _openOwner = window.openOwner;
  window.openOwner = function(){
    if(typeof _openOwner === 'function') _openOwner.apply(this, arguments);
    try{
      if((typeof ownerTab !== 'undefined') && ownerTab === 'overview'){
        var r = R(typeof ownerRest !== 'undefined' ? ownerRest : null) || RESTAURANTS[0];
        var body = document.getElementById('ownerBody'); if(!r || !body) return;
        var st = reportStats(r);
        var hero = body.querySelector('.ohero');
        if(hero){
          var amt = hero.querySelector('.amt'); if(amt) amt.textContent = '$' + st.saved.toLocaleString();
          var sub = hero.querySelector('.osub'); if(sub) sub.textContent = st.orders.toLocaleString() + ' orders · $' + st.revenue.toLocaleString() + ' kept · $0 paid to delivery apps';
        }
        var ob = body.querySelectorAll('.ostat b'); if(ob[0]) ob[0].textContent = '$' + st.aov.toFixed(2);
      }
    }catch(e){}
  };

  /* ============ Restaurant page: menu up, secondary down, why inline ============ */
  var _openRestaurant = window.openRestaurant;
  window.openRestaurant = function(){
    if(typeof _openRestaurant === 'function') _openRestaurant.apply(this, arguments);
    try{
      var v = document.getElementById('view-restaurant'); if(!v || v.style.display === 'none') return;
      var anchor = null;
      Array.prototype.forEach.call(v.querySelectorAll('.menucat'), function(c){ if(/What diners say/i.test(c.textContent)) anchor = c; });
      if(!anchor) anchor = v.querySelector('.revstrip');
      var g = v.querySelector('.gcard');
      var chips = document.getElementById('cpChips');
      if(g){ if(anchor && anchor.parentNode){ anchor.parentNode.insertBefore(g, anchor); } else v.appendChild(g); }
      if(chips){ if(g && g.parentNode){ g.parentNode.insertBefore(chips, g); } else if(anchor && anchor.parentNode){ anchor.parentNode.insertBefore(chips, anchor); } else v.appendChild(chips); }
      var ai = v.querySelector('.ai-launch');
      if(ai && ai.parentNode && !document.getElementById('rfWhyLine')){
        var w = document.createElement('div'); w.id = 'rfWhyLine';
        w.style.cssText = 'margin:8px 16px 2px;font-size:12.5px;color:var(--muted);line-height:1.5';
        w.innerHTML = 'Ordering direct keeps every dollar with the restaurant, not a delivery app. <button onclick="if(window.goWhy)goWhy()" style="background:none;border:0;color:var(--brand);font-weight:800;font-size:12.5px;cursor:pointer;padding:0">Why FullPlate ›</button>';
        ai.parentNode.insertBefore(w, ai.nextSibling);
      }
    }catch(e){}
  };

  /* ============ Checkout: fulfillment before time, drop $0 rows ============ */
  var _openCheckout = window.openCheckout;
  window.openCheckout = function(){
    if(typeof _openCheckout === 'function') _openCheckout.apply(this, arguments);
    try{
      var view = document.getElementById('view-checkout'); if(!view || view.style.display === 'none') return;
      var ful = document.getElementById('cpFulfill');
      if(ful){
        var pt = null;
        Array.prototype.forEach.call(view.children, function(c){
          if(pt || c.id === 'cpStack') return;
          var cl = c.className || '';
          if(/section-label|co-line|promorow|tiprow|tiplabel|co-tot|savecard|demo-note|cpExtras/.test(cl)) return;
          if(/Pickup time/i.test(c.textContent || '')) pt = c;
        });
        var target = pt || view.querySelector('.co-line');
        if(target && target.parentNode) target.parentNode.insertBefore(ful, target);
      }
      Array.prototype.forEach.call(view.querySelectorAll('.co-tot'), function(row){
        if(row.classList.contains('big')) return;
        if(/Delivery-app markup|Service fee|commission fee/i.test(row.textContent || '')) row.style.display = 'none';
      });
    }catch(e){}
  };

  /* ============ Account: remove the erroneous Pickup row ============ */
  var _openAccount = window.openAccount;
  window.openAccount = function(){
    if(typeof _openAccount === 'function') _openAccount.apply(this, arguments);
    try{
      var view = document.getElementById('view-account'); if(!view) return;
      Array.prototype.forEach.call(view.querySelectorAll('.profrow'), function(row){
        var pk = row.querySelector('.pk'); if(pk && /^pickup$/i.test((pk.textContent || '').trim())) row.parentNode.removeChild(row);
      });
    }catch(e){}
  };

  /* ============ deep links: ?view=owner / ?view=why (for the website embed) ============ */
  try{
    var vw = new URLSearchParams(location.search).get('view');
    if(vw === 'owner' || vw === 'why'){
      setTimeout(function(){ try{ if(vw === 'owner') openOwner('chiwas', 'overview'); else if(window.goWhy) goWhy(); }catch(e){} }, 80);
    }
  }catch(e){}
})();
