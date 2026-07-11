# RBRTW / EWX Real Maps 2.2.8

This is the V2.2.8 stabilization build.

## Main changes

- Replaced the raw ArcGIS VectorTileServer experiment with the official `@esri/maplibre-arcgis` plugin path.
- Updated MapLibre CDN to 5.24.0 and added `@esri/maplibre-arcgis@1.3.0` by CDN.
- ArcGIS Navigation is the default basemap. OpenFreeMap remains available as fallback.
- Added tiled radar products:
  - IEM NEXRAD tiled radar mosaic.
  - NOAA nowCOAST Weather Radar Base Reflectivity WMS tiles.
  - NOAA `radar_base_reflectivity_time` ImageServer WMS tiles.
  - Server-proxied NOAA MRMS MapServer tile export.
  - Original NOAA MRMS MapServer export remains as fallback.
- PNG export no longer depends only on the live MapLibre canvas for tiled radar products. For tiled radar exports it draws a server-proxied raster basemap and radar tiles directly onto the 1920x1080 export canvas.
- If the live map canvas cannot be read during export, export falls back to server-proxied raster basemap/radar drawing instead of exporting a blank map plate.
- Removed the bottom footer text from the live map and PNG export.

## Notes

The true GRIB2 decoding pipeline is not included in this static Netlify build. The “server-rendered MRMS” option is implemented as server-proxied NOAA MRMS MapServer tile export, which keeps rendering server-side and avoids trying to decode GRIB2 in the browser.

Use GitHub deploy, not Netlify drag-and-drop, because this version includes Netlify Functions.

## Folder structure

```text
index.html
style.css
app.js
netlify.toml
README.md
netlify/functions/noaa-map.js
netlify/functions/openweather.js
```

## Netlify build settings

```text
Build command: leave blank
Publish directory: .
Functions directory: netlify/functions
```
