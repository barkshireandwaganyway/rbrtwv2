const TILE_LAYERS = new Set([
  'clouds_new',
  'precipitation_new',
  'pressure_new',
  'wind_new',
  'temp_new'
]);

exports.handler = async (event) => {
  try {
    const q = event.queryStringParameters || {};
    const op = q.op || 'status';
    const key = process.env.OPENWEATHER_API_KEY || process.env.OPENWEATHER_APPID || process.env.OPENWEATHER_KEY;

    if (op === 'status') {
      if (!key) return json(500, {ready:false, error:'Missing OpenWeather Netlify environment variable. Use OPENWEATHER_API_KEY, OPENWEATHER_APPID, or OPENWEATHER_KEY.'});
      return json(200, {ready:true, layers:[...TILE_LAYERS]});
    }

    if (!key) return json(500, {error:'Missing OpenWeather Netlify environment variable. Use OPENWEATHER_API_KEY, OPENWEATHER_APPID, or OPENWEATHER_KEY.'});

    if (op === 'tile') {
      const layer = cleanLayer(q.layer);
      const z = cleanTileNumber(q.z, 'z', 0, 19);
      const x = cleanTileNumber(q.x, 'x', 0, Math.pow(2, z) - 1);
      const y = cleanTileNumber(q.y, 'y', 0, Math.pow(2, z) - 1);
      const url = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${encodeURIComponent(key)}`;
      const res = await fetch(url, {headers: {'User-Agent':'RBRTW-RealMaps/2.0'}});
      const contentType = res.headers.get('content-type') || '';
      const body = Buffer.from(await res.arrayBuffer());
      if (!res.ok) {
        return json(res.status, {error:'OpenWeather tile request failed', status:res.status, detail:body.toString('utf8').slice(0,500)});
      }
      if (!contentType.includes('image')) {
        return json(502, {error:'OpenWeather returned non-image response', contentType, detail:body.toString('utf8').slice(0,500)});
      }
      return {
        statusCode: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=600',
          'Access-Control-Allow-Origin': '*'
        },
        body: body.toString('base64'),
        isBase64Encoded: true
      };
    }

    if (op === 'air') {
      const lat = cleanCoord(q.lat, 'lat', -90, 90);
      const lon = cleanCoord(q.lon, 'lon', -180, 180);
      const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${encodeURIComponent(key)}`;
      const data = await fetchJson(url);
      return json(200, data);
    }

    return json(400, {error:'Unsupported op. Use op=status, op=tile, or op=air.'});
  } catch (err) {
    return json(500, {error: err.message});
  }
};

function cleanLayer(raw){
  const layer = String(raw || '').trim();
  if (!TILE_LAYERS.has(layer)) throw new Error(`Invalid OpenWeather layer. Allowed: ${[...TILE_LAYERS].join(', ')}`);
  return layer;
}

function cleanTileNumber(raw, name, min, max){
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) throw new Error(`Invalid ${name} tile coordinate.`);
  return n;
}

function cleanCoord(raw, name, min, max){
  const n = Number(raw);
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`Invalid ${name}.`);
  return n.toFixed(5);
}

async function fetchJson(url){
  const res = await fetch(url, {headers: {'Accept':'application/json','User-Agent':'RBRTW-RealMaps/2.0'}});
  const text = await res.text();
  if (!res.ok) throw new Error(`OpenWeather request failed ${res.status}: ${text.slice(0,300)}`);
  return JSON.parse(text);
}

function json(statusCode, payload){
  return {
    statusCode,
    headers: {'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'no-store'},
    body: JSON.stringify(payload)
  };
}
