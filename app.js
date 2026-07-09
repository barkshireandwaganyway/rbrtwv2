'use strict';

const $ = (id) => document.getElementById(id);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

const RBRTW_BOUNDS = [-101.5, 27.5, -96.5, 31.0];
const MAP_SIZE = [1868, 902];

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
  owHeat: {
    title: 'FEELS LIKE / HEAT INDEX', subtitle: 'OPENWEATHER TEMPERATURE TILE + POINT FEELS-LIKE VALUES', service:'openweatherTile', openWeatherLayer:'temp_new', sourceLabel:'OpenWeather temperature tiles and current feels-like values via secure Netlify function',
    key:'heat', dayEnabled:false, hourEnabled:false
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


const TEXAS_CITIES = [
  ['San Antonio',29.424,-98.494,1],['Austin',30.267,-97.743,1],['Dallas',32.776,-96.797,1],['Fort Worth',32.755,-97.330,1],['Houston',29.760,-95.369,1],['Corpus Christi',27.801,-97.397,1],['Laredo',27.506,-99.507,1],['Del Rio',29.370,-100.896,1],['San Angelo',31.464,-100.437,1],['Amarillo',35.222,-101.831,1],['Lubbock',33.577,-101.855,1],['Wichita Falls',33.913,-98.493,1],['El Paso',31.761,-106.485,1],['Waco',31.549,-97.147,2],['College Station',30.628,-96.334,2],['Victoria',28.805,-97.004,2],['Brownsville',25.901,-97.497,2],['McAllen',26.204,-98.230,2],['Midland',31.997,-102.078,2],['Odessa',31.845,-102.367,2],['Abilene',32.448,-99.733,2],['Killeen',31.117,-97.727,2],['Tyler',32.351,-95.301,2],['Longview',32.500,-94.740,2],['Beaumont',30.080,-94.126,2],['Galveston',29.301,-94.797,2],['Texarkana',33.425,-94.047,2],['Denton',33.214,-97.133,2],['New Braunfels',29.704,-98.124,2],['San Marcos',29.884,-97.941,2],['Seguin',29.568,-97.965,2],['Boerne',29.795,-98.732,3],['Hondo',29.347,-99.141,3],['Uvalde',29.209,-99.786,3],['Eagle Pass',28.709,-100.499,3],['Cotulla',28.436,-99.236,3],['Carrizo Springs',28.522,-99.860,3],['Pleasanton',28.967,-98.478,3],['Beeville',28.401,-97.748,3],['Alice',27.752,-98.070,3],['Kingsville',27.516,-97.856,3],['Rockport',28.020,-97.054,3],['Port Aransas',27.833,-97.061,3],['Fredericksburg',30.275,-98.872,3],['Kerrville',30.047,-99.140,3],['Junction',30.489,-99.772,3],['Marble Falls',30.578,-98.272,3],['Georgetown',30.633,-97.677,3],['Temple',31.098,-97.342,3],['Brenham',30.166,-96.397,3],['Huntsville',30.723,-95.551,3],['Lufkin',31.338,-94.729,3],['Nacogdoches',31.603,-94.655,3],['Port Arthur',29.885,-93.940,3],['Sherman',33.635,-96.609,3],['Paris',33.661,-95.555,3],['Greenville',33.138,-96.110,4],['Gainesville',33.625,-97.133,4],['Weatherford',32.759,-97.797,4],['Mineral Wells',32.809,-98.112,4],['Stephenville',32.220,-98.202,4],['Brownwood',31.709,-98.991,4],['Big Spring',32.250,-101.478,4],['Plainview',34.185,-101.706,4],['Pampa',35.537,-100.959,4],['Borger',35.667,-101.397,4],['Childress',34.426,-100.204,4],['Palestine',31.762,-95.631,4],['Bay City',28.982,-95.969,4],['Freeport',28.954,-95.359,4],['Harlingen',26.190,-97.696,4],['Pharr',26.194,-98.183,4],['Mission',26.216,-98.325,4],['Edinburg',26.302,-98.164,4],['Hillsboro',32.010,-97.130,5],['Corsicana',32.095,-96.468,5],['Lampasas',31.064,-98.181,5],['Mason',30.749,-99.230,5],['Llano',30.759,-98.675,5],['Burnet',30.758,-98.228,5],['Crystal City',28.677,-99.828,5],['Hebbronville',27.307,-98.681,5],['Falfurrias',27.227,-98.145,5],['Raymondville',26.481,-97.783,5]
].map(([name,lat,lon,p]) => ({name,lat,lon,p}));

const USA_CITIES = [
  ['New York',40.713,-74.006,1],['Los Angeles',34.052,-118.244,1],['Chicago',41.878,-87.630,1],['Houston',29.760,-95.369,1],['Phoenix',33.448,-112.074,1],['Philadelphia',39.952,-75.165,1],['San Antonio',29.424,-98.494,1],['San Diego',32.715,-117.161,1],['Dallas',32.776,-96.797,1],['San Jose',37.338,-121.886,1],['Austin',30.267,-97.743,1],['Jacksonville',30.332,-81.656,1],['Fort Worth',32.755,-97.330,1],['Columbus',39.961,-82.999,1],['Charlotte',35.227,-80.843,1],['San Francisco',37.775,-122.419,1],['Indianapolis',39.768,-86.158,1],['Seattle',47.606,-122.332,1],['Denver',39.739,-104.990,1],['Washington',38.907,-77.037,1],['Boston',42.360,-71.059,1],['El Paso',31.761,-106.485,2],['Nashville',36.162,-86.781,2],['Detroit',42.331,-83.046,2],['Oklahoma City',35.468,-97.516,2],['Portland',45.515,-122.679,2],['Las Vegas',36.170,-115.140,2],['Memphis',35.150,-90.049,2],['Louisville',38.253,-85.758,2],['Baltimore',39.290,-76.612,2],['Milwaukee',43.039,-87.906,2],['Albuquerque',35.084,-106.650,2],['Tucson',32.222,-110.974,2],['Fresno',36.738,-119.787,2],['Sacramento',38.581,-121.494,2],['Kansas City',39.099,-94.578,2],['Atlanta',33.749,-84.388,2],['Miami',25.761,-80.192,2],['Raleigh',35.779,-78.638,2],['Omaha',41.256,-95.934,2],['Minneapolis',44.977,-93.265,2],['New Orleans',29.951,-90.072,2],['Cleveland',41.499,-81.694,2],['Tampa',27.951,-82.457,2],['Orlando',28.538,-81.379,2],['St. Louis',38.627,-90.199,2],['Pittsburgh',40.441,-79.996,2],['Cincinnati',39.103,-84.512,3],['Salt Lake City',40.761,-111.891,3],['Birmingham',33.518,-86.810,3],['Tulsa',36.154,-95.992,3],['Wichita',37.687,-97.330,3],['Des Moines',41.586,-93.625,3],['Little Rock',34.746,-92.290,3],['Knoxville',35.961,-83.920,3],['Richmond',37.541,-77.436,3],['Norfolk',36.850,-76.286,3],['Charleston SC',32.777,-79.931,3],['Savannah',32.080,-81.091,3],['Mobile',30.695,-88.040,3],['Pensacola',30.421,-87.216,3],['Jackson MS',32.299,-90.185,3],['Shreveport',32.525,-93.750,3],['Baton Rouge',30.451,-91.187,3],['Corpus Christi',27.801,-97.397,3],['Lubbock',33.577,-101.855,3],['Amarillo',35.222,-101.831,3],['Omaha',41.256,-95.934,3],['Boise',43.615,-116.202,3],['Spokane',47.658,-117.426,3],['Reno',39.530,-119.814,3],['Flagstaff',35.198,-111.651,3],['Rapid City',44.081,-103.231,4],['Bismarck',46.808,-100.784,4],['Fargo',46.877,-96.789,4],['Sioux Falls',43.546,-96.731,4],['Billings',45.783,-108.501,4],['Cheyenne',41.140,-104.820,4],['Colorado Springs',38.833,-104.822,4],['Santa Fe',35.687,-105.938,4],['Roswell',33.394,-104.523,4],['Grand Junction',39.064,-108.550,4],['Eugene',44.052,-123.087,4],['Medford',42.326,-122.875,4],['Bakersfield',35.373,-119.019,4],['Palm Springs',33.830,-116.545,4],['Yuma',32.692,-114.627,4],['Duluth',46.786,-92.100,4],['Green Bay',44.513,-88.014,4],['Grand Rapids',42.963,-85.668,4],['Buffalo',42.887,-78.878,4],['Albany',42.653,-73.756,4],['Hartford',41.765,-72.673,4],['Providence',41.824,-71.412,4],['Portland ME',43.659,-70.256,4],['Burlington',44.476,-73.212,4],['Manchester',42.995,-71.454,4]
].map(([name,lat,lon,p]) => ({name,lat,lon,p}));

const CITY_SETS = {
  custom: null,
  texasCore: TEXAS_CITIES.filter(c => c.p <= 2),
  texasExpanded: TEXAS_CITIES,
  usaCore: USA_CITIES.filter(c => c.p <= 2),
  usaExpanded: USA_CITIES
};

let map;
let currentProductKey = 'radar';
let currentWeatherBounds = RBRTW_BOUNDS.slice();
let currentWeatherUrl = '';
let currentLayerSource = '';
let pointValuesLoaded = false;
let cityValueMap = new Map();
let stationObservations = [];
let stationValueMap = new Map();
let mapOverlays = [];
let selectedOverlayId = null;

function init(){
  fillProductSelect();
  bindEvents();
  initMap();
  renderAllText();
  updateUiAvailability();
  fitStage();
  renderMapOverlays();
}

function fillProductSelect(){
  const labels = {
    radar:'Clouds + Radar Snapshot / NOAA MRMS Radar',
    owClouds:'Cloud Cover / OpenWeather Tiles',
    owPrecip:'Precipitation / OpenWeather Tiles',
    owTemp:'Temperature / OpenWeather Tiles', owHeat:'Feels Like / Heat Index / OpenWeather',
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
  $('showBasemapLabels')?.addEventListener('change', applyBasemapLabelVisibility);
  $('showLoadedTime')?.addEventListener('change', () => setHeaderLoadedText(''));
  $('showCities').addEventListener('change', drawCityLabels);
  $('showNoaaLayer').addEventListener('change', updateWeatherVisibility);
  $('layerOpacity').addEventListener('input', updateWeatherVisibility);
  $('layerProduct').addEventListener('change', productChanged);
  $('productDay').addEventListener('change', refreshWeatherLayer);
  $('ndfdHour').addEventListener('change', refreshWeatherLayer);
  $('alertScope')?.addEventListener('change', () => { if (currentProductKey === 'alerts') refreshWeatherLayer(); });
  $('refreshWeatherLayer').addEventListener('click', refreshWeatherLayer);
  $('showKey').addEventListener('change', drawKey);
  ['keyX','keyY','keyScale'].forEach(id => $(id).addEventListener('input', drawKey));
  $('showSourceBar').addEventListener('change', drawSourceBar);
  ['sourceX','sourceY','sourceW','sourceText'].forEach(id => $(id).addEventListener('input', drawSourceBar));
  ['cityPreset','cityDensity','cityValueSize','cityNameSize','cityTextColor','cityHaloColor','cityValueDisplay','cityValueSource'].forEach(id => $(id)?.addEventListener('input', drawCityLabels));
  $('applyCityLabels').addEventListener('click', () => { pointValuesLoaded = false; cityValueMap.clear(); drawCityLabels(); });
  $('loadPointValues').addEventListener('click', loadPointValues);
  $('clearCityValues')?.addEventListener('click', () => { pointValuesLoaded=false; cityValueMap.clear(); drawCityLabels(); setLayerStatus('City values cleared. City names remain.'); });
  ['showStations','stationDensity','stationValueSize','stationNameSize','stationTextColor','stationHaloColor'].forEach(id => $(id)?.addEventListener('input', drawStations));
  $('loadStations')?.addEventListener('click', loadNwsStationsInView);
  $('clearStations')?.addEventListener('click', () => { stationObservations=[]; stationValueMap.clear(); drawStations(); setLayerStatus('Station observations cleared.'); });
  $('addTextBox')?.addEventListener('click', () => addMapOverlay({text:'WEATHER NOTE', box:true, w:360, h:96, fontSize:34}));
  $('addNoBoxText')?.addEventListener('click', () => addMapOverlay({text:'WEATHER NOTE', box:false, w:360, h:70, fontSize:36}));
  $$('.symbolBtn').forEach(btn => btn.addEventListener('click', () => addMapOverlay({text:btn.dataset.symbol || 'H', box:false, textColor:btn.dataset.color || '#ffffff', w:110, h:90, fontSize:72})));
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
    applyBasemapLabelVisibility();
  });
  map.on('moveend', () => { drawCityLabels(); drawStations(); });
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
    applyBasemapLabelVisibility();
    drawCityLabels();
    drawStations();
  });
}

