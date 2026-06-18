// FullPlate website import — Vercel serverless function.
// Fetches a restaurant's website and extracts structured listing data
// (name, cuisine, hours, rating, menu, reviews) using Claude, so the
// onboarding flow can build a real page from a real URL during a pitch.
// Reads ANTHROPIC_API_KEY from the environment (same key as /api/chat).
// If the key is missing or anything fails, returns ok:false and the front end
// falls back to its built-in cuisine template, so the demo never breaks.

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(200).json({ configured: false, ok: false }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  let url = (body.url || '').toString().trim();
  const nameHint = (body.name || '').toString().slice(0, 120);
  const cuisineHint = (body.cuisineHint || '').toString().slice(0, 60);
  if (!url) { res.status(200).json({ configured: true, ok: false, error: 'no url' }); return; }
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url.replace(/^\/+/, '');
  try { new URL(url); } catch { res.status(200).json({ configured: true, ok: false, error: 'bad url' }); return; }

  async function grab(u) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4500);
    try {
      const r = await fetch(u, {
        redirect: 'follow', signal: ctrl.signal,
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; FullPlateBot/1.0; +https://fullplate.app)' }
      });
      clearTimeout(timer);
      if (!r.ok) return '';
      return await r.text();
    } catch (e) { clearTimeout(timer); return ''; }
  }
  function toText(html) {
    if (!html) return '';
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#0?39;/g, "'")
      .replace(/&rsquo;|&lsquo;/g, "'").replace(/&quot;/g, '"').replace(/&#8211;|&ndash;/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }

  let text = toText(await grab(url));
  // If the landing page is thin (SPA shell or splash), try one common menu path.
  if (text.length < 500) {
    const extra = toText(await grab(url.replace(/\/+$/, '') + '/menu'));
    if (extra.length > text.length) text = extra;
  }
  text = text.slice(0, 10000);
  if (text.length < 120) { res.status(200).json({ configured: true, ok: false, error: 'no content' }); return; }

  const system =
    'You extract structured restaurant data from the raw text of a restaurant website, to build an online-ordering listing. ' +
    'Use ONLY information present in the text. Never invent dishes, prices, hours, ratings, or reviews. ' +
    'If something is not present, use null (or an empty array). Prices must be plain numbers in dollars (no symbols). ' +
    'Tags may only come from this set, and only when the text clearly indicates it: "gf" (gluten free), "v" (vegetarian or vegan), "spicy". ' +
    'Return AT MOST 6 categories and AT MOST 8 items per category. Keep each description under 90 characters. ' +
    'kind must be one short word such as Mexican, Pizza, Burgers, Cafe, BBQ, Asian, Bakery, Seafood, Sandwiches, or Local. ' +
    'Only include reviews/testimonials that actually appear in the text. ' +
    'Respond with ONLY a JSON object, no prose and no code fences:\n' +
    '{"name":"","cuisine":"","kind":"","hours":"","rating":null,"reviewCount":null,' +
    '"menu":[{"cat":"","items":[{"name":"","price":0,"desc":"","tags":[]}]}],' +
    '"reviews":[{"name":"","stars":5,"text":""}]}';

  const user =
    'Website URL: ' + url + '\n' +
    (nameHint ? ('Owner-provided name (use if the page is consistent with it): ' + nameHint + '\n') : '') +
    (cuisineHint ? ('Owner-selected cuisine hint: ' + cuisineHint + '\n') : '') +
    '\nRAW WEBSITE TEXT:\n' + text;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1800,
        system: system,
        messages: [{ role: 'user', content: user }]
      })
    });
    if (!r.ok) { res.status(200).json({ configured: true, ok: false, error: 'model ' + r.status }); return; }
    const data = await r.json();
    const out = ((data.content || []).map(c => c.text || '').join('')).trim();
    let parsed;
    try { const s = out.indexOf('{'); const e = out.lastIndexOf('}'); parsed = JSON.parse(out.slice(s, e + 1)); }
    catch (err) { res.status(200).json({ configured: true, ok: false, error: 'parse' }); return; }

    const clean = sanitize(parsed);
    const itemCount = (clean.menu || []).reduce((n, c) => n + (c.items ? c.items.length : 0), 0);
    res.status(200).json({ configured: true, ok: (itemCount >= 2 || !!clean.name), items: itemCount, data: clean });
  } catch (e) {
    res.status(200).json({ configured: true, ok: false, error: 'exception' });
  }
}

function sanitize(p) {
  p = p || {};
  const okTags = { gf: 1, v: 1, spicy: 1 };
  const num = (x) => { const n = parseFloat(x); return isFinite(n) ? n : null; };
  const str = (x, n) => (x == null ? '' : String(x).slice(0, n || 120));
  let rating = num(p.rating); if (rating != null && (rating < 1 || rating > 5)) rating = null;
  let rc = parseInt(p.reviewCount, 10); if (!isFinite(rc) || rc < 0) rc = null;
  const menu = Array.isArray(p.menu) ? p.menu.slice(0, 6).map((c) => ({
    cat: str(c && c.cat, 40) || 'Menu',
    items: (Array.isArray(c && c.items) ? c.items : []).slice(0, 8).map((it) => ({
      name: str(it && it.name, 80),
      price: (num(it && it.price) != null ? Math.max(0, num(it.price)) : 0),
      desc: str(it && it.desc, 90),
      tags: (Array.isArray(it && it.tags) ? it.tags : []).filter((t) => okTags[t]).slice(0, 3)
    })).filter((it) => it.name)
  })).filter((c) => c.items.length) : [];
  const reviews = (Array.isArray(p.reviews) ? p.reviews : []).slice(0, 4).map((rv) => {
    let s = parseInt(rv && rv.stars, 10); if (!isFinite(s) || s < 1 || s > 5) s = 5;
    return { name: str(rv && rv.name, 40) || 'Guest', stars: s, text: str(rv && rv.text, 220) };
  }).filter((rv) => rv.text);
  return {
    name: str(p.name, 120), cuisine: str(p.cuisine, 60), kind: str(p.kind, 24),
    hours: str(p.hours, 120), rating: rating, reviewCount: rc, menu: menu, reviews: reviews
  };
}
