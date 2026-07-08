'use strict';

const $ = (id) => document.getElementById(id);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

const RBRTW_BOUNDS = [-101.5, 27.5, -96.5, 31.0];
const MAP_SIZE = [1600, 850];

const BASEMAPS = {
  liberty: 'https://tiles.openfreemap.org/styles/liberty',
  positron: 'https://tiles.openfreemap.org/styles/positron',
  bright: 'https://tiles.openfreemap.org/styles/bright',
  dark: 'https://tiles.openfreemap.org/styles/dark',
  fiord: 'https://tiles.openfreemap.org/styles/fiord'
};

const BLANK_STYLE = {
  version: 8,
  sources: {},
  layers: [{id:'background', type:'background', paint:{'background-color':'#07101f'}}]
};

const PRODUCTS = {
  radar: {
    title: 'CLOUDS + RADAR SNAPSHOT', subtitle: 'LATEST NOAA MRMS BASE REFLECTIVITY', service:'radar', layers:'', sourceLabel:'NOAA MRMS radar base reflectivity MapServer',
    key:'radar', dayEnabled:false, hourEnabled:false
  },
  owClouds: {
    title: 'CLOUD COVER', subtitle: 'OPENWEATHER CLOUD TILE OVERLAY + NOAA/NWS CONTEXT', service:'openweatherTile', openWeatherLayer:'clouds_new', sourceLabel:'OpenWeather cloud map tiles via secure Netlify function',
    key:'clouds', dayEnabled:false, hourEnabled:false
  },
  owPrecip: {
    title: 'PRECIPITATION MAP', subtitle: 'OPENWEATHER PRECIPITATION TILE OVERLAY + NOAA/NWS CONTEXT', service:'openweatherTile', openWeatherLayer:'precipitation_new', sourceLabel:'OpenWeather precipitation map tiles via secure Netlify function',
    key:'owPrecip', dayEnabled:false, hourEnabled:false
  },
  owTemp: {
    title: 'TEMPERATURE MAP', subtitle: 'OPENWEATHER TEMPERATURE TILE OVERLAY + NOAA/NWS CONTEXT', service:'openweatherTile', openWeatherLayer:'temp_new', sourceLabel:'OpenWeather temperature map tiles via secure Netlify function',
    key:'temp', dayEnabled:false, hourEnabled:false
  },
  owPressure: {
    title: 'SURFACE PRESSURE', subtitle: 'OPENWEATHER PRESSURE TILE OVERLAY + NOAA/NWS CONTEXT', service:'openweatherTile', openWeatherLayer:'pressure_new', sourceLabel:'OpenWeather pressure map tiles via secure Netlify function',
    key:'pressure', dayEnabled:false, hourEnabled:false
  },
  owWind: {
    title: 'WIND MAP', subtitle: 'OPENWEATHER WIND TILE OVERLAY + NOAA/NWS CONTEXT', service:'openweatherTile', openWeatherLayer:'wind_new', sourceLabel:'OpenWeather wind map tiles via secure Netlify function',
    key:'wind', dayEnabled:false, hourEnabled:false
  },
  temp: {
    title: 'TEMPERATURES', subtitle: 'NDFD TEMPERATURE FORECAST', service:'ndfdTemp', layersByHour:{0:'show:4','00':'show:8','03':'show:12','06':'show:16','09':'show:20','12':'show:24','15':'show:28','18':'show:32','21':'show:36','24':'show:40'}, sourceLabel:'NOAA NDFD temperature image layer', key:'temp', dayEnabled:false, hourEnabled:true
  },
  heat: {
    title: 'HEAT INDEX', subtitle: 'NDFD APPARENT TEMPERATURE FORECAST', service:'ndfdTemp', layersByHour:{0:'show:45','00':'show:49','03':'show:53','06':'show:57','09':'show:61','12':'show:65','15':'show:69','18':'show:73','21':'show:77','24':'show:81'}, sourceLabel:'NOAA NDFD apparent temperature image layer', key:'heat', dayEnabled:false, hourEnabled:true
  },
  humidity: {
    title: 'RELATIVE HUMIDITY', subtitle: 'NDFD RELATIVE HUMIDITY FORECAST', service:'ndfdTemp', layersByHour:{0:'show:86','00':'show:90','03':'show:94','06':'show:98','09':'show:102','12':'show:106','15':'show:110','18':'show:114','21':'show:118','24':'show:122'}, sourceLabel:'NOAA NDFD relative humidity image layer', key:'humidity', dayEnabled:false, hourEnabled:true
  },
  maxTemp: {
    title: 'FORECAST HIGHS', subtitle: 'NDFD MAX TEMPERATURE DAY 1', service:'ndfdTemp', layers:'show:127', sourceLabel:'NOAA NDFD max temperature Day 1 image layer', key:'temp', dayEnabled:false, hourEnabled:false
  },
  minTemp: {
    title: 'FORECAST LOWS', subtitle: 'NDFD MIN TEMPERATURE DAY 1', service:'ndfdTemp', layers:'show:140', sourceLabel:'NOAA NDFD min temperature Day 1 image layer', key:'temp', dayEnabled:false, hourEnabled:false
  },
  spcCat: { title:'SEVERE STORM OUTLOOK', subtitle:'SPC CATEGORICAL OUTLOOK', service:'spc', spcKind:'cat', sourceLabel:'NOAA/SPC categorical outlook layer', key:'spc', dayEnabled:true, hourEnabled:false },
  spcTor: { title:'TORNADO OUTLOOK', subtitle:'SPC PROBABILISTIC TORNADO OUTLOOK', service:'spc', spcKind:'tor', sourceLabel:'NOAA/SPC tornado probability layer', key:'spcProb', dayEnabled:true, hourEnabled:false },
  spcHail: { title:'HAIL OUTLOOK', subtitle:'SPC PROBABILISTIC HAIL OUTLOOK', service:'spc', spcKind:'hail', sourceLabel:'NOAA/SPC hail probability layer', key:'spcProb', dayEnabled:true, hourEnabled:false },
  spcWind: { title:'DAMAGING WIND OUTLOOK', subtitle:'SPC PROBABILISTIC WIND OUTLOOK', service:'spc', spcKind:'wind', sourceLabel:'NOAA/SPC damaging wind probability layer', key:'spcProb', dayEnabled:true, hourEnabled:false },
  wpcChart: { title:'SURFACE FRONTS + WEATHER', subtitle:'WPC NATIONAL FORECAST CHART', service:'wpc', sourceLabel:'NOAA/WPC national forecast chart layers', key:'wpc', dayEnabled:true, hourEnabled:false },
  alerts: { title:'ACTIVE NWS ALERTS', subtitle:'NWS ACTIVE ALERT POLYGONS', service:'nwsAlerts', sourceLabel:'NWS active alerts GeoJSON API', key:'alerts', dayEnabled:false, hourEnabled:false }
};

