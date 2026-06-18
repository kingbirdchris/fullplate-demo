/* FullPlate navigation layer. Loaded LAST. Gives the app a real back-history so
   the header back button (and in-flow Back buttons) return to the actual
   previous screen instead of jumping to Home or the owner Overview. Each screen
   records a restore thunk; the owner console is a single node that remembers its
   current tab, so going Owner > Grow > Embed > Back returns to Grow. No core
   files edited. */
(function(){
  if(window.__fpNav) return; window.__fpNav = true;

  var stack = [], lock = false;
  function record(key, go){
    if(lock) return;
    var top = stack[stack.length - 1];
    if(top && top.key === key){ top.go = go; return; }   /* same screen re-render: just refresh thunk */
    stack.push({ key:key, go:go });
    if(stack.length > 60) stack.shift();
  }

  var _goHome = window.goHome;
  if(typeof _goHome === 'function'){
    stack.push({ key:'home', go:function(){ _goHome(); } });  /* seed */
    window.goHome = function(){ _goHome.apply(this, arguments); record('home', function(){ _goHome(); }); };
  }

  var _openRestaurant = window.openRestaurant;
  if(typeof _openRestaurant === 'function'){
    window.openRestaurant = function(id){
      _openRestaurant.apply(this, arguments);
      var rid = (typeof current !== 'undefined' && current) ? current.id : id;
      record('rest:' + rid, function(){ _openRestaurant(rid); });
    };
  }

  var _openCheckout = window.openCheckout;
  if(typeof _openCheckout === 'function'){
    window.openCheckout = function(){
      _openCheckout.apply(this, arguments);
      try{ if(document.getElementById('view-checkout').style.display === 'block') record('checkout', function(){ _openCheckout(); }); }catch(e){}
    };
  }

  var _openAccount = window.openAccount;
  if(typeof _openAccount === 'function'){
    window.openAccount = function(){ _openAccount.apply(this, arguments); record('account', function(){ _openAccount(); }); };
  }

  /* the owner console is ONE history node that remembers its current tab */
  var _openOwner = window.openOwner;
  if(typeof _openOwner === 'function'){
    window.openOwner = function(id, tab){
      _openOwner.apply(this, arguments);
      var rid = (typeof ownerRest !== 'undefined') ? ownerRest : id;
      var t = (typeof ownerTab !== 'undefined') ? ownerTab : tab;
      record('owner', function(){ _openOwner(rid, t); });
    };
  }

  var _openOnboard = window.openOnboard;
  if(typeof _openOnboard === 'function'){
    window.openOnboard = function(){ _openOnboard.apply(this, arguments); record('onboard', function(){ _openOnboard(); }); };
  }
  var _fpShowEmbed = window.fpShowEmbed;
  if(typeof _fpShowEmbed === 'function'){
    window.fpShowEmbed = function(id){ _fpShowEmbed.apply(this, arguments); record('embed:' + id, function(){ _fpShowEmbed(id); }); };
  }

  /* completing an order ends the flow: start fresh from Home */
  var _placeOrder = window.placeOrder;
  if(typeof _placeOrder === 'function'){
    window.placeOrder = function(){ _placeOrder.apply(this, arguments); stack = [{ key:'home', go:function(){ _goHome(); } }]; };
  }

  /* the embed "Back" button used to jump into the onboarding success flow */
  window.onboardSuccessBack = function(){ window.goBack(); };

  window.goBack = function(){
    if(stack.length > 1){
      stack.pop();                                   /* drop the screen we are on */
      var prev = stack[stack.length - 1];
      lock = true; try{ if(prev && typeof prev.go === 'function') prev.go(); }catch(e){} lock = false;
      return;
    }
    lock = true; try{ if(typeof _goHome === 'function') _goHome(); }catch(e){} lock = false;
  };
})();
