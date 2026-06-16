/* FullPlate core: shared app state + diner storefront, cart, checkout,
   account, and the ordering assistant. Loaded after data.js + platform.js, before owner.js. */

let current=null, cart=[], activeCity='Phoenix', activeKind='All', activeSearch='', cartRest=null, appliedPromo=null;
const placedOrders=[], orderHistory=[];
let aiHistory=[], loyaltyPts=120;
let ownerRest='chiwas', ownerTab='overview', __oid=1000, __toastT=null;
const QUEUE={}, STORE={}, unavailable={}, photoOverride={}, reviews={}, favorites={};
const promos=[{code:'LOCAL10',type:'pct',value:10,label:'10% off your order'}];
const ownerSettings={sound:true,autoprint:true,smsReady:true,dailyEmail:false,tips:true};
let __lid=0, tipPct=0, tipAmt=null;
const profile={name:'Guest', phone:'', pickup:'Pickup at the counter', pay:'Visa •••• 4242 · demo'};
let modItem=null, modSel={};

function photoFor(it){ return photoOverride[it.id] || itemPhoto(it.name); }
function cities(){ return [...new Set(RESTAURANTS.map(r=>r.city))]; }
function storeOf(r){ if(!STORE[r.id]) STORE[r.id]={open:true,paused:false,prep:r.eta}; return STORE[r.id]; }
function orderingOpen(r){ const s=storeOf(r); return s.open && !s.paused && (r.type!=='truck' || r.live); }
function showToast(msg){ const el=document.getElementById('toast'); if(!el) return; el.textContent=msg; el.classList.add('show'); clearTimeout(__toastT); __toastT=setTimeout(function(){el.classList.remove('show');},2600); }

function setCity(c){ activeCity=c; activeKind='All'; activeSearch=''; var s=document.getElementById('searchBox'); if(s)s.value=''; renderHome(); window.scrollTo(0,0); }
function setKind(k){ activeKind=k; renderHome(); }
function runSearch(q){ activeSearch=(q||'').trim().toLowerCase(); renderHome(); }
function matchSearch(r,q){
  if((r.name+' '+r.cuisine+' '+r.kind).toLowerCase().includes(q)) return true;
  return r.menu.some(c=>c.items.some(i=>i.name.toLowerCase().includes(q)||i.desc.toLowerCase().includes(q)));
}
function toggleFav(id){
  if(favorites[id]) delete favorites[id]; else favorites[id]=true;
  showToast(favorites[id]?'Saved to favorites':'Removed from favorites');
  if(document.getElementById('view-home').style.display!=='none') renderHome();
  else if(document.getElementById('view-account').style.display!=='none') openAccount();
}

function renderHome(){
  document.getElementById('cityTabs').innerHTML = cities().map(c=>`
    <button class="citytab ${c===activeCity?'on':''}" onclick="setCity('${c}')"><span class="cpin">◉</span> ${c}</button>`).join('');
  const inCity = RESTAURANTS.filter(r=>r.city===activeCity);
  const cuis = [...new Set(inCity.filter(r=>r.type!=='truck').map(r=>r.kind))].sort();
  const hasTrucks = inCity.some(r=>r.type==='truck');
  let kindHTML = ['All', ...cuis].map(k=>`<button class="kindtab ${k===activeKind?'on':''}" onclick="setKind('${k}')">${k==='All'?'All food':k}</button>`).join('');
  if(hasTrucks) kindHTML += `<button class="kindtab trucktab ${activeKind==='__trucks__'?'on':''}" onclick="setKind('__trucks__')">🚚 Trucks</button>`;
  document.getElementById('kindTabs').innerHTML = kindHTML;

  // one card per fixed brand (primary location in this city) + trucks as their own cards
  const seen={}, fixedCards=[];
  inCity.filter(r=>r.type!=='truck').forEach(r=>{
    const bk=r.brand||r.id; if(seen[bk]) return; seen[bk]=1;
    const locs=inCity.filter(x=>(x.brand||x.id)===bk && x.type!=='truck');
    fixedCards.push(locs.find(x=>x.featured)||locs[0]);
  });
  const trucks=inCity.filter(r=>r.type==='truck');

  let display, label;
  if(activeSearch){
    display=fixedCards.filter(r=>matchSearch(r,activeSearch)).concat(trucks.filter(r=>matchSearch(r,activeSearch)));
    label=`${display.length} result${display.length===1?'':'s'} for "${activeSearch}"`;
  } else if(activeKind==='__trucks__'){
    display=trucks.slice();
    label=`${trucks.length} food truck${trucks.length===1?'':'s'} in ${activeCity}`;
  } else if(activeKind==='All'){
    const live=trucks.filter(truckLive);
    display=live.concat(fixedCards);
    label=`${display.length} places in ${activeCity}`;
  } else {
    display=fixedCards.filter(r=>r.kind===activeKind).concat(trucks.filter(r=>r.kind===activeKind && truckLive(r)));
    label=`${display.length} ${activeKind.toLowerCase()} spots in ${activeCity}`;
  }
  document.getElementById('rlistLabel').textContent=label;
  document.getElementById('rlist').innerHTML = display.length ? display.map(r=>cardHTML(r)).join('') : '<div class="empty">No matches. Try another search or category.</div>';
}

