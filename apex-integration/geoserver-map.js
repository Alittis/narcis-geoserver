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
                `&query_layers=${workspace}:${layer}` +
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
