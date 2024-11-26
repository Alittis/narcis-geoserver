# GeoServer and Oracle APEX Integration Guide

## Table of Contents
1. [GDAL Installation](#gdal-installation)
2. [GeoServer Oracle Database Connection](#geoserver-oracle-database-connection)
3. [GeoServer Use Cases](#geoserver-use-cases)
4. [APEX Integration](#apex-integration)
5. [MapLibre Integration](#maplibre-integration)
6. [Faceted Search Integration](#faceted-search-integration)

## GDAL Installation

GDAL is installed on the system through Homebrew (version 3.10.0_1) at `/opt/homebrew/Cellar/gdal/3.10.0_1/`.

Main uses of GDAL:

1. **Data Format Translation**
   - Converts between different geospatial file formats
   - Supports 200+ raster formats (like GeoTIFF, NetCDF, PNG, JPEG) 
   - Supports 100+ vector formats (like Shapefile, GeoJSON, KML)

2. **Raster Data Processing**
   - Reading and writing satellite/aerial imagery
   - Image warping (reprojection)
   - Mosaicing multiple images
   - Color manipulation and band calculations
   - DEM (Digital Elevation Model) processing

3. **Coordinate System Transformations**
   - Converting between different map projections
   - Handling coordinate reference systems (CRS)
   - Datum transformations

4. **Vector Data Processing**
   - Reading and writing geographic features
   - Spatial operations
   - Attribute manipulation
   - Vector format conversion

5. **Spatial Analysis**
   - Terrain analysis
   - Distance calculations
   - Buffer creation
   - Spatial queries

## GeoServer Oracle Database Connection

### Setup Requirements
1. **Oracle JDBC Driver**
   - Download `ojdbc8.jar` or `ojdbc11.jar`
   - Place in GeoServer's `WEB-INF/lib` directory

2. **Oracle Extension**
   - Download from https://geoserver.org/download/
   - Extract to GeoServer's `WEB-INF/lib` directory

3. **Configure Connection**
   ```
   host: your_oracle_host
   port: your_oracle_port (usually 1521)
   database: your_sid_or_service_name
   schema: your_schema
   user: your_username
   password: your_password
   ```

### Use Cases
1. **Serving Spatial Data**
   - WMS/WFS services
   - Web mapping applications
   - Real-time data access

2. **Enterprise Integration**
   - Single source of truth
   - Real-time updates
   - Security integration

3. **Performance Benefits**
   - Oracle spatial indexes
   - Database-level caching
   - Query optimization

## APEX Integration

### MapLibre Integration Code

\`\`\`javascript
// geoserver-map.js
const initGeoServerMap = function(regionId, geoserverUrl, workspace, layer) {
    // Get the map object from the APEX region
    const mapRegion = apex.region(regionId);
    const map = mapRegion.widget().getMap();
    
    // Wait for the map to load
    map.on('load', function() {
        // Add WMS layer from GeoServer
        map.addLayer({
            'id': `${workspace}-${layer}-wms`,
            'type': 'raster',
            'source': {
                'type': 'raster',
                'tiles': [
                    `${geoserverUrl}/wms?` +
                    'service=WMS' +
                    '&version=1.1.0' +
                    '&request=GetMap' +
                    `&layers=${workspace}:${layer}` +
                    '&bbox={bbox-epsg-3857}' +
                    '&width=256' +
                    '&height=256' +
                    '&srs=EPSG:3857' +
                    '&format=image/png' +
                    '&transparent=true'
                ],
                'tileSize': 256
            },
            'paint': {
                'raster-opacity': 0.8
            }
        });

        // Add popup interaction
        map.on('click', `${workspace}-${layer}-wms`, function(e) {
            // Get feature info from GeoServer
            const bbox = map.getBounds().toString();
            const point = e.point;
            
            // WMS GetFeatureInfo request
            fetch(`${geoserverUrl}/wms?` +
                'service=WMS' +
                '&version=1.1.0' +
                '&request=GetFeatureInfo' +
                `&layers=${workspace}:${layer}` +
                '&query_layers=${workspace}:${layer}' +
                '&info_format=application/json' +
                `&bbox=${bbox}` +
                `&x=${Math.round(point.x)}` +
                `&y=${Math.round(point.y)}` +
                '&width=' + map.getCanvas().width +
                '&height=' + map.getCanvas().height +
                '&srs=EPSG:3857'
            )
            .then(response => response.json())
            .then(data => {
                if (data.features && data.features.length > 0) {
                    // Create popup content from feature properties
                    const properties = data.features[0].properties;
                    let content = '<div class="custom-popup">';
                    for (const [key, value] of Object.entries(properties)) {
                        content += `<p><strong>${key}:</strong> ${value}</p>`;
                    }
                    content += '</div>';

                    // Show popup
                    new maplibregl.Popup()
                        .setLngLat(e.lngLat)
                        .setHTML(content)
                        .addTo(map);
                }
            });
        });

        // Change cursor on hover
        map.on('mouseenter', `${workspace}-${layer}-wms`, function() {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', `${workspace}-${layer}-wms`, function() {
            map.getCanvas().style.cursor = '';
        });
    });

    // Add layer controls if needed
    const toggleLayer = function(layerId) {
        const visibility = map.getLayoutProperty(layerId, 'visibility');
        if (visibility === 'visible') {
            map.setLayoutProperty(layerId, 'visibility', 'none');
        } else {
            map.setLayoutProperty(layerId, 'visibility', 'visible');
        }
    };

    // Return public methods
    return {
        toggleLayer: toggleLayer,
        setOpacity: function(opacity) {
            map.setPaintProperty(`${workspace}-${layer}-wms`, 'raster-opacity', opacity);
        }
    };
};
\`\`\`

### Faceted Search Integration

\`\`\`javascript
// Enhanced geoserver-map.js with Faceted Search support
const initGeoServerMap = function(regionId, geoserverUrl, workspace, layer) {
    const mapRegion = apex.region(regionId);
    const map = mapRegion.widget().getMap();
    let currentCQLFilter = '';
    
    // Function to update layer with CQL filter
    const updateLayerFilter = function(cqlFilter) {
        currentCQLFilter = cqlFilter;
        
        // Remove existing layer
        if (map.getLayer(`${workspace}-${layer}-wms`)) {
            map.removeLayer(`${workspace}-${layer}-wms`);
            map.removeSource(`${workspace}-${layer}-wms`);
        }
        
        // Add layer with new filter
        map.addLayer({
            'id': `${workspace}-${layer}-wms`,
            'type': 'raster',
            'source': {
                'type': 'raster',
                'tiles': [
                    `${geoserverUrl}/wms?` +
                    'service=WMS' +
                    '&version=1.1.0' +
                    '&request=GetMap' +
                    `&layers=${workspace}:${layer}` +
                    '&bbox={bbox-epsg-3857}' +
                    '&width=256' +
                    '&height=256' +
                    '&srs=EPSG:3857' +
                    '&format=image/png' +
                    '&transparent=true' +
                    (cqlFilter ? `&CQL_FILTER=${encodeURIComponent(cqlFilter)}` : '')
                ],
                'tileSize': 256
            },
            'paint': {
                'raster-opacity': 0.8
            }
        });
    };

    // Convert Faceted Search selections to CQL
    const facetsToCQL = function(facets) {
        let conditions = [];
        
        facets.forEach(facet => {
            switch(facet.type) {
                case 'STRING':
                    if (facet.values && facet.values.length > 0) {
                        const values = facet.values.map(v => `'${v}'`).join(',');
                        conditions.push(`${facet.column} IN (${values})`);
                    }
                    break;
                    
                case 'NUMBER':
                    if (facet.min !== undefined || facet.max !== undefined) {
                        if (facet.min !== undefined) {
                            conditions.push(`${facet.column} >= ${facet.min}`);
                        }
                        if (facet.max !== undefined) {
                            conditions.push(`${facet.column} <= ${facet.max}`);
                        }
                    }
                    break;
                    
                case 'DATE':
                    if (facet.min || facet.max) {
                        if (facet.min) {
                            conditions.push(`${facet.column} >= '${facet.min}'`);
                        }
                        if (facet.max) {
                            conditions.push(`${facet.column} <= '${facet.max}'`);
                        }
                    }
                    break;
            }
        });
        
        return conditions.length > 0 ? conditions.join(' AND ') : null;
    };

    // Initialize map when loaded
    map.on('load', function() {
        updateLayerFilter(''); // Initial load without filters
    });

    // Return public methods
    return {
        updateFromFacets: function(facetRegionId) {
            const facetRegion = apex.region(facetRegionId);
            const facets = facetRegion.getFacets();
            const cqlFilter = facetsToCQL(facets);
            updateLayerFilter(cqlFilter);
        },
        
        getCurrentFilter: function() {
            return currentCQLFilter;
        }
    };
};
\`\`\`

### APEX Page Setup

1. **Create Map Region**
   - Type: Map
   - Set Static ID
   - Configure base map

2. **JavaScript Initialization**
   ```javascript
   // In Page Properties -> JavaScript -> Function and Global Variable Declaration
   let geoserverMap;

   // In Execute when Page Loads
   geoserverMap = initGeoServerMap(
       "my_map",
       "https://your-geoserver-url/geoserver",
       "your_workspace",
       "your_layer"
   );
   ```

3. **Faceted Search Dynamic Action**
   - Event: After Refresh
   - Selection Type: Region
   - Region: Faceted Search region
   ```javascript
   geoserverMap.updateFromFacets("faceted_search_region_static_id");
   ```

4. **Optional CSS**
   ```css
   .custom-popup {
       padding: 10px;
       max-width: 300px;
   }

   .custom-popup p {
       margin: 5px 0;
   }
   ```

## Notes
- APEX Map regions use MapLibre GL JS (not Leaflet or OpenLayers)
- WFS is not directly supported in APEX Map regions
- Integration requires JavaScript customization
- Faceted Search can filter map data using CQL filters
