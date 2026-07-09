# RBRTW / EWX Real Maps 2.0 Expanded

Separate real-map engine build. This is not the V1 forecast-card builder.

## What this version adds

- Keeps the working NOAA/NWS/SPC/MRMS/WPC layers.
- Keeps OpenWeather as supplemental tile layers only.
- Adds Texas and USA city-label presets with density control.
- Adds San Angelo, Del Rio, Amarillo, Lubbock, and Wichita Falls to the Texas city presets.
- Adds city temperature/value size, city-name size, city text color, and city outline color controls.
- Adds Texas-only vs National active alerts scope.
- Defaults the source bar off.
- Adds draggable broadcast text boxes and weather symbols.
- Added overlay resizing from corners and sides.
- Adds overlay text color, box color, opacity, and text-only/no-box option.
- Keeps PNG export fix with an idle timeout so the export cannot hang forever waiting for MapLibre idle.
- Uses Web Mercator output for NOAA ArcGIS export images to better align raster shading with the MapLibre basemap.

## Folder structure

Upload this exact structure to GitHub / Netlify:

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

## OpenWeather key

Do not put the OpenWeather key in `app.js`, JSON, or any public file. It must be a Netlify environment variable.

Accepted names:

```text
OPENWEATHER_API_KEY
OPENWEATHER_APPID
OPENWEATHER_KEY
```

After adding or changing the key, redeploy the site. If the app still reports the key missing, it means Netlify did not apply the variable to that deployed site or the site was not redeployed after the variable was added.

## City labels

City label presets use real city coordinates. Temperature labels are loaded from NWS data for visible cities only when you click **Load NWS Values For Visible Cities**. For Forecast Highs and Forecast Lows, the app pulls the NWS point forecast high or low. For other products, it pulls the current hourly temperature.

Density controls how many built-in city labels are allowed to show:

- 1 = major cities only
- 5 = most dense

## Alerts

Active alerts can use Texas-only scope or national scope. Both are still filtered to the current map view.

## Export

PNG export uses the live MapLibre canvas plus RBRTW broadcast frame, city labels, key, source bar if enabled, and custom overlays.