const SPC_LAYERS = {
  cat: {1:'show:1', 2:'show:9', 3:'show:17', 4:'show:21', 5:'show:22', 6:'show:23', 7:'show:24', 8:'show:25'},
  tor: {1:'show:3', 2:'show:11'},
  hail:{1:'show:5', 2:'show:13'},
  wind:{1:'show:7', 2:'show:15'}
};

const WPC_LAYERS = {
  1:'show:1,2,3,4,5,6,7,8,9,10,11',
  2:'show:13,14,15,16,17,18,19,20,21,22,23',
  3:'show:25,26,27,28,29,30,31,32,33,34,35'
};

let map;
let currentProductKey = 'radar';
let currentWeatherBounds = RBRTW_BOUNDS.slice();
let currentWeatherUrl = '';
let currentLayerSource = '';
let pointValuesLoaded = false;

function init(){
  fillProductSelect();
  bindEvents();
  initMap();
  renderAllText();
  updateUiAvailability();
  fitStage();
}

function fillProductSelect(){
  const labels = {
    radar:'Clouds + Radar Snapshot / NOAA MRMS Radar',
    owClouds:'Cloud Cover / OpenWeather Tiles',
    owPrecip:'Precipitation / OpenWeather Tiles',
    owTemp:'Temperature / OpenWeather Tiles',
    owPressure:'Surface Pressure / OpenWeather Tiles',
    owWind:'Wind / OpenWeather Tiles',
    temp:'Temperatures / NOAA NDFD Temp', heat:'Heat Index / NOAA NDFD Apparent Temp', humidity:'Humidity / NOAA NDFD RH', maxTemp:'Forecast Highs / NOAA NDFD Max Temp', minTemp:'Forecast Lows / NOAA NDFD Min Temp',
    spcCat:'Severe Storm Outlook / SPC Categorical', spcTor:'Tornado Outlook / SPC Probability', spcHail:'Hail Outlook / SPC Probability', spcWind:'Damaging Wind Outlook / SPC Probability', wpcChart:'Surface Fronts + Weather / WPC Chart', alerts:'Active NWS Alerts / GeoJSON'
  };
  $('layerProduct').innerHTML = Object.keys(PRODUCTS).map(k => `<option value="${k}">${labels[k]}</option>`).join('');
}

