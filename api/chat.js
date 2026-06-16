// FullPlate ordering assistant — Vercel serverless function.
// Reads ANTHROPIC_API_KEY from the environment (set it in Vercel project settings).
// If the key is absent or the call fails, returns a signal the front-end uses to fall back
// to the built-in scripted assistant, so the demo never breaks.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(200).json({ configured: false });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};
  const restaurant = body.restaurant || 'the restaurant';
  const menu = Array.isArray(body.menu) ? body.menu : [];
  const message = (body.message || '').toString().slice(0, 1000);
  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

  const menuText = menu.map(function (m) {
    return '- id:' + m.id + ' | ' + m.name + ' | $' + Number(m.price).toFixed(2) +
      ' | ' + (m.desc || '') + ' | tags:' + ((m.tags && m.tags.join(',')) || 'none');
  }).join('\n');

  const system =
    'You are the friendly ordering assistant for ' + restaurant + ' on FullPlate, a commission-free ordering marketplace.\n' +
    'Only ever reference items from THIS menu. Never invent items, prices, or modifiers.\n\n' +
    'MENU:\n' + menuText + '\n\n' +
    'Rules:\n' +
    '- Help the guest order in plain language. Keep replies short and warm (1-3 sentences).\n' +
    '- When the guest wants something, put it in "add" using its exact menu id and a quantity.\n' +
    '- For allergy or dietary-safety questions, share what the menu lists (tags) and tell them to confirm with staff about cross-contamination. Never certify a dish as safe to eat.\n' +
    '- If the guest is finished, set "checkout" to true.\n' +
    'Respond with ONLY a JSON object, no prose and no code fences:\n' +
    '{"reply":"<what you say to the guest>","add":[{"id":"<menu id>","qty":<integer>}],"checkout":<true or false>}';

  const messages = history.concat([{ role: 'user', content: message }]);

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: system,
        messages: messages
      })
    });
    if (!r.ok) {
      res.status(200).json({ configured: true, error: true });
      return;
    }
    const data = await r.json();
    const text = ((data.content || []).map(function (c) { return c.text || ''; }).join('')).trim();
    let parsed;
    try {
      const s = text.indexOf('{');
      const e = text.lastIndexOf('}');
      parsed = JSON.parse(text.slice(s, e + 1));
    } catch (err) {
      parsed = { reply: text || 'Sorry, could you say that again?', add: [], checkout: false };
    }
    res.status(200).json({
      configured: true,
      reply: parsed.reply || '',
      add: Array.isArray(parsed.add) ? parsed.add : [],
      checkout: !!parsed.checkout
    });
  } catch (e) {
    res.status(200).json({ configured: true, error: true });
  }
}
