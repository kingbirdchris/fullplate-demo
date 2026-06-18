/* FullPlate owner-tab grouping. Loaded after polish.js, before nav.js. Collapses
   the 12 flat owner tabs into 7 primary groups, with a sub-tab row for the
   groups that hold more than one screen. The underlying ownerTab values and all
   content routing are unchanged, so every existing screen still works; this is
   purely the tab-bar presentation. No core files edited. Demo-only. */
(function(){
  if(window.__fpGroups) return; window.__fpGroups = true;

  var GROUPS = [
    { k:'overview', l:'Overview', m:['overview'] },
    { k:'orders',   l:'Orders',   m:['orders'] },
    { k:'menu',     l:'Menu',     m:['menu'] },
    { k:'marketing',l:'Marketing',m:['promos', 'grow'] },
    { k:'bookings', l:'Bookings', m:['bookings'] },
    { k:'insights', l:'Insights', m:['reports', 'reviews', 'customers'] },
    { k:'settings', l:'Settings', m:['settings', 'hours', 'payouts'] }
  ];
  var SUB = { promos:'Promos & Deals', grow:'Grow', reports:'Reports', reviews:'Reviews', customers:'Customers', settings:'General', hours:'Hours', payouts:'Payouts' };
  function groupOf(t){ for(var i = 0; i < GROUPS.length; i++){ if(GROUPS[i].m.indexOf(t) >= 0) return GROUPS[i]; } return GROUPS[0]; }

  try{
    var st = document.createElement('style');
    st.textContent = '.otabsub{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 14px}'
      + '.osub{border:1px solid var(--line);background:#fff;color:var(--muted);border-radius:999px;padding:5px 14px;font-size:12.5px;font-weight:700;cursor:pointer}'
      + '.osub.on{background:#FDEEE7;border-color:var(--brand);color:var(--brand)}';
    document.head.appendChild(st);
  }catch(e){}

  var _openOwner = window.openOwner;
  window.openOwner = function(){
    if(typeof _openOwner === 'function') _openOwner.apply(this, arguments);
    try{
      var t = (typeof ownerTab !== 'undefined') ? ownerTab : 'overview';
      var rid = (typeof ownerRest !== 'undefined') ? ownerRest : 'chiwas';
      var bar = document.querySelector('#view-owner .otabs'); if(!bar) return;
      var cur = groupOf(t);
      bar.innerHTML = GROUPS.map(function(g){
        var on = (g.k === cur.k);
        var target = (g.m.indexOf(t) >= 0) ? t : g.m[0];
        return '<button class="otab' + (on ? ' on' : '') + '" onclick="openOwner(\'' + rid + '\',\'' + target + '\')">' + g.l + '</button>';
      }).join('');

      var old = document.getElementById('otabsub'); if(old && old.parentNode) old.parentNode.removeChild(old);
      if(cur.m.length > 1){
        var ob = document.getElementById('ownerBody');
        var sub = document.createElement('div'); sub.id = 'otabsub'; sub.className = 'otabsub';
        sub.innerHTML = cur.m.map(function(mt){
          return '<button class="osub' + (mt === t ? ' on' : '') + '" onclick="openOwner(\'' + rid + '\',\'' + mt + '\')">' + (SUB[mt] || mt) + '</button>';
        }).join('');
        if(ob && ob.parentNode) ob.parentNode.insertBefore(sub, ob);
      }
    }catch(e){}
  };
})();
