const https = require('node:https');
const { URL } = require('node:url');

function httpGetJson(urlStr) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function geocodeLocation(query) {
  const key = process.env.OPENCAGE_API_KEY;
  if (!key) return null;
  const q = encodeURIComponent(String(query || '').trim());
  if (!q) return null;

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${q}&key=${encodeURIComponent(key)}`;
  try {
    const res = await httpGetJson(url);
    const best = res && res.data && Array.isArray(res.data.results) ? res.data.results[0] : null;
    if (!best || !best.geometry) return null;
    return { lat: best.geometry.lat, lng: best.geometry.lng };
  } catch (e) {
    return null;
  }
}

module.exports = geocodeLocation;

