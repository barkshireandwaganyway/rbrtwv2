const SERVICES = {
  radar: 'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity/MapServer',
  radarTime: 'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer',
  ndfdTemp: 'https://mapservices.weather.noaa.gov/raster/rest/services/NDFD/NDFD_temp/MapServer',
  spc: 'https://mapservices.weather.noaa.gov/vector/rest/services/outlooks/SPC_wx_outlks/MapServer',
  wpc: 'https://mapservices.weather.noaa.gov/vector/rest/services/outlooks/natl_fcst_wx_chart/MapServer'
};

exports.handler = async (event) => {
  try {
    const q = event.queryStringParameters || {};
    const op = q.op || 'export';

    if (op === 'proxyImage') {
      const url = cleanProxyUrl(q.url);
      return await proxyImage(url, 900);
    }

    if (op === 'iemRadarTile') {
      const z = cleanTileNumber(q.z, 'z', 0, 19);
      const x = cleanTileNumber(q.x, 'x', 0, Math.pow(2, z) - 1);
      const y = cleanTileNumber(q.y, 'y', 0, Math.pow(2, z) - 1);
      const layer = 'nexrad-n0r-900913';
      const url = `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/${layer}/${z}/${x}/${y}.png`;
      return await proxyImage(url, 300);
    }

    if (op === 'wmsRadarTile') {
      const bbox = cleanMercatorBbox(q.bbox);
      const source = String(q.source || 'nowcoast').toLowerCase();
      let url;
      if (source === 'nowcoast') {
        const params = new URLSearchParams({
          SERVICE:'WMS', VERSION:'1.3.0', REQUEST:'GetMap',
          LAYERS:'conus_base_reflectivity_mosaic', STYLES:'',
          FORMAT:'image/png', TRANSPARENT:'true', CRS:'EPSG:3857',
          BBOX:bbox, WIDTH:'256', HEIGHT:'256'
        });
        url = `https://nowcoast.noaa.gov/geoserver/observations/weather_radar/ows?${params.toString()}`;
      } else if (source === 'noaatime') {
        const params = new URLSearchParams({
          SERVICE:'WMS', VERSION:'1.3.0', REQUEST:'GetMap',
          LAYERS:'0', STYLES:'', FORMAT:'image/png', TRANSPARENT:'true',
          CRS:'EPSG:3857', BBOX:bbox, WIDTH:'256', HEIGHT:'256'
        });
        url = `https://mapservices.weather.noaa.gov/eventdriven/services/radar/radar_base_reflectivity_time/ImageServer/WMSServer?${params.toString()}`;
      } else if (source === 'mrmsarcgis') {
        const params = new URLSearchParams({
          f:'image', bbox, bboxSR:'3857', imageSR:'3857', size:'256,256',
          format:'png32', transparent:'true', layers:'show:3'
        });
        url = `https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity/MapServer/export?${params.toString()}`;
      } else {
        return json(400, {error:'Unknown WMS radar source'});
      }
      return await proxyImage(url, 300);
    }

    if (op === 'counties') {
      const bbox = cleanBbox(q.bbox || '-106.650000,25.500000,-93.200000,36.800000');
      const params = new URLSearchParams({
        where: "STATE='48'",
        outFields: 'NAME,BASENAME,GEOID,STATE,COUNTY',
        returnGeometry: 'true',
        returnTrueCurves: 'false',
        outSR: '4326',
        f: 'geojson',
        geometry: bbox,
        geometryType: 'esriGeometryEnvelope',
        inSR: '4326',
        spatialRel: 'esriSpatialRelIntersects',
        geometryPrecision: '3',
        maxAllowableOffset: '0.012',
        resultRecordCount: '2000',
        returnExceededLimitFeatures: 'false'
      });
      const url = `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/13/query?${params.toString()}`;
      const data = await fetchJson(url);
      return json(200, data, 1800);
    }

    const serviceKey = q.service;
    const service = SERVICES[serviceKey];
    if (!service) return json(400, {error: 'Unknown service key', allowed: Object.keys(SERVICES)});

    if (op === 'metadata') {
      const params = new URLSearchParams({f:'pjson'});
      if (q.returnUpdates === 'true') params.set('returnUpdates', 'true');
      const url = `${service}?${params.toString()}`;
      const data = await fetchJson(url);
      return json(200, data);
    }

    if (op === 'layers') {
      const url = `${service}/layers?f=pjson`;
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
      imageSR: /^\d+$/.test(q.imageSR || '') ? q.imageSR : '4326',
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


function cleanTileNumber(raw, name, min, max){
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) throw new Error(`Invalid ${name} tile coordinate.`);
  return n;
}

function cleanMercatorBbox(raw){
  const parts = String(raw || '').split(',').map(Number);
  if (parts.length !== 4 || parts.some(v => !Number.isFinite(v))) throw new Error('Invalid EPSG:3857 bbox.');
  const limit = 20037508.342789244;
  const [w,s,e,n] = parts;
  if (w < -limit || e > limit || s < -limit || n > limit || w >= e || s >= n) throw new Error('EPSG:3857 bbox out of range.');
  return parts.map(v => v.toFixed(3)).join(',');
}

function cleanProxyUrl(raw){
  const url = String(raw || '');
  if (!/^https:\/\//i.test(url)) throw new Error('Only https image proxy URLs are allowed.');
  const allowed = [
    'mesonet.agron.iastate.edu',
    'server.arcgisonline.com',
    'nowcoast.noaa.gov',
    'mapservices.weather.noaa.gov',
    'basemaps-api.arcgis.com',
    'basemapstyles-api.arcgis.com'
  ];
  const u = new URL(url);
  if (!allowed.some(host => u.hostname === host || u.hostname.endsWith('.' + host))) throw new Error('Image proxy host is not allowed.');
  return u.href;
}

async function proxyImage(url, maxAge=300){
  const res = await fetch(url, {headers:{'User-Agent':'RBRTW-RealMaps/2.2.8','Accept':'image/png,image/*,*/*'}});
  const contentType = res.headers.get('content-type') || 'image/png';
  const body = Buffer.from(await res.arrayBuffer());
  if (!res.ok) return json(res.status, {error:'Image proxy request failed', status:res.status, detail:body.toString('utf8').slice(0,500), url});
  if (!contentType.includes('image')) return json(502, {error:'Image proxy returned non-image data', contentType, detail:body.toString('utf8').slice(0,500), url});
  return {statusCode:200, headers:{'Content-Type':contentType,'Access-Control-Allow-Origin':'*','Cache-Control':`public, max-age=${maxAge}`}, body:body.toString('base64'), isBase64Encoded:true};
}

async function fetchJson(url){
  const res = await fetch(url, {headers: {'Accept':'application/json','User-Agent':'RBRTW-RealMaps/2.0'}});
  const text = await res.text();
  if (!res.ok) throw new Error(`NOAA metadata failed ${res.status}: ${text.slice(0,300)}`);
  return JSON.parse(text);
}

function json(statusCode, payload, maxAge=0){
  return {
    statusCode,
    headers: {'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control': maxAge ? `public, max-age=${maxAge}` : 'no-store'},
    body: JSON.stringify(payload)
  };
}
