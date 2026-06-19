/* FullPlate platform layer: operators, brands, multi-location, food trucks.
   Loaded AFTER data.js and BEFORE core.js. Augments the flat RESTAURANTS list
   with brand / location / operator structure to demo multi-tenant scenarios,
   without restructuring data.js. Every metro (Phoenix, Orange CA, Austin TX,
   New York NY) gets a 2-location brand + a live food truck under one operator. */

/* 0) NEW METRO — New York, NY base restaurants (pushed before default tagging
      so they pick up brand/operator defaults like the data.js restaurants). */
[
  { id:'bleecker', city:'New York, NY', kind:'Pizza', featured:true, name:'Bleecker Street Pizza', cuisine:'NY Slice Joint', emoji:'🍕',
    color:'#FBE7DA', rating:4.7, reviews:1890, eta:'10–20 min', price:'$', popular:'bk2',
    blurb:'Classic Greenwich Village slice shop. Thin, foldable, coal-oven style.',
    story:'A Village institution slinging classic New York slices — thin, crisp, foldable — plus square Grandma slices and whole pies to go.',
    menu:[
      {cat:'Slices', items:[
        {id:'bk1', name:'Plain Cheese Slice', price:3.75, desc:'Mozzarella, house red sauce', tags:['v'], emoji:'🍕'},
        {id:'bk2', name:'Pepperoni Slice', price:4.50, desc:'Cup-and-char pepperoni', tags:[], emoji:'🍕'},
        {id:'bk3', name:'Grandma Slice', price:4.75, desc:'Square, fresh mozzarella, basil, olive oil', tags:['v'], emoji:'🍕'}
      ]},
      {cat:'Whole pies', items:[
        {id:'bk4', name:'Margherita Pie', price:22.00, desc:'San Marzano, fresh mozzarella, basil', tags:['v'], emoji:'🍕'},
        {id:'bk5', name:'Vodka Pie', price:26.00, desc:'Creamy vodka sauce, fresh mozz, hot honey', tags:['v'], emoji:'🍕'}
      ]},
      {cat:'Sides', items:[
        {id:'bk6', name:'Garlic Knots (6)', price:6.00, desc:'Pulled dough, garlic, parm', tags:['v'], emoji:'🥨'},
        {id:'bk7', name:'Canned Soda', price:2.50, desc:'Coke, Sprite, or seltzer', tags:['v','gf'], emoji:'🥤'}
      ]}
    ]
  },
  { id:'lesdeli', city:'New York, NY', kind:'Sandwiches', name:'Orchard Street Deli', cuisine:'Jewish Deli', emoji:'🥪',
    color:'#F3E7D6', rating:4.6, reviews:1240, eta:'10–20 min', price:'$$', popular:'ld1',
    blurb:'Lower East Side deli — hand-carved pastrami piled on rye.',
    story:'An old-school Lower East Side deli: hand-carved pastrami and corned beef, matzo ball soup, and half-sour pickles on every table.',
    menu:[
      {cat:'Sandwiches', items:[
        {id:'ld1', name:'Pastrami on Rye', price:16.50, desc:'Hand-carved pastrami, mustard, rye', tags:[], emoji:'🥪'},
        {id:'ld2', name:'Corned Beef Reuben', price:17.00, desc:'Corned beef, kraut, swiss, Russian', tags:[], emoji:'🥪'},
        {id:'ld3', name:'Turkey Club', price:14.00, desc:'Roast turkey, bacon, lettuce, tomato', tags:[], emoji:'🥪'}
      ]},
      {cat:'Sides', items:[
        {id:'ld4', name:'Matzo Ball Soup', price:8.00, desc:'Schmaltz broth, dill', tags:[], emoji:'🍲'},
        {id:'ld5', name:'Half-Sour Pickles', price:4.00, desc:'House-brined', tags:['v','gf'], emoji:'🥒'}
      ]},
      {cat:'Drinks', items:[
        {id:'ld6', name:"Dr. Brown's Cream Soda", price:3.00, desc:'The deli classic', tags:['v'], emoji:'🥤'}
      ]}
    ]
  },
  { id:'shinjuku', city:'New York, NY', kind:'Asian', name:'Shinjuku Ramen', cuisine:'Japanese Ramen', emoji:'🍜',
    color:'#F6E5DF', rating:4.7, reviews:980, eta:'15–25 min', price:'$$', popular:'sk1',
    blurb:'East Village ramen-ya. Tonkotsu broth simmered 18 hours.',
    story:'A tiny East Village counter pouring rich 18-hour tonkotsu and clean shoyu bowls, plus crispy gyoza and cold Ramune.',
    menu:[
      {cat:'Ramen', items:[
        {id:'sk1', name:'Tonkotsu Ramen', price:16.00, desc:'18-hour pork broth, chashu, egg, scallion', tags:[], emoji:'🍜'},
        {id:'sk2', name:'Shoyu Ramen', price:15.00, desc:'Soy-based chicken broth, chashu, menma', tags:[], emoji:'🍜'},
        {id:'sk3', name:'Veggie Miso Ramen', price:14.50, desc:'Miso broth, tofu, corn, bok choy', tags:['v'], emoji:'🍲'}
      ]},
      {cat:'Small plates', items:[
        {id:'sk4', name:'Pork Gyoza (5)', price:7.50, desc:'Pan-fried dumplings, ponzu', tags:[], emoji:'🥟'},
        {id:'sk5', name:'Edamame', price:5.00, desc:'Sea salt', tags:['v','gf'], emoji:'🫛'}
      ]},
      {cat:'Drinks', items:[
        {id:'sk6', name:'Ramune', price:4.00, desc:'Japanese marble soda', tags:['v'], emoji:'🥤'}
      ]}
    ]
  },
  { id:'bkbagel', city:'New York, NY', kind:'Breakfast', name:'Brooklyn Bagel House', cuisine:'Bagels & Breakfast', emoji:'🥯',
    color:'#F8ECDA', rating:4.8, reviews:1530, eta:'5–15 min', price:'$', popular:'bb1',
    blurb:'Kettle-boiled, hand-rolled bagels. Williamsburg classic.',
    story:'Kettle-boiled, hand-rolled bagels baked all morning — bacon-egg-and-cheese, lox and schmear, and strong coffee for the train.',
    menu:[
      {cat:'Bagels', items:[
        {id:'bb1', name:'Bacon, Egg & Cheese', price:7.50, desc:'On an everything bagel', tags:[], emoji:'🥯'},
        {id:'bb2', name:'Lox & Schmear', price:13.00, desc:'Nova lox, cream cheese, tomato, onion, capers', tags:[], emoji:'🥯'},
        {id:'bb3', name:'Avocado Bagel', price:9.00, desc:'Smashed avocado, chili flakes, sea salt', tags:['v'], emoji:'🥯'}
      ]},
      {cat:'Sides', items:[
        {id:'bb4', name:'Hash Browns', price:4.50, desc:'Crispy, griddled', tags:['v'], emoji:'🥔'},
        {id:'bb5', name:'Drip Coffee', price:3.00, desc:'Light, regular, or black', tags:['v','gf'], emoji:'☕'}
      ]}
    ]
  },
  { id:'empire', city:'New York, NY', kind:'Burgers', name:'Empire Smash', cuisine:'Smash Burgers', emoji:'🍔',
    color:'#F7E7DF', rating:4.6, reviews:870, eta:'10–20 min', price:'$$', popular:'em1',
    blurb:'Midtown smash-burger counter. Griddled lacy edges, potato bun.',
    story:'A Midtown counter doing one thing well — crispy-edged smash patties on a toasted potato bun, crinkle fries, and thick shakes.',
    menu:[
      {cat:'Burgers', items:[
        {id:'em1', name:'Empire Double Smash', price:12.00, desc:'Two patties, American, onion, Empire sauce', tags:[], emoji:'🍔',
          mods:[{name:'Add-ons', multi:true, max:3, options:[{name:'Add patty',price:2.50},{name:'Bacon',price:2.00},{name:'Extra cheese',price:1.00}]}]},
        {id:'em2', name:'Classic Single', price:9.00, desc:'Single patty, lettuce, tomato, pickle', tags:[], emoji:'🍔'},
        {id:'em3', name:'Veggie Smash', price:10.50, desc:'Crispy plant patty, all the fixings', tags:['v'], emoji:'🍔'}
      ]},
      {cat:'Sides', items:[
        {id:'em4', name:'Crinkle Fries', price:4.50, desc:'Sea salt', tags:['v'], emoji:'🍟'},
        {id:'em5', name:'Chocolate Shake', price:6.00, desc:'Hand-spun', tags:['v'], emoji:'🥤'}
      ]}
    ]
  }
].forEach(function(r){ if(!RESTAURANTS.find(function(x){return x.id===r.id;})) RESTAURANTS.push(r); });
IMG['bleecker']=IMG.slice; IMG['lesdeli']=IMG.harbor; IMG['shinjuku']=IMG.sakura; IMG['bkbagel']=IMG.sunrise; IMG['empire']=IMG.burger;

