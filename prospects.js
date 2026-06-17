/* FullPlate prospect listings: real Orange-County restaurants added for AJ's
   pitches, built from each restaurant's public menu. Loaded after platform.js,
   before core.js. Each is an explicit single-location independent brand, spliced
   into the front of the Orange, CA cluster so it leads that metro's feed without
   reordering the city tabs. */
(function(){
  if(RESTAURANTS.find(function(r){return r.id==='sals';}) || RESTAURANTS.find(function(r){return r.id==='airoma';})) return;

  /* Sal's Tacos a la Mexicana — 2431 N Tustin Ave, Santa Ana, CA 92705.
     Menu + pricing from public listings (DoorDash / SinglePlatform). */
  var sals = {
    id:'sals', city:'Orange, CA', kind:'Mexican', featured:true, name:"Sal's Tacos a la Mexicana",
    brand:'sals', brandName:"Sal's Tacos a la Mexicana", operator:'sals', operatorName:"Sal's Tacos a la Mexicana (independent owner)",
    type:'fixed', loc:'Santa Ana (N Tustin Ave)', cuisine:'Mexican Taqueria', emoji:'🌮', color:'#FBE3DA',
    rating:4.5, reviews:386, eta:'15–25 min', price:'$', popular:'sal1',
    blurb:'Santa Ana taqueria. Street tacos by the meat, fish tacos, burritos, and $1.99 daily taco specials.',
    story:"A Santa Ana street-taco spot on N Tustin Ave known for tacos by the meat (asada, pastor, carnitas, lengua, tripa and more), keto tacos, fish tacos, and big burritos. This listing was built from Sal's public menu to show how a FullPlate page comes together.",
    realNote:"Real restaurant at 2431 N Tustin Ave, Santa Ana, CA 92705. Menu and prices are from public listings (DoorDash / SinglePlatform); please confirm with the restaurant.",
    menu:[
      {cat:'Tacos', items:[
        {id:'sal1', name:'Street Taco', price:2.25, desc:'Corn tortilla, onion, cilantro, salsa. Pick your meat. ($1.99 daily, $1 Taco Tuesday)', tags:['gf'], emoji:'🌮',
          mods:[{name:'Choose your meat', options:[
            {name:'Asada (steak)',price:0},{name:'Pollo (chicken)',price:0},{name:'Al Pastor',price:0},{name:'Carnitas',price:0},
            {name:'Cabeza',price:0},{name:'Chorizo',price:0},{name:'Lengua',price:0},{name:'Seso',price:0},{name:'Tripa',price:0},{name:'Buche',price:0}
          ]}]},
        {id:'sal2', name:'Campechana Taco', price:2.50, desc:'Asada and chorizo mix, onion, cilantro', tags:['gf'], emoji:'🌮'},
        {id:'sal3', name:'Fish Taco', price:2.75, desc:'Battered fish, cabbage, crema', tags:[], emoji:'🌮'},
        {id:'sal4', name:'Keto Taco', price:4.00, desc:'Crispy cheese shell instead of tortilla, your choice of meat', tags:['gf'], emoji:'🧀'}
      ]},
      {cat:'Burritos', items:[
        {id:'sal5', name:'Burrito con Carne', price:8.75, desc:'Your choice of meat, rice, beans', tags:[], emoji:'🌯'},
        {id:'sal6', name:'Tripa Dorada Burrito', price:11.00, desc:'Crispy golden beef tripe, rice, beans', tags:[], emoji:'🌯'},
        {id:'sal7', name:'Shrimp Wet Burrito', price:14.00, desc:'Shrimp burrito smothered in salsa and melted cheese', tags:['spicy'], emoji:'🌯'}
      ]},
      {cat:'Drinks', items:[
        {id:'sal8', name:'Agua Fresca', price:1.75, desc:'Horchata, jamaica, or seasonal', tags:['gf','v'], emoji:'🥤',
          mods:[{name:'Size', options:[{name:'Small',price:0},{name:'Large',price:1.00},{name:'X-Large',price:2.00}]}]},
        {id:'sal9', name:'Jarritos', price:2.75, desc:'Mexican soda, assorted flavors', tags:['gf','v'], emoji:'🥤'},
        {id:'sal10', name:'Mexican Coke', price:3.25, desc:'Half-liter glass bottle', tags:['gf','v'], emoji:'🥤'}
      ]}
    ]
  };

  /* Airoma Cafe — Little Saigon, Westminster (Orange County). Vietnamese coffee
     and ceremonial matcha. Items from airomacafe.com; pricing confirmed by owner
     (coffee $6.25, matcha $7.25, tea $5.50, one size, less-sweet or full-sweet). */
  var sweet = [{name:'Sweetness', options:[{name:'Less sweet',price:0},{name:'Full sweet',price:0}]}];
  var airoma = {
    id:'airoma', city:'Orange, CA', kind:'Cafe', featured:true, name:'Airoma Cafe',
    brand:'airoma', brandName:'Airoma Cafe', operator:'airoma', operatorName:'Airoma Cafe (independent owner)',
    type:'fixed', loc:'Westminster (Little Saigon)', cuisine:'Vietnamese Coffee & Tea', emoji:'☕', color:'#F0E6D8',
    rating:4.8, reviews:540, eta:'10–15 min', price:'$$', popular:'air1',
    blurb:'Vietnamese coffee and ceremonial matcha in Little Saigon. Egg coffee, pandan, ube, einspanner.',
    story:"A locally owned Vietnamese coffee shop in Little Saigon, Westminster, specializing in coffee and tea: egg coffee, pandan and ube lattes, and ceremonial-grade Uji matcha. This listing was built from Airoma's public menu to show how a FullPlate page comes together.",
    realNote:"Real restaurant. Items and descriptions are from airomacafe.com; pricing confirmed by the owner (coffee $6.25, matcha $7.25, tea $5.50, one size, less-sweet or full-sweet).",
    menu:[
      {cat:'Coffee', items:[
        {id:'air1', name:'Egg Coffee', price:6.25, desc:'Smooth iced coffee finished with a sweet, creamy egg cream', tags:[], emoji:'☕', mods:sweet},
        {id:'air2', name:'House Coffee', price:6.25, desc:'Bold, rich Vietnamese-style coffee, dark roasted beans', tags:[], emoji:'☕', mods:sweet},
        {id:'air3', name:'Black Sea', price:6.25, desc:'Lightly sweetened black coffee topped with sea salt cream', tags:[], emoji:'☕', mods:sweet},
        {id:'air4', name:'Marble Coffee', price:6.25, desc:'Light, milky Vietnamese coffee for a creamy finish', tags:[], emoji:'☕', mods:sweet},
        {id:'air5', name:'Banana Coffee', price:6.25, desc:'In-house banana mix layered with freshly brewed coffee', tags:[], emoji:'🍌', mods:sweet},
        {id:'air6', name:'Pandan Coffee', price:6.25, desc:'Creamy, velvety pandan base layered with light coffee', tags:[], emoji:'☕', mods:sweet},
        {id:'air7', name:'Ube Coffee', price:6.25, desc:'In-house ube latte paired with a light coffee', tags:[], emoji:'🍠', mods:sweet},
        {id:'air8', name:'Matcha Coffee', price:6.25, desc:'Vietnamese coffee layered with ceremonial matcha cream', tags:[], emoji:'☕', mods:sweet}
      ]},
      {cat:'Matcha (ceremonial-grade, Uji)', items:[
        {id:'air9', name:'Matcha Oat Latte', price:7.25, desc:'Ceremonial matcha paired with dairy-free oat milk', tags:[], emoji:'🍵', mods:sweet},
        {id:'air10', name:'Matcha Einspanner', price:7.25, desc:'Oat milk, lightly sweetened cream, layered with ceremonial matcha', tags:[], emoji:'🍵', mods:sweet},
        {id:'air11', name:'Double Matcha', price:7.25, desc:'Oat milk and matcha cream layered with vibrant ceremonial matcha', tags:[], emoji:'🍵', mods:sweet},
        {id:'air12', name:'Matcha Pandan', price:7.25, desc:'Ceremonial matcha, oat milk, velvety in-house pandan', tags:[], emoji:'🍵', mods:sweet},
        {id:'air13', name:'Matcha Ube', price:7.25, desc:'Ceremonial matcha, oat milk, creamy in-house ube', tags:[], emoji:'🍠', mods:sweet},
        {id:'air14', name:'Matcha Strawberry', price:7.25, desc:'Ceremonial matcha, oat milk, strawberry puree', tags:[], emoji:'🍓', mods:sweet},
        {id:'air15', name:'Matcha Blueberry', price:7.25, desc:'Ceremonial matcha, oat milk, blueberry puree', tags:[], emoji:'🫐', mods:sweet}
      ]},
      {cat:'Tea', items:[
        {id:'air16', name:'Phoenix Oolong Milk Tea', price:5.50, desc:'Uniquely roasted oolong tea leaves, refreshing and balanced', tags:[], emoji:'🧋', mods:sweet},
        {id:'air17', name:'Mango Green Tea', price:5.50, desc:'Freshly brewed jasmine green tea infused with real mango', tags:['v'], emoji:'🥭', mods:sweet}
      ]}
    ]
  };

  var firstOC = RESTAURANTS.findIndex(function(r){return r.city==='Orange, CA';});
  if(firstOC < 0) firstOC = RESTAURANTS.length;
  RESTAURANTS.splice(firstOC, 0, sals, airoma);
  IMG['sals'] = IMG.rosas;
  IMG['airoma'] = PIX.coffee;
})();