function bindEvents(){
  window.addEventListener('resize', () => { fitStage(); setTimeout(() => map?.resize(), 50); });
  ['productTitle','productSubtitle','locationLabel'].forEach(id => $(id).addEventListener('input', renderAllText));
  $('applyMapView').addEventListener('click', applyMapView);
  $('fitEwx').addEventListener('click', fitEwx);
  $('basemapStyle').addEventListener('change', setBasemap);
  $('showBaseMap').addEventListener('change', setBasemap);
  $('showCities').addEventListener('change', drawCityLabels);
  $('showNoaaLayer').addEventListener('change', updateWeatherVisibility);
  $('layerOpacity').addEventListener('input', updateWeatherVisibility);
  $('layerProduct').addEventListener('change', productChanged);
  $('productDay').addEventListener('change', refreshWeatherLayer);
  $('ndfdHour').addEventListener('change', refreshWeatherLayer);
  $('refreshWeatherLayer').addEventListener('click', refreshWeatherLayer);
  $('showKey').addEventListener('change', drawKey);
  ['keyX','keyY','keyScale'].forEach(id => $(id).addEventListener('input', drawKey));
  $('showSourceBar').addEventListener('change', drawSourceBar);
  ['sourceX','sourceY','sourceW','sourceText'].forEach(id => $(id).addEventListener('input', drawSourceBar));
  $('applyCityLabels').addEventListener('click', () => { pointValuesLoaded = false; drawCityLabels(); });
  $('loadPointValues').addEventListener('click', loadPointValues);
  $('exportPng').addEventListener('click', exportPng);
}

function initMap(){
  if (!window.maplibregl) {
    showStatus('MapLibre did not load. Check CDN/network access.', true);
    return;
  }
  map = new maplibregl.Map({
    container: 'map',
    style: BASEMAPS.liberty,
    center: [-98.748, 29.481],
    zoom: 6.2,
    bearing: 0,
    pitch: 0,
    preserveDrawingBuffer: true,
    attributionControl: false
  });
  map.addControl(new maplibregl.NavigationControl({showCompass:false}), 'bottom-right');
  map.on('load', () => {
    fitEwx(false);
    refreshWeatherLayer();
  });
  map.on('moveend', drawCityLabels);
}

function setBasemap(){
  if (!map) return;
  const show = $('showBaseMap').checked;
  const style = show ? BASEMAPS[$('basemapStyle').value] : BLANK_STYLE;
  currentWeatherUrl = currentWeatherUrl || '';
  map.setStyle(style);
  map.once('styledata', () => {
    const p = PRODUCTS[currentProductKey];
    if (p?.service === 'openweatherTile') addOpenWeatherTileLayer(p.openWeatherLayer);
    else if (currentWeatherUrl && currentProductKey !== 'alerts') addWeatherImageLayer(currentWeatherUrl, currentWeatherBounds);
    if (currentProductKey === 'alerts') refreshWeatherLayer();
    drawCityLabels();
  });
}

function productChanged(){
  currentProductKey = $('layerProduct').value;
  const p = PRODUCTS[currentProductKey];
  $('productTitle').value = p.title;
  $('productSubtitle').value = p.subtitle;
  renderAllText();
  updateUiAvailability();
  refreshWeatherLayer();
}

function updateUiAvailability(){
  const p = PRODUCTS[currentProductKey];
  $('productDay').disabled = !p.dayEnabled;
  $('ndfdHour').disabled = !p.hourEnabled;
}

function applyMapView(){
  const lat = Number($('centerLat').value), lon = Number($('centerLon').value), zoom = Number($('zoomLevel').value), bearing = Number($('mapBearing').value);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(zoom)) { showStatus('Invalid center or zoom.', true); return; }
  map.flyTo({center:[lon,lat], zoom, bearing:Number.isFinite(bearing)?bearing:0, duration:450});
}

function fitEwx(animate=true){
  if (!map) return;
  map.fitBounds([[RBRTW_BOUNDS[0], RBRTW_BOUNDS[1]],[RBRTW_BOUNDS[2], RBRTW_BOUNDS[3]]], {padding:35, duration: animate ? 500 : 0});
}

function renderAllText(){
  $('titleOut').textContent = $('productTitle').value || '';
  $('subtitleOut').textContent = $('productSubtitle').value || '';
  $('locationOut').textContent = ($('locationLabel').value || '').toUpperCase();
  drawSourceBar();
}

function getCurrentBbox(){
  const b = map.getBounds();
  return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
}

function getProductLayerConfig(){
  const p = PRODUCTS[currentProductKey];
  const day = Number($('productDay').value || 1);
  const hour = $('ndfdHour').value;
  let layers = p.layers || '';
  if (p.layersByHour) layers = p.layersByHour[hour] || p.layersByHour[0];
  if (p.spcKind) layers = (SPC_LAYERS[p.spcKind] || {})[day] || '';
  if (currentProductKey === 'wpcChart') layers = WPC_LAYERS[day] || WPC_LAYERS[1];
  return {product:p, layers, day, hour};
}