/* 1) Default tagging: every restaurant is its own single-location brand with
      its own operator and a fixed venue unless overridden below. */
RESTAURANTS.forEach(function(r){
  if(!r.brand)        r.brand        = r.id;
  if(!r.brandName)    r.brandName    = r.name;
  if(!r.operator)     r.operator     = r.id;
  if(!r.operatorName) r.operatorName = r.name + ' (independent owner)';
  if(!r.type)         r.type         = 'fixed';
  if(!r.loc)          r.loc          = r.cuisine;
});

/* Clone an existing restaurant into a second location of the same brand,
   sharing the brand's menu template. */
function addLocation(baseId, conf){
  var base = RESTAURANTS.find(function(r){return r.id===baseId;});
  if(!base || RESTAURANTS.find(function(r){return r.id===conf.id;})) return;
  RESTAURANTS.push({
    id:conf.id, city:base.city, kind:base.kind, name:conf.name,
    brand:base.brand, brandName:base.brandName, type:'fixed', loc:conf.loc,
    operator:base.operator, operatorName:base.operatorName,
    cuisine:base.cuisine, emoji:base.emoji, color:base.color,
    rating:conf.rating||base.rating, reviews:conf.reviews||Math.round(base.reviews*0.4),
    eta:conf.eta||base.eta, price:base.price, popular:base.popular,
    blurb:conf.blurb||('Second location of '+base.brandName+'. Same menu, second kitchen.'),
    story:base.story, realNote:base.realNote,
    menu: base.menu
  });
  IMG[conf.id]=IMG[baseId];
}

