# RBRTW / EWX Real Maps 2.0

This is the separate real-map engine build. It is not the V1 forecast-card builder.

## What this version does

- Uses MapLibre GL JS for the map viewer.
- Uses OpenFreeMap as the free basemap source.
- Uses NOAA/NWS/SPC/MRMS/WPC services for official weather layers.
- Adds OpenWeather tile overlays as a supplemental visual layer source.
- Does not generate fake map fields.
- Does not use placeholder weather maps.
- If a real service fails, the app shows an error instead of drawing a fake layer.
- Exports a 1920x1080 PNG from the live map canvas plus RBRTW broadcast frame.

## Included real layers

Official NOAA/NWS/SPC/MRMS/WPC layers:

- NOAA MRMS base reflectivity radar
- NOAA NDFD temperature
- NOAA NDFD apparent temperature / heat index style layer
- NOAA NDFD relative humidity
- NOAA NDFD max/min temperature day layers
- NOAA/SPC severe outlook categorical layers
- NOAA/SPC tornado, hail, and damaging wind probability layers where separate SPC layers exist
- NOAA/WPC national forecast chart layers including fronts and weather areas
- NWS active alerts GeoJSON polygons for Texas

Supplemental OpenWeather visual overlays:

- Clouds
- Precipitation
- Temperature
- Pressure
- Wind

OpenWeather is not used to replace NOAA/NWS/SPC official products. It is used as a supplemental map-tile source where it helps the map viewer.

## Folder structure

Upload the entire folder to GitHub / Netlify with this structure preserved:

```text
index.html
style.css
app.js
netlify.toml
README.md
netlify/functions/noaa-map.js
netlify/functions/openweather.js
```

## Netlify setup

Use GitHub deploy, not drag-and-drop, because this version includes Netlify Functions.

Build settings:

```text
Build command: leave blank
Publish directory: .
Functions directory: netlify/functions
```

## Required environment variable

Do not put the OpenWeather key directly in app.js.

In Netlify, add this environment variable:

```text
OPENWEATHER_API_KEY=your_actual_key_here
```

Then redeploy the site.

If the key is missing, the OpenWeather products will show an error. NOAA/NWS/SPC products can still work.

## Test order

1. Deploy to Netlify.
2. Open the site.
3. Click **Fit EWX / South Central TX**.
4. Test **Clouds + Radar Snapshot / NOAA MRMS Radar**.
5. Test **Precipitation / OpenWeather Tiles**.
6. Test **Temperature / OpenWeather Tiles**.
7. Test **NOAA NDFD Temperature**.
8. Test **SPC Categorical Outlook**.
9. Test **Download PNG**.

## Important behavior

This version intentionally does not fake maps. When a NOAA/OpenWeather layer is unavailable, the app reports that instead of drawing a fake fallback.

The NOAA function pulls official ArcGIS export images through the same Netlify domain. The OpenWeather function pulls weather tiles through the same Netlify domain and keeps the API key server-side.