async function refreshWeatherLayer(){
  if (!map) return;
  const {product, layers, day, hour} = getProductLayerConfig();
  hideStatusBanner();
  setLayerStatus('Requesting real weather layer...');
  currentWeatherBounds = getCurrentBbox();
  try {
    removeWeatherLayers();
    if (product.service === 'openweatherTile') {
      await assertOpenWeatherReady();
      currentWeatherUrl = '';
      currentLayerSource = product.sourceLabel;
      addOpenWeatherTileLayer(product.openWeatherLayer);
      $('loadedOut').textContent = `OPENWEATHER LOADED ${timeStamp()}`;
      setLayerStatus(`Loaded real OpenWeather tile layer: ${product.openWeatherLayer}. NOAA/NWS layers remain available separately.`);
      drawKey(); drawSourceBar(); drawCityLabels();
      return;
    }
    if (currentProductKey === 'alerts') {
      await loadAlertLayer();
      currentLayerSource = product.sourceLabel;
      $('loadedOut').textContent = `NWS ALERTS ${timeStamp()}`;
      setLayerStatus('Loaded NWS active alert polygons for Texas.');
      drawKey(); drawSourceBar(); drawCityLabels();
      return;
    }
    if (product.spcKind && !layers) {
      throw new Error(`${product.title} only has separate tornado/hail/wind probability layers for SPC Day 1 and Day 2. Choose categorical for Day 3–8.`);
    }
    const bbox = currentWeatherBounds.map(v => Number(v).toFixed(6)).join(',');
    const params = new URLSearchParams({op:'export', service:product.service, bbox, size:MAP_SIZE.join(','), transparent:'true'});
    if (layers) params.set('layers', layers);
    const url = `/.netlify/functions/noaa-map?${params.toString()}&cache=${Date.now()}`;
    await validateImage(url);
    currentWeatherUrl = url;
    currentLayerSource = product.sourceLabel;
    addWeatherImageLayer(url, currentWeatherBounds);
    $('loadedOut').textContent = `LOADED ${timeStamp()}`;
    setLayerStatus(`Loaded real layer: ${product.sourceLabel}${layers ? ` (${layers})` : ' (default visible layers)'}.`);
    drawKey(); drawSourceBar(); drawCityLabels();
  } catch (err) {
    console.error(err);
    currentWeatherUrl = '';
    currentLayerSource = product.sourceLabel;
    showStatusBanner(`Layer failed: ${err.message}`);
    setLayerStatus(`Layer failed: ${err.message}`);
    drawKey(); drawSourceBar(); drawCityLabels();
  }
}

function addWeatherImageLayer(url, bbox){
  if (!map || !map.isStyleLoaded()) return;
  removeWeatherImageOnly();
  const [w,s,e,n] = bbox;
  map.addSource('weather-image-source', {type:'image', url, coordinates:[[w,n],[e,n],[e,s],[w,s]]});
  map.addLayer({id:'weather-image-layer', type:'raster', source:'weather-image-source', paint:{'raster-opacity':Number($('layerOpacity').value || 0.72), 'raster-fade-duration':0}});
  updateWeatherVisibility();
}

async function assertOpenWeatherReady(){
  const res = await fetch('/.netlify/functions/openweather?op=status', {headers:{Accept:'application/json'}});
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ready) {
    throw new Error(data.error || 'OpenWeather function is not ready. Add OPENWEATHER_API_KEY in Netlify environment variables and redeploy.');
  }
}

function addOpenWeatherTileLayer(layerName){
  if (!map || !map.isStyleLoaded()) return;
  removeOpenWeatherLayerOnly();
  const encodedLayer = encodeURIComponent(layerName);
  map.addSource('openweather-source', {
    type:'raster',
    tiles:[`/.netlify/functions/openweather?op=tile&layer=${encodedLayer}&z={z}&x={x}&y={y}`],
    tileSize:256,
    attribution:'OpenWeather'
  });
  map.addLayer({
    id:'openweather-layer',
    type:'raster',
    source:'openweather-source',
    paint:{'raster-opacity':Number($('layerOpacity').value || 0.72), 'raster-fade-duration':0}
  });
  updateWeatherVisibility();
}

function removeWeatherImageOnly(){
  if (map.getLayer('weather-image-layer')) map.removeLayer('weather-image-layer');
  if (map.getSource('weather-image-source')) map.removeSource('weather-image-source');
}

function removeOpenWeatherLayerOnly(){
  if (map.getLayer('openweather-layer')) map.removeLayer('openweather-layer');
  if (map.getSource('openweather-source')) map.removeSource('openweather-source');
}

function removeWeatherLayers(){
  removeWeatherImageOnly();
  removeOpenWeatherLayerOnly();
  if (map.getLayer('nws-alerts-fill')) map.removeLayer('nws-alerts-fill');
  if (map.getLayer('nws-alerts-line')) map.removeLayer('nws-alerts-line');
  if (map.getSource('nws-alerts-source')) map.removeSource('nws-alerts-source');
}

function updateWeatherVisibility(){
  const visible = $('showNoaaLayer').checked ? 'visible' : 'none';
  if (map?.getLayer('weather-image-layer')) {
    map.setLayoutProperty('weather-image-layer','visibility', visible);
    map.setPaintProperty('weather-image-layer','raster-opacity', Number($('layerOpacity').value || 0.72));
  }
  if (map?.getLayer('openweather-layer')) {
    map.setLayoutProperty('openweather-layer','visibility', visible);
    map.setPaintProperty('openweather-layer','raster-opacity', Number($('layerOpacity').value || 0.72));
  }
  ['nws-alerts-fill','nws-alerts-line'].forEach(id => {
    if (map?.getLayer(id)) map.setLayoutProperty(id,'visibility', visible);
  });
}

