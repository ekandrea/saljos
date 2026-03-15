export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const masterKey = process.env.JSONBIN_MASTER_KEY;
  const binId = process.env.JSONBIN_BIN_ID;
  if (!masterKey || !binId) return res.status(500).json({ error: 'JSONBIN_MASTER_KEY och JSONBIN_BIN_ID saknas i Vercel.' });
  const headers = { 'X-Master-Key': masterKey, 'Content-Type': 'application/json' };
  try {
    if (req.method === 'GET') {
      const r = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, { headers });
      return res.status(r.status).json(await r.json());
    }
    if (req.method === 'PUT') {
      const r = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, { method: 'PUT', headers, body: JSON.stringify(req.body) });
      return res.status(r.status).json(await r.json());
    }
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
