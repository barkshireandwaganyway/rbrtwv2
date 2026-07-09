# RBRTW / EWX Real Maps 2.0 City + Station Fix

Separate real-map engine build. Not the V1 forecast-card builder.

## What changed in this build

- City temperature values no longer get permanently written into the city text list after clicking load values.
- City values can be hidden, always shown, or automatically shown only on temperature / heat / high / low layers.
- Changing to non-temperature layers can auto-hide/clear visible values so pressure/fronts/radar do not keep old temp numbers on screen.
- Added OpenWeather current weather value support through the Netlify function using `op=weather`.
- Added OpenWeather Feels Like / Heat Index product using the OpenWeather temperature tile and point feels-like values.
- Added NWS apparent temperature point values from NWS grid data for heat-index style labels.
- Added basemap place/city-label toggle so custom broadcast cities can be used without duplicate basemap city names.
- Added NWS station observations overlay for the current map view.
- Added station size/color/outline/density controls.
- Added source-bar default off and loaded timestamp default off.
- Kept working NOAA layers intact: MRMS radar, SPC outlooks, WPC fronts/weather, active alerts.
- Kept draggable broadcast text/symbol tools.
- Kept PNG export timeout fix.

## Data notes

- NWS point/grid values come directly from api.weather.gov.
- NWS station observations come from api.weather.gov station observations.
- OpenWeather current values come through `netlify/functions/openweather.js` and require `OPENWEATHER_API_KEY` in Netlify.
- MesoWest / consumer station data is not included yet because that requires a separate Synoptic/MesoWest data token. This build adds NWS station observations first without fake data.

## Folder structure

Upload the full folder to GitHub / Netlify with this structure preserved:

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

Environment variable:

```text
OPENWEATHER_API_KEY=your_actual_key_here
```

After changing the variable, redeploy.