function productChanged(){
  currentProductKey = $('layerProduct').value;
  const p = PRODUCTS[currentProductKey];
  $('productTitle').value = p.title;
  $('productSubtitle').value = p.subtitle;
  if ($('clearCityValuesOnLayerChange')?.checked && !cityValuesShouldDisplayForCurrentLayer()) {
    cityValueMap.clear();
    pointValuesLoaded = false;
  }
  renderAllText();
  updateUiAvailability();
  drawCityLabels();
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

function setHeaderLoadedText(text){
  const out = $('loadedOut');
  if (!out) return;
  out.textContent = $('showLoadedTime')?.checked ? (text || '') : '';
}

function applyBasemapLabelVisibility(){
  if (!map || !map.getStyle) return;
  const show = $('showBasemapLabels')?.checked === true;
  const style = map.getStyle();
  if (!style?.layers) return;
  for (const layer of style.layers) {
    if (layer.type !== 'symbol') continue;
    const id = String(layer.id || '').toLowerCase();
    const sourceLayer = String(layer['source-layer'] || '').toLowerCase();
    const isPlace = /(place|settlement|city|town|village|hamlet|locality|neighbourhood|suburb|state|province|country|capital)/.test(id + ' ' + sourceLayer);
    if (isPlace && map.getLayer(layer.id)) {
      try { map.setLayoutProperty(layer.id, 'visibility', show ? 'visible' : 'none'); } catch (err) {}
    }
  }
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
      setHeaderLoadedText(`OPENWEATHER LOADED ${timeStamp()}`);
      setLayerStatus(`Loaded real OpenWeather tile layer: ${product.openWeatherLayer}. NOAA/NWS layers remain available separately.`);
      drawKey(); drawSourceBar(); drawCityLabels();
      return;
    }
    if (currentProductKey === 'alerts') {
      await loadAlertLayer();
      currentLayerSource = product.sourceLabel;
      setHeaderLoadedText(`NWS ALERTS ${timeStamp()}`);
      setLayerStatus(`Loaded NWS active alert polygons using ${($('alertScope')?.value || 'tx') === 'national' ? 'national' : 'Texas'} scope, filtered to the current map view.`);
      drawKey(); drawSourceBar(); drawCityLabels();
      return;
    }
    if (product.spcKind && !layers) {
      throw new Error(`${product.title} only has separate tornado/hail/wind probability layers for SPC Day 1 and Day 2. Choose categorical for Day 3–8.`);
    }
    const bbox = currentWeatherBounds.map(v => Number(v).toFixed(6)).join(',');
    const params = new URLSearchParams({op:'export', service:product.service, bbox, size:MAP_SIZE.join(','), transparent:'true', imageSR:'3857'});
    if (layers) params.set('layers', layers);
    const url = `/.netlify/functions/noaa-map?${params.toString()}&cache=${Date.now()}`;
    await validateImage(url);
    currentWeatherUrl = url;
    currentLayerSource = product.sourceLabel;
    addWeatherImageLayer(url, currentWeatherBounds);
    setHeaderLoadedText(`LOADED ${timeStamp()}`);
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
  const scope = $('alertScope')?.value || 'tx';
  const url = scope === 'national' ? 'https://api.weather.gov/alerts/active' : 'https://api.weather.gov/alerts/active?area=TX';
  const res = await fetch(url, {headers:{Accept:'application/geo+json'}});
  if (!res.ok) throw new Error(`NWS alerts API returned ${res.status}`);
  const data = await res.json();
  const filtered = filterFeaturesToBbox(data, getCurrentBbox());
  if (!filtered.features.length) showStatusBanner(`No active ${scope === 'national' ? 'national' : 'Texas'} alert polygons intersect the current map view.`);
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
    const [name,lat,lon,value] = line.split('|').map(v => (v || '').trim());
    const la = Number(lat), lo = Number(lon);
    if (!name || !Number.isFinite(la) || !Number.isFinite(lo)) return null;
    return {name, lat:la, lon:lo, value:value || '', p:1};
  }).filter(Boolean);
}