/* 2) PHOENIX — Tacos del Comal (2 locations) + El Norteño Truck, one operator. */
(function(){
  var ch = RESTAURANTS.find(function(r){return r.id==='chiwas';});
  if(!ch) return;
  ch.brand='chiwas'; ch.brandName='Tacos del Comal'; ch.loc='Roosevelt Row';
  ch.operator='sonoran-group'; ch.operatorName='Sonoran Hospitality Group';
  addLocation('chiwas', {id:'chiwas-mesa', name:'Tacos del Comal — Mesa', loc:'Mesa (Main St)', rating:4.5, reviews:412, eta:'20–30 min',
    blurb:'The Mesa location of Tacos del Comal. Same handmade tortillas, same menu, second kitchen.'});
})();
(function(){
  if(RESTAURANTS.find(function(r){return r.id==='norteno-truck';})) return;
  RESTAURANTS.push({
    id:'norteno-truck', city:'Phoenix', kind:'Mexican', name:'El Norteño Truck',
    brand:'norteno', brandName:'El Norteño Truck', type:'truck',
    operator:'sonoran-group', operatorName:'Sonoran Hospitality Group',
    live:true, spot:'Roosevelt Row · 1st St & Roosevelt', until:'8:00pm',
    nextStop:'Sat — Uptown Farmers Market, 8am–1pm',
    cuisine:'Sonoran street tacos & dogs', emoji:'🚚', color:'#FCE3D4',
    rating:4.8, reviews:233, eta:'10–15 min', price:'$', popular:'nt1', loc:'Mobile',
    blurb:'Sonoran hot dogs and mesquite street tacos from a truck. Catch us around Phoenix.',
    story:'A roving Sonoran-style truck from the Tacos del Comal family — bacon-wrapped dogs and mesquite-grilled street tacos wherever it parks for the day.',
    menu:[
      {cat:'Street tacos', items:[
        {id:'nt1', name:'Carne Asada Street Taco', price:2.75, desc:'Mesquite-grilled beef, onion, cilantro', tags:['gf'], emoji:'🌮'},
        {id:'nt2', name:'Adobada Street Taco', price:2.75, desc:'Marinated pork, pineapple, onion', tags:['gf'], emoji:'🌮'},
        {id:'nt3', name:'Nopales Street Taco', price:2.50, desc:'Grilled cactus, squash, onion', tags:['gf','v'], emoji:'🌮'}
      ]},
      {cat:'Sonoran dogs', items:[
        {id:'nt4', name:'Sonoran Hot Dog', price:6.50, desc:'Bacon-wrapped dog, pinto beans, onions, tomato, jalapeño crema', tags:[], emoji:'🌭',
          mods:[{name:'Add-ons', multi:true, max:3, options:[{name:'Extra bacon',price:1.50},{name:'Guacamole',price:1.50},{name:'Extra jalapeños',price:0}]}]},
        {id:'nt5', name:'Loaded Dog Combo', price:9.50, desc:'Sonoran dog + chips + agua fresca', tags:[], emoji:'🌭'}
      ]},
      {cat:'Drinks', items:[
        {id:'nt6', name:'Agua Fresca', price:3.00, desc:'Horchata or jamaica', tags:['v','gf'], emoji:'🥤'}
      ]}
    ]
  });
  IMG['norteno-truck']=IMG.chiwas;
})();