function cardHTML(r){
  const bk=r.brand||r.id;
  const locCount=RESTAURANTS.filter(x=>(x.brand||x.id)===bk && x.type!=='truck' && x.city===r.city).length;
  const isTruck=r.type==='truck', live=truckLive(r);
  const meta = `<div class="rmeta"><span class="star">★ ${r.rating}</span><span>(${r.reviews})</span>·<span>${r.cuisine}</span>·<span>${r.price}</span>${isTruck?'':`·<span>◷ ${r.eta}</span>`}</div>`;
  const truckLine = isTruck
    ? (live ? `<div class="liveline">🚚 Live now · 📍 ${esc(r.spot)} · until ${esc(r.until)}</div>`
            : `<div class="offline">🚚 Off now · Next: ${esc(r.nextStop||'TBA')}</div>`)
    : '';
  const locChip = (!isTruck && locCount>1) ? `<div class="loccount">📍 ${locCount} locations · pick one inside</div>` : '';
  const badge = isTruck ? `<div class="rbadge truck">🚚 Food truck</div>` : `<div class="rbadge">● 0% commission</div>`;
  const flag = r.featured ? '<div class="feat">★ Featured</div>' : (live?'<div class="feat live">● Live now</div>':'');
  return `
    <div class="rcard ${r.featured?'is-feat':''} ${isTruck?'is-truck':''}" onclick="openRestaurant('${r.id}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter')openRestaurant('${r.id}')" aria-label="${r.name}, ${r.cuisine}">
      <div class="rbanner" style="${bannerStyle(r.id, r.color, CARD_SCRIM)}">${IMG[r.id]?'':'<span class="bemoji">'+r.emoji+'</span>'}${badge}${flag}</div>
      <div class="rbody">
        <div class="rtop"><h3>${r.name}</h3><button class="favbtn" onclick="event.stopPropagation();toggleFav('${r.id}')" aria-label="Favorite ${r.name}">${favorites[r.id]?'♥':'♡'}</button></div>
        ${meta}
        ${truckLine}
        ${locChip}
        <p class="rblurb">${r.blurb}</p>
      </div>
    </div>`;
}

function locPicker(r){
  const locs=RESTAURANTS.filter(x=>(x.brand||x.id)===(r.brand||r.id) && x.type!=='truck');
  if(locs.length<2) return '';
  return `<div class="locpick">
      <div class="lplabel">📍 ${locs.length} locations — choose where to pick up</div>
      <div class="lprow">${locs.map(l=>`<button class="lpbtn ${l.id===r.id?'on':''}" onclick="openRestaurant('${l.id}')">${esc(l.loc||l.name)}<span>◷ ${l.eta}</span></button>`).join('')}</div>
    </div>`;
}
function truckStatus(r){
  if(r.type!=='truck') return '';
  return r.live
    ? `<div class="truckstatus live">🚚 <b>Live now</b> · 📍 ${esc(r.spot)}<br>Open until ${esc(r.until)} · pickup at the truck</div>`
    : `<div class="truckstatus off">🚚 <b>Not serving right now</b><br>Next stop: ${esc(r.nextStop||'TBA')}</div>`;
}

function openRestaurant(id){
  current = RESTAURANTS.find(r=>r.id===id);
  if(typeof ensureReviews==='function') ensureReviews(current);
  if(cart.length && cartRest!==id){ cart=[]; appliedPromo=null; tipPct=0; tipAmt=null; updateCartBar(); }
  chatStarted=false; aiHistory=[]; document.getElementById('chat').innerHTML='';
  window.scrollTo(0,0);
  const s=storeOf(current);
  const liveOk = current.type!=='truck' || current.live;
  const open = s.open && !s.paused && liveOk;
  const banner = (open || current.type==='truck') ? '' : `<div class="dinerbanner">${s.open?'⏸ Pausing new orders — the kitchen is catching up. Check back in a few minutes.':'🚫 Currently closed — browse the menu; ordering resumes when they reopen.'}</div>`;
  document.getElementById('view-restaurant').innerHTML = `
    <div class="rhead">
      <div class="rhead-banner" style="${bannerStyle(current.id, current.color, HEAD_SCRIM)}">${IMG[current.id]?'':'<span class="bemoji">'+current.emoji+'</span>'}</div>
      <div class="rhead-info">
        <h2>${current.name}</h2>
        <div class="rmeta"><span class="star">★ ${current.rating}</span><span>(${current.reviews})</span>·<span>${current.cuisine}</span>·<span>${current.price}</span>·<span>◷ ${s.prep} pickup</span></div>
        <div class="rstory">${current.story}</div>
        ${current.realNote?`<div class="realnote">${current.realNote}</div>`:''}
      </div>
    </div>
    ${truckStatus(current)}
    ${locPicker(current)}
    ${banner}
    ${open?`<div class="ai-launch" onclick="openChat()" role="button" tabindex="0" onkeydown="if(event.key==='Enter')openChat()">
      <div class="spark">✦</div>
      <div class="t"><b>Order by chatting</b><span>Say or type what you want. Ask anything about the menu.</span></div>
      <div class="go">›</div>
    </div>`:''}
    ${current.menu.map(cat=>`
      <div class="menucat">${cat.cat}</div>
      ${cat.items.map(it=>{const ph=photoFor(it);const so=unavailable[it.id];const hasMods=it.mods&&it.mods.length;return `
        <div class="mitem">
          <div class="mthumb ${so?'dim':''}" style="${ph?`background-image:url('${ph}')`:`background:${current.color}`}">${ph?'':it.emoji}</div>
          <div class="minfo">
            <h4>${it.name} ${it.id===current.popular?'<span class="pop">★ Most ordered</span>':''} ${it.tags.map(t=>tagHTML(t)).join('')}</h4>
            <p>${it.desc}</p>
          </div>
          <div class="madd"><span class="mprice">$${it.price.toFixed(2)}</span>${so?'<span class="soldtag">Sold out</span>':(open?(hasMods?`<button class="custbtn" onclick="addOrConfigure('${it.id}')" aria-label="Customize ${it.name}">Customize</button>`:`<button class="addbtn" onclick="addOrConfigure('${it.id}')" aria-label="Add ${it.name}">+</button>`):'')}</div>
        </div>`;}).join('')}
    `).join('')}
    ${reviewsSection(current)}
    <div style="height:10px"></div>`;
  show('view-restaurant');
  document.getElementById('backBtn').style.display='flex';
  document.getElementById('aiName').textContent = current.name + ' Assistant';
}

