/* FullPlate data layer: restaurants, image maps, and image helpers.
   No external dependencies. Loaded first. */

const IMG = {
  chiwas:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/%28El_Flaco%29_Al_Pastor_Tacos.jpg/1280px-%28El_Flaco%29_Al_Pastor_Tacos.jpg",
  rosas:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Tacos_de_Carnitas_con_nopales.jpg/1280px-Tacos_de_Carnitas_con_nopales.jpg",
  platos:"https://upload.wikimedia.org/wikipedia/commons/1/1e/Tacos_de_pescado_estilo_Ensenada_o_Baja_Fish_Taco..jpg",
  pho:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Tofu_noodle_soup_%28Ph%E1%BB%9F_chay%29_-_Pho_Hanoi_Authentic_2024-12-01.jpg/1280px-Tofu_noodle_soup_%28Ph%E1%BB%9F_chay%29_-_Pho_Hanoi_Authentic_2024-12-01.jpg",
  sakura:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Tonkotsu_Ramen_-_Goemon_Ramen_Bar_2023-06-06.jpg/1280px-Tonkotsu_Ramen_-_Goemon_Ramen_Bar_2023-06-06.jpg",
  poke:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Almighty_steak_%28medium_size%29_-_Hawaiian_Pok%C3%A9_Bowl_2024-11-30.jpg/1280px-Almighty_steak_%28medium_size%29_-_Hawaiian_Pok%C3%A9_Bowl_2024-11-30.jpg",
  slice:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Margherita_Originale.JPG/1280px-Margherita_Originale.JPG",
  bashir:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Plate_Shawarma_-_variant.jpg/1280px-Plate_Shawarma_-_variant.jpg",
  smoke:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Smoked_Brisket_with_smoke_ring.jpg/1280px-Smoked_Brisket_with_smoke_ring.jpg",
  sunrise:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/2019-04-21_11_41_12_A_stack_of_blueberry_pancakes_with_syrup_in_the_Franklin_Farm_section_of_Oak_Hill%2C_Fairfax_County%2C_Virginia.jpg/1280px-2019-04-21_11_41_12_A_stack_of_blueberry_pancakes_with_syrup_in_the_Franklin_Farm_section_of_Oak_Hill%2C_Fairfax_County%2C_Virginia.jpg",
  harbor:"https://upload.wikimedia.org/wikipedia/commons/b/bd/Club-sandwich.jpg",
  burger:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Cheeseburger_with_onions_at_Hatfield_Heath_Festival_2017.jpg/1280px-Cheeseburger_with_onions_at_Hatfield_Heath_Festival_2017.jpg",
  bella:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Spaghetti_Bolognese_-_Figaros%2C_Brighton_2023-10-06.jpg/1280px-Spaghetti_Bolognese_-_Figaros%2C_Brighton_2023-10-06.jpg"
};
const PIX = {
  burrito:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Burrito_al_pastor_-_Bacalar_QR.jpg/960px-Burrito_al_pastor_-_Bacalar_QR.jpg",
  salad:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Bowtie_pasta_salad_bowl_close-up.jpg/960px-Bowtie_pasta_salad_bowl_close-up.jpg",
  coffee:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/A_cup_of_coffee_in_Mohk.jpg/960px-A_cup_of_coffee_in_Mohk.jpg",
  dumpling:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Missgyoza_production_gyoza_dumpling_Manufacturer.jpg/960px-Missgyoza_production_gyoza_dumpling_Manufacturer.jpg",
  fries:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/McDonald%27s_French_Fries%2C_Canada%2C_2026-04-04.jpg/960px-McDonald%27s_French_Fries%2C_Canada%2C_2026-04-04.jpg",
  eggs:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Liat_Portal_for_Foodie_Disorder_-_Israeli_breakfast_plate_with_fried_egg_and_avocado.jpg/960px-Liat_Portal_for_Foodie_Disorder_-_Israeli_breakfast_plate_with_fried_egg_and_avocado.jpg",
  guacamole:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Guacamole_IMGP1303.jpg/960px-Guacamole_IMGP1303.jpg",
  tamale:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Tamales_Mexicanos_sweet_corn_tamales_05.jpg/960px-Tamales_Mexicanos_sweet_corn_tamales_05.jpg",
  gyro:"https://upload.wikimedia.org/wikipedia/commons/b/b7/Shawarma_closeup.png",
  ceviche:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Tostada_de_ceviche_de_camar%C3%B3n_con_mango.jpg/960px-Tostada_de_ceviche_de_camar%C3%B3n_con_mango.jpg",
  springroll:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Vietnamese_fried_spring_rolls_in_Ho_Chi_Minh_City%2C_Vietnam.jpg/960px-Vietnamese_fried_spring_rolls_in_Ho_Chi_Minh_City%2C_Vietnam.jpg"
};
const PIC_ORDER = [
  ['shawarma',IMG.bashir],['gyro',PIX.gyro],['falafel',IMG.bashir],['hummus',PIX.guacamole],
  ['gyoza',PIX.dumpling],['rangoon',PIX.dumpling],['spring roll',PIX.springroll],
  ['fish taco',PIX.ceviche],['ceviche',PIX.ceviche],['tostada',PIX.ceviche],['shrimp',PIX.ceviche],
  ['burrito',PIX.burrito],['tamale',PIX.tamale],['guacamole',PIX.guacamole],['chips',PIX.guacamole],
  ['caesar',PIX.salad],['salad',PIX.salad],['tabbouleh',PIX.salad],['bruschetta',PIX.salad],
  ['chilaquiles',PIX.eggs],['avocado toast',PIX.eggs],['egg',PIX.eggs],['pancake',IMG.sunrise],
  ['latte',PIX.coffee],['coffee',PIX.coffee],['cold brew',PIX.coffee],
  ['fries',PIX.fries],
  ['pho',IMG.pho],['ramen',IMG.sakura],['pizza',IMG.slice],['margherita',IMG.slice],['funghi',IMG.slice],
  ['brisket',IMG.smoke],['pulled pork',IMG.smoke],['smoked',IMG.smoke],
  ['club',IMG.harbor],['sandwich',IMG.harbor],['melt',IMG.harbor],
  ['smash',IMG.burger],['burger',IMG.burger],
  ['bolognese',IMG.bella],['spaghetti',IMG.bella],['tagliatelle',IMG.bella],['cacio',IMG.bella],['parmigiana',IMG.bella],
  ['poke',IMG.poke],['ahi',IMG.poke],['salmon',IMG.poke],
  ['taco',IMG.chiwas]
];
function itemPhoto(name){ const n=name.toLowerCase(); for(const p of PIC_ORDER){ if(n.includes(p[0])) return p[1]; } return null; }
function bannerStyle(id, color, scrim){
  return IMG[id]
    ? `background-image:${scrim},url('${IMG[id]}')`
    : `background:linear-gradient(135deg, ${color} 0%, #ffffff 140%)`;
}
const CARD_SCRIM='linear-gradient(rgba(0,0,0,.34),rgba(0,0,0,0) 42%,rgba(0,0,0,0) 80%,rgba(0,0,0,.12))';
const HEAD_SCRIM='linear-gradient(rgba(0,0,0,.28),rgba(0,0,0,.06) 55%)';

