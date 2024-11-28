# NARCIS GeoServer

A dockerized GeoServer instance serving Natura 2000 data for Slovenia.

## Layers

1. `narcis:natura2000` - Natura 2000 protected areas in Slovenia
2. `narcis:svn_rjava_1200x800` - Background raster map of Slovenia

## Setup

1. Install Docker and Docker Compose
2. Clone this repository
3. Start GeoServer:
   ```bash
   docker-compose up -d
   ```
4. Access GeoServer at http://localhost:8080/geoserver
   - Username: admin
   - Password: geoserver

## WMS Example

Access both layers with:
```
http://localhost:8080/geoserver/narcis/wms?service=WMS&version=1.1.0&request=GetMap&layers=narcis:svn_rjava_1200x800,narcis:natura2000&styles=&bbox=13.271,45.375,16.723,47.047&width=1200&height=800&srs=EPSG:4326&format=image/png
```

## Data Sources

- Natura 2000 data: Protected areas in Slovenia
- Background map: Raster map of Slovenia

## Management

- Start server: `docker-compose up -d`
- Stop server: `docker-compose down`
- View logs: `docker-compose logs`

## Data Persistence

All GeoServer data and configurations are stored in the `geoserver_data` directory.

## Related Projects

- [apex-integration](./apex-integration/): Oracle APEX integration files and documentation

## Oracle APEX Integration

### Setup

1. Copy the `js/geoserver-map.js` file to your APEX application's static files.

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

### Features

- WMS Layer Integration: Automatically adds GeoServer WMS layers to your APEX map
- Interactive Popups: Click on features to view their properties
- Layer Controls: Toggle layer visibility and adjust opacity
- Cursor Interaction: Cursor changes to pointer when hovering over features

### Example Usage

```javascript
// Toggle layer visibility
geoserverMap.toggleLayer('narcis-natura2000-wms');

// Adjust layer opacity (0-1)
geoserverMap.setOpacity(0.8);
```