function reviewsSection(r){
  if(typeof ensureReviews==='function') ensureReviews(r);
  const rv=(reviews[r.id]||[]); if(!rv.length) return '';
  const avg=(rv.reduce((s,x)=>s+x.stars,0)/rv.length).toFixed(1);
  const rounded=Math.round(avg);
  const top=rv.slice(0,3);
  return `<div class="menucat">What diners say</div>
    <div class="revstrip">
      <div class="rvtop"><span class="rvavg">${avg}</span><span class="rvstars">${'★'.repeat(rounded)}${'☆'.repeat(5-rounded)}</span><span class="rvcount">${rv.length} review${rv.length>1?'s':''}</span></div>
      ${top.map(x=>`<div class="revitem"><div class="rvname">${esc(x.name)}<span class="rvr">${'★'.repeat(x.stars)}${'☆'.repeat(5-x.stars)}</span></div><div class="rvtext">${esc(x.text)}</div>${x.reply?`<div class="rvreply"><b>${esc(r.name)}:</b> ${esc(x.reply)}</div>`:''}</div>`).join('')}
    </div>`;
}

function tagHTML(t){ const map={gf:['gf','GF'],v:['v','VEG'],spicy:['spicy','🌶']}; const m=map[t]; return m?`<span class="tag ${m[0]}">${m[1]}</span>`:''; }

function findItem(id){ for(const r of RESTAURANTS) for(const c of r.menu) for(const it of c.items) if(it.id===id) return it; }
function lineUnit(it, mods){ return it.price + (mods? mods.reduce((s,m)=>s+(m.price||0),0):0); }
function addToCart(id, mods){
  const it=findItem(id); if(!it) return;
  if(unavailable[id]) return;
  if(current && !orderingOpen(current)) return;
  if(it.mods && it.mods.length && !mods){
    mods = it.mods.filter(g=>!g.multi).map(g=>({group:g.name, option:g.options[0].name, price:g.options[0].price}));
    if(!mods.length) mods=null;
  }
  cartRest=current?current.id:cartRest;
  if(!mods || !mods.length){
    const row=cart.find(c=>c.id===id && (!c.mods || !c.mods.length));
    if(row){ row.qty++; updateCartBar(); return; }
  }
  cart.push({lid:++__lid, id:it.id, name:it.name, price:lineUnit(it,mods), qty:1, mods:(mods&&mods.length)?mods:null});
  updateCartBar();
}
function addOrConfigure(id){ const it=findItem(id); if(it && it.mods && it.mods.length){ openModSheet(it); } else { addToCart(id); } }

/* MODIFIER SHEET */
function openModSheet(it){
  if(unavailable[it.id]) return;
  if(current && !orderingOpen(current)) return;
  modItem=it; modSel={};
  it.mods.forEach(g=>{ modSel[g.name] = g.multi ? [] : [g.options[0]]; });
  modSheetRender();
  document.getElementById('modback').style.display='block';
  requestAnimationFrame(()=>{document.getElementById('modback').style.opacity='1';document.getElementById('modsheet').classList.add('open');});
}
function closeModSheet(){ document.getElementById('modsheet').classList.remove('open'); const b=document.getElementById('modback'); b.style.opacity='0'; setTimeout(()=>{b.style.display='none';},200); modItem=null; }
function modUnit(){ let u=modItem.price; Object.keys(modSel).forEach(gn=>modSel[gn].forEach(o=>u+=o.price)); return u; }
function modSheetRender(){
  document.getElementById('modTitle').textContent = modItem.name;
  document.getElementById('modSub').textContent = modItem.desc || '';
  document.getElementById('modBody').innerHTML = modItem.mods.map((g,gi)=>`
    <div class="modgroup">
      <div class="modglabel">${g.name}<span>${g.multi?('Choose up to '+(g.max||g.options.length)):'Choose one'}</span></div>
      ${g.options.map((o,oi)=>{const on=modSel[g.name].some(s=>s.name===o.name);return `
        <div class="modopt ${on?'on':''}" onclick="modPick(${gi},${oi})" role="button" tabindex="0" aria-pressed="${on}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();modPick(${gi},${oi})}">
          <span class="moname">${o.name}</span>
          <span class="moprice">${o.price>0?'+$'+o.price.toFixed(2):''}</span>
          <span class="modot"></span>
        </div>`;}).join('')}
    </div>`).join('');
  document.getElementById('modAddBtn').textContent = 'Add to order · $'+modUnit().toFixed(2);
}
function modPick(gi,oi){
  const g=modItem.mods[gi]; const opt=g.options[oi]; const arr=modSel[g.name];
  if(g.multi){
    const idx=arr.findIndex(s=>s.name===opt.name);
    if(idx>=0) arr.splice(idx,1);
    else { if(g.max && arr.length>=g.max){ showToast('Up to '+g.max); return; } arr.push(opt); }
  } else { modSel[g.name]=[opt]; }
  modSheetRender();
}
function modConfirm(){
  if(!modItem) return;
  const mods=[];
  Object.keys(modSel).forEach(gn=>modSel[gn].forEach(o=>mods.push({group:gn,option:o.name,price:o.price})));
  const id=modItem.id; closeModSheet();
  addToCart(id, mods.length?mods:null);
  showToast('Added to order');
}

