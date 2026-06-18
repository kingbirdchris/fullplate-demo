/* FullPlate tuning layer. Loaded LAST, after refine.js. Two changes:
   (1) Make Reports + the Overview teaser come alive during a demo: the seeded
       baseline is layered with the test orders placed this session, so revenue,
       orders, AOV and the top-item list move as the viewer orders. Catering
       dates are made relative to today so nothing ever looks stale.
   (2) Gate AI chat ordering when the restaurant is paused or closed.
   All by overriding globals; no core files edited. Demo-only. */
(function(){
  if(window.__fpTune) return; window.__fpTune = true;

  function R(id){ try{ return RESTAURANTS.find(function(x){ return x.id === id; }); }catch(e){ return null; } }
  function rHash(s){ var h = 0; s = String(s); for(var i = 0; i < s.length; i++){ h = (h * 31 + s.charCodeAt(i)) >>> 0; } return h; }
  function money(n){ return '$' + (Math.round(n * 100) / 100).toFixed(2); }
  function tEsc(s){ return (typeof esc === 'function') ? esc(s) : String(s == null ? '' : s); }
  function allItems(r){ var o = []; try{ (r.menu || []).forEach(function(c){ c.items.forEach(function(i){ o.push(i); }); }); }catch(e){} return o; }
  var GB = ' style="background:#EAF5EE;color:#1F6B43;border:1px solid #CDEBD0"';

  /* ---- relative catering dates so seeded bookings never look stale ---- */
  function relDates(){
    var now = new Date();
    function nextDow(t, w){ var d = new Date(now); var add = (t - d.getDay() + 7) % 7; if(add === 0) add = 7; d.setDate(d.getDate() + add + (w || 0) * 7); return d; }
    var DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], MO = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    function fmt(d){ return DOW[d.getDay()] + ' ' + MO[d.getMonth()] + ' ' + d.getDate(); }
    return { fri:fmt(nextDow(5, 0)), sat:fmt(nextDow(6, 3)) };
  }
  try{
    var rd = relDates(); window.fpCatering = window.fpCatering || {};
    (typeof RESTAURANTS !== 'undefined' ? RESTAURANTS : []).forEach(function(r){
      if(!window.fpCatering[r.id]) window.fpCatering[r.id] = [
        { name:'Northside Realty', date:rd.fri, head:30, budget:16, notes:'Lunch trays, setup by 11:30', status:'new' },
        { name:'Lopez wedding', date:rd.sat, head:80, budget:22, notes:'Buffet + 2 staff', status:'quoted' }
      ];
    });
  }catch(e){}

  /* ---- session-aware stats: one source so Overview + Reports agree ---- */
  function sessionFor(r){ try{ return (typeof placedOrders !== 'undefined' ? placedOrders.filter(function(o){ return o.id === r.id; }) : []); }catch(e){ return []; } }
  function reportStats(r){
    var seed = rHash(r.id + 'rep');
    var baseOrders = 180 + seed % 220, baseAov = 17 + seed % 12;
    var sess = sessionFor(r), sc = sess.length, sr = sess.reduce(function(s, o){ return s + (o.total || 0); }, 0);
    var orders = baseOrders + sc;
    var revenue = Math.round(baseOrders * baseAov + sr);
    var aov = orders ? revenue / orders : baseAov;
    return { seed:seed, orders:orders, revenue:revenue, aov:aov, saved:Math.round(revenue * 0.27), repeat:38 + seed % 22, newC:Math.round(orders * (0.18 + (seed % 10) / 100)), sc:sc };
  }
  function topItems(r){
    var its = allItems(r), base = {};
    its.forEach(function(it, i){ base[it.id] = { name:it.name, n:Math.max(5, 62 - i * 10 + (rHash(it.name) % 9)) }; });
    try{ (orderHistory || []).filter(function(o){ return o.id === r.id; }).forEach(function(o){ (o.items || []).forEach(function(i){ if(base[i.id]) base[i.id].n += (i.qty || 1) * 7; else base[i.id] = { name:i.name, n:(i.qty || 1) * 7 }; }); }); }catch(e){}
    var arr = Object.keys(base).map(function(k){ return base[k]; }); arr.sort(function(a, b){ return b.n - a.n; }); return arr.slice(0, 5);
  }
  function reportHTML(r){
    var st = reportStats(r);
    var stat = function(big, lbl, good){ return '<div style="flex:1 1 40%;min-width:130px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px 13px"><div style="font-size:20px;font-weight:800;color:' + (good ? 'var(--good)' : 'var(--ink)') + ';line-height:1.1">' + big + '</div><div style="font-size:11.5px;color:var(--muted);margin-top:3px">' + lbl + '</div></div>'; };
    var top = topItems(r), maxN = Math.max.apply(null, top.map(function(t){ return t.n; })) || 1;
    var topHTML = top.map(function(t){ return '<div style="display:flex;align-items:center;gap:10px;padding:5px 0"><span style="flex:1;font-size:12.5px;font-weight:700;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + tEsc(t.name) + '</span>'
      + '<span style="width:120px;height:10px;background:#F0E2D8;border-radius:99px;overflow:hidden"><span style="display:block;height:100%;width:' + Math.round(t.n / maxN * 100) + '%;background:var(--brand)"></span></span>'
      + '<span style="width:32px;text-align:right;font-size:12px;font-weight:800;color:var(--ink)">' + t.n + '</span></div>'; }).join('');
    var hours = ['11a','12p','1p','2p','3p','4p','5p','6p','7p','8p'], nowIdx = new Date().getHours() - 11;
    var hvals = hours.map(function(h, i){ var b = [60,90,70,35,25,30,65,100,85,55][i]; return Math.round(b * (0.7 + (rHash(r.id + h) % 60) / 100)); });
    var hmax = Math.max.apply(null, hvals) || 1;
    var heat = '<div style="display:flex;align-items:flex-end;gap:5px;height:90px;padding:4px 0">'
      + hvals.map(function(v, i){ var pct = Math.round(v / hmax * 100), peak = pct > 80, isNow = (i === nowIdx); return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px"><div style="width:100%;height:' + pct + '%;min-height:6px;background:' + (peak ? 'var(--brand)' : '#E7C9B8') + ';border-radius:5px 5px 0 0' + (isNow ? ';outline:2px solid var(--ink);outline-offset:1px' : '') + '"></div><span style="font-size:9.5px;color:' + (isNow ? 'var(--ink);font-weight:800' : 'var(--muted)') + '">' + (isNow ? 'now' : hours[i]) + '</span></div>'; }).join('')
      + '</div>';
    var live = st.sc > 0 ? '<div class="fppos-note" style="background:#EAF5EE;border:1px solid #CDEBD0;color:#1F6B43;margin:0 0 8px">● Live: these figures include the ' + st.sc + ' test order' + (st.sc === 1 ? '' : 's') + ' placed in this demo. Place another and watch them move.</div>' : '';
    return '<div class="section-label" style="padding-left:0">Reports &middot; ' + tEsc(r.name) + ' <span class="fppos-tag"' + GB + '>last 30 days</span></div>'
      + live
      + '<div style="display:flex;flex-wrap:wrap;gap:9px;margin:0 0 4px">'
      + stat(money(st.revenue), 'Revenue (you keep 100%)', true) + stat(st.orders, 'Orders') + stat(money(st.aov), 'Average order')
      + stat(st.repeat + '%', 'Repeat customers') + stat(money(st.saved), 'Commission you did NOT pay', true) + stat(st.newC, 'New customers')
      + '</div>'
      + '<div class="fppos" style="margin-top:14px"><div class="fppos-h">Top items' + (st.sc > 0 ? ' <span' + GB + '>updated</span>' : '') + '</div>' + topHTML + '<div class="fppos-note">Know your winners. Feature them, bundle them, upsell them at checkout.</div></div>'
      + '<div class="fppos" style="margin-top:14px"><div class="fppos-h">Busiest hours</div>' + heat + '<div class="fppos-note">Staff to your real rush. Peak bars are when order-ahead and delivery earn their keep.</div></div>'
      + '<div class="fppos" style="margin-top:14px"><div class="fppos-h">Customer mix</div>'
      + '<div class="fppos-row"><div class="pn">Repeat vs new<small>' + st.repeat + '% of orders are returning customers you own</small></div><span class="fppos-tag"' + GB + '>healthy</span></div>'
      + '<div class="fppos-row"><div class="pn">Lifetime value (avg)<small>' + money(st.aov * (4 + st.seed % 6)) + ' per repeat customer</small></div></div>'
      + '<div class="fppos-note">This is the data the delivery apps keep from you. On FullPlate it is yours, in full, every day.</div></div>';
  }

  /* wrap ownerBody: session-aware Reports (Bookings still flows to compete) */
  var _ownerBody = window.ownerBody;
  window.ownerBody = function(r){ if(typeof ownerTab !== 'undefined' && ownerTab === 'reports') return reportHTML(r); return (typeof _ownerBody === 'function') ? _ownerBody(r) : ''; };

  /* wrap openOwner: keep the Overview teaser in sync with the session stats */
  var _openOwner = window.openOwner;
  window.openOwner = function(){
    if(typeof _openOwner === 'function') _openOwner.apply(this, arguments);
    try{
      if((typeof ownerTab !== 'undefined') && ownerTab === 'overview'){
        var r = R(typeof ownerRest !== 'undefined' ? ownerRest : null) || RESTAURANTS[0]; if(!r) return;
        var box = document.getElementById('cpOvw'); if(!box) return;
        var st = reportStats(r); var nums = box.querySelectorAll('div[style*="font-size:18px"]');
        if(nums[0]) nums[0].textContent = money(st.revenue);
        if(nums[1]) nums[1].textContent = st.orders;
        if(nums[2]) nums[2].textContent = money(st.saved);
      }
    }catch(e){}
  };

  /* gate AI chat ordering when paused or closed */
  var _openChat = window.openChat;
  window.openChat = function(){
    try{
      if(typeof current !== 'undefined' && current){
        var s = storeOf(current); var liveOk = current.type !== 'truck' || current.live;
        if(!s.open || s.paused || !liveOk){
          try{ showToast(!s.open ? 'This restaurant is closed right now.' : (!liveOk ? 'This truck is offline right now.' : 'Ordering is paused right now. Check back in a few minutes.')); }catch(e){}
          return;
        }
      }
    }catch(e){}
    if(typeof _openChat === 'function') return _openChat.apply(this, arguments);
  };
})();
