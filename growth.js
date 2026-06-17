/* FullPlate growth layer: auto-onboarding wizard, live Google rating + recent
   reviews, and a post-order Google-review nudge. Loaded LAST (after owner.js).
   Wraps openRestaurant / show / rateOrder so it needs no edits to core.js.
   All Google data here is demo/mock; in production it comes from the Google
   Places + Business Profile APIs (read + attribution), never by posting reviews. */
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
  + '.oblabel{display:block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:12px 0 5px}'
  + '.obinput,.obselect{width:100%;border:1px solid var(--line);border-radius:11px;padding:11px 12px;font-size:14px;background:#fff;color:var(--ink)}'
  + '.obrow2{display:flex;gap:10px}.obrow2>div{flex:1;min-width:0}'
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
  + '.obmp{font-weight:800;color:var(--ink);padding-left:10px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------------- onboarding view container ---------------- */
  var ov = document.createElement('div'); ov.id = 'view-onboard'; ov.style.display = 'none';
  (document.querySelector('.app') || document.body).appendChild(ov);

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

  /* ---------------- wrap openRestaurant: inject the Google card ---------------- */
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

  /* ---------------- wrap show(): manage the onboarding view ---------------- */
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

  /* ---------------- AUTO-ONBOARDING WIZARD ---------------- */
  var MENU_TEMPLATES = {
    'Tacos / Mexican': { cuisine:'Mexican Taqueria', kind:'Mexican', emoji:'🌮', color:'#FBE3DA', rating:4.6, gcount:540, img:'chiwas', menu:[
      {cat:'Tacos', items:[
        {id:'t1', name:'Asada Taco', price:3.50, desc:'Grilled steak, onion, cilantro', tags:['gf'], emoji:'🌮'},
        {id:'t2', name:'Al Pastor Taco', price:3.50, desc:'Marinated pork, pineapple, onion', tags:['gf'], emoji:'🌮'},
        {id:'t3', name:'Veggie Taco', price:3.25, desc:'Grilled vegetables, avocado crema', tags:['gf','v'], emoji:'🌮'}
      ]},
      {cat:'Burritos', items:[
        {id:'t4', name:'Carne Asada Burrito', price:11.00, desc:'Steak, rice, beans, pico, guacamole', tags:[], emoji:'🌯'}
      ]},
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
      {cat:'Tea', items:[
        {id:'c4', name:'Matcha Latte', price:5.75, desc:'Ceremonial matcha, oat milk', tags:['v'], emoji:'🍵'}
      ]},
      {cat:'Pastries', items:[
        {id:'c5', name:'Butter Croissant', price:3.95, desc:'Baked fresh daily', tags:['v'], emoji:'🥐'}
      ]}
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
        {id:'o2', name:'Daily Plate', price:12.00, desc:'Ask about today’s special', tags:[], emoji:'🍽️'}
      ]},
      {cat:'Sides & Drinks', items:[
        {id:'o3', name:'Side Salad', price:5.00, desc:'Greens, house vinaigrette', tags:['v'], emoji:'🥗'},
        {id:'o4', name:'Soft Drink', price:3.00, desc:'Assorted', tags:['v','gf'], emoji:'🥤'}
      ]}
    ]}
  };
  function imgFor(key){ return (typeof IMG!=='undefined' && IMG[key]) || (typeof PIX!=='undefined' && PIX[key]) || (typeof IMG!=='undefined' && IMG.chiwas) || ''; }

  var draft = null;

  window.openOnboard = function(){
    draft = null;
    var cities = [].concat.apply([], (function(){ var seen={},out=[]; RESTAURANTS.forEach(function(r){ if(!seen[r.city]){seen[r.city]=1;out.push(r.city);} }); return out; })());
    var cz = Object.keys(MENU_TEMPLATES);
    document.getElementById('view-onboard').innerHTML = '<div class="obwrap">'
      + '<div class="obeyebrow">Restaurant onboarding</div>'
      + '<h2 class="obh">Build your page from your website</h2>'
      + '<p class="obsub">Paste your website and FullPlate pulls in your menu, prices, photos, hours, location, and Google rating. Review the draft, then publish. In real life this takes about a day; in this demo it takes a few seconds.</p>'
      + '<label class="oblabel">Your website</label>'
      + '<input id="obUrl" class="obinput" value="https://" placeholder="https://yourrestaurant.com">'
      + '<label class="oblabel">Restaurant name</label>'
      + '<input id="obName" class="obinput" placeholder="e.g. Sunrise Taqueria">'
      + '<div class="obrow2">'
      +   '<div><label class="oblabel">City</label><select id="obCity" class="obselect">' + cities.map(function(c){ return '<option' + (c===activeCity?' selected':'') + '>' + c + '</option>'; }).join('') + '</select></div>'
      +   '<div><label class="oblabel">Cuisine</label><select id="obCuisine" class="obselect">' + cz.map(function(k){ return '<option>' + k + '</option>'; }).join('') + '</select></div>'
      + '</div>'
      + '<button class="obbtn" onclick="onboardScan()">✦ Scan my website</button>'
      + '<div class="obtiny">Demo note: we simulate the AI import here. In production FullPlate reads your real site, menus (including PDFs and photos), and your Google Business listing, then asks you to confirm.</div>'
      + '</div>';
    show('view-onboard');
    document.getElementById('backBtn').style.display = 'flex';
    var cb = document.getElementById('cartbar'); if(cb) cb.style.display = 'none';
    window.scrollTo(0, 0);
  };

  window.onboardScan = function(){
    var url = (document.getElementById('obUrl').value || '').trim();
    var name = (document.getElementById('obName').value || '').trim() || 'Your Restaurant';
    var city = document.getElementById('obCity').value;
    var czk = document.getElementById('obCuisine').value;
    var tpl = MENU_TEMPLATES[czk] || MENU_TEMPLATES['Other'];
    var id = 'new_' + Date.now();
    var menu = tpl.menu.map(function(c){
      return { cat: c.cat, items: c.items.map(function(it){
        return { id: id + '_' + it.id, name: it.name, price: it.price, desc: it.desc, tags: it.tags || [], emoji: it.emoji, mods: it.mods };
      }) };
    });
    draft = { id:id, url:url, name:name, city:city, cuisine:tpl.cuisine, kind:tpl.kind, emoji:tpl.emoji,
      color:tpl.color, rating:tpl.rating, gcount:tpl.gcount, img:tpl.img, loc:(city.split(',')[0]),
      hours:'Mon to Sun, 11:00am to 9:00pm', menu:menu };

    var labels = ['Reading your website', 'Detecting menu items and prices', 'Importing your photos', 'Pulling your hours and location', 'Fetching your Google rating'];
    document.getElementById('view-onboard').innerHTML = '<div class="obwrap">'
      + '<div class="obeyebrow">Importing</div>'
      + '<h2 class="obh">Building your FullPlate page…</h2>'
      + '<div class="obscan">' + labels.map(function(s, i){ return '<div class="obcheck" id="obc' + i + '"><span class="obspin">◷</span> ' + s + '</div>'; }).join('') + '</div>'
      + '</div>';
    window.scrollTo(0, 0);
    labels.forEach(function(s, i){
      setTimeout(function(){
        var el = document.getElementById('obc' + i);
        if(el){ el.classList.add('done'); var sp = el.querySelector('.obspin'); if(sp) sp.textContent = '✓'; }
        if(i === labels.length - 1){ setTimeout(onboardPreview, 550); }
      }, 600 * (i + 1));
    });
  };

  function onboardPreview(){
    var d = draft; if(!d) return;
    var nItems = d.menu.reduce(function(n, c){ return n + c.items.length; }, 0);
    var menuHtml = d.menu.map(function(c){
      return '<div class="obcat">' + esc(c.cat) + '</div>' + c.items.map(function(i){
        return '<div class="obmi"><span>' + esc(i.name) + '</span><span class="obmp">$' + i.price.toFixed(2) + '</span></div>';
      }).join('');
    }).join('');
    document.getElementById('view-onboard').innerHTML = '<div class="obwrap">'
      + '<div class="obeyebrow">Draft ready · review and publish</div>'
      + '<h2 class="obh">' + esc(d.name) + '</h2>'
      + '<div class="obmeta">' + esc(d.cuisine) + ' · ' + esc(d.loc) + ' · ' + esc(d.hours) + '</div>'
      + '<div class="obkv">✓ Imported from ' + esc(d.url || 'your website') + '</div>'
      + gBlock({ id:'__draft', name:d.name, loc:d.loc, city:d.city, rating:d.rating, reviews:d.gcount })
      + '<div class="obcardlabel">Detected menu (' + nItems + ' items)</div>'
      + '<div class="obmenu">' + menuHtml + '</div>'
      + '<button class="obbtn" onclick="onboardPublish()">Publish to FullPlate ›</button>'
      + '<button class="obbtn2" onclick="openOnboard()">Start over</button>'
      + '<div class="obtiny">After publishing you can fine-tune everything in the owner console: edit items, prices, photos, hours, and modifiers.</div>'
      + '</div>';
    window.scrollTo(0, 0);
  }

  window.onboardPublish = function(){
    var d = draft; if(!d) return;
    if(!RESTAURANTS.find(function(r){ return r.id === d.id; })){
      var rest = { id:d.id, city:d.city, kind:d.kind, featured:true, name:d.name,
        brand:d.id, brandName:d.name, operator:d.id, operatorName:d.name + ' (you)', type:'fixed', loc:d.loc,
        cuisine:d.cuisine, emoji:d.emoji, color:d.color, rating:d.rating, reviews:Math.max(20, Math.round(d.gcount / 6)),
        eta:'15–25 min', price:'$$', popular:d.menu[0].items[0].id,
        blurb:'Commission-free ordering, imported from your website and ready to go.',
        story:'This FullPlate page was built automatically from the ' + d.name + ' website in this demo: menu, prices, hours, location, and Google rating, ready for the owner to confirm.',
        realNote:'Demo listing generated by FullPlate auto-onboarding. In production, FullPlate imports your real menu, prices, photos, hours, and Google rating from your website and Google Business listing for you to confirm before going live.',
        menu:d.menu };
      var at = RESTAURANTS.findIndex(function(r){ return r.city === d.city; });
      if(at < 0) at = RESTAURANTS.length;
      RESTAURANTS.splice(at, 0, rest);
      IMG[d.id] = imgFor(d.img);
    }
    activeCity = d.city;
    showToast('Your FullPlate page is live');
    openRestaurant(d.id);
  };

  /* ---------------- entry banner on the home screen ---------------- */
  function injectBanner(){
    if(document.querySelector('.obbanner')) return;
    var home = document.getElementById('view-home');
    var hero = home && home.querySelector('.hero');
    if(!home) return;
    var b = document.createElement('div'); b.className = 'obbanner';
    b.innerHTML = '<div class="obb-t"><b>Own a restaurant?</b> Build your FullPlate page from your website in seconds.</div>'
      + '<button class="obb-btn" onclick="openOnboard()">List your restaurant ›</button>';
    if(hero && hero.parentNode){ hero.parentNode.insertBefore(b, hero.nextSibling); }
    else { home.insertBefore(b, home.firstChild); }
  }
  injectBanner();
})();
