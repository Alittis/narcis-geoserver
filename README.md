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