async function loadAlertLayer(){
  const res = await fetch('https://api.weather.gov/alerts/active?area=TX', {headers:{Accept:'application/geo+json'}});
  if (!res.ok) throw new Error(`NWS alerts API returned ${res.status}`);
  const data = await res.json();
  const filtered = filterFeaturesToBbox(data, getCurrentBbox());
  if (!filtered.features.length) showStatusBanner('No active Texas alert polygons intersect the current map view.');
  map.addSource('nws-alerts-source', {type:'geojson', data:filtered});
  map.addLayer({id:'nws-alerts-fill', type:'fill', source:'nws-alerts-source', paint:{'fill-color':['match',['get','severity'],'Extreme','#ff00ff','Severe','#ff2222','Moderate','#ff9d00','Minor','#ffe23a','#00d2ff'], 'fill-opacity':0.38}});
  map.addLayer({id:'nws-alerts-line', type:'line', source:'nws-alerts-source', paint:{'line-color':'#ffffff','line-width':3}});
}

function filterFeaturesToBbox(fc, bbox){
  const [w,s,e,n] = bbox;
  const features = (fc.features || []).filter(f => {
    if (!f.geometry) return false;
    const b = featureBbox(f.geometry.coordinates.flat(Infinity));
    return b && !(b.e < w || b.w > e || b.n < s || b.s > n);
  });
  return {type:'FeatureCollection', features};
}

function featureBbox(nums){
  const lons=[], lats=[];
  for (let i=0;i<nums.length-1;i+=2) { const lon=Number(nums[i]), lat=Number(nums[i+1]); if (Number.isFinite(lon) && Number.isFinite(lat)) {lons.push(lon); lats.push(lat);} }
  if (!lons.length) return null;
  return {w:Math.min(...lons), e:Math.max(...lons), s:Math.min(...lats), n:Math.max(...lats)};
}

function validateImage(url){
  return new Promise((resolve,reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => (img.naturalWidth > 1 && img.naturalHeight > 1) ? resolve() : reject(new Error('NOAA image was empty.'));
    img.onerror = () => reject(new Error('NOAA image request failed or returned non-image data.'));
    img.src = url;
  });
}

function setLayerStatus(msg){ $('layerStatus').textContent = msg; }
function showStatusBanner(msg){ const el=$('statusBanner'); el.textContent=msg; el.classList.remove('hidden'); }
function hideStatusBanner(){ $('statusBanner').classList.add('hidden'); }
function timeStamp(){ return new Date().toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).toUpperCase(); }

function drawKey(){
  const box = $('keyBox');
  box.style.display = $('showKey').checked ? 'block' : 'none';
  box.style.left = `${$('keyX').value}px`;
  box.style.top = `${$('keyY').value}px`;
  box.style.transform = `scale(${$('keyScale').value})`;
  if (!$('showKey').checked) return;
  const key = PRODUCTS[currentProductKey].key;
  box.innerHTML = keyHtml(key);
}

function keyHtml(key){
  if (key === 'radar') return `<div class="legendCard"><div class="legendTitle">RADAR REFLECTIVITY</div><div class="legendScale"></div><div class="legendInline"><span>LIGHT</span><span style="margin-left:auto">HEAVY</span></div></div>`;
  if (key === 'clouds') return `<div class="legendCard"><div class="legendTitle">CLOUD COVER</div>${legendRows([['#d7dde6','Lower'],['#adb7c4','Scattered'],['#7f8c99','Broken'],['#525d69','Overcast']])}</div>`;
  if (key === 'owPrecip') return `<div class="legendCard"><div class="legendTitle">PRECIPITATION</div><div class="legendScale"></div><div class="legendInline"><span>LIGHT</span><span style="margin-left:auto">HEAVY</span></div></div>`;
  if (key === 'pressure') return `<div class="legendCard"><div class="legendTitle">PRESSURE</div>${legendRows([['#375cff','Lower'],['#41c7ff','Below avg'],['#f3f0a2','Average'],['#f0873f','Higher'],['#d63232','High']])}</div>`;
  if (key === 'wind') return `<div class="legendCard"><div class="legendTitle">WIND</div>${legendRows([['#8fe6ff','Light'],['#5cf06b','Breezy'],['#fff04d','Windy'],['#ff8e25','Strong'],['#d22bff','Severe']])}</div>`;
  if (key === 'temp') return `<div class="legendCard"><div class="legendTitle">TEMPERATURE</div>${legendRows([['#59c7ff','Cooler'],['#5be25b','Mild'],['#ffd84a','Warm'],['#ff832d','Hot'],['#c71328','Very Hot']])}</div>`;
  if (key === 'heat') return `<div class="legendCard"><div class="legendTitle">APPARENT TEMP</div>${legendRows([['#7cecff','Lower risk'],['#5bf06b','Hot'],['#fff04d','Dangerous'],['#ff7d2d','High'],['#cc1a82','Extreme']])}</div>`;
  if (key === 'humidity') return `<div class="legendCard"><div class="legendTitle">RELATIVE HUMIDITY</div>${legendRows([['#e7d7a5','Dry'],['#95df88','Comfortable'],['#28c76f','Humid'],['#109b63','Very Humid'],['#08603f','Oppressive']])}</div>`;
  if (key === 'spc') return `<div class="legendCard"><div class="legendTitle">SPC OUTLOOK</div><div class="legendInline"><span class="legendDot" style="background:#58c65d"></span>Marginal <span class="legendDot" style="background:#f2ef54"></span>Slight <span class="legendDot" style="background:#f79a2a"></span>Enhanced <span class="legendDot" style="background:#e85c61"></span>Moderate <span class="legendDot" style="background:#d84fd6"></span>High</div></div>`;
  if (key === 'spcProb') return `<div class="legendCard"><div class="legendTitle">SPC PROBABILITY</div><div class="legendScale"></div><div class="legendInline"><span>LOW</span><span>MODERATE</span><span style="margin-left:auto">HIGH</span></div></div>`;
  if (key === 'wpc') return `<div class="legendCard"><div class="legendTitle">WPC FORECAST CHART</div>${legendRows([['#1d56ff','Cold front'],['#e73333','Warm front'],['#a94cff','Occluded'],['#1fcf57','Rain / storms'],['#ffffff','Winter areas']])}</div>`;
  if (key === 'alerts') return `<div class="legendCard"><div class="legendTitle">NWS ALERTS</div>${legendRows([['#ff00ff','Extreme'],['#ff2222','Severe'],['#ff9d00','Moderate'],['#ffe23a','Minor'],['#00d2ff','Other']])}</div>`;
  return '';
}
function legendRows(rows){ return rows.map(([c,t])=>`<div class="legendRow"><div class="legendSwatch" style="background:${c}"></div><div class="legendText">${escapeHtml(t)}</div></div>`).join(''); }

