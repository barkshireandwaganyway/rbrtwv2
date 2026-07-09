# RBRTW / EWX Real Maps 2.2.4

This is the Real Maps V2.2.4 cleanup and feature-preservation build.

## Major fixes in 2.2.4

- Completely removed the NWS station observation picker/viewer UI and map overlay.
- City values now work across all active weather layers instead of only temperature/heat layers.
- City values can use Auto source, OpenWeather current conditions, or NWS point/grid data.
- City value metric can use Auto from active layer, temperature, feels-like, wind, pressure, clouds, precipitation, or humidity.
- Wind map city values now show mph when values are loaded.
- Header subtitle/subtext is removed from the actual map header and PNG export. The header now only shows the main product title, location, and optional date/time.
- Road/highway controls were expanded with road label size, road label density, road line width, and highway line width.
- Texas county lines were added as a separate configurable layer using U.S. Census TIGERweb county boundaries.
- County line color, county line width, county name visibility, county name color, county name size, and county name outline are editable.
- Product keys are now editable per key type. Each key row has its own color picker and editable text.
- Manual canvas export, NDFD timing, OpenWeather function support, SPC/WPC/MRMS layers, alerts, city labels, source bar, and draggable broadcast overlays are preserved.

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

Use GitHub deploy, not Netlify drag-and-drop, because this version includes Netlify Functions.

## Netlify build settings

```text
Build command: leave blank
Publish directory: .
Functions directory: netlify/functions
```

## OpenWeather key

Use one of these Netlify environment variable names:

```text
OPENWEATHER_API_KEY
OPENWEATHER_APPID
OPENWEATHER_KEY
```

After changing the variable, redeploy the site.

## Notes

The app does not generate fake weather fields. If a live service fails, the app reports the failure instead of drawing a fake fallback layer.