function getSelectedCities(){
  const preset = $('cityPreset')?.value || 'custom';
  const density = Number($('cityDensity')?.value || 3);
  const showValues = cityValuesShouldDisplayForCurrentLayer();
  if (preset === 'custom') {
    return parseCityLines().map(c => ({...c, value: showValues ? (cityValueMap.get(c.name) || c.value || '') : ''}));
  }
  const list = CITY_SETS[preset] || CITY_SETS.texasCore || [];
  return list.filter(c => c.p <= density).map(c => ({...c, value: showValues ? (cityValueMap.get(c.name) || '') : ''}));
}

function visibleCities(){
  if (!map) return [];
  const stage = $('mapStage');
  return getSelectedCities().filter(c => {
    const p = map.project([c.lon, c.lat]);
    return p.x >= -80 && p.y >= -80 && p.x <= stage.clientWidth + 80 && p.y <= stage.clientHeight + 80;
  });
}

function applyCityStyle(){
  const layer = $('cityLayer');
  if (!layer) return;
  layer.style.setProperty('--city-text-color', $('cityTextColor')?.value || '#ffffff');
  layer.style.setProperty('--city-halo-color', $('cityHaloColor')?.value || '#000000');
  layer.style.setProperty('--city-value-size', `${$('cityValueSize')?.value || 44}px`);
  layer.style.setProperty('--city-name-size', `${$('cityNameSize')?.value || 16}px`);
}