function drawSourceBar(){
  const bar = $('sourceBar');
  bar.style.display = $('showSourceBar').checked ? 'block' : 'none';
  bar.style.left = `${$('sourceX').value}px`;
  bar.style.top = `${$('sourceY').value}px`;
  bar.style.width = `${$('sourceW').value}px`;
  const text = $('sourceText').value || '';
  bar.textContent = currentLayerSource ? `${text} Current layer: ${currentLayerSource}.` : text;
}

function parseCityLines(){
  return $('cityValues').value.split(/\n+/).map(line => {
    const [name,lat,lon,value] = line.split('|').map(s => (s||'').trim());
    const la = Number(lat), lo = Number(lon);
    if (!name || !Number.isFinite(la) || !Number.isFinite(lo)) return null;
    return {name, lat:la, lon:lo, value:value || ''};
  }).filter(Boolean);
}

function drawCityLabels(){
  const layer = $('cityLayer');
  layer.innerHTML = '';
  if (!$('showCities').checked || !map) return;
  const cities = parseCityLines();
  for (const c of cities) {
    const p = map.project([c.lon, c.lat]);
    if (p.x < -60 || p.y < -60 || p.x > $('mapStage').clientWidth+60 || p.y > $('mapStage').clientHeight+60) continue;
    const div = document.createElement('div');
    div.className = 'cityLabel';
    div.style.left = `${p.x}px`; div.style.top = `${p.y}px`;
    div.innerHTML = c.value ? `<div class="value">${escapeHtml(c.value)}</div><div class="name">${escapeHtml(c.name)}</div>` : `<div class="name">${escapeHtml(c.name)}</div>`;
    layer.appendChild(div);
  }
}

async function loadPointValues(){
  const cities = parseCityLines();
  setLayerStatus('Loading NWS point temperatures for city labels...');
  const out = [];
  for (const c of cities) {
    try {
      const point = await fetchJson(`https://api.weather.gov/points/${c.lat.toFixed(4)},${c.lon.toFixed(4)}`);
      const hourlyUrl = point.properties?.forecastHourly;
      if (!hourlyUrl) throw new Error('No hourly forecast URL');
      const hourly = await fetchJson(hourlyUrl);
      const temp = hourly.properties?.periods?.[0]?.temperature;
      out.push(`${c.name}|${c.lat}|${c.lon}|${Number.isFinite(temp)?Math.round(temp)+'°':''}`);
    } catch (err) {
      out.push(`${c.name}|${c.lat}|${c.lon}|`);
    }
  }
  $('cityValues').value = out.join('\n');
  pointValuesLoaded = true;
  drawCityLabels();
  setLayerStatus('Loaded NWS point values where available. Blank labels mean the API did not return a value.');
}

