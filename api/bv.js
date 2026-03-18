export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const clientId = process.env.BV_CLIENT_ID;
  const clientSecret = process.env.BV_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'BV_CLIENT_ID eller BV_CLIENT_SECRET saknas.' });
  }

  try {
    const tokenRes = await fetch('https://portal.api.bolagsverket.se/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.status(401).json({ error: 'Kunde inte hämta token', details: tokenData });
    }

    const { sniKod, registreringsdatumFran, registreringsdatumTill, lan, bolagsform, maxAntal } = req.query;
    const sniKoder = Array.isArray(sniKod) ? sniKod : sniKod ? [sniKod] : [];

    const body = {
      sniKoder,
      registreringsdatumFran: registreringsdatumFran || '',
      registreringsdatumTill: registreringsdatumTill || '',
      maxAntal: parseInt(maxAntal) || 50
    };
    if (lan) body.lan = lan;
    if (bolagsform) body.bolagsform = bolagsform;

    const apiRes = await fetch('https://gw.api.bolagsverket.se/vardefulla-datamangder/v1/organisationer/sok', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await apiRes.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
