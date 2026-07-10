# RBRTW / EWX Real Maps 2.2.7

This patch builds on 2.2.6.

## Main changes in 2.2.7

- Added a direct ArcGIS World_Basemap_v2 VectorTileServer basemap option.
- The direct ArcGIS vector tile style uses `/resources/styles/root.json` and patches ArcGIS sprite, glyph, and source URLs for MapLibre.
- ArcGIS World Basemap v2 Direct is selected by default.
- Existing ArcGIS Basemap Styles service options remain available.
- OpenFreeMap remains as fallback.
- County outlines were adjusted again. The Netlify county proxy now requests only counties intersecting the current map bounds and asks TIGERweb for simplified geometry.
- County query geometry precision and offset were loosened to reduce payload size and improve load reliability.
- NOAA/MRMS, SPC, WPC, NDFD, alerts, OpenWeather, city values, editable keys, text boxes, symbols, and PNG export are preserved.

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

## Notes

The ArcGIS key is embedded in `app.js` per the private-app request. OpenFreeMap fallback remains available if ArcGIS fails.

County outlines still depend on Census TIGERweb. If they are too noisy or slow, the better long-term answer is a custom ArcGIS basemap style with administrative boundary layers styled inside the basemap instead of loading county polygons separately.