function drawCityLabels(){
  const layer = $('cityLayer');
  layer.innerHTML = '';
  applyCityStyle();
  if (!$('showCities').checked || !map) return;
  const cities = getSelectedCities();
  for (const c of cities) {
    const p = map.project([c.lon, c.lat]);
    if (p.x < -70 || p.y < -70 || p.x > $('mapStage').clientWidth+70 || p.y > $('mapStage').clientHeight+70) continue;
    const displayValue = c.value || '';
    const div = document.createElement('div');
    div.className = 'cityLabel';
    div.style.left = `${p.x}px`; div.style.top = `${p.y}px`;
    div.innerHTML = displayValue ? `<div class="value">${escapeHtml(displayValue)}</div><div class="name">${escapeHtml(c.name)}</div>` : `<div class="name">${escapeHtml(c.name)}</div>`;
    layer.appendChild(div);
  }
}

async function loadPointValues(){
  const cities = visibleCities().slice(0, 80);
  const source = $('cityValueSource')?.value || 'nws';
  setLayerStatus(`Loading ${source === 'openweather' ? 'OpenWeather' : 'NWS'} values for ${cities.length} visible city labels...`);
  let loaded = 0;
  for (const c of cities) {
    try {
      const value = source === 'openweather' ? await fetchOpenWeatherCityValue(c) : await fetchNwsCityDisplayValue(c);
      if (value) { cityValueMap.set(c.name, value); loaded++; }
      else cityValueMap.delete(c.name);
    } catch (err) {
      console.warn('city value failed', c.name, err);
      cityValueMap.delete(c.name);
    }
  }
  pointValuesLoaded = true;
  drawCityLabels();
  const layerNote = cityValuesShouldDisplayForCurrentLayer() ? '' : ' Values are loaded but hidden by Auto mode on this layer.';
  setLayerStatus(`Loaded ${loaded}/${cities.length} ${source === 'openweather' ? 'OpenWeather' : 'NWS'} city values.${layerNote}`);
}

