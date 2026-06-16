/* FullPlate platform layer: operators, brands, multi-location, food trucks.
   Loaded AFTER data.js and BEFORE core.js. Augments the flat RESTAURANTS list
   with brand / location / operator structure to demo multi-tenant scenarios,
   without restructuring data.js. Every metro (Phoenix, Orange CA, Austin TX)
   gets a 2-location brand + a live food truck under one local operator group. */

/* 1) Default tagging: every existing restaurant is its own single-location
      brand with its own operator and a fixed venue. */
RESTAURANTS.forEach(function(r){
  if(!r.brand)        r.brand        = r.id;
  if(!r.brandName)    r.brandName    = r.name;
  if(!r.operator)     r.operator     = r.id;
  if(!r.operatorName) r.operatorName = r.name + ' (independent owner)';
  if(!r.type)         r.type         = 'fixed';
  if(!r.loc)          r.loc          = r.cuisine;
});

/* Helper to clone an existing restaurant into a second location of the same
   brand. The new location SHARES the brand's menu (template), as a real
   multi-location brand would. */
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

/* 2) PHOENIX — Tacos Chiwas (2 locations) + El Norteño Truck, one operator. */
(function(){
  var ch = RESTAURANTS.find(function(r){return r.id==='chiwas';});
  if(!ch) return;
  ch.brand='chiwas'; ch.brandName='Tacos Chiwas'; ch.loc='Roosevelt Row';
  ch.operator='sonoran-group'; ch.operatorName='Sonoran Hospitality Group';
  addLocation('chiwas', {id:'chiwas-mesa', name:'Tacos Chiwas — Mesa', loc:'Mesa (Main St)', rating:4.5, reviews:412, eta:'20–30 min',
    blurb:'The Mesa location of Tacos Chiwas. Same handmade tortillas, same menu, second kitchen.'});
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
    story:'A roving Sonoran-style truck from the Tacos Chiwas family — bacon-wrapped dogs and mesquite-grilled street tacos wherever it parks for the day.',
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

/* 5) Helpers used by the storefront and owner console. */
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
