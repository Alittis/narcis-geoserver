# Oracle APEX Integration for NARCIS GeoServer

This directory contains the necessary files to integrate NARCIS GeoServer with Oracle APEX's native map region using MapLibre.

## Files

- `geoserver-map.js`: Main JavaScript file containing the integration code

## Setup

1. Copy the `geoserver-map.js` file to your APEX application's static files.

2. Include the script in your APEX application:
   - Go to Shared Components > Static Application Files
   - Upload `geoserver-map.js`
   - Add a reference to the file in your page's JavaScript file URLs

3. Initialize the map in your page's JavaScript code:
   ```javascript
   const geoserverMap = initGeoServerMap(
       'your-map-region-id',      // APEX native map region static ID
       'http://your-geoserver-url', // GeoServer base URL
       'narcis',                  // workspace name
       'natura2000'               // layer name
   );
   ```

## Features

- WMS Layer Integration: Automatically adds GeoServer WMS layers to your APEX map
- Interactive Popups: Click on features to view their properties
- Layer Controls: Toggle layer visibility and adjust opacity
- Cursor Interaction: Cursor changes to pointer when hovering over features

## Example Usage

```javascript
// Toggle layer visibility
geoserverMap.toggleLayer('narcis-natura2000-wms');

// Adjust layer opacity (0-1)
geoserverMap.setOpacity(0.8);
```

## Requirements

- Oracle APEX with native map region support
- MapLibre GL JS (included with APEX)
- GeoServer instance (see main project README for setup)