function cartTotals(){ const sub=cart.reduce((s,c)=>s+c.price*c.qty,0); const count=cart.reduce((s,c)=>s+c.qty,0); return {sub,count}; }
function promoDiscount(sub){ if(!appliedPromo) return 0; return appliedPromo.type==='pct' ? sub*(appliedPromo.value/100) : Math.min(appliedPromo.value, sub); }
function tipAmount(base){ if(!ownerSettings.tips) return 0; return tipAmt!=null ? tipAmt : base*(tipPct/100); }
function updateCartBar(){
  const {sub,count}=cartTotals(); const bar=document.getElementById('cartbar');
  if(count>0){bar.style.display='flex';document.getElementById('cartCount').textContent=count;document.getElementById('cartTotal').textContent=sub.toFixed(2);}
  else bar.style.display='none';
}
function applyPromo(){
  const v=((document.getElementById('promoIn')||{}).value||'').trim().toUpperCase();
  if(!v){ appliedPromo=null; openCheckout(); return; }
  const p=promos.find(x=>x.code===v);
  if(!p){ appliedPromo=null; showToast('Code not found'); openCheckout(); return; }
  appliedPromo=p; showToast('Promo '+p.code+' applied'); openCheckout();
}
function setTip(p){ tipPct=p; tipAmt=null; openCheckout(); }
function setTipCustom(){ const v=parseFloat(prompt('Tip amount in dollars? (e.g. 3.00)')); if(v>=0){ tipAmt=v; } openCheckout(); }

function openCheckout(){
  if(cartTotals().count===0) return;
  closeChat();
  const {sub}=cartTotals(); const disc=promoDiscount(sub); const keptFood=Math.max(0,sub-disc); const tax=keptFood*0.086; const tip=tipAmount(keptFood); const total=keptFood+tax+tip; const doordashCut=sub*0.30;
  document.getElementById('view-checkout').innerHTML=`
    <div class="section-label" style="padding-top:14px">Your order · ${current.name}</div>
    ${cart.map(c=>`
      <div class="co-line">
        <div><b>${c.name}</b>
          ${c.mods?`<div class="comods">${c.mods.map(m=>m.option).join(', ')}</div>`:''}
          <div class="qstep"><button onclick="changeQty(${c.lid},-1)" aria-label="Remove one">−</button><span>${c.qty}</span><button onclick="changeQty(${c.lid},1)" aria-label="Add one">+</button></div>
        </div>
        <div>$${(c.price*c.qty).toFixed(2)}</div>
      </div>`).join('')}
    <div class="promorow"><input id="promoIn" class="promoinput" placeholder="Promo code" value="${appliedPromo?appliedPromo.code:''}"><button class="promobtn" onclick="applyPromo()">${appliedPromo?'Change':'Apply'}</button></div>
    ${ownerSettings.tips?`<div class="tiplabel">Add a tip — 100% goes to the restaurant</div>
    <div class="tiprow">${[0,15,18,20].map(p=>`<button class="tipbtn ${(tipAmt==null&&tipPct===p)?'on':''}" onclick="setTip(${p})">${p===0?'No tip':p+'%'}</button>`).join('')}<button class="tipbtn ${tipAmt!=null?'on':''}" onclick="setTipCustom()">Custom</button></div>`:''}
    <div class="co-tot"><span>Subtotal</span><span>$${sub.toFixed(2)}</span></div>
    ${disc>0?`<div class="co-tot"><span>Promo ${appliedPromo.code}</span><span style="color:var(--good);font-weight:700">−$${disc.toFixed(2)}</span></div>`:''}
    <div class="co-tot"><span>Estimated tax</span><span>$${tax.toFixed(2)}</span></div>
    ${tip>0?`<div class="co-tot"><span>Tip</span><span>$${tip.toFixed(2)}</span></div>`:''}
    <div class="co-tot"><span>Delivery-app markup</span><span style="color:var(--good);font-weight:700">$0.00</span></div>
    <div class="co-tot"><span>Service / commission fee</span><span style="color:var(--good);font-weight:700">$0.00</span></div>
    <div class="co-tot big"><span>Total</span><span>$${total.toFixed(2)}</span></div>
    <div class="savecard">
      <h4>✓ ${current.name} keeps <span class="big">$${(keptFood+tip).toFixed(2)}</span></h4>
      <p>On a typical delivery app, this $${sub.toFixed(2)} order would cost the restaurant about <b>$${doordashCut.toFixed(2)}</b> in commission. On FullPlate they keep all of it, plus the full tip. You pay honest menu prices, they keep their margin.</p>
    </div>
    <button class="paybtn" onclick="placeOrder()">Place pickup order · $${total.toFixed(2)}</button>
    <div class="demo-note">Demo only — no card is charged.</div>`;
  window.scrollTo(0,0); show('view-checkout');
  document.getElementById('cartbar').style.display='none';
  document.getElementById('backBtn').style.display='flex';
}