const RESTAURANTS = [
  {
    id:'chiwas', city:'Phoenix', kind:'Mexican', featured:true, name:'Tacos Chiwas', cuisine:'Chihuahua-style Mexican', emoji:'🌮',
    color:'#FBE3DA', rating:4.6, reviews:1064, eta:'15–25 min', price:'$$', popular:'tc1',
    blurb:'Family-run Chihuahua-style taqueria on Indian School Rd. Handmade tortillas, made to order.',
    story:"A beloved Phoenix taqueria serving the Chihuahua-style cooking the owners grew up on. The corn tortillas are pressed by hand and the gorditas are made to order.",
    realNote:"Real restaurant. This listing was built from public info (tacoschiwas.com) to show how a FullPlate page comes together. Menu and prices should be confirmed with the restaurant.",
    menu:[
      {cat:'Tacos (handmade corn tortillas)', items:[
        {id:'tc1', name:'Taco Chiwas', price:3.49, desc:'Beef, ham, jalapeño, Anaheim chiles, asadero cheese', tags:['gf'], emoji:'🌮'},
        {id:'tc2', name:'Taco Asada', price:3.49, desc:'Beef, cilantro, pickled red onion', tags:['gf'], emoji:'🌮'},
        {id:'tc3', name:'Taco Al Pastor', price:3.49, desc:'Marinated pork, cilantro, white onion', tags:['gf'], emoji:'🌮'},
        {id:'tc4', name:'Taco Carnitas', price:3.49, desc:'Shredded pork, cilantro, white onion', tags:['gf'], emoji:'🌮'},
        {id:'tc5', name:'Taco Calabacitas', price:3.49, desc:'Mexican squash, corn, white onion, asadero cheese', tags:['gf','v'], emoji:'🌽'},
      ]},
      {cat:'Gorditas (flour)', items:[
        {id:'tc6', name:'Picadillo Gordita', price:5.00, desc:'Ground beef, carrots, celery, potato, beans', tags:[], emoji:'🫓'},
        {id:'tc7', name:'Rajas Gordita', price:5.00, desc:'Roasted poblanos, Anaheim peppers, onion, asadero, beans', tags:['v'], emoji:'🌶️'},
      ]},
      {cat:'Burritos (organic flour tortillas)', items:[
        {id:'tc8', name:'Asada Burrito', price:11.00, desc:'Beef, lettuce, cilantro, tomato, pickled red onion, beans, asadero', tags:[], emoji:'🌯'},
        {id:'tc9', name:'Deshebrada Roja Burrito', price:10.00, desc:'Red shredded beef, potato, beans', tags:[], emoji:'🌯'},
      ]},
      {cat:'More', items:[
        {id:'tc10', name:'Quesadilla', price:6.00, desc:'Queso asadero (add asada, pastor, or rajas)', tags:['v'], emoji:'🧀'},
      ]},
    ]
  },
  {
    id:'rosas', city:'Phoenix', kind:'Mexican', name:"Rosa's Cocina", cuisine:'Sonoran Mexican', emoji:'🌮',
    color:'#FBE7DD', rating:4.8, reviews:412, eta:'20–30 min', price:'$$', popular:'r4',
    blurb:'Family-run Sonoran kitchen in South Phoenix since 1998.',
    story:"Rosa learned mole from her grandmother in Hermosillo. Everything is made from scratch daily, and the salsas are not for the faint of heart.",
    menu:[
      {cat:'Tacos', items:[
        {id:'r1', name:'Carne Asada Taco', price:4.50, desc:'Mesquite-grilled steak, onion, cilantro, corn tortilla', tags:['gf'], emoji:'🌮'},
        {id:'r2', name:'Rajas Taco', price:4.00, desc:'Roasted poblano, caramelized onion, crema', tags:['gf','v'], emoji:'🌶️'},
        {id:'r3', name:'Carnitas Taco', price:4.25, desc:'Slow-braised pork, salsa verde', tags:['gf'], emoji:'🌮'},
      ]},
      {cat:'Plates', items:[
        {id:'r4', name:'Chicken Mole Plate', price:14.00, desc:"Rosa's signature mole, rice, beans, handmade tortillas", tags:['gf'], emoji:'🍗'},
        {id:'r5', name:'Tamale Plate (3)', price:12.50, desc:'Red chile pork tamales, steamed in corn husk', tags:['gf'], emoji:'🫔'},
        {id:'r6', name:'Veggie Burrito', price:10.50, desc:'Beans, rice, rajas, guacamole, pico', tags:['v'], emoji:'🌯'},
      ]},
      {cat:'Sides & Drinks', items:[
        {id:'r7', name:'Chips & Guacamole', price:6.00, desc:'Made to order', tags:['gf','v'], emoji:'🥑'},
        {id:'r8', name:'Horchata', price:3.50, desc:'House cinnamon rice milk', tags:['gf','v'], emoji:'🥛'},
      ]},
    ]
  },
  {
    id:'pho', city:'Phoenix', kind:'Asian', name:'Pho Saigon Kitchen', cuisine:'Vietnamese', emoji:'🍜',
    color:'#E7F0EA', rating:4.7, reviews:286, eta:'15–25 min', price:'$$', popular:'p1',
    blurb:'Slow-simmered broth and bright herbs on East McDowell.',
    story:"The Tran family simmers their beef broth for 12 hours every morning. No shortcuts, no MSG, just the recipe they brought from Saigon.",
    menu:[
      {cat:'Pho & Noodles', items:[
        {id:'p1', name:'Pho Tai (Rare Beef)', price:13.00, desc:'12-hour broth, rice noodles, herbs on the side', tags:['gf'], emoji:'🍜'},
        {id:'p2', name:'Veggie Tofu Pho', price:12.00, desc:'Vegetable broth, tofu, bok choy', tags:['gf','v'], emoji:'🍲'},
        {id:'p3', name:'Bun Cha Gio', price:12.50, desc:'Vermicelli, crispy spring rolls, nuoc cham', tags:[], emoji:'🍜'},
      ]},
      {cat:'Starters', items:[
        {id:'p4', name:'Fresh Spring Rolls (2)', price:6.50, desc:'Shrimp, herbs, peanut sauce', tags:['gf'], emoji:'🥬'},
        {id:'p5', name:'Crispy Spring Rolls (4)', price:7.00, desc:'Pork and glass noodle', tags:[], emoji:'🥢'},
      ]},
      {cat:'Drinks', items:[
        {id:'p6', name:'Vietnamese Iced Coffee', price:4.50, desc:'Condensed milk, strong drip', tags:['v'], emoji:'☕'},
      ]},
    ]
  },
  {
    id:'slice', city:'Phoenix', kind:'Pizza', name:'Slice & Co. Pizzeria', cuisine:'Wood-fired Pizza', emoji:'🍕',
    color:'#FBEFD9', rating:4.9, reviews:531, eta:'25–35 min', price:'$$', popular:'s2',
    blurb:'Naples-style pies from a downtown garage, fermented 72 hours.',
    story:"Danny ferments his dough for three days and fires every pie at 900 degrees. The menu is short on purpose. He only makes what he is proud of.",
    menu:[
      {cat:'Pizzas', items:[
        {id:'s1', name:'Margherita', price:15.00, desc:'San Marzano, fresh mozzarella, basil', tags:['v'], emoji:'🍕'},
        {id:'s2', name:'Pepperoni & Hot Honey', price:18.00, desc:'Cup-and-char pepperoni, chili honey drizzle', tags:['spicy'], emoji:'🍕'},
        {id:'s3', name:'Funghi (Mushroom)', price:17.00, desc:'Roasted mushrooms, thyme, taleggio', tags:['v'], emoji:'🍄'},
      ]},
      {cat:'Salads & Sides', items:[
        {id:'s4', name:'Little Gem Caesar', price:9.00, desc:'House dressing, parmesan, focaccia crumb', tags:['v'], emoji:'🥗'},
        {id:'s5', name:'Garlic Knots (6)', price:7.00, desc:'Pulled from the dough, sea salt, butter', tags:['v'], emoji:'🥨'},
      ]},
      {cat:'Drinks', items:[
        {id:'s6', name:'Italian Soda', price:3.50, desc:'Blood orange or lemon', tags:['gf','v'], emoji:'🥤'},
      ]},
    ]
  },
  {
    id:'bashir', city:'Phoenix', kind:'Mediterranean', name:"Bashir's Mediterranean", cuisine:'Mediterranean', emoji:'🥙',
    color:'#EAF1F6', rating:4.7, reviews:243, eta:'20–30 min', price:'$$', popular:'b1',
    blurb:'Charcoal-grilled shawarma and fresh-pressed hummus in Tempe.',
    story:"Bashir came from Amman with his spice blends and a charcoal grill. He still greets regulars by name and slides an extra falafel into the bag.",
    menu:[
      {cat:'Wraps & Plates', items:[
        {id:'b1', name:'Chicken Shawarma Wrap', price:11.00, desc:'Charcoal chicken, garlic toum, pickles, saj bread', tags:[], emoji:'🌯'},
        {id:'b2', name:'Falafel Plate', price:10.50, desc:'Crispy falafel, hummus, salad, tahini, rice', tags:['v'], emoji:'🧆'},
        {id:'b3', name:'Beef & Lamb Gyro', price:12.00, desc:'Shaved gyro, tzatziki, tomato, onion', tags:[], emoji:'🥙'},
      ]},
      {cat:'Mezze', items:[
        {id:'b4', name:'Hummus & Pita', price:6.50, desc:'Stone-ground chickpea, olive oil, warm pita', tags:['v'], emoji:'🫓'},
        {id:'b5', name:'Tabbouleh', price:6.00, desc:'Parsley, bulgur, mint, lemon', tags:['v'], emoji:'🥗'},
      ]},
      {cat:'Drinks', items:[
        {id:'b6', name:'Mint Lemonade', price:4.00, desc:'Fresh-squeezed, blended with mint', tags:['gf','v'], emoji:'🍋'},
      ]},
    ]
  },
  {
    id:'smoke', city:'Phoenix', kind:'BBQ', name:'Smoke & Oak BBQ', cuisine:'Texas BBQ', emoji:'🍖',
    color:'#F3E5DD', rating:4.8, reviews:389, eta:'25–35 min', price:'$$$', popular:'m1',
    blurb:'Oak-smoked brisket by the pound, until it sells out.',
    story:"Marcus smokes brisket over Texas post oak for 14 hours and sells until it is gone, usually by mid-afternoon. When the sign flips to sold out, that is the day done.",
    menu:[
      {cat:'By the Plate', items:[
        {id:'m1', name:'Brisket Plate', price:18.00, desc:'Half pound oak-smoked brisket, two sides, pickles', tags:['gf'], emoji:'🥩'},
        {id:'m2', name:'Pulled Pork Plate', price:15.00, desc:'Hand-pulled pork shoulder, two sides', tags:['gf'], emoji:'🍖'},
        {id:'m3', name:'Smoked Half Chicken', price:16.00, desc:'Dry-rubbed, slow-smoked, crisp skin', tags:['gf'], emoji:'🍗'},
      ]},
      {cat:'Sandwiches & Sides', items:[
        {id:'m4', name:'Brisket Sandwich', price:12.00, desc:'Chopped brisket, pickles, white bread', tags:[], emoji:'🥪'},
        {id:'m5', name:'Mac & Cheese', price:5.00, desc:'Three-cheese, baked crust', tags:['v'], emoji:'🧀'},
        {id:'m6', name:'Smoked Beans', price:4.50, desc:'Burnt-end beans, brown sugar', tags:['gf'], emoji:'🫘'},
      ]},
      {cat:'Drinks', items:[
        {id:'m7', name:'Sweet Tea', price:3.00, desc:'Brewed daily, proper Southern sweet', tags:['gf','v'], emoji:'🧊'},
      ]},
    ]
  },
  {
    id:'sunrise', city:'Phoenix', kind:'Breakfast', name:'Sunrise Cafe', cuisine:'Breakfast & Brunch', emoji:'🍳',
    color:'#FCEFD2', rating:4.6, reviews:512, eta:'15–25 min', price:'$$', popular:'n1',
    blurb:'All-day breakfast and bottomless coffee in Arcadia.',
    story:"A neighborhood diner run by the Ortiz sisters, where the green chile is roasted in-house and the regulars have had the same booth for years.",
    menu:[
      {cat:'Breakfast', items:[
        {id:'n1', name:'Green Chile Breakfast Burrito', price:9.50, desc:'Egg, potato, cheese, house green chile', tags:['v'], emoji:'🌯'},
        {id:'n2', name:'Buttermilk Pancakes (3)', price:8.50, desc:'Stack with whipped butter and syrup', tags:['v'], emoji:'🥞'},
        {id:'n3', name:'Avocado Toast', price:9.00, desc:'Sourdough, smashed avocado, chili, egg', tags:['v'], emoji:'🥑'},
      ]},
      {cat:'Plates', items:[
        {id:'n4', name:'Two-Egg Plate', price:10.00, desc:'Eggs any style, potatoes, toast, bacon', tags:['gf'], emoji:'🍳'},
        {id:'n5', name:'Chilaquiles Rojos', price:11.00, desc:'Crispy tortilla, red salsa, eggs, crema', tags:['gf','v'], emoji:'🍳'},
      ]},
      {cat:'Coffee', items:[
        {id:'n6', name:'Drip Coffee', price:3.00, desc:'Bottomless, local roast', tags:['gf','v'], emoji:'☕'},
        {id:'n7', name:'Horchata Latte', price:5.00, desc:'Espresso, cinnamon rice milk', tags:['v'], emoji:'☕'},
      ]},
    ]
  },
  {
    id:'platos', city:'Orange, CA', kind:'Mexican', name:'Plato Verde', cuisine:'Coastal Mexican', emoji:'🫔',
    color:'#E8F1E6', rating:4.8, reviews:367, eta:'20–30 min', price:'$$', popular:'o2',
    blurb:'Baja-style seafood and street tacos off the Orange Circle.',
    story:"Elena grew up cooking in Ensenada and opened Plato Verde two blocks from the Plaza. The fish is delivered every morning and the tortillas are pressed to order.",
    menu:[
      {cat:'Tacos', items:[
        {id:'o1', name:'Baja Fish Taco', price:5.00, desc:'Beer-battered cod, cabbage, chipotle crema', tags:[], emoji:'🌮'},
        {id:'o2', name:'Carne Asada Taco', price:4.75, desc:'Citrus-marinated steak, onion, cilantro', tags:['gf'], emoji:'🌮'},
        {id:'o3', name:'Grilled Veggie Taco', price:4.25, desc:'Zucchini, corn, poblano, cotija', tags:['gf','v'], emoji:'🌽'},
      ]},
      {cat:'Plates', items:[
        {id:'o4', name:'Shrimp Ceviche Tostada', price:13.50, desc:'Lime-cured shrimp, avocado, pico', tags:['gf'], emoji:'🦐'},
        {id:'o5', name:'Carnitas Burrito', price:11.50, desc:'Slow-roasted pork, rice, beans, salsa roja', tags:[], emoji:'🌯'},
      ]},
      {cat:'Drinks', items:[
        {id:'o6', name:'Agua de Jamaica', price:3.50, desc:'Hibiscus, lightly sweetened', tags:['gf','v'], emoji:'🧊'},
      ]},
    ]
  },
  {
    id:'harbor', city:'Orange, CA', kind:'Sandwiches', name:'Harbor & Vine', cuisine:'California Comfort', emoji:'🥪',
    color:'#FBEEDF', rating:4.7, reviews:298, eta:'15–25 min', price:'$$', popular:'h1',
    blurb:'Scratch sandwiches and grain bowls in Old Towne Orange.',
    story:"A husband-and-wife team who left restaurant kitchens to open a corner spot focused on local produce and bread baked down the street. Everything is made the morning you order it.",
    menu:[
      {cat:'Sandwiches', items:[
        {id:'h1', name:'Roasted Turkey Club', price:13.00, desc:'Herb-roasted turkey, bacon, avocado, sourdough', tags:[], emoji:'🥪'},
        {id:'h2', name:'Caprese Melt', price:11.50, desc:'Fresh mozzarella, tomato, basil pesto, ciabatta', tags:['v'], emoji:'🧀'},
      ]},
      {cat:'Bowls & Salads', items:[
        {id:'h3', name:'Citrus Harvest Bowl', price:12.50, desc:'Quinoa, roasted veg, orange vinaigrette', tags:['gf','v'], emoji:'🥗'},
        {id:'h4', name:'Chili-Lime Chicken Bowl', price:13.50, desc:'Grilled chicken, brown rice, slaw', tags:['gf'], emoji:'🍗'},
      ]},
      {cat:'Drinks', items:[
        {id:'h5', name:'Cold Brew', price:4.50, desc:'House blend, 18-hour steep', tags:['gf','v'], emoji:'☕'},
      ]},
    ]
  },
  {
    id:'sakura', city:'Orange, CA', kind:'Asian', name:'Sakura Ramen Bar', cuisine:'Ramen & Japanese', emoji:'🍜',
    color:'#F3E7EE', rating:4.9, reviews:455, eta:'20–30 min', price:'$$', popular:'k1',
    blurb:'Tonkotsu simmered overnight, a few seats near Chapman.',
    story:"Kenji trained in Fukuoka and brings that broth home to Orange. The pork bones simmer for 18 hours and the noodles are made fresh in-house every day.",
    menu:[
      {cat:'Ramen', items:[
        {id:'k1', name:'Tonkotsu Ramen', price:15.00, desc:'18-hour pork broth, chashu, soft egg, scallion', tags:[], emoji:'🍜'},
        {id:'k2', name:'Spicy Miso Ramen', price:15.50, desc:'Miso-chili broth, ground pork, corn', tags:['spicy'], emoji:'🌶️'},
        {id:'k3', name:'Veggie Shoyu Ramen', price:13.50, desc:'Kombu-shiitake broth, tofu, greens', tags:['v'], emoji:'🍲'},
      ]},
      {cat:'Starters', items:[
        {id:'k4', name:'Pork Gyoza (5)', price:7.50, desc:'Pan-seared dumplings, ponzu', tags:[], emoji:'🥟'},
        {id:'k5', name:'Edamame', price:5.00, desc:'Sea salt, steamed', tags:['gf','v'], emoji:'🫛'},
      ]},
      {cat:'Drinks', items:[
        {id:'k6', name:'Ramune Soda', price:3.50, desc:'Original marble soda', tags:['gf','v'], emoji:'🥤'},
      ]},
    ]
  },
  {
    id:'poke', city:'Orange, CA', kind:'Asian', name:'Citrus Poke Co.', cuisine:'Hawaiian Poke', emoji:'🐟',
    color:'#E6F1F2', rating:4.6, reviews:271, eta:'10–20 min', price:'$$', popular:'j1',
    blurb:'Build-your-own poke with sushi-grade fish near the Circle.',
    story:"Kai grew up in Oahu and missed real poke after moving to Orange, so he built a counter around daily-delivered ahi and his grandmother's shoyu recipe.",
    menu:[
      {cat:'Signature Bowls', items:[
        {id:'j1', name:'Classic Ahi Bowl', price:13.50, desc:'Ahi tuna, shoyu, sweet onion, rice, seaweed', tags:['gf'], emoji:'🍣'},
        {id:'j2', name:'Spicy Salmon Bowl', price:13.50, desc:'Salmon, spicy mayo, cucumber, edamame', tags:['spicy'], emoji:'🐟'},
        {id:'j3', name:'Tofu Veggie Bowl', price:11.50, desc:'Marinated tofu, avocado, mango, greens', tags:['gf','v'], emoji:'🥑'},
      ]},
      {cat:'Sides', items:[
        {id:'j4', name:'Seaweed Salad', price:4.50, desc:'Sesame, rice vinegar', tags:['gf','v'], emoji:'🥗'},
        {id:'j5', name:'Crab Rangoon (4)', price:6.00, desc:'Crispy, cream cheese', tags:[], emoji:'🥟'},
      ]},
      {cat:'Drinks', items:[
        {id:'j6', name:'Pineapple Iced Tea', price:3.50, desc:'House-brewed, lightly sweet', tags:['gf','v'], emoji:'🍍'},
      ]},
    ]
  },
  {
    id:'burger', city:'Orange, CA', kind:'Burgers', name:'The Plaza Burger', cuisine:'Smash Burgers', emoji:'🍔',
    color:'#FBE9DC', rating:4.8, reviews:604, eta:'15–25 min', price:'$$', popular:'u1',
    blurb:'Smash burgers and hand-cut fries on the Orange Plaza.',
    story:"A walk-up window run by two line cooks who wanted to make one thing perfectly. Local beef, smashed to order, never frozen.",
    menu:[
      {cat:'Burgers', items:[
        {id:'u1', name:'Classic Smash', price:9.00, desc:'Two patties, American, onion, house sauce', tags:[], emoji:'🍔'},
        {id:'u2', name:'Bacon Cheddar Smash', price:11.00, desc:'Double patty, bacon, aged cheddar', tags:[], emoji:'🥓'},
        {id:'u3', name:'Crispy Veggie Burger', price:9.50, desc:'Black bean patty, lettuce, chipotle aioli', tags:['v'], emoji:'🥬'},
      ]},
      {cat:'Sides', items:[
        {id:'u4', name:'Hand-Cut Fries', price:4.00, desc:'Sea salt, twice-fried', tags:['gf','v'], emoji:'🍟'},
        {id:'u5', name:'Vanilla Shake', price:5.50, desc:'Real vanilla bean, thick', tags:['v'], emoji:'🥤'},
      ]},
    ]
  },
  {
    id:'bella', city:'Orange, CA', kind:'Italian', name:'Bella Trattoria', cuisine:'Italian', emoji:'🍝',
    color:'#F4E7E2', rating:4.7, reviews:418, eta:'25–35 min', price:'$$$', popular:'e1',
    blurb:'Handmade pasta and wood-fired classics in Old Towne.',
    story:"Nonna Bella's recipes, run by her grandson Marco. The pasta is rolled every morning and the marinara simmers from breakfast until close.",
    menu:[
      {cat:'Pasta', items:[
        {id:'e1', name:'Tagliatelle Bolognese', price:17.00, desc:'Slow-cooked beef and pork ragu, parmesan', tags:[], emoji:'🍝'},
        {id:'e2', name:'Cacio e Pepe', price:15.00, desc:'Pecorino, black pepper, house tonnarelli', tags:['v'], emoji:'🧀'},
        {id:'e3', name:'Eggplant Parmigiana', price:14.50, desc:'Layered eggplant, marinara, mozzarella', tags:['v'], emoji:'🍆'},
      ]},
      {cat:'Starters', items:[
        {id:'e4', name:'Bruschetta (3)', price:8.00, desc:'Tomato, basil, garlic, grilled bread', tags:['v'], emoji:'🍅'},
        {id:'e5', name:'Caprese Salad', price:10.00, desc:'Mozzarella di bufala, tomato, basil', tags:['gf','v'], emoji:'🥗'},
      ]},
      {cat:'Drinks', items:[
        {id:'e6', name:'San Pellegrino', price:3.50, desc:'Sparkling, chilled', tags:['gf','v'], emoji:'🥤'},
      ]},
    ]
  },
];