function cityValuesShouldDisplayForCurrentLayer(){
  const mode = $('cityValueDisplay')?.value || 'auto';
  if (mode === 'off') return false;
  if (mode === 'always') return true;
  return ['owTemp','owHeat','temp','heat','maxTemp','minTemp'].includes(currentProductKey);
}

async function fetchOpenWeatherCityValue(c){
  const metric = (currentProductKey === 'owHeat' || currentProductKey === 'heat') ? 'feels' : 'temp';
  const url = `/.netlify/functions/openweather?op=weather&lat=${c.lat.toFixed(5)}&lon=${c.lon.toFixed(5)}`;
  const data = await fetchJson(url);
  const main = data.main || {};
  const value = metric === 'feels' ? main.feels_like : main.temp;
  return Number.isFinite(value) ? `${Math.round(value)}°` : '';
}

async function fetchNwsCityDisplayValue(c){
  const point = await fetchJson(`https://api.weather.gov/points/${c.lat.toFixed(4)},${c.lon.toFixed(4)}`);
  const props = point.properties || {};
  if (currentProductKey === 'heat' || currentProductKey === 'owHeat') {
    return await fetchNwsGridApparentValue(props);
  }
  if (currentProductKey === 'maxTemp' || currentProductKey === 'minTemp') {
    if (!props.forecast) throw new Error('No point forecast URL');
    const forecast = await fetchJson(props.forecast);
    const periods = forecast.properties?.periods || [];
    const period = currentProductKey === 'maxTemp'
      ? periods.find(p => p.isDaytime !== false)
      : periods.find(p => p.isDaytime === false);
    const temp = period?.temperature;
    return Number.isFinite(temp) ? `${Math.round(temp)}°` : '';
  }
  if (!props.forecastHourly) throw new Error('No hourly forecast URL');
  const hourly = await fetchJson(props.forecastHourly);
  const temp = hourly.properties?.periods?.[0]?.temperature;
  return Number.isFinite(temp) ? `${Math.round(temp)}°` : '';
}

async function fetchNwsGridApparentValue(props){
  if (!props.forecastGridData) throw new Error('No grid data URL');
  const grid = await fetchJson(props.forecastGridData);
  const values = grid.properties?.apparentTemperature?.values || [];
  const first = values.find(v => v.value !== null && v.value !== undefined);
  if (!first) return '';
  const f = cToF(first.value);
  return Number.isFinite(f) ? `${Math.round(f)}°` : '';
}

function cToF(c){ return (Number(c) * 9/5) + 32; }