function changeQty(lid,d){
  const row=cart.find(c=>c.lid===lid); if(!row) return;
  row.qty+=d; if(row.qty<=0) cart=cart.filter(c=>c.lid!==lid);
  updateCartBar();
  if(cartTotals().count===0){ appliedPromo=null; tipPct=0; tipAmt=null; goHome(); return; }
  openCheckout();
}

function placeOrder(){
  const {sub}=cartTotals(); const disc=promoDiscount(sub); const keptFood=Math.max(0,sub-disc); const tip=tipAmount(keptFood); const kept=keptFood+tip; const cut=(sub*0.30).toFixed(2);
  const pts=Math.max(1, Math.round(keptFood));
  const prep=storeOf(current).prep || current.eta || '15-20 min';
  const isTruck=current.type==='truck';
  const pickupLine=isTruck ? `Pickup at the truck · 📍 ${esc(current.spot||current.loc||current.city)}` : `Pickup at ${esc(current.name)} · ${esc(current.loc||current.city)}`;
  const rid=current.id, rname=current.name;
  const items=cart.map(c=>({id:c.id,name:c.name,qty:c.qty,price:c.price,mods:c.mods||null}));
  placedOrders.unshift({ id:rid, names:cart.map(c=>c.qty+'× '+c.name), total:kept });
  ensureQueue(current);
  QUEUE[rid].unshift({ oid:++__oid, items:items, total:kept, status:'new', mins:0, name:'You (demo)' });
  orderHistory.unshift({ id:rid, name:rname, items:items, total:kept, when:'Just now' });
  loyaltyPts += pts;
  window.__lastRest=rid;
  document.getElementById('doneMsg').innerHTML =
    `${rname} got your order and is firing it up now.<br><br>
     <div class="readyline">◷ <b>Estimated ready in ${prep}</b><br>${pickupLine}<br>We'll text you the moment it's ready.</div>
     <b style="color:var(--good)">They kept the full $${keptFood.toFixed(2)}</b>${tip>0?` plus a $${tip.toFixed(2)} tip`:''} and saved about $${cut} in delivery-app commission on this order alone.<br><br>You earned <b>${pts} FullPlate points</b>.`;
  document.getElementById('rateRow').innerHTML = rateWidget(rid);
  cart=[]; cartRest=null; appliedPromo=null; tipPct=0; tipAmt=null; updateCartBar();
  document.getElementById('backBtn').style.display='none';
  window.scrollTo(0,0); show('view-done');
}

function rateWidget(rid){
  return `<div class="raterow" id="rwrap">
    <div class="rlbl">How was your order? Leave the restaurant a review.</div>
    <div class="ratestars" id="rstars">${[1,2,3,4,5].map(n=>`<span data-n="${n}" onmouseover="hoverStars(${n})" onclick="rateOrder('${rid}',${n})" role="button" tabindex="0" aria-label="${n} star${n>1?'s':''}" onkeydown="if(event.key==='Enter')rateOrder('${rid}',${n})">★</span>`).join('')}</div>
  </div>`;
}
function hoverStars(n){ document.querySelectorAll('#rstars span').forEach(s=>s.classList.toggle('on', parseInt(s.getAttribute('data-n'))<=n)); }
function rateOrder(rid,n){
  const r=RESTAURANTS.find(x=>x.id===rid);
  if(typeof ensureReviews==='function' && r) ensureReviews(r);
  hoverStars(n);
  reviews[rid]=reviews[rid]||[];
  const who=(profile.name && profile.name!=='Guest')?profile.name:'You';
  reviews[rid].unshift({name:who, stars:n, text:(n>=4?'Great pickup order through FullPlate — easy and fast.':'Thanks — feedback sent to the restaurant.'), reply:''});
  const w=document.getElementById('rwrap');
  if(w) w.innerHTML = `<div class="ratedone">✓ Thanks! Your ${n}-star review was sent to ${esc((r||{}).name||'the restaurant')} — it shows up in their owner inbox.</div>`;
  showToast('Review submitted');
}

