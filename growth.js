/* FullPlate growth layer: auto-onboarding (any location), multi-location and
   multi-brand setup, an editable review step, an embed-on-your-site preview,
   live Google rating + reviews, and a post-order Google-review nudge. Loaded
   LAST (after owner.js). Wraps openRestaurant / show / rateOrder so it needs no
   edits to core.js. Google data is demo/mock; production uses Google Places +
   Business Profile APIs (read + attribution only), never posting reviews. */
(function(){
  if(window.__fpGrowth) return; window.__fpGrowth = true;

  /* ---------------- styles ---------------- */
  var css = ''
  + '.gcard{margin:12px 16px 2px;padding:14px;background:#fff;border:1px solid var(--line);border-radius:16px}'
  + '.gcard .grow{display:flex;align-items:center;gap:8px;margin-bottom:8px}'
  + '.glogo{width:20px;height:20px;border-radius:50%;background:#fff;border:1px solid var(--line);display:inline-flex;align-items:center;justify-content:center;font-weight:800;color:#4285F4;font-size:13px}'
  + '.glogo.sm{width:18px;height:18px;font-size:12px}'
  + '.gtitle{font-weight:800;font-size:13px;color:var(--ink)}'
  + '.glink{margin-left:auto;font-size:12px;font-weight:700;color:var(--brand);text-decoration:none}'
  + '.gtop{display:flex;align-items:center;gap:8px;margin-bottom:6px}'
  + '.gnum{font-size:22px;font-weight:900;color:var(--ink)}'
  + '.gstars{color:#E8A317;letter-spacing:1px}'
  + '.gcount{font-size:12px;color:var(--muted)}'
  + '.grev{padding:8px 0;border-top:1px solid var(--line)}'
  + '.grev .grh{display:flex;justify-content:space-between;align-items:baseline}'
  + '.grev .gname{font-weight:700;font-size:13px}'
  + '.grev .gtime{font-size:11.5px;color:var(--muted)}'
  + '.grev .grstars{color:#E8A317;font-size:11px;letter-spacing:1px;margin:1px 0 2px}'
  + '.grev .gtext{font-size:13px;color:#444;line-height:1.4}'
  + '.gcard .gnote{font-size:10.5px;color:var(--muted);margin-top:8px;line-height:1.45}'
  + '.gnudge{margin-top:14px;padding:13px;background:#F4FBF4;border:1px solid #CDEBD0;border-radius:14px;text-align:center}'
  + '.gnudge .gnt{font-size:13.5px;font-weight:800;margin-bottom:8px}'
  + '.gnbtn{display:inline-flex;align-items:center;gap:7px;background:#fff;border:1px solid var(--line);border-radius:999px;padding:9px 14px;font-size:13px;font-weight:800;color:var(--ink);text-decoration:none}'
  + '.gnudge .gnnote{font-size:11px;color:var(--muted);margin-top:7px}'
  + '.obbanner{margin:10px 16px 0;padding:12px 14px;background:linear-gradient(135deg,#2B1E17,#3A2A22);color:#fff;border-radius:14px;display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap}'
  + '.obbanner .obb-t{font-size:12.5px;line-height:1.4;flex:1;min-width:160px}'
  + '.obbanner .obb-t b{color:#F4C9B4}'
  + '.obbanner .obb-btn{background:var(--brand);color:#fff;border:0;border-radius:999px;padding:8px 13px;font-size:12.5px;font-weight:800;white-space:nowrap;cursor:pointer}'
  + '.obwrap{padding:18px 16px 34px}'
  + '.obeyebrow{font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--brand);margin-bottom:6px}'
  + '.obh{font-size:22px;font-weight:900;line-height:1.15;margin-bottom:8px}'
  + '.obsub{font-size:13px;color:var(--muted);line-height:1.5;margin-bottom:14px}'
  + '.obctx{font-size:12px;background:#F4F1EE;border:1px solid var(--line);border-radius:10px;padding:9px 11px;margin-bottom:12px}'
  + '.obctx b{color:var(--ink)}'
  + '.oblabel{display:block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:12px 0 5px}'
  + '.obinput,.obselect{width:100%;border:1px solid var(--line);border-radius:11px;padding:11px 12px;font-size:14px;background:#fff;color:var(--ink)}'
  + '.obrow2{display:flex;gap:10px}.obrow2>div{flex:1;min-width:0}'
  + '.obrow3{display:flex;gap:10px}.obrow3 .c1{flex:2;min-width:0}.obrow3 .c2{flex:1;min-width:0}.obrow3 .c3{flex:1.2;min-width:0}'
  + '.obbtn{width:100%;margin-top:16px;background:var(--brand);color:#fff;border:0;border-radius:12px;padding:14px;font-size:15px;font-weight:800;cursor:pointer}'
  + '.obbtn2{width:100%;margin-top:9px;background:#fff;color:var(--ink);border:1px solid var(--line);border-radius:12px;padding:12px;font-size:14px;font-weight:700;cursor:pointer}'
  + '.obtiny{font-size:11px;color:var(--muted);margin-top:12px;line-height:1.45}'
  + '.obscan{margin-top:10px}'
  + '.obcheck{display:flex;align-items:center;gap:9px;padding:11px 0;border-bottom:1px solid var(--line);font-size:14px;color:var(--muted)}'
  + '.obcheck:last-child{border-bottom:0}'
  + '.obcheck.done{color:var(--ink);font-weight:700}'
  + '.obcheck .obspin{color:var(--brand);font-weight:800;width:16px;text-align:center}'
  + '.obcheck.done .obspin{color:var(--good)}'
  + '.obmeta{font-size:13px;color:var(--muted);margin-bottom:8px}'
  + '.obkv{font-size:12.5px;color:var(--good);font-weight:700;margin-bottom:6px}'
  + '.obcardlabel{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--ink);margin:16px 0 8px}'
  + '.obcat{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:12px 0 6px}'
  + '.obmenu{border:1px solid var(--line);border-radius:14px;padding:4px 14px}'
  + '.obmi{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--line);font-size:13.5px}'
  + '.obmi:last-child{border-bottom:0}'
  + '.obmp{font-weight:800;color:var(--ink);padding-left:10px}'
  + '.edcat{display:flex;align-items:center;gap:8px;margin:14px 0 6px}'
  + '.edcatname{flex:1;min-width:0;border:0;border-bottom:1px solid var(--line);background:transparent;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);padding:4px 0}'
  + '.edaddbtn{border:1px solid var(--line);background:#fff;border-radius:999px;padding:5px 10px;font-size:11px;font-weight:700;color:var(--brand);cursor:pointer;white-space:nowrap}'
  + '.edrow{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--line)}'
  + '.edname{flex:1;min-width:0;border:1px solid var(--line);border-radius:9px;padding:9px 10px;font-size:13.5px;background:#fff;color:var(--ink)}'
  + '.edpfx{color:var(--muted);font-size:13px}'
  + '.edprice{width:74px;flex:0 0 auto;border:1px solid var(--line);border-radius:9px;padding:9px 8px;font-size:13.5px;background:#fff;color:var(--ink)}'
  + '.edrm{border:0;background:transparent;color:#C44A28;font-size:22px;line-height:1;cursor:pointer;padding:0 2px;flex:0 0 auto}'
  + '.obsuccess{text-align:center;padding:22px 6px 8px}'
  + '.obmark{width:58px;height:58px;border-radius:50%;background:var(--good);color:#fff;font-size:30px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px}'
  + '.obsuccess h2{font-size:21px;font-weight:900;margin-bottom:6px}'
  + '.obsuccess .obsp{font-size:13px;color:var(--muted);margin-bottom:18px;line-height:1.5}'
  + '.obactions{display:flex;flex-direction:column;gap:9px;text-align:left}'
  + '.obact{display:block;border:1px solid var(--line);border-radius:13px;padding:13px 14px;background:#fff;cursor:pointer;font-size:14px;font-weight:800;color:var(--ink);width:100%;text-align:left}'
  + '.obact .obad{display:block;font-size:11.5px;font-weight:500;color:var(--muted);margin-top:3px}'
  + '.obact.primary{background:var(--brand);color:#fff;border-color:var(--brand)}'
  + '.obact.primary .obad{color:rgba(255,255,255,.85)}'
  + '.embframe{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff;margin:10px 0 16px;box-shadow:0 8px 24px rgba(13,14,15,.08)}'
  + '.emburl{display:flex;align-items:center;gap:8px;background:#ECE7DE;padding:8px 12px;font-size:11.5px;color:var(--muted)}'
  + '.emburl .d3{display:flex;gap:4px}.emburl .d3 i{width:8px;height:8px;border-radius:50%;background:#C9C0B4}'
  + '.emburl .ub{flex:1;background:#fff;border-radius:6px;padding:4px 9px;color:#444;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}'
  + '.embsite{padding:16px 15px}'
  + '.embsite .emblogo{font-size:16px;font-weight:900}'
  + '.embsite .embtag{font-size:11.5px;color:var(--muted);margin:2px 0 12px}'
  + '.embwidget{border:2px dashed var(--brand);border-radius:12px;padding:12px;background:#FFF8F4}'
  + '.embwidget .ewh{font-size:9.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--brand);margin-bottom:8px;display:flex;justify-content:space-between}'
  + '.embwidget .ewi{display:flex;justify-content:space-between;font-size:12.5px;padding:4px 0;border-bottom:1px solid #F0E2D8}'
  + '.embwidget .ewbtn{width:100%;margin-top:10px;background:var(--brand);color:#fff;border:0;border-radius:9px;padding:11px;font-size:13px;font-weight:800;cursor:pointer}'
  + '.embsnippet{background:var(--ink);color:#E8E2D8;border-radius:11px;padding:12px 13px;font-family:ui-monospace,Menlo,monospace;font-size:11px;line-height:1.55;white-space:pre-wrap;word-break:break-word}'
  + '.embcopybtn{margin-top:9px;width:100%;border:1px solid var(--line);background:#fff;border-radius:10px;padding:11px;font-size:13px;font-weight:700;cursor:pointer}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------------- onboarding view container ---------------- */
  var ov = document.createElement('div'); ov.id = 'view-onboard'; ov.style.display = 'none';
  (document.querySelector('.app') || document.body).appendChild(ov);

  function escAttr(s){ return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ---------------- Google rating + reviews (demo) ---------------- */
  var G_REVIEWS = {
    sals: [
      {n:'Marisol R.', s:5, t:'Best al pastor in Santa Ana, and the $1.99 taco days are unreal.', w:'2 weeks ago'},
      {n:'David T.', s:5, t:'Tripa dorada burrito is huge. In and out for pickup.', w:'1 month ago'},
      {n:'Ana G.', s:4, t:'Great street tacos and the salsa bar is on point.', w:'3 months ago'}
    ],
    airoma: [
      {n:'Kim L.', s:5, t:'Egg coffee and the ube latte are incredible. Cozy Little Saigon spot.', w:'1 week ago'},
      {n:'Bryan N.', s:5, t:'Ceremonial matcha is the real deal. The less-sweet option is perfect.', w:'3 weeks ago'},
      {n:'Thanh P.', s:4, t:'Lovely drinks and friendly staff, gets busy on weekends.', w:'2 months ago'}
    ]
  };
  var G_GENERIC = [
    {n:'Jordan M.', s:5, t:'Great food and the pickup was ready right on time.', w:'2 weeks ago'},
    {n:'Priya S.', s:5, t:'New favorite in the neighborhood, and ordering was easy.', w:'1 month ago'},
    {n:'Chris A.', s:4, t:'Solid and consistent, friendly staff every time.', w:'2 months ago'}
  ];
  function gData(r){
    var rating = (r && r.rating) ? r.rating : 4.6;
    var base = (r && r.reviews) ? r.reviews : 200;
    var count = Math.round(base * 2.3) + 140;
    var revs = (r && G_REVIEWS[r.id]) ? G_REVIEWS[r.id] : G_GENERIC;
    var q = encodeURIComponent(((r && r.name) || '') + ' ' + ((r && (r.loc || r.city)) || ''));
    var url = 'https://www.google.com/maps/search/?api=1&query=' + q;
    return { rating: rating, count: count, reviews: revs.slice(0, 3), mapsUrl: url, reviewUrl: url };
  }
  function stars(n){ n = Math.max(0, Math.min(5, Math.round(n))); return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); }
  function gBlock(r){
    var g = gData(r);
    return '<div class="gcard">'
      + '<div class="grow"><span class="glogo">G</span><span class="gtitle">Google rating</span>'
      + '<a class="glink" href="' + g.mapsUrl + '" target="_blank" rel="noopener">View on Google ›</a></div>'
      + '<div class="gtop"><span class="gnum">' + g.rating.toFixed(1) + '</span>'
      + '<span class="gstars">' + stars(g.rating) + '</span>'
      + '<span class="gcount">' + g.count.toLocaleString() + ' Google reviews</span></div>'
      + g.reviews.map(function(x){
          return '<div class="grev"><div class="grh"><span class="gname">' + esc(x.n) + '</span><span class="gtime">' + esc(x.w) + '</span></div>'
            + '<div class="grstars">' + stars(x.s) + '</div><div class="gtext">' + esc(x.t) + '</div></div>';
        }).join('')
      + '<div class="gnote">Shown live from Google with attribution. FullPlate displays your Google rating alongside your own reviews; it does not copy or change them.</div>'
      + '</div>';
  }
  window.fpGoogleBlock = gBlock; window.fpGoogleData = gData;

  /* ---------------- wrap openRestaurant: inject Google card ---------------- */
  var _openRestaurant = window.openRestaurant;
  window.openRestaurant = function(id){
    _openRestaurant(id);
    try{
      var view = document.getElementById('view-restaurant');
      var head = view && view.querySelector('.rhead');
      if(head && head.parentNode && typeof current !== 'undefined' && current){
        var holder = document.createElement('div');
        holder.innerHTML = gBlock(current);
        head.parentNode.insertBefore(holder.firstChild, head.nextSibling);
      }
    }catch(e){}
  };

  /* ---------------- wrap show(): manage onboarding view ---------------- */
  var _show = window.show;
  window.show = function(id){
    _show(id);
    var o = document.getElementById('view-onboard');
    if(o) o.style.display = (id === 'view-onboard') ? 'block' : 'none';
  };

  /* ---------------- wrap rateOrder(): Google nudge for 4-5 stars ---------------- */
  var _rateOrder = window.rateOrder;
  window.rateOrder = function(rid, n){
    _rateOrder(rid, n);
    try{
      if(n >= 4){
        var r = RESTAURANTS.find(function(x){ return x.id === rid; });
        var g = gData(r || {});
        var w = document.getElementById('rwrap');
        if(w){
          var cta = document.createElement('div'); cta.className = 'gnudge';
          cta.innerHTML = '<div class="gnt">Loved it? Help ' + esc((r || {}).name || 'them') + ' out</div>'
            + '<a class="gnbtn" href="' + g.reviewUrl + '" target="_blank" rel="noopener" onclick="showToast(\'Opening Google so you can post your review\')"><span class="glogo sm">G</span> Leave a 30-second Google review ›</a>'
            + '<div class="gnnote">You post it on Google yourself. FullPlate just makes it one tap.</div>';
          w.appendChild(cta);
        }
      }
    }catch(e){}
  };

  /* ---------------- AUTO-ONBOARDING (any location, multi-location/brand) ---------------- */
  var MENU_TEMPLATES = {
    'Tacos / Mexican': { cuisine:'Mexican Taqueria', kind:'Mexican', emoji:'🌮', color:'#FBE3DA', rating:4.6, gcount:540, img:'chiwas', menu:[
      {cat:'Tacos', items:[
        {id:'t1', name:'Asada Taco', price:3.50, desc:'Grilled steak, onion, cilantro', tags:['gf'], emoji:'🌮'},
        {id:'t2', name:'Al Pastor Taco', price:3.50, desc:'Marinated pork, pineapple, onion', tags:['gf'], emoji:'🌮'},
        {id:'t3', name:'Veggie Taco', price:3.25, desc:'Grilled vegetables, avocado crema', tags:['gf','v'], emoji:'🌮'}
      ]},
      {cat:'Burritos', items:[ {id:'t4', name:'Carne Asada Burrito', price:11.00, desc:'Steak, rice, beans, pico, guacamole', tags:[], emoji:'🌯'} ]},
      {cat:'Sides', items:[
        {id:'t5', name:'Chips & Guacamole', price:5.50, desc:'Made to order', tags:['gf','v'], emoji:'🥑'},
        {id:'t6', name:'Horchata', price:3.50, desc:'House cinnamon rice milk', tags:['gf','v'], emoji:'🥛'}
      ]}
    ]},
    'Coffee / Cafe': { cuisine:'Coffee & Tea', kind:'Cafe', emoji:'☕', color:'#F0E6D8', rating:4.8, gcount:760, img:'coffee', menu:[
      {cat:'Coffee', items:[
        {id:'c1', name:'Latte', price:5.25, desc:'Double espresso, steamed milk', tags:['v'], emoji:'☕'},
        {id:'c2', name:'Cold Brew', price:5.00, desc:'Slow-steeped 18 hours', tags:['v'], emoji:'☕'},
        {id:'c3', name:'Cappuccino', price:4.75, desc:'Espresso, foam', tags:['v'], emoji:'☕'}
      ]},
      {cat:'Tea', items:[ {id:'c4', name:'Matcha Latte', price:5.75, desc:'Ceremonial matcha, oat milk', tags:['v'], emoji:'🍵'} ]},
      {cat:'Pastries', items:[ {id:'c5', name:'Butter Croissant', price:3.95, desc:'Baked fresh daily', tags:['v'], emoji:'🥐'} ]}
    ]},
    'Pizza': { cuisine:'Pizzeria', kind:'Pizza', emoji:'🍕', color:'#FBE7DA', rating:4.6, gcount:610, img:'slice', menu:[
      {cat:'Pizzas', items:[
        {id:'p1', name:'Margherita', price:15.00, desc:'San Marzano, fresh mozzarella, basil', tags:['v'], emoji:'🍕'},
        {id:'p2', name:'Pepperoni', price:17.00, desc:'Cup-and-char pepperoni', tags:[], emoji:'🍕'}
      ]},
      {cat:'Sides', items:[
        {id:'p3', name:'Garlic Knots', price:6.00, desc:'Six, with marinara', tags:['v'], emoji:'🥨'},
        {id:'p4', name:'Caesar Salad', price:9.00, desc:'Romaine, parmesan, croutons', tags:['v'], emoji:'🥗'}
      ]}
    ]},
    'Burgers': { cuisine:'Smash Burgers', kind:'Burgers', emoji:'🍔', color:'#F7E7DF', rating:4.5, gcount:430, img:'burger', menu:[
      {cat:'Burgers', items:[
        {id:'b1', name:'Classic Single', price:9.00, desc:'Smash patty, American, pickles', tags:[], emoji:'🍔'},
        {id:'b2', name:'Double Smash', price:12.00, desc:'Two patties, onion, house sauce', tags:[], emoji:'🍔'},
        {id:'b3', name:'Veggie Smash', price:10.50, desc:'Crispy plant patty, all the fixings', tags:['v'], emoji:'🍔'}
      ]},
      {cat:'Sides', items:[
        {id:'b4', name:'Crinkle Fries', price:4.00, desc:'Sea salt', tags:['v'], emoji:'🍟'},
        {id:'b5', name:'Chocolate Shake', price:6.00, desc:'Hand-spun', tags:['v'], emoji:'🥤'}
      ]}
    ]},
    'BBQ': { cuisine:'Barbecue', kind:'BBQ', emoji:'🍖', color:'#F3E2D2', rating:4.7, gcount:880, img:'smoke', menu:[
      {cat:'Plates', items:[
        {id:'q1', name:'Brisket Plate', price:16.00, desc:'Sliced brisket, two sides, toast', tags:['gf'], emoji:'🍖'},
        {id:'q2', name:'Pulled Pork Plate', price:14.00, desc:'Smoked pulled pork, two sides', tags:['gf'], emoji:'🍖'}
      ]},
      {cat:'Sides', items:[
        {id:'q3', name:'Mac & Cheese', price:5.00, desc:'Three cheese', tags:['v'], emoji:'🧀'},
        {id:'q4', name:'Cornbread', price:3.50, desc:'Honey butter', tags:['v'], emoji:'🍞'}
      ]}
    ]},
    'Other': { cuisine:'Local Kitchen', kind:'Local', emoji:'🍽️', color:'#F2EAE0', rating:4.6, gcount:300, img:'harbor', menu:[
      {cat:'Mains', items:[
        {id:'o1', name:'House Special', price:13.50, desc:'Our signature plate', tags:[], emoji:'🍽️'},
        {id:'o2', name:'Daily Plate', price:12.00, desc:'Ask about the special', tags:[], emoji:'🍽️'}
      ]},
      {cat:'Sides & Drinks', items:[
        {id:'o3', name:'Side Salad', price:5.00, desc:'Greens, house vinaigrette', tags:['v'], emoji:'🥗'},
        {id:'o4', name:'Soft Drink', price:3.00, desc:'Assorted', tags:['v','gf'], emoji:'🥤'}
      ]}
    ]}
  };
  function imgFor(key){ return (typeof IMG!=='undefined' && IMG[key]) || (typeof PIX!=='undefined' && PIX[key]) || (typeof IMG!=='undefined' && IMG.chiwas) || ''; }

  var draft = null, pendingBrand = null, pendingOp = null;

  window.fpStartListing = function(){ pendingBrand = null; pendingOp = null; openOnboard(); };

  window.openOnboard = function(){
    draft = null;
    var mode = pendingBrand ? 'location' : (pendingOp ? 'brand' : 'new');
    var ctx = '';
    if(mode === 'location') ctx = '<div class="obctx">Adding a location to <b>' + esc(pendingBrand.name) + '</b>. It shares the same menu and prices; just tell us where.</div>';
    else if(mode === 'brand') ctx = '<div class="obctx">Adding a new brand under <b>' + esc(pendingOp.name) + '</b>. Same owner account, separate storefront.</div>';
    var cz = Object.keys(MENU_TEMPLATES);
    var html = '<div class="obwrap">'
      + '<div class="obeyebrow">' + (mode==='location' ? 'Add a location' : (mode==='brand' ? 'Add a brand' : 'Restaurant onboarding')) + '</div>'
      + '<h2 class="obh">' + (mode==='location' ? 'Set up another location' : (mode==='brand' ? 'Set up another brand' : 'Build your page from your website')) + '</h2>'
      + (mode==='new' ? '<p class="obsub">Paste your website and FullPlate pulls in your menu, prices, photos, hours, location, and Google rating. You can review and edit everything before it goes live. In this demo the import takes a few seconds.</p>' : '')
      + ctx;
    if(mode !== 'location'){
      html += '<label class="oblabel">Your website</label><input id="obUrl" class="obinput" value="https://" placeholder="https://yourrestaurant.com">'
        + '<label class="oblabel">' + (mode==='brand' ? 'New brand name' : 'Restaurant name') + '</label><input id="obName" class="obinput" placeholder="e.g. Sunrise Taqueria">'
        + '<label class="oblabel">Cuisine</label><select id="obCuisine" class="obselect">' + cz.map(function(k){ return '<option>' + k + '</option>'; }).join('') + '</select>';
    } else {
      html += '<label class="oblabel">Location label</label><input id="obLoc" class="obinput" placeholder="e.g. Downtown, Eastside, 5th Ave">';
    }
    html += '<div class="obrow3">'
      + '<div class="c1"><label class="oblabel">City</label><input id="obCity" class="obinput" placeholder="City"></div>'
      + '<div class="c2"><label class="oblabel">State</label><input id="obState" class="obinput" placeholder="ST" maxlength="2"></div>'
      + '<div class="c3"><label class="oblabel">ZIP</label><input id="obZip" class="obinput" placeholder="ZIP" inputmode="numeric"></div>'
      + '</div>'
      + '<button class="obbtn" onclick="onboardScan()">' + (mode==='location' ? 'Set up this location ›' : '✦ Scan my website') + '</button>'
      + '<div class="obtiny">' + (mode==='new'
          ? 'Any city works. Your City and State become your marketplace area; the ZIP helps nearby diners find you. Next you will review and edit everything before publishing. Demo note: the AI import is simulated.'
          : 'You can run as many locations and brands as you like from one owner account.') + '</div>'
      + '</div>';
    document.getElementById('view-onboard').innerHTML = html;
    show('view-onboard');
    document.getElementById('backBtn').style.display = 'flex';
    var cb = document.getElementById('cartbar'); if(cb) cb.style.display = 'none';
    window.scrollTo(0, 0);
  };

  function readArea(){
    var c = (document.getElementById('obCity').value || '').trim();
    var s = (document.getElementById('obState').value || '').trim().toUpperCase().slice(0,2);
    var z = (document.getElementById('obZip').value || '').trim();
    if(!c) c = 'Your City';
    return { city: (s ? (c + ', ' + s) : c), area: c, zip: z };
  }

  window.onboardScan = function(){
    var mode = pendingBrand ? 'location' : (pendingOp ? 'brand' : 'new');
    var a = readArea();
    var id = (mode==='location' ? 'loc_' : 'new_') + Date.now();
    if(mode === 'location'){
      var locLabel = (document.getElementById('obLoc').value || '').trim() || a.area;
      draft = { id:id, url:'', name:pendingBrand.name, city:a.city, zip:a.zip, loc:locLabel,
        cuisine:pendingBrand.cuisine, kind:pendingBrand.kind, emoji:pendingBrand.emoji, color:pendingBrand.color,
        rating:pendingBrand.rating, gcount:pendingBrand.gcount, imgUrl:pendingBrand.imgUrl,
        hours:'Mon to Sun, 11:00am to 9:00pm',
        brand:pendingBrand.id, brandName:pendingBrand.name, operator:pendingBrand.operator, operatorName:pendingBrand.operatorName,
        menu:pendingBrand.menu, shared:true };
    } else {
      var name = (document.getElementById('obName').value || '').trim() || (mode==='brand' ? 'New Brand' : 'Your Restaurant');
      var url = (document.getElementById('obUrl').value || '').trim();
      var czk = document.getElementById('obCuisine').value;
      var tpl = MENU_TEMPLATES[czk] || MENU_TEMPLATES['Other'];
      var menu = tpl.menu.map(function(c){ return { cat:c.cat, items:c.items.map(function(it){
        return { id:id + '_' + it.id, name:it.name, price:it.price, desc:it.desc, tags:it.tags || [], emoji:it.emoji, mods:it.mods };
      }) }; });
      draft = { id:id, url:url, name:name, city:a.city, zip:a.zip, loc:a.area, cuisine:tpl.cuisine, kind:tpl.kind,
        emoji:tpl.emoji, color:tpl.color, rating:tpl.rating, gcount:tpl.gcount, imgUrl:imgFor(tpl.img), menu:menu,
        hours:'Mon to Sun, 11:00am to 9:00pm',
        operator: pendingOp ? pendingOp.id : null, operatorName: pendingOp ? pendingOp.name : null };
    }
    var labels = (mode === 'location')
      ? ['Linking to your FullPlate account', 'Cloning your menu and prices', 'Setting this location’s hours', 'Pulling location and Google rating']
      : ['Reading your website', 'Detecting menu items and prices', 'Importing your photos', 'Pulling your hours and location', 'Fetching your Google rating'];
    document.getElementById('view-onboard').innerHTML = '<div class="obwrap">'
      + '<div class="obeyebrow">Setting up</div><h2 class="obh">Building your FullPlate page…</h2>'
      + '<div class="obscan">' + labels.map(function(s, i){ return '<div class="obcheck" id="obc' + i + '"><span class="obspin">◷</span> ' + s + '</div>'; }).join('') + '</div></div>';
    window.scrollTo(0, 0);
    labels.forEach(function(s, i){
      setTimeout(function(){
        var el = document.getElementById('obc' + i);
        if(el){ el.classList.add('done'); var sp = el.querySelector('.obspin'); if(sp) sp.textContent = '✓'; }
        if(i === labels.length - 1){ setTimeout(onboardPreview, 550); }
      }, 600 * (i + 1));
    });
  };

  /* ---------------- editable REVIEW step (before publishing) ---------------- */
  function onboardPreview(){
    var d = draft; if(!d) return;
    var nItems = d.menu.reduce(function(n, c){ return n + c.items.length; }, 0);
    var head = '<div class="obwrap">'
      + '<div class="obeyebrow">Draft ready · review, edit, and publish</div>'
      + '<h2 class="obh">Check everything, then publish</h2>'
      + '<p class="obsub">We imported what we found. Fix anything that is off, add or remove items, and update your details before it goes live. Nothing is locked, you can keep editing in the owner console.</p>'
      + (d.url ? '<div class="obkv">✓ Imported from ' + esc(d.url) + '</div>' : '<div class="obkv">✓ Cloned from your existing FullPlate menu</div>');

    if(d.shared){
      var ro = d.menu.map(function(c){
        return '<div class="obcat">' + esc(c.cat) + '</div>' + c.items.map(function(i){
          return '<div class="obmi"><span>' + esc(i.name) + '</span><span class="obmp">$' + i.price.toFixed(2) + '</span></div>';
        }).join('');
      }).join('');
      document.getElementById('view-onboard').innerHTML = head
        + '<label class="oblabel">Location label</label><input class="obinput" value="' + escAttr(d.loc) + '" onchange="onboardSetField(\'loc\',this.value)">'
        + '<label class="oblabel">Area</label><input class="obinput" value="' + escAttr(d.city) + '" onchange="onboardSetField(\'city\',this.value)">'
        + gBlock({ id:'__draft', name:d.name, loc:d.loc, city:d.city, rating:d.rating, reviews:d.gcount })
        + '<div class="obcardlabel">Shared menu (' + nItems + ' items)</div>'
        + '<div class="obmenu">' + ro + '</div>'
        + '<div class="obtiny">This location shares the ' + esc(d.name) + ' menu. Edit the menu once on the brand and it updates everywhere.</div>'
        + '<button class="obbtn" onclick="onboardPublish()">Publish this location ›</button>'
        + '<button class="obbtn2" onclick="openOnboard()">Start over</button>'
        + '</div>';
      window.scrollTo(0, 0);
      return;
    }

    var menuHtml = d.menu.map(function(c, ci){
      return '<div class="edcat"><input class="edcatname" value="' + escAttr(c.cat) + '" onchange="onboardSetCat(' + ci + ',this.value)"><button class="edaddbtn" onclick="onboardAddItem(' + ci + ')">+ Item</button></div>'
        + c.items.map(function(it, ii){
            return '<div class="edrow">'
              + '<input class="edname" value="' + escAttr(it.name) + '" onchange="onboardSetItem(' + ci + ',' + ii + ',\'name\',this.value)">'
              + '<span class="edpfx">$</span><input class="edprice" type="number" step="0.01" min="0" value="' + it.price.toFixed(2) + '" onchange="onboardSetItem(' + ci + ',' + ii + ',\'price\',this.value)">'
              + '<button class="edrm" title="Remove" onclick="onboardRemoveItem(' + ci + ',' + ii + ')">×</button>'
              + '</div>';
          }).join('');
    }).join('');

    document.getElementById('view-onboard').innerHTML = head
      + '<label class="oblabel">Restaurant name</label><input class="obinput" value="' + escAttr(d.name) + '" onchange="onboardSetField(\'name\',this.value)">'
      + '<div class="obrow2"><div><label class="oblabel">Cuisine</label><input class="obinput" value="' + escAttr(d.cuisine) + '" onchange="onboardSetField(\'cuisine\',this.value)"></div>'
      + '<div><label class="oblabel">Area</label><input class="obinput" value="' + escAttr(d.city) + '" onchange="onboardSetField(\'city\',this.value)"></div></div>'
      + '<label class="oblabel">Hours</label><input class="obinput" value="' + escAttr(d.hours || 'Mon to Sun, 11:00am to 9:00pm') + '" onchange="onboardSetField(\'hours\',this.value)">'
      + gBlock({ id:'__draft', name:d.name, loc:d.loc, city:d.city, rating:d.rating, reviews:d.gcount })
      + '<div class="obcardlabel">Menu (' + nItems + ' items) — edit, add, or remove</div>'
      + '<div>' + menuHtml + '</div>'
      + '<button class="obbtn2" style="margin-top:10px" onclick="onboardAddCategory()">+ Add a category</button>'
      + '<button class="obbtn" onclick="onboardPublish()">Publish to FullPlate ›</button>'
      + '<button class="obbtn2" onclick="openOnboard()">Re-scan from scratch</button>'
      + '</div>';
    window.scrollTo(0, 0);
  }

  window.onboardSetField = function(f, v){
    if(!draft) return;
    if(f === 'city'){ draft.city = v; if(!draft.shared){ draft.loc = (v.split(',')[0] || v).trim() || draft.loc; } }
    else { draft[f] = v; }
  };
  window.onboardSetCat = function(ci, v){ if(draft && draft.menu[ci]) draft.menu[ci].cat = v; };
  window.onboardSetItem = function(ci, ii, f, v){
    if(!draft || !draft.menu[ci] || !draft.menu[ci].items[ii]) return;
    if(f === 'price'){ var n = parseFloat(v); draft.menu[ci].items[ii].price = (n >= 0 ? n : 0); }
    else { draft.menu[ci].items[ii][f] = v; }
  };
  window.onboardAddItem = function(ci){
    if(!draft || !draft.menu[ci]) return;
    draft.menu[ci].items.push({ id: draft.id + '_x' + Date.now(), name:'New item', price:0, desc:'', tags:[], emoji:'🍽️' });
    onboardPreview();
  };
  window.onboardRemoveItem = function(ci, ii){
    if(!draft || !draft.menu[ci]) return;
    draft.menu[ci].items.splice(ii, 1);
    if(!draft.menu[ci].items.length) draft.menu.splice(ci, 1);
    onboardPreview();
  };
  window.onboardAddCategory = function(){
    if(!draft) return;
    draft.menu.push({ cat:'New category', items:[{ id: draft.id + '_x' + Date.now(), name:'New item', price:0, desc:'', tags:[], emoji:'🍽️' }] });
    onboardPreview();
  };

  window.onboardPublish = function(){
    var d = draft; if(!d) return;
    if(!d.shared){
      d.menu = d.menu.map(function(c){ return { cat:(c.cat || 'Menu'), items:c.items.filter(function(it){ return (it.name || '').trim(); }) }; }).filter(function(c){ return c.items.length; });
      if(!d.menu.length){ showToast('Add at least one item before publishing'); return; }
    }
    var popularId = d.menu[0].items[0].id;
    if(!RESTAURANTS.find(function(r){ return r.id === d.id; })){
      var rest = { id:d.id, city:d.city, kind:d.kind, featured: !d.shared, name: d.shared ? (d.name + ' (' + d.loc + ')') : d.name,
        brand: d.brand || d.id, brandName: d.brandName || d.name,
        operator: d.operator || d.id, operatorName: d.operatorName || (d.name + ' (you)'),
        type:'fixed', loc:d.loc, cuisine:d.cuisine, emoji:d.emoji, color:d.color,
        rating:d.rating, reviews:Math.max(20, Math.round(d.gcount / 6)), eta:'15–25 min', price:'$$',
        popular:popularId,
        blurb: d.shared ? ('Another location of ' + d.brandName + ', commission-free.') : 'Commission-free ordering, imported from your website and ready to go.',
        story: d.shared ? ('A location of ' + d.brandName + ' set up on FullPlate in this demo. It shares the brand menu and prices.') : ('This FullPlate page was built and reviewed in this demo from the ' + d.name + ' website: menu, prices, hours, location, and Google rating.'),
        realNote:'Demo listing generated by FullPlate onboarding. In production, FullPlate imports your real menu, prices, photos, hours, and Google rating, you review and edit it, and orders sync to your POS or kitchen.',
        menu:d.menu };
      var at = RESTAURANTS.findIndex(function(r){ return r.city === d.city; });
      if(at < 0) at = RESTAURANTS.length;
      RESTAURANTS.splice(at, 0, rest);
      IMG[d.id] = d.imgUrl || imgFor('chiwas');
    }
    activeCity = d.city;
    showToast(d.shared ? 'Location added' : 'Your FullPlate page is live');
    onboardSuccess(d.id);
  };

  function onboardSuccess(restId){
    var r = RESTAURANTS.find(function(x){ return x.id === restId; }) || {};
    var brandLocs = (typeof brandLocations === 'function') ? brandLocations(r.brand || r.id).length : 1;
    var opBrands = (typeof operatorBrands === 'function') ? operatorBrands(r.operator || r.id).length : 1;
    document.getElementById('view-onboard').innerHTML = '<div class="obwrap"><div class="obsuccess">'
      + '<div class="obmark">✓</div>'
      + '<h2>' + esc(r.name || 'Your page') + ' is live</h2>'
      + '<div class="obsp">It is on FullPlate now at <b>fullplate.app/r/' + esc(r.id) + '</b>, commission-free. '
      + 'Your account has ' + opBrands + ' brand' + (opBrands>1?'s':'') + ' and ' + brandLocs + ' location' + (brandLocs>1?'s':'') + '.</div>'
      + '<div class="obactions">'
      + '<button class="obact primary" onclick="onboardView(\'' + r.id + '\')">View my FullPlate page<span class="obad">See exactly what diners see and can order</span></button>'
      + '<button class="obact" onclick="onboardEmbed(\'' + r.id + '\')">Embed ordering on my own website<span class="obad">Keep diners on your site, no third party taking a cut</span></button>'
      + '<button class="obact" onclick="onboardAddLocation(\'' + r.id + '\')">Add another location<span class="obad">Same brand and menu, a new address. Adds a location picker</span></button>'
      + '<button class="obact" onclick="onboardAddBrand(\'' + r.id + '\')">Add another brand<span class="obad">A separate storefront under the same owner account</span></button>'
      + '<button class="obact" onclick="goHome()">Done, back to the marketplace<span class="obad">Find your new area in the city tabs</span></button>'
      + '</div></div></div>';
    window.scrollTo(0, 0);
  }
  window.onboardView = function(id){ openRestaurant(id); };
  window.onboardAddLocation = function(id){
    var r = RESTAURANTS.find(function(x){ return x.id === id; }); if(!r) return;
    pendingBrand = { id:r.brand || r.id, name:r.brandName || r.name, operator:r.operator || r.id, operatorName:r.operatorName,
      cuisine:r.cuisine, kind:r.kind, emoji:r.emoji, color:r.color, rating:r.rating, gcount:Math.round((r.reviews||200)*2.3)+140,
      imgUrl:(typeof IMG!=='undefined' ? IMG[r.id] : ''), menu:r.menu };
    pendingOp = null; openOnboard();
  };
  window.onboardAddBrand = function(id){
    var r = RESTAURANTS.find(function(x){ return x.id === id; }); if(!r) return;
    pendingOp = { id:r.operator || r.id, name:r.operatorName || r.name };
    pendingBrand = null; openOnboard();
  };

  /* ---------------- EMBED-ON-YOUR-SITE preview ---------------- */
  window.onboardEmbed = function(id){
    var r = RESTAURANTS.find(function(x){ return x.id === id; }); if(!r) return;
    var domain = (r.name || 'yourrestaurant').toLowerCase().replace(/[^a-z0-9]+/g,'').slice(0,18) + '.com';
    var items = [];
    (r.menu || []).forEach(function(c){ c.items.forEach(function(i){ items.push(i); }); });
    items = items.slice(0, 3);
    var snippet = '<!-- FullPlate commission-free ordering -->\n<div data-fullplate="' + r.id + '"></div>\n<script src="https://embed.fullplate.app/v1.js" async></scr' + 'ipt>';
    window.__embSnippet = snippet;
    document.getElementById('view-onboard').innerHTML = '<div class="obwrap">'
      + '<div class="obeyebrow">Embed on your website</div>'
      + '<h2 class="obh">Your ordering, on your own site</h2>'
      + '<p class="obsub">FullPlate is your storefront in the marketplace, and the same ordering drops right into your existing website. Diners learn your menu and check out without leaving your site, and no middle service takes a cut. Here is how it looks embedded on ' + esc(domain) + ':</p>'
      + '<div class="embframe">'
      +   '<div class="emburl"><span class="d3"><i></i><i></i><i></i></span><span class="ub">https://www.' + esc(domain) + '/order</span></div>'
      +   '<div class="embsite">'
      +     '<div class="emblogo">' + esc(r.name) + '</div>'
      +     '<div class="embtag">' + esc(r.cuisine || 'Local restaurant') + ' · Order pickup</div>'
      +     '<div class="embwidget">'
      +       '<div class="ewh"><span>Order with FullPlate</span><span>0% commission</span></div>'
      +       items.map(function(i){ return '<div class="ewi"><span>' + esc(i.name) + '</span><span>$' + i.price.toFixed(2) + '</span></div>'; }).join('')
      +       '<button class="ewbtn" onclick="openRestaurant(\'' + r.id + '\')">Start your order ›</button>'
      +     '</div>'
      +   '</div>'
      + '</div>'
      + '<div class="obcardlabel">Add this to your site</div>'
      + '<div class="embsnippet">' + esc(snippet) + '</div>'
      + '<button class="embcopybtn" onclick="(navigator.clipboard&&navigator.clipboard.writeText(window.__embSnippet));showToast(\'Embed code copied\')">Copy embed code</button>'
      + '<div class="obtiny">One source of truth: your menu, prices, hours, and sold-out items stay in sync between your FullPlate page and the embed automatically. Update once, it changes everywhere.</div>'
      + '<button class="obbtn2" onclick="onboardSuccessBack(\'' + r.id + '\')">Back</button>'
      + '</div>';
    window.scrollTo(0, 0);
  };
  window.onboardSuccessBack = function(id){ onboardSuccess(id); };

  /* ---------------- entry banner on the home screen ---------------- */
  function injectBanner(){
    if(document.querySelector('.obbanner')) return;
    var home = document.getElementById('view-home');
    var hero = home && home.querySelector('.hero');
    if(!home) return;
    var b = document.createElement('div'); b.className = 'obbanner';
    b.innerHTML = '<div class="obb-t"><b>Own a restaurant?</b> Build your FullPlate page from your website, in any city.</div>'
      + '<button class="obb-btn" onclick="fpStartListing()">List your restaurant ›</button>';
    if(hero && hero.parentNode){ hero.parentNode.insertBefore(b, hero.nextSibling); }
    else { home.insertBefore(b, home.firstChild); }
  }
  injectBanner();
})();