async function fetchJson(url){
  const res = await fetch(url, {headers:{Accept:'application/json, application/geo+json'}});
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function loadNwsStationsInView(){
  if (!map) return;
  const limit = Number($('stationDensity')?.value || 40);
  const center = map.getCenter();
  setLayerStatus(`Loading nearest NWS observation stations around current map center...`);
  try {
    const point = await fetchJson(`https://api.weather.gov/points/${center.lat.toFixed(4)},${center.lng.toFixed(4)}`);
    const stationsUrl = point.properties?.observationStations;
    if (!stationsUrl) throw new Error('No NWS station list URL for current map center.');
    const stationData = await fetchJson(stationsUrl);
    const stations = (stationData.features || []).map(f => {
      const coords = f.geometry?.coordinates || [];
      return {id:f.properties?.stationIdentifier || f.properties?.stationId || f.id, name:f.properties?.name || f.properties?.stationIdentifier || '', lon:Number(coords[0]), lat:Number(coords[1])};
    }).filter(s => s.id && Number.isFinite(s.lat) && Number.isFinite(s.lon));
    const inView = stations.filter(s => pointInBbox(s.lon, s.lat, getCurrentBbox())).slice(0, limit);
    const loaded = [];
    for (const st of inView) {
      try {
        const obs = await fetchJson(`https://api.weather.gov/stations/${encodeURIComponent(st.id)}/observations/latest`);
        const p = obs.properties || {};
        const tempC = p.temperature?.value;
        const dewC = p.dewpoint?.value;
        const windKph = p.windSpeed?.value;
        const tempF = Number.isFinite(tempC) ? Math.round(cToF(tempC)) : null;
        const dewF = Number.isFinite(dewC) ? Math.round(cToF(dewC)) : null;
        const windMph = Number.isFinite(windKph) ? Math.round(Number(windKph) * 0.621371) : null;
        const value = tempF !== null ? `${tempF}°` : '';
        const detail = [dewF !== null ? `Dew ${dewF}°` : '', windMph !== null ? `Wind ${windMph}` : ''].filter(Boolean).join(' • ');
        loaded.push({...st, value, detail});
      } catch (err) {
        loaded.push({...st, value:'', detail:''});
      }
    }
    stationObservations = loaded;
    $('showStations').checked = true;
    drawStations();
    setLayerStatus(`Loaded ${loaded.length} NWS station observations from weather.gov around the current map view.`);
  } catch (err) {
    console.error(err);
    setLayerStatus(`NWS station load failed: ${err.message}`);
  }
}

function pointInBbox(lon, lat, bbox){
  const [w,s,e,n] = bbox;
  return lon >= w && lon <= e && lat >= s && lat <= n;
}

function drawStations(){
  const layer = $('stationLayer');
  if (!layer) return;
  layer.innerHTML = '';
  applyStationStyle();
  if (!$('showStations')?.checked || !map) return;
  for (const st of stationObservations) {
    const p = map.project([st.lon, st.lat]);
    if (p.x < -70 || p.y < -70 || p.x > $('mapStage').clientWidth+70 || p.y > $('mapStage').clientHeight+70) continue;
    const div = document.createElement('div');
    div.className = 'stationLabel';
    div.style.left = `${p.x}px`; div.style.top = `${p.y}px`;
    div.innerHTML = `<div class="stationDot"></div>${st.value ? `<div class="stationValue">${escapeHtml(st.value)}</div>` : ''}<div class="stationName">${escapeHtml(st.id || st.name)}</div>${st.detail ? `<div class="stationDetail">${escapeHtml(st.detail)}</div>` : ''}`;
    layer.appendChild(div);
  }
}

function applyStationStyle(){
  const layer = $('stationLayer');
  if (!layer) return;
  layer.style.setProperty('--station-text-color', $('stationTextColor')?.value || '#ccf6ff');
  layer.style.setProperty('--station-halo-color', $('stationHaloColor')?.value || '#001020');
  layer.style.setProperty('--station-value-size', `${$('stationValueSize')?.value || 24}px`);
  layer.style.setProperty('--station-name-size', `${$('stationNameSize')?.value || 11}px`);
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
    if ($('showStations')?.checked) drawStationsToCanvas(ctx);
    if ($('showSourceBar').checked) drawSourceToCanvas(ctx);
    drawOverlaysToCanvas(ctx);
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
  const color = $('cityTextColor')?.value || '#ffffff';
  const halo = $('cityHaloColor')?.value || '#000000';
  const valueSize = Number($('cityValueSize')?.value || 44);
  const nameSize = Number($('cityNameSize')?.value || 16);
  for (const c of getSelectedCities()){
    const p = map.project([c.lon,c.lat]); const x=26+p.x, y=134+p.y; if(x<0||x>1920||y<120||y>1036) continue;
    cityShadow(ctx, halo); const displayValue = c.value || '';
    if(displayValue) text(ctx,displayValue,x,y-5,valueSize,'center',color,1000);
    text(ctx,c.name,x,y+Math.round(nameSize*1.4),nameSize,'center',color,1000); shadow(ctx,false);
  }
}
function drawStationsToCanvas(ctx){
  const color = $('stationTextColor')?.value || '#ccf6ff';
  const halo = $('stationHaloColor')?.value || '#001020';
  const valueSize = Number($('stationValueSize')?.value || 24);
  const nameSize = Number($('stationNameSize')?.value || 11);
  for (const st of stationObservations){
    const p = map.project([st.lon,st.lat]); const x=26+p.x, y=134+p.y; if(x<0||x>1920||y<120||y>1036) continue;
    ctx.save();
    ctx.fillStyle = '#7efcff'; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    cityShadow(ctx, halo);
    if(st.value) text(ctx,st.value,x,y-8,valueSize,'center',color,1000);
    text(ctx,st.id || st.name,x,y+Math.round(nameSize*1.7),nameSize,'center',color,1000);
    shadow(ctx,false); ctx.restore();
  }
}

function drawSourceToCanvas(ctx){
  const x=26+Number($('sourceX').value), y=134+Number($('sourceY').value), w=Number($('sourceW').value); const msg=$('sourceBar').textContent;
  ctx.fillStyle='rgba(0,0,0,.72)'; roundPath(ctx,x,y,w,34,6); ctx.fill(); ctx.fillStyle='#89e9ff'; ctx.fillRect(x,y,7,34); text(ctx,msg,x+18,y+23,18,'left','white',900);
}

function waitForMapIdle(){ return new Promise(resolve => { let done=false; const finish=()=>{ if(done) return; done=true; setTimeout(resolve,180); }; if (map.loaded && map.loaded()) return finish(); const timer=setTimeout(finish,1800); map.once('idle', () => { clearTimeout(timer); finish(); }); }); }
function cityShadow(ctx, color){ ctx.shadowColor=color || 'rgba(0,0,0,.85)'; ctx.shadowBlur=8; ctx.shadowOffsetY=3; }
function loadImage(src){ return new Promise((resolve,reject)=>{ const img=new Image(); img.onload=()=>resolve(img); img.onerror=()=>reject(new Error('Could not read map canvas image. Cross-origin tiles may be blocking export.')); img.src=src; }); }
function downloadCanvas(canvas, filename){ return new Promise((resolve,reject)=>{ canvas.toBlob(blob=>{ if(!blob) return reject(new Error('Could not create PNG blob.')); const a=document.createElement('a'); const url=URL.createObjectURL(blob); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>{URL.revokeObjectURL(url); resolve();},250); },'image/png'); }); }
function text(ctx,str,x,y,size,align,color,weight=900){ ctx.font=`${weight} ${size}px Arial, Helvetica, sans-serif`; ctx.textAlign=align; ctx.textBaseline='alphabetic'; ctx.fillStyle=color; ctx.fillText(String(str||''),x,y); }
function shadow(ctx,on){ if(on){ctx.shadowColor='rgba(0,0,0,.75)';ctx.shadowBlur=8;ctx.shadowOffsetY=4;}else{ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;} }
function gradient(ctx,x1,y1,x2,y2,colors){ const g=ctx.createLinearGradient(x1,y1,x2,y2); colors.forEach((c,i)=>g.addColorStop(i/(colors.length-1),c)); return g; }
function roundRect(ctx,x,y,w,h,r,fill){ ctx.fillStyle=fill; roundPath(ctx,x,y,w,h,r); ctx.fill(); }
function roundPath(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }


function addMapOverlay(opts={}){
  const overlay = Object.assign({
    id:`ov-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text:'WEATHER NOTE', x:260, y:180, w:340, h:90, fontSize:34,
    textColor:'#ffffff', boxColor:'#061020', boxOpacity:.78, box:true
  }, opts || {});
  mapOverlays.push(overlay);
  selectedOverlayId = overlay.id;
  renderMapOverlays();
  renderOverlayEditor();
}

function renderMapOverlays(){
  const layer = $('mapOverlayLayer');
  if (!layer) return;
  layer.innerHTML = mapOverlays.map(o => overlayHtml(o)).join('');
  $$('.mapOverlayItem', layer).forEach(el => {
    const overlay = mapOverlays.find(o => o.id === el.dataset.id);
    el.addEventListener('mousedown', e => startOverlayMove(e, overlay));
    el.addEventListener('click', e => { e.stopPropagation(); selectedOverlayId = overlay.id; renderMapOverlays(); renderOverlayEditor(); });
  });
  $$('.resizeHandle', layer).forEach(handle => {
    handle.addEventListener('mousedown', e => startOverlayResize(e, mapOverlays.find(o => o.id === handle.closest('.mapOverlayItem').dataset.id), handle.dataset.handle));
  });
}

function overlayHtml(o){
  const selected = o.id === selectedOverlayId ? ' selectedOverlay' : '';
  const noBox = o.box === false ? ' noBox' : '';
  const bg = o.box === false ? 'transparent' : hexToRgba(o.boxColor || '#061020', Number(o.boxOpacity ?? .78));
  const border = o.box === false ? 'transparent' : 'rgba(255,255,255,.50)';
  const handles = o.id === selectedOverlayId ? ['nw','n','ne','e','se','s','sw','w'].map(h => `<span class="resizeHandle ${h}" data-handle="${h}"></span>`).join('') : '';
  return `<div class="mapOverlayItem${selected}${noBox}" data-id="${escapeHtml(o.id)}" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;font-size:${o.fontSize}px;color:${escapeHtml(o.textColor || '#ffffff')};background:${bg};border-color:${border};">${escapeHtml(o.text)}${handles}</div>`;
}

function startOverlayMove(e, overlay){
  if (!overlay || e.target.classList.contains('resizeHandle')) return;
  e.preventDefault(); e.stopPropagation(); selectedOverlayId = overlay.id;
  const scale = currentStageScale();
  const startX=e.clientX, startY=e.clientY, ox=overlay.x, oy=overlay.y;
  function move(ev){ overlay.x = clamp(Math.round(ox + (ev.clientX-startX)/scale), -50, $('mapStage').clientWidth-30); overlay.y = clamp(Math.round(oy + (ev.clientY-startY)/scale), -50, $('mapStage').clientHeight-30); renderMapOverlays(); renderOverlayEditor(false); }
  function up(){ document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); renderMapOverlays(); renderOverlayEditor(); }
  document.addEventListener('mousemove', move); document.addEventListener('mouseup', up); renderMapOverlays(); renderOverlayEditor();
}

function startOverlayResize(e, overlay, handle){
  if (!overlay) return;
  e.preventDefault(); e.stopPropagation(); selectedOverlayId = overlay.id;
  const scale=currentStageScale(); const sx=e.clientX, sy=e.clientY; const ox=overlay.x, oy=overlay.y, ow=overlay.w, oh=overlay.h;
  function move(ev){
    const dx=(ev.clientX-sx)/scale, dy=(ev.clientY-sy)/scale;
    let x=ox,y=oy,w=ow,h=oh;
    if (handle.includes('e')) w=ow+dx;
    if (handle.includes('s')) h=oh+dy;
    if (handle.includes('w')) { x=ox+dx; w=ow-dx; }
    if (handle.includes('n')) { y=oy+dy; h=oh-dy; }
    overlay.x=Math.round(x); overlay.y=Math.round(y); overlay.w=Math.max(36,Math.round(w)); overlay.h=Math.max(30,Math.round(h));
    renderMapOverlays(); renderOverlayEditor(false);
  }
  function up(){ document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); renderMapOverlays(); renderOverlayEditor(); }
  document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
}