/* DINER ACCOUNT */
function openAccount(){
  document.getElementById('view-account').innerHTML = accountHTML();
  show('view-account');
  document.getElementById('cartbar').style.display = cartTotals().count>0 ? 'flex':'none';
  document.getElementById('backBtn').style.display='flex';
  window.scrollTo(0,0);
}
function accountHTML(){
  const favs=RESTAURANTS.filter(r=>favorites[r.id]);
  const goal=50; const have=loyaltyPts%goal; const toGo=goal-have; const ready=loyaltyPts>=goal;
  return `
    <div class="odash">
      <div class="section-label" style="padding-left:0">Your account</div>
      <div class="loyalcard">
        <div class="lbl">FullPlate rewards</div>
        <div class="amt">${loyaltyPts} pts</div>
        <div class="osub">Earn 1 point per $1 spent. ${ready?'You have a $5 reward ready to redeem.':toGo+' more points to your next $5 reward.'}</div>
        <div class="lbar"><div class="lfill" style="width:${Math.round(have/goal*100)}%"></div></div>
        ${ready?`<button class="redeembtn" onclick="redeemReward()">Redeem 50 pts for $5 off</button>`:''}
      </div>
      <div class="section-label" style="padding-left:0">Profile</div>
      <div class="profcard">
        <div class="profrow"><span class="pk">Name</span><span class="pv">${esc(profile.name)}</span><button class="ebtn" onclick="editProfile('name')">Edit</button></div>
        <div class="profrow"><span class="pk">Phone</span><span class="pv">${profile.phone?esc(profile.phone):'Add a number for order texts'}</span><button class="ebtn" onclick="editProfile('phone')">Edit</button></div>
        <div class="profrow"><span class="pk">Pickup</span><span class="pv">${esc(profile.pickup)}</span><button class="ebtn" onclick="editProfile('pickup')">Edit</button></div>
        <div class="profrow"><span class="pk">Payment</span><span class="pv">${esc(profile.pay)}</span></div>
      </div>
      <div class="section-label" style="padding-left:0">Favorites</div>
      ${favs.length?favs.map(r=>`<div class="orow" onclick="openRestaurant('${r.id}')" style="cursor:pointer"><div><b>${r.name}</b><span>${r.cuisine} · ${r.city}</span></div><div class="okept">★ ${r.rating}</div></div>`).join(''):'<div class="empty">Tap the heart on a restaurant to save it here.</div>'}
      <div class="section-label" style="padding-left:0">Order history</div>
      ${orderHistory.length?orderHistory.map((h,idx)=>`<div class="ocard"><div class="ohd"><b>${h.name}</b><span class="otime">${h.when}</span></div><div class="oitems">${h.items.map(i=>i.qty+'× '+i.name).join(', ')}</div><div class="ofoot"><span class="ocust">$${h.total.toFixed(2)} · kept by the restaurant</span><button class="oadv" onclick="reorder(${idx})">Reorder →</button></div></div>`).join(''):'<div class="empty">No orders yet. Your past orders show up here for one-tap reorder.</div>'}
      <div class="realnote" style="margin-top:14px">Loyalty, favorites, and reorder are what keep diners coming back to the restaurant directly — not the delivery app.</div>
    </div>`;
}
function editProfile(field){
  const labels={name:'Your name',phone:'Mobile number (for order texts)',pickup:'Pickup note'};
  const v=prompt(labels[field]||'Edit', profile[field]); if(v===null) return;
  profile[field]=v.trim() || profile[field];
  showToast('Profile updated'); openAccount();
}
function redeemReward(){
  if(loyaltyPts<50) return;
  loyaltyPts-=50;
  const code='REWARD'+Math.floor(Math.random()*900+100);
  promos.push({code,type:'amt',value:5,label:'$5 loyalty reward'});
  showToast('Reward unlocked! Use code '+code+' at checkout');
  openAccount();
}
function reorder(idx){
  const h=orderHistory[idx]; if(!h) return;
  const r=RESTAURANTS.find(x=>x.id===h.id); if(!r) return;
  current=r; cartRest=r.id; appliedPromo=null; tipPct=0; tipAmt=null;
  cart=h.items.map(i=>({lid:++__lid, id:i.id, name:i.name, price:i.price, qty:i.qty, mods:i.mods||null}));
  updateCartBar(); showToast('Reordered from '+r.name);
  openRestaurant(r.id);
}

function show(id){
  ['view-home','view-restaurant','view-checkout','view-done','view-owner','view-account'].forEach(v=>{ document.getElementById(v).style.display=(v===id)?'block':'none'; });
  const navmap={'view-home':'home','view-account':'account','view-owner':'owner'};
  const active=navmap[id]||'home';
  document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('on', b.getAttribute('data-nav')===active));
}
function goHome(){ closeChat(); show('view-home'); document.getElementById('backBtn').style.display='none'; updateCartBar(); window.scrollTo(0,0); }
function goSearch(){ goHome(); const s=document.getElementById('searchBox'); if(s){ try{s.focus();}catch(e){} } document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('on', b.getAttribute('data-nav')==='search')); }
function goBack(){
  if(document.getElementById('view-checkout').style.display==='block' && current){ openRestaurant(current.id); updateCartBar(); return; }
  goHome();
}
function resetAll(){ cart=[]; cartRest=null; appliedPromo=null; tipPct=0; tipAmt=null; updateCartBar(); goHome(); }

