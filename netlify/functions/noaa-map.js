const SERVICES = {
  radar: 'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity/MapServer',
  ndfdTemp: 'https://mapservices.weather.noaa.gov/raster/rest/services/NDFD/NDFD_temp/MapServer',
  spc: 'https://mapservices.weather.noaa.gov/vector/rest/services/outlooks/SPC_wx_outlks/MapServer',
  wpc: 'https://mapservices.weather.noaa.gov/vector/rest/services/outlooks/natl_fcst_wx_chart/MapServer'
};

exports.handler = async (event) => {
  try {
    const q = event.queryStringParameters || {};
    const op = q.op || 'export';
    const serviceKey = q.service;
    const service = SERVICES[serviceKey];
    if (!service) return json(400, {error: 'Unknown service key', allowed: Object.keys(SERVICES)});

    if (op === 'metadata') {
      const url = `${service}?f=pjson`;
      const data = await fetchJson(url);
      return json(200, data);
    }

    if (op === 'legend') {
      const url = `${service}/legend?f=pjson`;
      const data = await fetchJson(url);
      return json(200, data);
    }

    if (op !== 'export') return json(400, {error: 'Unsupported op'});

    const bbox = cleanBbox(q.bbox);
    const size = cleanSize(q.size || '1600,850');
    const layers = cleanLayers(q.layers || '');
    const transparent = q.transparent !== 'false';
    const format = q.format || 'png32';
    const params = new URLSearchParams({
      f: 'image',
      bbox,
      bboxSR: '4326',
      imageSR: '4326',
      size,
      format,
      transparent: String(transparent)
    });
    if (layers) params.set('layers', layers);
    if (q.time && /^\d+(,\d+)?$/.test(q.time)) params.set('time', q.time);
    const url = `${service}/export?${params.toString()}`;
    const res = await fetch(url, {headers: {'User-Agent':'RBRTW-RealMaps/2.0'}});
    const contentType = res.headers.get('content-type') || '';
    const body = Buffer.from(await res.arrayBuffer());
    if (!res.ok) {
      return json(res.status, {error:'NOAA export failed', status:res.status, detail:body.toString('utf8').slice(0,600), url});
    }
    if (!contentType.includes('image')) {
      return json(502, {error:'NOAA returned non-image response', contentType, detail:body.toString('utf8').slice(0,600), url});
    }
    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=120',
        'Access-Control-Allow-Origin': '*'
      },
      body: body.toString('base64'),
      isBase64Encoded: true
    };
  } catch (err) {
    return json(500, {error: err.message});
  }
};

function cleanBbox(raw){
  const parts = String(raw || '').split(',').map(Number);
  if (parts.length !== 4 || parts.some(v => !Number.isFinite(v))) throw new Error('Invalid bbox. Use west,south,east,north.');
  const [w,s,e,n] = parts;
  if (w < -180 || e > 180 || s < -90 || n > 90 || w >= e || s >= n) throw new Error('Bbox outside valid longitude/latitude range.');
  return parts.map(v => v.toFixed(6)).join(',');
}

function cleanSize(raw){
  const parts = String(raw).split(',').map(v => Math.round(Number(v)));
  if (parts.length !== 2 || parts.some(v => !Number.isFinite(v) || v < 64 || v > 4096)) throw new Error('Invalid image size.');
  return parts.join(',');
}

function cleanLayers(raw){
  const val = String(raw || '').trim();
  if (!val) return '';
  if (!/^(show|hide|include|exclude):[0-9,]+$/.test(val)) throw new Error('Invalid layers syntax. Use show:1,2,3');
  return val;
}

async function fetchJson(url){
  const res = await fetch(url, {headers: {'Accept':'application/json','User-Agent':'RBRTW-RealMaps/2.0'}});
  const text = await res.text();
  if (!res.ok) throw new Error(`NOAA metadata failed ${res.status}: ${text.slice(0,300)}`);
  return JSON.parse(text);
}

function json(statusCode, payload){
  return {
    statusCode,
    headers: {'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'no-store'},
    body: JSON.stringify(payload)
  };
}