async function fetchJson(url){
  const res = await fetch(url, {headers:{Accept:'application/json, application/geo+json'}});
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function exportPng(){
  if (!map) return;
  const cover = $('exportCover');
  document.body.classList.add('exporting');
  cover.style.display = 'flex';
  $('exportStatus').textContent = 'Rendering live map canvas to PNG...';
  try {
    await waitForMapIdle();
    const mapCanvas = map.getCanvas();
    const mapImg = await loadImage(mapCanvas.toDataURL('image/png'));
    const canvas = document.createElement('canvas');
    canvas.width = 1920; canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    drawExportBackground(ctx);
    drawHeader(ctx);
    ctx.save();
    ctx.beginPath();
    ctx.rect(26,134,1868,902);
    ctx.clip();
    ctx.drawImage(mapImg,26,134,1868,902);
    ctx.restore();
    drawMapFrame(ctx);
    if ($('showKey').checked) drawKeyToCanvas(ctx);
    if ($('showCities').checked) drawCitiesToCanvas(ctx);
    if ($('showSourceBar').checked) drawSourceToCanvas(ctx);
    drawFooter(ctx);
    await downloadCanvas(canvas, `RBRTW-real-map-${slug(PRODUCTS[currentProductKey].title)}-${new Date().toISOString().slice(0,10)}.png`);
    $('exportStatus').textContent = 'PNG exported.';
  } catch (err) {
    console.error(err);
    $('exportStatus').textContent = `Export failed: ${err.message}`;
    setLayerStatus(`Export failed: ${err.message}`);
  } finally {
    document.body.classList.remove('exporting');
    cover.style.display = '';
  }
}

function drawExportBackground(ctx){
  const g = ctx.createLinearGradient(0,0,1920,1080); g.addColorStop(0,'#061020'); g.addColorStop(.45,'#0b1d3b'); g.addColorStop(1,'#230d45'); ctx.fillStyle=g; ctx.fillRect(0,0,1920,1080);
}
function drawHeader(ctx){
  const g = ctx.createLinearGradient(0,0,1920,0); g.addColorStop(0,'#020814'); g.addColorStop(.35,'#105bff'); g.addColorStop(.75,'#6f2cff'); g.addColorStop(1,'#020814'); ctx.fillStyle=g; ctx.fillRect(0,0,1920,134); ctx.fillStyle='rgba(255,255,255,.96)'; ctx.fillRect(0,127,1920,7);
  roundRect(ctx,32,18,186,86,17, gradient(ctx,32,18,218,104, ['#105bff','#6f2cff','#cf2cff']));
  text(ctx,'RBRTW',125,62,36,'center','white',1000); text(ctx,'AUTO WEATHER STUDIO',125,84,11,'center','#e8eeff',1000);
  shadow(ctx,true); text(ctx,$('productTitle').value,252,64,64,'left','white',1000); shadow(ctx,false); text(ctx,$('productSubtitle').value,252,99,23,'left','#d9e8ff',1000);
  text(ctx,($('locationLabel').value||'').toUpperCase(),1865,50,23,'right','white',1000); text(ctx,$('loadedOut').textContent||'',1865,77,15,'right','#bad5ff',1000);
}
function drawMapFrame(ctx){ ctx.strokeStyle='rgba(255,255,255,.9)'; ctx.lineWidth=4; ctx.strokeRect(26,134,1868,902); }
function drawFooter(ctx){ ctx.fillStyle='rgba(2,7,15,.94)'; ctx.fillRect(0,1036,1920,44); ctx.fillStyle='rgba(255,255,255,.76)'; ctx.fillRect(0,1036,1920,4); text(ctx,'Generated by RBRTW / EWX Real Maps 2.0',34,1064,16,'left','#d5e4ff',900); text(ctx,'Layer stack export',1886,1064,16,'right','#a9c0e2',900); }

function drawKeyToCanvas(ctx){
  const key = PRODUCTS[currentProductKey].key; const x=Number($('keyX').value)+26, y=Number($('keyY').value)+134, s=Number($('keyScale').value);
  ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
  ctx.fillStyle='rgba(2,8,20,.86)'; ctx.strokeStyle='rgba(255,255,255,.55)'; ctx.lineWidth=3; ctx.fillRect(0,0,230,150); ctx.strokeRect(0,0,230,150);
  text(ctx,legendCanvasTitle(key),10,26,18,'left','white',1000);
  const rows = legendCanvasRows(key);
  let yy=42;
  for (const [c,t] of rows){ ctx.fillStyle=c; ctx.fillRect(10,yy,42,24); ctx.fillStyle='rgba(255,255,255,.90)'; ctx.fillRect(52,yy,165,24); text(ctx,t,62,yy+17,15,'left','#061020',1000); yy+=24; }
  if (!rows.length){ const g=ctx.createLinearGradient(10,52,220,52); ['#55e455','#f8f158','#ff8e25','#ff2a2a','#d22bff'].forEach((c,i)=>g.addColorStop(i/4,c)); ctx.fillStyle=g; ctx.fillRect(10,54,210,30); text(ctx,'LIGHT',10,105,16,'left','white',1000); text(ctx,'HEAVY',220,105,16,'right','white',1000); }
  ctx.restore();
}
function legendCanvasTitle(key){ return ({radar:'RADAR REFLECTIVITY',clouds:'CLOUD COVER',owPrecip:'PRECIPITATION',pressure:'PRESSURE',wind:'WIND',temp:'TEMPERATURE',heat:'APPARENT TEMP',humidity:'RELATIVE HUMIDITY',spc:'SPC OUTLOOK',spcProb:'SPC PROBABILITY',wpc:'WPC FORECAST',alerts:'NWS ALERTS'})[key]||'KEY'; }
function legendCanvasRows(key){
  const m = {clouds:[['#d7dde6','Lower'],['#adb7c4','Scattered'],['#7f8c99','Broken'],['#525d69','Overcast']], pressure:[['#375cff','Lower'],['#41c7ff','Below avg'],['#f3f0a2','Average'],['#f0873f','Higher'],['#d63232','High']], wind:[['#8fe6ff','Light'],['#5cf06b','Breezy'],['#fff04d','Windy'],['#ff8e25','Strong'],['#d22bff','Severe']], temp:[['#59c7ff','Cooler'],['#5be25b','Mild'],['#ffd84a','Warm'],['#ff832d','Hot'],['#c71328','Very Hot']], heat:[['#7cecff','Lower risk'],['#5bf06b','Hot'],['#fff04d','Dangerous'],['#ff7d2d','High'],['#cc1a82','Extreme']], humidity:[['#e7d7a5','Dry'],['#95df88','Comfortable'],['#28c76f','Humid'],['#109b63','Very Humid'],['#08603f','Oppressive']], spc:[['#58c65d','Marginal'],['#f2ef54','Slight'],['#f79a2a','Enhanced'],['#e85c61','Moderate'],['#d84fd6','High']], wpc:[['#1d56ff','Cold front'],['#e73333','Warm front'],['#a94cff','Occluded'],['#1fcf57','Rain / storms'],['#ffffff','Winter']], alerts:[['#ff00ff','Extreme'],['#ff2222','Severe'],['#ff9d00','Moderate'],['#ffe23a','Minor'],['#00d2ff','Other']]};
  return m[key] || [];
}
function drawCitiesToCanvas(ctx){
  for (const c of parseCityLines()){
    const p = map.project([c.lon,c.lat]); const x=26+p.x, y=134+p.y; if(x<0||x>1920||y<120||y>1036) continue;
    shadow(ctx,true); if(c.value) text(ctx,c.value,x,y-5,44,'center','white',1000); text(ctx,c.name,x,y+22,16,'center','white',1000); shadow(ctx,false);
  }
}
function drawSourceToCanvas(ctx){
  const x=26+Number($('sourceX').value), y=134+Number($('sourceY').value), w=Number($('sourceW').value); const msg=$('sourceBar').textContent;
  ctx.fillStyle='rgba(0,0,0,.72)'; roundPath(ctx,x,y,w,34,6); ctx.fill(); ctx.fillStyle='#89e9ff'; ctx.fillRect(x,y,7,34); text(ctx,msg,x+18,y+23,18,'left','white',900);
}

function waitForMapIdle(){ return new Promise(resolve => map.once('idle', () => setTimeout(resolve, 100))); }
function loadImage(src){ return new Promise((resolve,reject)=>{ const img=new Image(); img.onload=()=>resolve(img); img.onerror=()=>reject(new Error('Could not read map canvas image. Cross-origin tiles may be blocking export.')); img.src=src; }); }
function downloadCanvas(canvas, filename){ return new Promise((resolve,reject)=>{ canvas.toBlob(blob=>{ if(!blob) return reject(new Error('Could not create PNG blob.')); const a=document.createElement('a'); const url=URL.createObjectURL(blob); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>{URL.revokeObjectURL(url); resolve();},250); },'image/png'); }); }
function text(ctx,str,x,y,size,align,color,weight=900){ ctx.font=`${weight} ${size}px Arial, Helvetica, sans-serif`; ctx.textAlign=align; ctx.textBaseline='alphabetic'; ctx.fillStyle=color; ctx.fillText(String(str||''),x,y); }
function shadow(ctx,on){ if(on){ctx.shadowColor='rgba(0,0,0,.75)';ctx.shadowBlur=8;ctx.shadowOffsetY=4;}else{ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;} }
function gradient(ctx,x1,y1,x2,y2,colors){ const g=ctx.createLinearGradient(x1,y1,x2,y2); colors.forEach((c,i)=>g.addColorStop(i/(colors.length-1),c)); return g; }
function roundRect(ctx,x,y,w,h,r,fill){ ctx.fillStyle=fill; roundPath(ctx,x,y,w,h,r); ctx.fill(); }
function roundPath(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function fitStage(){ const vp=$('stageViewport'), fr=$('slideFrame'); const s=Math.min((vp.clientWidth-36)/1920,(vp.clientHeight-36)/1080,1); fr.style.transform=`translate(-50%,-50%) scale(${s})`; fr.dataset.scale=s; }
function slug(s){ return String(s||'map').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
function escapeHtml(v){ return String(v??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

init();