/* ASSISTANT — real Claude via /api/chat, with scripted fallback */
let chatStarted=false;
function openChat(){
  document.getElementById('backdrop').style.display='block';
  requestAnimationFrame(()=>{document.getElementById('backdrop').style.opacity='1';document.getElementById('sheet').classList.add('open');});
  setupMic();
  if(!chatStarted){
    chatStarted=true;
    botSay(`Hi! I am the ordering assistant for ${current.name}. You can say or type what you would like, or ask me anything about the menu. What sounds good?`);
    setChips(["What do you recommend?","See popular items","Anything gluten free?"]);
  }
}
function closeChat(){ stopMic(); document.getElementById('sheet').classList.remove('open'); const b=document.getElementById('backdrop'); b.style.opacity='0'; setTimeout(()=>{b.style.display='none';},200); }
function scrollChat(){const c=document.getElementById('chat');c.scrollTop=c.scrollHeight;}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function botSay(html){const c=document.getElementById('chat');const d=document.createElement('div');d.className='msg bot';d.innerHTML=html;c.appendChild(d);scrollChat();}
function meSay(t){const c=document.getElementById('chat');const d=document.createElement('div');d.className='msg me';d.textContent=t;c.appendChild(d);scrollChat();}
function noteSay(t){const c=document.getElementById('chat');const d=document.createElement('div');d.className='msg note';d.textContent=t;c.appendChild(d);scrollChat();}
function setChips(arr){document.getElementById('chips').innerHTML=(arr||[]).map(t=>`<button class="chip" onclick="sendUser('${t.replace(/'/g,"\\'")}')">${t}</button>`).join('');}
function showTyping(){const c=document.getElementById('chat');const t=document.createElement('div');t.className='typing';t.id='typing';t.innerHTML='<span></span><span></span><span></span>';c.appendChild(t);scrollChat();}
function hideTyping(){const e=document.getElementById('typing');if(e)e.remove();}
function botThink(cb){showTyping();setTimeout(()=>{hideTyping();cb();},650);}
function allItems(){ const a=[]; current.menu.forEach(c=>c.items.forEach(i=>a.push(i))); return a; }

function sendUser(raw){ const text=(raw||'').trim(); if(!text) return; meSay(text); setChips([]); aiTurn(text); }

function aiTurn(text){
  showTyping();
  const menu=allItems().filter(i=>!unavailable[i.id]).map(i=>({id:i.id,name:i.name,price:i.price,desc:i.desc,tags:i.tags}));
  const fallback=function(){ hideTyping(); handleIntent(text.toLowerCase()); };
  let done=false;
  const timer=setTimeout(function(){ if(!done){ done=true; fallback(); } }, 12000);
  fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({restaurant:current.name, menu:menu, message:text, history:aiHistory})})
    .then(function(r){return r.json();})
    .then(function(d){
      if(done) return; done=true; clearTimeout(timer); hideTyping();
      if(!d || d.configured===false || d.error || !d.reply){ handleIntent(text.toLowerCase()); return; }
      aiHistory.push({role:'user',content:text}); aiHistory.push({role:'assistant',content:d.reply});
      if(aiHistory.length>16) aiHistory=aiHistory.slice(-16);
      (d.add||[]).forEach(function(a){ var it=findItem(a.id); if(it && !unavailable[a.id]){ var n=Math.max(1,Math.min(parseInt(a.qty)||1,20)); for(var k=0;k<n;k++) addToCart(it.id); } });
      botSay(esc(d.reply));
      if(d.checkout && cartTotals().count>0){ setChips([]); setTimeout(openCheckout,800); }
      else setChips(["What do you recommend?","Add a drink","That's it, checkout"]);
    })
    .catch(function(){ if(done) return; done=true; clearTimeout(timer); fallback(); });
}

