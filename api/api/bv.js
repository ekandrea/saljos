export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const apiKey = process.env.BV_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'BV_API_KEY saknas i Vercel environment variables.' });
  const baseUrl = process.env.BV_BASE_URL || 'https://api.bolagsverket.se/';
  const params = new URLSearchParams(req.query);
  const endpoint = params.get('_endpoint') || 'foretagsinformation/v1/search';
  params.delete('_endpoint');
  try {
    const response = await fetch(`${baseUrl}${endpoint}?${params}`, {
      headers: { 'Authorization': `ApiKey ${apiKey}`, 'Accept': 'application/json' }
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
