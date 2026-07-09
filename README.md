# RBRTW / EWX Real Maps 2.2.3

This is the Real Maps V2 architecture-fix build. It fixes the known 2.2.2 problems around PNG export architecture, NDFD timing, and basemap layer control.

## Major fixes in 2.2.3

- PNG export is now manual-canvas first. It no longer tries DOM/html2canvas export first.
- Export still uses the live MapLibre map canvas as the map plate, then redraws the RBRTW header, footer, key, cities, stations, source bar, and user text/symbol overlays directly onto a locked 1920x1080 canvas.
- NDFD requests now include a real time parameter. The app requests the selected NDFD hour as epoch milliseconds so the NDFD service is not asked for an empty current-time slice.
- NDFD exports use EPSG:4326 output to match the MapLibre image-source coordinates and reduce map-image offset.
- NDFD layer selection now has a metadata-aware resolver with a hard-coded fallback.
- Basemap city/place labels are separated from road/highway lines and road/highway labels. Turning place labels off no longer intentionally hides roads or roadway labels.
- Basemap road/highway line color and road/highway label color controls are preserved.
- Header timestamp is simplified. The checkbox only shows date/time. It no longer says LOADED, OPENWEATHER LOADED, NWS ALERTS, or layer information.

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

OpenWeather is still optional supplemental data. NOAA/NWS/SPC layers do not require it.

Use one of these Netlify environment variable names:

```text
OPENWEATHER_API_KEY
OPENWEATHER_APPID
OPENWEATHER_KEY
```

After changing the variable, redeploy the site.

## Notes

The app does not generate fake weather fields. If a live service fails, the app reports the failure instead of drawing a fake fallback layer.