function handleIntent(t){
  if(/(check\s?out|that'?s it|that is it|i'?m done|im done|finish|pay|place order|nothing else|^done|^checkout)/.test(t)){
    if(cartTotals().count===0){ botSay("You have not added anything yet. Want me to share a couple of favorites?"); setChips(["What do you recommend?","See popular items"]); return; }
    botSay("Perfect. Taking you to checkout to confirm your pickup order."); setTimeout(openCheckout,500); return;
  }
  if(/(recommend|popular|favorite|favourite|what'?s good|whats good|else is good|what else is|anything good|something good|\bbest\b|suggest)/.test(t)){
    const pop=allItems().find(i=>i.id===current.popular); const rest=allItems().filter(i=>i!==pop);
    const picks=[pop||rest[0], rest[0]===pop?rest[1]:rest[0]].filter(Boolean);
    botSay(`A couple of favorites at ${current.name}:`);
    picks.forEach((p,idx)=>botSay(`<b>${p.name}</b>${idx===0?' ★ most ordered':''} · $${p.price.toFixed(2)}<br>${p.desc}`));
    setChips([`Add ${picks[0].name}`, `Add ${picks[1].name}`, "See full menu"]); return;
  }
  if(/(drink|beverage|soda|coffee|thirsty|to drink)/.test(t)){
    const drinks=current.menu.filter(c=>/(drink|coffee)/i.test(c.cat)).flatMap(c=>c.items);
    if(drinks.length){ botSay("Something to drink:<br>"+drinks.map(d=>`• <b>${d.name}</b> ($${d.price.toFixed(2)})`).join('<br>')); setChips([`Add ${drinks[0].name}`,"That's it, checkout"]); }
    else botSay("No drinks are listed separately here. Anything else from the menu?");
    return;
  }
  if(/(gluten|celiac|coeliac|\bgf\b)/.test(t)){
    const gf=allItems().filter(i=>i.tags.includes('gf'));
    if(gf.length){
      botSay("These are marked gluten free on the menu:<br>"+gf.map(i=>`• <b>${i.name}</b> ($${i.price.toFixed(2)})`).join('<br>'));
      noteSay("The restaurant lists these as gluten free. Please confirm with staff about cross-contamination if you have an allergy.");
      setChips([`Add ${gf[0].name}`,"What else do you have?","Checkout"]);
    } else { botSay("I do not see gluten-free items flagged on this menu. The restaurant can confirm options directly."); }
    return;
  }
  if(/(vegetarian|veggie|vegan|meatless|plant)/.test(t)){
    const v=allItems().filter(i=>i.tags.includes('v'));
    if(v.length){ botSay("Vegetarian-friendly picks:<br>"+v.map(i=>`• <b>${i.name}</b> ($${i.price.toFixed(2)})`).join('<br>')); setChips([`Add ${v[0].name}`,"What do you recommend?","Checkout"]); }
    else botSay("No vegetarian items are flagged here, but the restaurant can advise on substitutions.");
    return;
  }
  if(/(hour|open|close|when|location|where|address|pickup time)/.test(t)){
    botSay(`${current.name} is set up for pickup with about a ${storeOf(current).prep} wait. In a live FullPlate listing this is where the real hours, address, and pickup time would show.`);
    setChips(["What do you recommend?","See full menu"]); return;
  }
  if(/(menu|what do you have|do you have|what else do you|see more|options|see (the )?menu|\blist\b)/.test(t)){
    const lines=current.menu.map(c=>`<b>${c.cat}</b><br>`+c.items.map(i=>`• ${i.name} ($${i.price.toFixed(2)})`).join('<br>')).join('<br><br>');
    botSay(lines); setChips([`Add ${allItems()[0].name}`,"What do you recommend?","Checkout"]); return;
  }
  const qty = parseQty(t); const matched = matchItems(t);
  if(matched.length){
    const per = matched.length>1 ? 1 : qty;
    matched.forEach(it=>{ for(let k=0;k<per;k++) addToCart(it.id); });
    const names=matched.map(it=>`${(matched.length===1&&qty>1)?qty+'× ':''}${it.name}`).join(' and ');
    const {sub,count}=cartTotals();
    botSay(`Added <b>${names}</b>. ✓<br>Your order is now ${count} item${count>1?'s':''}, $${sub.toFixed(2)}.<br>Anything else?`);
    setChips(["Add a drink","What else is good?","That's it, checkout"]); return;
  }
  if(/(^hi|^hey|^hello|^yo|good morning|good evening)/.test(t)){
    botSay(`Hey! Hungry? Tell me what you are in the mood for, or I can recommend something from ${current.name}.`);
    setChips(["What do you recommend?","Anything gluten free?","See full menu"]); return;
  }
  botSay("I want to get this right. I can recommend dishes, answer menu questions, or add something to your order. Try one of these:");
  setChips(["What do you recommend?","See full menu","Anything gluten free?"]);
}

function parseQty(t){
  const words={one:1,two:2,three:3,four:4,five:5,a:1,an:1,couple:2,double:2};
  const num=t.match(/\b(\d+)\b/); if(num) return Math.min(parseInt(num[1]),20);
  for(const w in words){ if(new RegExp('\\b'+w+'\\b').test(t)) return words[w]; }
  return 1;
}
const STOP=['the','and','with','plate','of','for','add','some','a','an','bowl'];
function matchItems(t){
  const items=allItems().filter(i=>!unavailable[i.id]);
  const exact=items.filter(it=>t.includes(it.name.toLowerCase()));
  if(exact.length) return exact;
  let best=null,bestScore=0;
  items.forEach(it=>{
    const kws=it.name.toLowerCase().replace(/[()0-9]/g,'').split(/\s+/).filter(w=>w.length>2 && !STOP.includes(w));
    const score=kws.reduce((s,k)=>s+(t.includes(k)?1:0),0);
    if(score>bestScore){bestScore=score;best=it;}
  });
  return best?[best]:[];
}

/* VOICE (progressive enhancement) */
let recog=null, micActive=false;
function micSupported(){ return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window; }
function setupMic(){
  const btn=document.getElementById('micBtn');
  if(!micSupported()){ btn.style.display='none'; return; }
  btn.style.display='flex';
}
function toggleMic(){
  if(!micSupported()) return;
  if(micActive){ stopMic(); return; }
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  recog=new SR(); recog.lang='en-US'; recog.interimResults=false; recog.maxAlternatives=1;
  recog.onresult=(e)=>{ const said=e.results[0][0].transcript; stopMic(); sendUser(said); };
  recog.onerror=()=>stopMic();
  recog.onend=()=>{ micActive=false; document.getElementById('micBtn').classList.remove('on'); };
  try{ recog.start(); micActive=true; document.getElementById('micBtn').classList.add('on'); document.getElementById('chatInput').placeholder='Listening...'; }catch(err){ stopMic(); }
}
function stopMic(){
  micActive=false;
  const btn=document.getElementById('micBtn'); if(btn) btn.classList.remove('on');
  const inp=document.getElementById('chatInput'); if(inp) inp.placeholder='Type your order...';
  if(recog){ try{recog.stop();}catch(e){} recog=null; }
}
