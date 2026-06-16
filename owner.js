/* FullPlate owner console: order queue, menu editor/builder, promos, reviews,
   store hours/availability, payouts, settings. Uses shared state + helpers
   from core.js and data from data.js. Loaded last. */

function ownerStats(r){
  const items=r.menu.flatMap(c=>c.items);
  const avg=items.reduce((s,i)=>s+i.price,0)/items.length;
  const monthlyOrders=Math.round(r.reviews*1.6);
  const aov=+(avg*2.4).toFixed(2);
  const revenue=Math.round(monthlyOrders*aov);
  const saved=Math.round(revenue*0.30);
  return {monthlyOrders,aov,revenue,saved};
}
function seedFeed(r){
  const items=r.menu.flatMap(c=>c.items);
  const g=(i)=>items[i%items.length];
  return [
    {names:[g(0).name,g(2).name], total:g(0).price+g(2).price, ago:'6 min ago'},
    {names:[g(1).name], total:g(1).price, ago:'23 min ago'},
    {names:[g(3).name,g(0).name,g(4).name], total:g(3).price+g(0).price+g(4).price, ago:'51 min ago'},
    {names:[g(2).name,g(1).name], total:g(2).price+g(1).price, ago:'1 hr ago'},
  ];
}
function ensureQueue(r){
  if(QUEUE[r.id]) return;
  const it=r.menu.flatMap(c=>c.items);
  const g=i=>it[i%it.length];
  const mk=(idxs,status,mins,name)=>{const items=idxs.map(i=>({name:g(i).name,qty:1,price:g(i).price}));return {oid:++__oid,items,total:items.reduce((s,x)=>s+x.price,0),status,mins,name};};
  QUEUE[r.id]=[
    mk([1],'new',1,'Devin R.'),
    mk([3,0],'new',2,'Sam P.'),
    mk([0,2],'preparing',5,'Maria G.'),
    mk([2,1,4],'ready',9,'Alex T.'),
  ];
}
function ensureReviews(r){
  if(reviews[r.id]) return;
  reviews[r.id]=[
    {name:'Jenna M.',stars:5,text:'Best in the neighborhood, and ordering on here is so easy now.',reply:''},
    {name:'Carlos R.',stars:5,text:'Love that I can just talk to order. Food was ready right when I got there.',reply:''},
    {name:'Priya S.',stars:4,text:'Great food. Wish there were a couple more veggie options.',reply:''},
  ];
}
function openOwner(id, tab){
  ownerRest = id || ownerRest;
  if(tab) ownerTab = tab;
  const r = RESTAURANTS.find(x=>x.id===ownerRest) || RESTAURANTS.find(x=>x.featured) || RESTAURANTS[0];
  current = r; ensureQueue(r); storeOf(r); ensureReviews(r);
  const tabs=[['overview','Overview'],['orders','Orders'],['menu','Menu'],['promos','Promos'],['reviews','Reviews'],['hours','Hours'],['payouts','Payouts'],['settings','Settings']];
  document.getElementById('view-owner').innerHTML = `
    <div class="odash">
      <div class="section-label" style="padding-left:0">Owner console · ${r.name}</div>
      <div class="otabs">${tabs.map(t=>`<button class="otab ${t[0]===ownerTab?'on':''}" onclick="openOwner('${r.id}','${t[0]}')">${t[1]}</button>`).join('')}</div>
      <div id="ownerBody">${ownerBody(r)}</div>
    </div>`;
  show('view-owner');
  document.getElementById('cartbar').style.display = cartTotals().count>0 ? 'flex':'none';
  document.getElementById('backBtn').style.display='flex';
  window.scrollTo(0,0);
}
function ownerBody(r){
  if(ownerTab==='orders') return ordersTab(r);
  if(ownerTab==='menu') return menuTab(r);
  if(ownerTab==='promos') return promosTab(r);
  if(ownerTab==='reviews') return reviewsTab(r);
  if(ownerTab==='hours') return hoursTab(r);
  if(ownerTab==='payouts') return payoutsTab(r);
  if(ownerTab==='settings') return settingsTab(r);
  return overviewTab(r);
}
function overviewTab(r){
  const st=ownerStats(r);
  const sess=placedOrders.filter(o=>o.id===r.id);
  const sessSaved=Math.round(sess.reduce((s,o)=>s+o.total,0)*0.30);
  const totalSaved=st.saved+sessSaved;
  const active=(QUEUE[r.id]||[]).filter(o=>o.status!=='done').length;
  const feed=sess.map(o=>({names:o.names,total:o.total,ago:'just now'})).concat(seedFeed(r));
  return `
    <div class="ohero">
      <div class="lbl">Commission saved this month</div>
      <div class="amt">$${totalSaved.toLocaleString()}</div>
      <div class="osub">${st.monthlyOrders.toLocaleString()} orders · $${st.revenue.toLocaleString()} kept · $0 paid to delivery apps</div>
    </div>
    <div class="ostatrow">
      <div class="ostat"><b>$${st.aov.toFixed(2)}</b><span>avg order</span></div>
      <div class="ostat"><b>${active}</b><span>active orders</span></div>
      <div class="ostat"><b>${sess.length}</b><span>this session</span></div>
    </div>
    <div class="section-label" style="padding-left:0">Latest orders</div>
    ${feed.slice(0,5).map(o=>`<div class="orow"><div><b>${o.names.join(', ')}</b><span>${o.ago} · pickup</span></div><div class="okept">+$${o.total.toFixed(2)} kept</div></div>`).join('')}
    <div class="realnote" style="margin-top:14px">Illustrative figures based on this restaurant's activity. Place an order in the demo and it lands in Orders as a new ticket.</div>`;
}
function ordersTab(r){
  const q=QUEUE[r.id]||[];
  const active=q.filter(o=>o.status!=='done');
  const done=q.filter(o=>o.status==='done').length;
  const label={new:'New',preparing:'Preparing',ready:'Ready for pickup'};
  const nextlbl={new:'Start preparing',preparing:'Mark ready',ready:'Mark picked up'};
  const cls={new:'st-new',preparing:'st-prep',ready:'st-ready'};
  return `
    <div class="oqsum">${active.length} active · ${done} completed today</div>
    ${active.length ? active.map(o=>`
      <div class="ocard">
        <div class="ohd"><span class="ostatus ${cls[o.status]}">${label[o.status]}</span><span class="otime">#${o.oid} · ${o.mins} min ago</span></div>
        <div class="oitems">${o.items.map(i=>i.qty+'× '+i.name).join(', ')}</div>
        <div class="ofoot"><span class="ocust">${o.name} · $${o.total.toFixed(2)}</span><button class="oadv" onclick="advanceOrder(${o.oid})">${nextlbl[o.status]} →</button></div>
      </div>`).join('') : '<div class="empty">No active orders right now. New tickets appear here the moment a diner orders.</div>'}
    ${done?`<div class="realnote" style="margin-top:10px">${done} order${done===1?'':'s'} completed today. On a live account, new orders also trigger a sound + receipt print.</div>`:''}`;
}
function advanceOrder(oid){
  const q=QUEUE[ownerRest]||[]; const o=q.find(x=>x.oid===oid); if(!o) return;
  const flow={new:'preparing',preparing:'ready',ready:'done'};
  o.status=flow[o.status]||'done'; o.mins=0;
  if(o.status==='ready') showToast('📲 '+(o.name||'Customer')+' texted: your order is ready for pickup');
  else if(o.status==='done') showToast('Order marked picked up');
  openOwner(ownerRest,'orders');
}
function menuTab(r){
  return `<div style="display:flex;gap:8px;margin:0 0 6px">
      <button class="addbtn2" style="margin:0" onclick="addCategory('${r.id}')">+ Category</button>
      <button class="addbtn2" style="margin:0" onclick="addMenuItem('${r.id}')">+ Item</button>
    </div>`+
    r.menu.map(c=>`<div class="section-label" style="padding-left:0">${c.cat}</div>`+
    (c.items.length?c.items.map(i=>{const so=unavailable[i.id];const ph=photoFor(i);const mc=i.mods?i.mods.length:0;return `
    <div class="mrow">
      <div class="mthumb sm ${so?'dim':''}" style="${ph?`background-image:url('${ph}')`:`background:${r.color}`}">${ph?'':i.emoji}</div>
      <div class="mgrow"><b>${i.name}</b> <span class="mp">$${i.price.toFixed(2)}</span>${mc?`<span class="modcount">${mc} modifier group${mc>1?'s':''}</span>`:''}</div>
      <div class="medit">
        <button class="ebtn" onclick="editPrice('${i.id}')">Price</button>
        <button class="ebtn" onclick="setPhoto('${i.id}')">Photo</button>
        <button class="ebtn" onclick="addModGroup('${i.id}')">+ Mod</button>
        <button class="soldbtn ${so?'off':''}" onclick="toggleSold('${i.id}')">${so?'Sold out':'Available'}</button>
      </div>
    </div>`;}).join(''):'<div class="empty" style="padding:14px">No items yet — tap + Item.</div>')).join('')
    + '<div class="realnote" style="margin-top:14px">Build the menu: add categories and items, set prices and photos, attach modifier groups (sizes, add-ons), or 86 an item. Every change updates the live storefront and the AI instantly.</div>';
}
function addCategory(rid){
  const r=RESTAURANTS.find(x=>x.id===rid);
  const name=prompt('New category name? (e.g. Specials)'); if(!name) return;
  r.menu.push({cat:name.trim(), items:[]}); showToast('Category "'+name.trim()+'" added'); openOwner(rid,'menu');
}
function addMenuItem(rid){
  const r=RESTAURANTS.find(x=>x.id===rid);
  const name=prompt('New item name?'); if(!name) return;
  const price=parseFloat(prompt('Price? (e.g. 9.50)')); if(!(price>=0)) return;
  const desc=prompt('Short description? (optional)')||'';
  const cat=r.menu[r.menu.length-1] || (r.menu[0]={cat:'Menu',items:[]});
  cat.items.push({id:'x'+(++__oid), name:name.trim(), price:price, desc:desc.trim(), tags:[], emoji:'🍽️'});
  showToast('Added '+name+' to '+cat.cat); openOwner(rid,'menu');
}
function addModGroup(id){
  const it=findItem(id); if(!it) return;
  const gname=prompt('Modifier group name? (e.g. Add-ons, Choose a size)'); if(!gname) return;
  const multiAns=prompt('Can the diner pick more than one? (yes/no)','yes')||'no';
  const multi=/^y/i.test(multiAns.trim());
  const raw=prompt('Options as name:price, comma-separated\n(e.g. Bacon:2, Avocado:1.5, Egg:1.5)'); if(!raw) return;
  const options=raw.split(',').map(s=>{const parts=s.split(':');return {name:(parts[0]||'').trim(), price:parseFloat(parts[1])||0};}).filter(o=>o.name);
  if(!options.length) return;
  if(!it.mods) it.mods=[];
  it.mods.push(multi?{name:gname.trim(),multi:true,max:options.length,options:options}:{name:gname.trim(),options:options});
  showToast('Modifier group added to '+it.name); openOwner(ownerRest,'menu');
}
function editPrice(id){ const it=findItem(id); if(!it) return; const v=prompt('New price for '+it.name, it.price.toFixed(2)); const n=parseFloat(v); if(n>=0){ it.price=n; showToast('Price updated'); } openOwner(ownerRest,'menu'); }
function setPhoto(id){ const it=findItem(id); if(!it) return; const v=prompt('Image URL for '+it.name+' (leave blank to clear)', photoOverride[id]||''); if(v===null) return; if(v.trim()) photoOverride[id]=v.trim(); else delete photoOverride[id]; showToast('Photo updated'); openOwner(ownerRest,'menu'); }
function toggleSold(id){
  if(unavailable[id]) delete unavailable[id]; else unavailable[id]=true;
  const it=findItem(id); showToast((it?it.name:'Item')+(unavailable[id]?' marked sold out':' back available'));
  openOwner(ownerRest,'menu');
}
function promosTab(r){
  return `<button class="addbtn2" onclick="createPromo()">+ Create promo code</button>`+
    (promos.length ? promos.map((p,idx)=>`<div class="mrow"><div class="mgrow"><b>${p.code}</b> <span class="mp">${p.label}</span></div><button class="ebtn del" onclick="deletePromo(${idx})">Delete</button></div>`).join('') : '<div class="empty">No promo codes yet.</div>')
    + '<div class="realnote" style="margin-top:14px">Codes apply at checkout instantly. As a diner, try <b>LOCAL10</b> in the promo box. Restaurant keeps the rest, commission-free.</div>';
}
function createPromo(){
  const code=(prompt('Promo code? (e.g. TACOTUES)')||'').trim().toUpperCase(); if(!code) return;
  const t=prompt('Percent off or dollars off? (type % or $)','%')||'%';
  const isPct=t.indexOf('$')<0;
  const val=parseFloat(prompt(isPct?'Percent off? (e.g. 15)':'Dollars off? (e.g. 5)')); if(!(val>0)) return;
  promos.push({code,type:isPct?'pct':'amt',value:val,label:isPct?val+'% off':'$'+val.toFixed(2)+' off'});
  showToast('Promo '+code+' created'); openOwner(ownerRest,'promos');
}
function deletePromo(i){ promos.splice(i,1); showToast('Promo deleted'); openOwner(ownerRest,'promos'); }
function reviewsTab(r){
  ensureReviews(r); const rv=reviews[r.id];
  const avg=(rv.reduce((s,x)=>s+x.stars,0)/rv.length).toFixed(1);
  return `<div class="oqsum">★ ${avg} average · ${rv.length} reviews · replying builds loyalty and ranking</div>`+
    rv.map((x,idx)=>`<div class="ocard"><div class="ohd"><b>${esc(x.name)}</b><span class="otime" style="color:#B8740B">${'★'.repeat(x.stars)}${'☆'.repeat(5-x.stars)}</span></div><div class="oitems" style="font-weight:500">${esc(x.text)}</div>${x.reply?`<div class="rvreply"><b>You replied:</b> ${esc(x.reply)}</div>`:`<button class="ebtn" onclick="replyReview('${r.id}',${idx})">Reply</button>`}</div>`).join('');
}
function replyReview(rid,idx){ const v=prompt('Your reply to this review'); if(!v) return; reviews[rid][idx].reply=v.trim(); showToast('Reply posted'); openOwner(rid,'reviews'); }
function hoursTab(r){
  const s=storeOf(r);
  const preps=['10–20 min','15–25 min','20–30 min','30–45 min'];
  return `
    <div class="hrow"><div><b>Store status</b><span>${s.open?'Diners can order now':'Diners can browse but not order'}</span></div>
      <button class="tgl ${s.open?'on':''}" onclick="toggleOpen('${r.id}')">${s.open?'Open':'Closed'}</button></div>
    <div class="hrow"><div><b>Pause new orders</b><span>Kitchen slammed? Stop the queue without closing</span></div>
      <button class="tgl ${s.paused?'warn':''}" onclick="togglePause('${r.id}')">${s.paused?'Paused':'Live'}</button></div>
    <div class="hrow col"><div><b>Pickup prep time</b><span>Shown to diners as the wait</span></div>
      <div class="prepwrap">${preps.map(p=>`<button class="prepbtn ${s.prep===p?'on':''}" onclick="setPrep('${r.id}','${p}')">${p}</button>`).join('')}</div></div>
    <div class="realnote" style="margin-top:6px">These flip the live storefront instantly. Closing or pausing shows diners a banner and turns off ordering.</div>`;
}
function toggleOpen(id){ const s=storeOf(RESTAURANTS.find(r=>r.id===id)); s.open=!s.open; showToast('Store '+(s.open?'opened':'closed')); openOwner(id,'hours'); }
function togglePause(id){ const s=storeOf(RESTAURANTS.find(r=>r.id===id)); s.paused=!s.paused; showToast(s.paused?'New orders paused':'Orders live again'); openOwner(id,'hours'); }
function setPrep(id,p){ const s=storeOf(RESTAURANTS.find(r=>r.id===id)); s.prep=p; showToast('Prep time set to '+p); openOwner(id,'hours'); }
function payoutsTab(r){
  const st=ownerStats(r);
  const week=Math.round(st.revenue/4.3);
  const wkSaved=Math.round(week*0.30);
  const rows=[['This Monday','$'+week.toLocaleString(),'Scheduled'],['Last Monday','$'+Math.round(week*0.94).toLocaleString(),'Paid'],['Two weeks ago','$'+Math.round(week*1.06).toLocaleString(),'Paid']];
  return `
    <div class="ohero">
      <div class="lbl">Next payout</div>
      <div class="amt">$${week.toLocaleString()}</div>
      <div class="osub">Deposits to your bank in 2 days · you keep 100%, FullPlate takes 0% commission</div>
    </div>
    <div class="ostatrow">
      <div class="ostat"><b>$${st.revenue.toLocaleString()}</b><span>sales this month</span></div>
      <div class="ostat"><b>$${wkSaved.toLocaleString()}</b><span>saved per week</span></div>
      <div class="ostat"><b>2.9%+30¢</b><span>card processing</span></div>
    </div>
    <div class="section-label" style="padding-left:0">Payout history</div>
    ${rows.map(p=>`<div class="orow"><div><b>${p[1]}</b><span>${p[0]} · direct deposit</span></div><div class="okept">${p[2]}</div></div>`).join('')}
    <div class="realnote" style="margin-top:14px">In a live account, payouts run through Stripe Connect straight to the restaurant's bank. FullPlate never holds your money and charges no commission — only standard card processing is passed through at cost.</div>`;
}
function settingsTab(r){
  const s=ownerSettings;
  const row=(k,label,desc)=>`<div class="hrow"><div><b>${label}</b><span>${desc}</span></div><button class="tgl ${s[k]?'on':''}" onclick="toggleSetting('${k}')">${s[k]?'On':'Off'}</button></div>`;
  return row('sound','New-order sound','Chime in the kitchen when a ticket arrives')
    + row('autoprint','Auto-print tickets','Send each order to the receipt printer')
    + row('smsReady','Text customer on ready','Auto-SMS the diner when you mark an order ready')
    + row('dailyEmail','Daily summary email','Sales and orders recap emailed each night')
    + row('tips','Accept tips','Let diners add a tip at checkout')
    + '<div class="realnote" style="margin-top:6px">Notification and hardware settings. In a live account these connect to a receipt printer and SMS/email, and run per-location.</div>';
}
function toggleSetting(k){ ownerSettings[k]=!ownerSettings[k]; showToast(k+' '+(ownerSettings[k]?'on':'off')); openOwner(ownerRest,'settings'); }