/* 3) ORANGE, CA — The Plaza Burger (2 locations) + Surfside Tacos truck,
      operator "Orange Coast Eats Co." */
(function(){
  var b = RESTAURANTS.find(function(r){return r.id==='burger';});
  if(!b) return;
  b.brand='plaza'; b.brandName='The Plaza Burger'; b.loc='Old Towne Orange';
  b.operator='orange-coast'; b.operatorName='Orange Coast Eats Co.';
  addLocation('burger', {id:'plaza-tustin', name:'The Plaza Burger — Tustin', loc:'Tustin (1st St)', rating:4.5, reviews:288, eta:'15–25 min',
    blurb:'The Tustin location of The Plaza Burger. Same smash patties, same menu.'});
})();
(function(){
  if(RESTAURANTS.find(function(r){return r.id==='surfside-truck';})) return;
  RESTAURANTS.push({
    id:'surfside-truck', city:'Orange, CA', kind:'Mexican', name:'Surfside Tacos',
    brand:'surfside', brandName:'Surfside Tacos', type:'truck',
    operator:'orange-coast', operatorName:'Orange Coast Eats Co.',
    live:true, spot:'Old Towne Plaza · Glassell St', until:'9:00pm',
    nextStop:'Sun — Orange Home Grown Farmers Market, 9am–1pm',
    cuisine:'Baja street tacos', emoji:'🚚', color:'#FCE6D6',
    rating:4.7, reviews:198, eta:'10–15 min', price:'$', popular:'os1', loc:'Mobile',
    blurb:'Baja fish tacos and California burritos from a truck around Orange County.',
    story:'A Baja-style taco truck working the Old Towne and OC farmers-market circuit — beer-battered fish tacos, carne asada, and fat California burritos.',
    menu:[
      {cat:'Tacos', items:[
        {id:'os1', name:'Baja Fish Taco', price:4.50, desc:'Beer-battered fish, cabbage, crema, corn tortilla', tags:['gf'], emoji:'🌮'},
        {id:'os2', name:'Carne Asada Taco', price:4.25, desc:'Grilled steak, onion, cilantro', tags:['gf'], emoji:'🌮'},
        {id:'os3', name:'Grilled Veggie Taco', price:3.75, desc:'Zucchini, peppers, onion, avocado crema', tags:['gf','v'], emoji:'🌮'}
      ]},
      {cat:'Burritos', items:[
        {id:'os4', name:'California Burrito', price:11.50, desc:'Carne asada, fries, cheese, guacamole, pico', tags:[], emoji:'🌯',
          mods:[{name:'Add-ons', multi:true, max:3, options:[{name:'Extra guac',price:1.50},{name:'Add bacon',price:2.00},{name:'Extra salsa',price:0}]}]}
      ]},
      {cat:'Sides & drinks', items:[
        {id:'os5', name:'Chips & Guacamole', price:5.50, desc:'Made to order', tags:['gf','v'], emoji:'🥑'},
        {id:'os6', name:'Agua Fresca', price:3.50, desc:'Horchata, jamaica, or limonada', tags:['v','gf'], emoji:'🥤'}
      ]}
    ]
  });
  IMG['surfside-truck']=IMG.platos;
})();