function renderOverlayEditor(rebuild=true){
  const el = $('overlayEditor'); if (!el) return;
  const o = mapOverlays.find(x => x.id === selectedOverlayId);
  if (!o) { el.innerHTML = 'Click an added text box or symbol to edit it.'; return; }
  if (!rebuild && document.activeElement && el.contains(document.activeElement)) return;
  el.innerHTML = `
    <label>Text / symbol<textarea id="overlayTextInput" rows="2">${escapeHtml(o.text)}</textarea></label>
    <div class="miniRow"><label>X<input id="overlayX" type="number" value="${o.x}"></label><label>Y<input id="overlayY" type="number" value="${o.y}"></label></div>
    <div class="miniRow"><label>Width<input id="overlayW" type="number" value="${o.w}"></label><label>Height<input id="overlayH" type="number" value="${o.h}"></label></div>
    <label>Font size<input id="overlayFontSize" type="range" min="14" max="110" step="1" value="${o.fontSize}"></label>
    <div class="miniRow"><label>Text color<input id="overlayTextColor" type="color" value="${o.textColor || '#ffffff'}"></label><label>Box color<input id="overlayBoxColor" type="color" value="${o.boxColor || '#061020'}"></label></div>
    <label>Box opacity<input id="overlayBoxOpacity" type="range" min="0" max="1" step="0.05" value="${o.boxOpacity ?? .78}"></label>
    <label class="checkRow"><input id="overlayNoBox" type="checkbox" ${o.box === false ? 'checked':''}><span>Text only / no box</span></label>
    <div class="inlineBtns"><button id="duplicateOverlay" class="secondary">Duplicate</button><button id="deleteOverlay" class="secondary">Delete</button></div>`;
  const update = () => {
    o.text = $('overlayTextInput').value;
    o.x = Math.round(Number($('overlayX').value) || o.x);
    o.y = Math.round(Number($('overlayY').value) || o.y);
    o.w = Math.max(36, Math.round(Number($('overlayW').value) || o.w));
    o.h = Math.max(30, Math.round(Number($('overlayH').value) || o.h));
    o.fontSize = Math.round(Number($('overlayFontSize').value) || o.fontSize);
    o.textColor = $('overlayTextColor').value;
    o.boxColor = $('overlayBoxColor').value;
    o.boxOpacity = Number($('overlayBoxOpacity').value);
    o.box = !$('overlayNoBox').checked;
    renderMapOverlays();
  };
  ['overlayTextInput','overlayX','overlayY','overlayW','overlayH','overlayFontSize','overlayTextColor','overlayBoxColor','overlayBoxOpacity','overlayNoBox'].forEach(id => $(id)?.addEventListener('input', update));
  $('overlayNoBox')?.addEventListener('change', update);
  $('deleteOverlay')?.addEventListener('click', () => { mapOverlays = mapOverlays.filter(x => x.id !== selectedOverlayId); selectedOverlayId = null; renderMapOverlays(); renderOverlayEditor(); });
  $('duplicateOverlay')?.addEventListener('click', () => { const c = JSON.parse(JSON.stringify(o)); c.id=`ov-${Date.now()}-${Math.random().toString(16).slice(2)}`; c.x+=30; c.y+=30; mapOverlays.push(c); selectedOverlayId=c.id; renderMapOverlays(); renderOverlayEditor(); });
}

function drawOverlaysToCanvas(ctx){
  for (const o of mapOverlays){
    const x=26+o.x, y=134+o.y;
    ctx.save();
    if (o.box !== false){
      ctx.fillStyle = hexToRgba(o.boxColor || '#061020', Number(o.boxOpacity ?? .78));
      roundPath(ctx,x,y,o.w,o.h,8); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.50)'; ctx.lineWidth=2; ctx.stroke();
    }
    shadow(ctx,true);
    ctx.fillStyle = o.textColor || '#ffffff';
    ctx.font = `1000 ${o.fontSize}px Arial, Helvetica, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lines = String(o.text || '').split(/\n/);
    const lineH = o.fontSize * 1.08;
    const start = y + o.h/2 - ((lines.length-1)*lineH)/2;
    lines.forEach((line,i) => ctx.fillText(line, x+o.w/2, start + i*lineH));
    shadow(ctx,false);
    ctx.restore();
  }
}

function currentStageScale(){ return Number($('slideFrame')?.dataset.scale || 1); }
function hexToRgba(hex, alpha){
  const h = String(hex || '#000000').replace('#','');
  const full = h.length === 3 ? h.split('').map(c => c+c).join('') : h.padEnd(6,'0').slice(0,6);
  const n = parseInt(full,16);
  const r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  return `rgba(${r},${g},${b},${Math.max(0,Math.min(1,Number(alpha)))})`;
}
function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
function showStatus(message){ setLayerStatus(message); }

function fitStage(){ const vp=$('stageViewport'), fr=$('slideFrame'); const s=Math.min((vp.clientWidth-36)/1920,(vp.clientHeight-36)/1080,1); fr.style.transform=`translate(-50%,-50%) scale(${s})`; fr.dataset.scale=s; }
function slug(s){ return String(s||'map').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
function escapeHtml(v){ return String(v??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

init();
