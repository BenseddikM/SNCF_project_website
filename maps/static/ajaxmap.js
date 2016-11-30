//Create Base Layer, loads tiles from mapbox
var baseMap = new L.TileLayer('https://api.mapbox.com/styles/v1/leonardbinet/ciw0kj8c500b82klkfevbaje3/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGVvbmFyZGJpbmV0IiwiYSI6ImNpdzBrNjU4NzAwMmwyb3BrYjQxemRoNnMifQ.7yzHGWbiQtCabkcgHa4oWw'
);

// Create index to put control (to show or not layers).
var baseMapIndex = {
  "Map": baseMap
};

// Create the map
var map = new L.map('mapid', {
    center: new L.LatLng(46.5, 2.5),
    zoom: 6,
    maxZoom: 18,
    layers: baseMap
});
map.doubleClickZoom.disable();

// Point style
var stationStyle = {
  opacity: 0.9,
  fillOpacity: 0.7
};


// Create the control and add it to the map;
var control = L.control.layers(baseMapIndex);
// Grab the handle of the Layer Control, it will be easier to find.
control.addTo(map);

// We create each point with its style (from GeoJSON file)
function onEachFeature(feature, layer) {
    layer.bindPopup(function (layer) {
        return layer.feature.properties.label;
    });
}
// How JSON points will look
function pointToLayer(feature, latlng) {
    return L.circleMarker(latlng, stationStyle);
}

// We download the GeoJSON file
// Do this in the same scope as the actualiseGeoJSON function,
// so it can read the variable
$.getJSON(ajaxurl, // ajax view url
    {
        lat: 46.5,
        lng: 2.5,
    },
    initialLoad);

function initialLoad(data){
    map.stopPointsLayer = L.geoJson(data["stop_points"],
        {onEachFeature: onEachFeature,
        pointToLayer: pointToLayer}
        )
    ;
    // CHECK
    map.markers = L.markerClusterGroup();
    map.markers.addLayer(map.stopPointsLayer);
    map.addLayer(map.markers);
    // Add overlay to control panel
    control.addOverlay(map.markers, "Stop points");

}


function refreshGeoJsonLayer(latlng) {
    // Then get data, and add it back to the layer
    // TODO query MongoDB with parameter in bounds
    $.getJSON(ajaxurl, // ajax view url
        {
            lat: latlng.lat,
            lng: latlng.lng
        },
        function (data) {
        // First we clear the layer
        map.stopPointsLayer.clearLayers();
        map.stopPointsLayer.addData(data["stop_points"]);
        map.markers.clearLayers();
        map.markers.addLayer(map.stopPointsLayer);
    });
}


function onMapDoubleClick(e) {
    var latlng = e.latlng;
    refreshGeoJsonLayer(latlng);
}

// Datas are modified if
map.on('dblclick', onMapDoubleClick);