/* 4) AUSTIN, TX — Lone Star Tacos (2 locations) + Bat City Tacos truck,
      operator "Lone Star Hospitality." */
(function(){
  var l = RESTAURANTS.find(function(r){return r.id==='lonestar';});
  if(!l) return;
  l.brand='lonestar'; l.brandName='Lone Star Tacos'; l.loc='South Congress';
  l.operator='lonestar-hosp'; l.operatorName='Lone Star Hospitality';
  addLocation('lonestar', {id:'lonestar-east', name:'Lone Star Tacos — East Austin', loc:'East 6th St', rating:4.6, reviews:331, eta:'15–25 min',
    blurb:'The East Austin location of Lone Star Tacos. Same breakfast tacos, same menu.'});
})();
(function(){
  if(RESTAURANTS.find(function(r){return r.id==='batcity-truck';})) return;
  RESTAURANTS.push({
    id:'batcity-truck', city:'Austin, TX', kind:'Mexican', name:'Bat City Tacos',
    brand:'batcity', brandName:'Bat City Tacos', type:'truck',
    operator:'lonestar-hosp', operatorName:'Lone Star Hospitality',
    live:true, spot:'Rainey St · downtown', until:'10:00pm',
    nextStop:'Sat — Mueller Farmers Market, 10am–2pm',
    cuisine:'Austin breakfast & Tex-Mex tacos', emoji:'🚚', color:'#FBE2D2',
    rating:4.9, reviews:307, eta:'10–15 min', price:'$', popular:'ab1', loc:'Mobile',
    blurb:'Migas and brisket tacos from a downtown Austin truck. Find us on Rainey St.',
    story:'A late-night and farmers-market Austin taco truck — migas breakfast tacos, chopped brisket, and queso, out of a trailer parked downtown.',
    menu:[
      {cat:'Breakfast tacos', items:[
        {id:'ab1', name:'Migas Taco', price:3.50, desc:'Egg, tortilla chips, cheese, pico, flour tortilla', tags:['v'], emoji:'🌮'},
        {id:'ab2', name:'Barbacoa Taco', price:4.00, desc:'Slow-cooked barbacoa, onion, cilantro', tags:['gf'], emoji:'🌮'}
      ]},
      {cat:'Tex-Mex', items:[
        {id:'ab3', name:'Brisket Taco', price:4.50, desc:'Chopped smoked brisket, onion, salsa verde', tags:[], emoji:'🌮'},
        {id:'ab4', name:'Queso & Chips', price:6.00, desc:'Yellow queso, house chips', tags:['v'], emoji:'🧀'},
        {id:'ab5', name:'Breakfast Taco Combo', price:9.50, desc:'Two tacos + drip coffee', tags:[], emoji:'🌮',
          mods:[{name:'Pick your tacos', multi:true, max:2, options:[{name:'Migas',price:0},{name:'Barbacoa',price:0.50},{name:'Brisket',price:1.00}]}]}
      ]},
      {cat:'Drinks', items:[
        {id:'ab6', name:'Topo Chico', price:3.00, desc:'Ice-cold mineral water', tags:['v','gf'], emoji:'🥤'}
      ]}
    ]
  });
  IMG['batcity-truck']=IMG.lonestar;
})();

