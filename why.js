/* FullPlate "Why us" page. Loaded after rewards.js (before nav.js). Adds a
   dedicated marketing page reachable from the home hero, making the case to
   diners and owners. Pricing-free. Creates its own view and wraps show() to
   manage it; no core files edited. Demo-only. */
(function(){
  if(window.__fpWhy) return; window.__fpWhy = true;

  /* create the view container once */
  function ensureView(){
    if(document.getElementById('view-why')) return;
    var app = document.querySelector('.app') || document.body;
    var v = document.createElement('div'); v.id = 'view-why'; v.style.display = 'none';
    var acct = document.getElementById('view-account');
    if(acct && acct.parentNode) acct.parentNode.insertBefore(v, acct.nextSibling); else app.appendChild(v);
  }
  ensureView();

  /* let show() manage the new view */
  var _show = window.show;
  if(typeof _show === 'function'){
    window.show = function(id){ _show(id); var v = document.getElementById('view-why'); if(v) v.style.display = (id === 'view-why') ? 'block' : 'none'; };
  }

  function reason(icon, h, p){
    return '<div style="display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-top:1px solid var(--line)">'
      + '<div style="flex:0 0 auto;width:36px;height:36px;border-radius:10px;background:#FDEEE7;display:grid;place-items:center;font-size:18px">' + icon + '</div>'
      + '<div><div style="font-size:14.5px;font-weight:800;color:var(--ink)">' + h + '</div><div style="font-size:13px;color:var(--muted);line-height:1.5;margin-top:2px">' + p + '</div></div></div>';
  }
  function vsRow(label, fp, apps){
    return '<div style="display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:8px;padding:9px 0;border-top:1px solid var(--line);align-items:center">'
      + '<div style="font-size:12.5px;font-weight:700;color:var(--ink)">' + label + '</div>'
      + '<div style="font-size:12.5px;font-weight:800;color:var(--good);text-align:center">' + fp + '</div>'
      + '<div style="font-size:12.5px;color:var(--muted);text-align:center">' + apps + '</div></div>';
  }

  window.goWhy = function(){
    ensureView();
    var html = '<div style="padding:18px 16px 40px;max-width:760px;margin:0 auto">'
      + '<div style="display:inline-block;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--brand);background:#FDEEE7;border-radius:999px;padding:5px 12px">Why FullPlate</div>'
      + '<h1 style="font-size:30px;line-height:1.12;letter-spacing:-.5px;margin:14px 0 8px">Order local.<br>Keep the money in your neighborhood.</h1>'
      + '<p style="font-size:15px;color:var(--muted);line-height:1.55;margin:0 0 6px">FullPlate is direct ordering for independent restaurants and food trucks. Diners get the same easy pickup and delivery they expect, and the restaurant keeps the whole bill instead of handing 15–30% to a delivery app.</p>'

      + '<div style="background:#fff;border:1px solid var(--line);border-radius:16px;padding:6px 16px 14px;margin:18px 0">'
      +   '<div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--ink);padding:14px 0 2px">For diners</div>'
      +   reason('🏠', 'Your money stays local', 'When you order direct, the restaurant keeps every dollar. No middleman taking a third of a small business’s margin.')
      +   reason('✦', 'Order by chatting', 'Tell the FullPlate AI what you want, in plain words or by voice. It knows the menu and builds your order.')
      +   reason('◷', 'Real pickup times', 'See an honest, order-aware pickup estimate, and get a text the moment your food is ready.')
      +   reason('🎁', 'Rewards that stay with the spot', 'Earn points and FullPlate credit, refer the restaurants you love, and keep your loyalty with the kitchen, not an app.')
      + '</div>'

      + '<div style="background:#fff;border:1px solid var(--line);border-radius:16px;padding:6px 16px 14px;margin:0 0 18px">'
      +   '<div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--ink);padding:14px 0 2px">For restaurants &amp; food trucks</div>'
      +   reason('●', '0% commission, ever', 'A flat monthly subscription instead of per-order commission. The more you sell, the more you keep.')
      +   reason('👥', 'You own your customers', 'Their contact info, order history, and loyalty are yours, not locked inside a delivery app you can’t see into.')
      +   reason('⚡', 'Delivery without the markup', 'Offer delivery through flat-fee couriers the diner pays for. You never give up a percentage of the order.')
      +   reason('🛠️', 'Done for you', 'We build your page from your existing website and sync your menu everywhere. Live in days, no new hardware.')
      + '</div>'

      + '<div style="background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px 16px;margin:0 0 18px">'
      +   '<div style="font-size:14px;font-weight:800;margin-bottom:4px">FullPlate vs. the delivery apps</div>'
      +   '<div style="display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:8px;font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);padding-bottom:4px">'
      +     '<div></div><div style="text-align:center;color:var(--brand)">FullPlate</div><div style="text-align:center">Delivery apps</div></div>'
      +   vsRow('Commission per order', '0%', '15–30%')
      +   vsRow('Who owns the customer', 'You', 'The app')
      +   vsRow('Customer list &amp; data', 'Yours', 'Hidden')
      +   vsRow('AI ordering', 'Included', 'No')
      +   vsRow('Delivery cost', 'Flat fee', 'Stacked fees')
      + '</div>'

      + '<div style="text-align:center;margin:6px 0 4px"><div style="font-size:18px;font-weight:800;letter-spacing:-.3px">Order local. Keep your margin.</div></div>'
      + '<div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">'
      +   '<button onclick="goHome()" style="flex:1;min-width:160px;background:var(--brand);color:#fff;border:0;border-radius:12px;padding:13px;font-size:14px;font-weight:800;cursor:pointer">Browse restaurants</button>'
      +   '<button onclick="(window.fpStartListing?fpStartListing():goHome())" style="flex:1;min-width:160px;background:#fff;color:var(--brand);border:1px solid var(--brand);border-radius:12px;padding:13px;font-size:14px;font-weight:800;cursor:pointer">List your restaurant ›</button>'
      + '</div>'
      + '<div style="text-align:center;margin-top:16px"><button onclick="goHome()" style="background:none;border:0;color:var(--muted);font-size:13px;font-weight:700;cursor:pointer">‹ Back to FullPlate</button></div>'
      + '</div>';
    document.getElementById('view-why').innerHTML = html;
    show('view-why');
    var bb = document.getElementById('backBtn'); if(bb) bb.style.display = 'flex';
    window.scrollTo(0, 0);
  };

  /* add a "Why FullPlate?" link to the home hero */
  var _renderHome = window.renderHome;
  window.renderHome = function(){
    if(typeof _renderHome === 'function') _renderHome.apply(this, arguments);
    try{
      var home = document.getElementById('view-home');
      var pills = home && home.querySelector('.hero .pillrow');
      if(pills && !document.getElementById('whyLink')){
        var a = document.createElement('div'); a.id = 'whyLink'; a.style.cssText = 'margin-top:10px';
        a.innerHTML = '<button onclick="goWhy()" style="background:none;border:0;color:var(--brand);font-size:13.5px;font-weight:800;cursor:pointer;padding:0">Why FullPlate? ›</button>';
        pills.parentNode.insertBefore(a, pills.nextSibling);
      }
    }catch(e){}
  };

  /* Demo scope: AI phone answering has been removed. Neutralize its actions and
     strip its card from the owner Grow/Marketing tab wherever compete.js injects it. */
  try{ window.fpTogglePhone = function(){}; window.fpPhonePreview = function(){}; }catch(e){}
  function stripPhone(){
    try{
      Array.prototype.forEach.call(document.querySelectorAll('.fppos'), function(card){
        if(/AI phone answering/i.test(card.textContent || '')){ if(card.parentNode) card.parentNode.removeChild(card); }
      });
    }catch(e){}
  }
  var _openOwner = window.openOwner;
  if(typeof _openOwner === 'function'){
    window.openOwner = function(){ var r = _openOwner.apply(this, arguments); try{ stripPhone(); }catch(e){} setTimeout(stripPhone, 60); return r; };
  }
  setTimeout(stripPhone, 0);
})();
