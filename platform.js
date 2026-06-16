/* FullPlate platform layer: operators, brands, multi-location, food trucks.
   Loaded AFTER data.js and BEFORE core.js. Augments the flat RESTAURANTS list
   with brand / location / operator structure to demo multi-tenant scenarios,
   without restructuring data.js. */

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

/* 2) Tacos Chiwas -> a 2-location brand under "Sonoran Hospitality Group". */
(function(){
  var ch = RESTAURANTS.find(function(r){return r.id==='chiwas';});
  if(!ch) return;
  ch.brand='chiwas'; ch.brandName='Tacos Chiwas'; ch.loc='Roosevelt Row';
  ch.operator='sonoran-group'; ch.operatorName='Sonoran Hospitality Group';
  if(!RESTAURANTS.find(function(r){return r.id==='chiwas-mesa';})){
    RESTAURANTS.push({
      id:'chiwas-mesa', city:'Phoenix', kind:'Mexican', name:'Tacos Chiwas — Mesa',
      brand:'chiwas', brandName:'Tacos Chiwas', type:'fixed', loc:'Mesa (Main St)',
      operator:'sonoran-group', operatorName:'Sonoran Hospitality Group',
      cuisine:ch.cuisine, emoji:ch.emoji, color:ch.color, rating:4.5, reviews:412,
      eta:'20–30 min', price:ch.price, popular:ch.popular,
      blurb:'The Mesa location of Tacos Chiwas. Same handmade tortillas, same menu, second kitchen.',
      story:ch.story, realNote:ch.realNote,
      menu: ch.menu   /* shared menu template across both locations */
    });
    IMG['chiwas-mesa']=IMG.chiwas;
  }
})();

/* 3) A food truck under the same operator (multi-brand: group runs a sit-down
      brand AND a mobile brand). */
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

/* 4) Helpers used by the storefront and owner console. */
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