/* 5) NEW YORK, NY — Bleecker Street Pizza (2 locations) + 53rd & 6th Halal
      truck, operator "Five Boroughs Hospitality." */
(function(){
  var p = RESTAURANTS.find(function(r){return r.id==='bleecker';});
  if(!p) return;
  p.brand='bleecker'; p.brandName='Bleecker Street Pizza'; p.loc='Greenwich Village';
  p.operator='five-boroughs'; p.operatorName='Five Boroughs Hospitality';
  addLocation('bleecker', {id:'bleecker-mid', name:'Bleecker Street Pizza — Midtown', loc:'Midtown (W 49th St)', rating:4.6, reviews:760, eta:'10–20 min',
    blurb:'The Midtown slice window of Bleecker Street Pizza. Same coal-oven style, same menu.'});
})();
(function(){
  if(RESTAURANTS.find(function(r){return r.id==='halal-truck';})) return;
  RESTAURANTS.push({
    id:'halal-truck', city:'New York, NY', kind:'Mediterranean', name:'53rd & 6th Halal',
    brand:'halal53', brandName:'53rd & 6th Halal', type:'truck',
    operator:'five-boroughs', operatorName:'Five Boroughs Hospitality',
    live:true, spot:'53rd St & 6th Ave · Midtown', until:'2:00am',
    nextStop:'Daily — Midtown lunch rush, 11am',
    cuisine:'Halal cart', emoji:'🚚', color:'#FBE6D4',
    rating:4.8, reviews:2540, eta:'5–15 min', price:'$', popular:'hc1', loc:'Mobile',
    blurb:'The famous Midtown halal cart — chicken and lamb over rice, white sauce, hot sauce.',
    story:'The late-night Midtown halal cart institution: chicken and lamb over yellow rice with white sauce, plus gyro and falafel wraps. Cash-and-card, served from the cart.',
    menu:[
      {cat:'Over rice', items:[
        {id:'hc1', name:'Chicken Over Rice', price:10.00, desc:'Chopped chicken, yellow rice, salad', tags:['gf'], emoji:'🍛',
          mods:[{name:'Sauce', multi:true, max:2, options:[{name:'White sauce',price:0},{name:'Hot sauce',price:0},{name:'Extra white sauce',price:0.50}]}]},
        {id:'hc2', name:'Lamb Over Rice', price:12.00, desc:'Gyro lamb, yellow rice, salad', tags:['gf'], emoji:'🍛'},
        {id:'hc3', name:'Mixed Over Rice', price:12.50, desc:'Chicken and lamb, yellow rice, salad', tags:['gf'], emoji:'🍛'}
      ]},
      {cat:'Wraps', items:[
        {id:'hc4', name:'Chicken Gyro Wrap', price:9.00, desc:'Chicken, salad, white sauce, pita', tags:[], emoji:'🌯'},
        {id:'hc5', name:'Falafel Wrap', price:8.50, desc:'Falafel, hummus, salad, pita', tags:['v'], emoji:'🧆'}
      ]},
      {cat:'Drinks', items:[
        {id:'hc6', name:'Mango Lassi', price:4.00, desc:'Yogurt, mango', tags:['v','gf'], emoji:'🥤'}
      ]}
    ]
  });
  IMG['halal-truck']=IMG.bashir;
})();

/* 6) Helpers used by the storefront and owner console. */
function brandKey(r){ return r.brand || r.id; }
function brandLocations(bkey, city){
  return RESTAURANTS.filter(function(r){
    return (r.brand||r.id)===bkey && r.type!=='truck' && (!city || r.city===city);
  });
}
function operatorBrands(opKey){
  var seen={}, out=[];
  RESTAURANTS.forEach(function(r){
    if((r.operator||r.id)===opKey){ var b=r.brand||r.id; if(!seen[b]){ seen[b]=1; out.push(b); } }
  });
  return out;
}
function brandPrimary(bkey){
  var locs=RESTAURANTS.filter(function(r){return (r.brand||r.id)===bkey;});
  return locs.find(function(r){return r.featured;}) || locs[0];
}
function truckLive(r){ return r.type==='truck' && !!r.live; }
