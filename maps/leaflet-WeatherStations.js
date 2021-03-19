// Script to display the weather stations from ACIS and AvyCan

// Display avy Canada weather stations on the map
$.getJSON("https://api.avalanche.ca/weather/stations", function(data){
    var clusters = L.markerClusterGroup();
    var jsonFeatures = [];
    data.forEach(element => {
        var lat = element.latitude;
        var lon = element.longitude;

        var feature = {
            type: 'Feature',
            properties: element,
            geometry: {
                type: 'Point',
                coordinates: [lon,lat]
            }
        };
        jsonFeatures.push(feature);
    });

    var geoJson = { type: 'FeatureCollection', features: jsonFeatures };

    var marks = L.geoJson(geoJson,{
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng, {icon: avyCanadaWeatherStations});
        },
        onEachFeature: function(feature,layer){
            layer.bindTooltip(feature.properties.name, {sticky: true});

            layer.addTo(clusters);

            layer.on('click', function(){
                window.open("https://www.avalanche.ca/weather/stations/" + feature.properties.stationId);
            });
        }
    });

    var mixed = {
        "Avalanche Canada Weather Stations": clusters //cluster of avy Canada weather stations
    }

    mymap.addLayer(clusters);
    // L.control.layers(null, mixed).addTo(mymap)
})

// Display ACIS weather stations on the map
$.getJSON("http://localhost/stationsGEO.json", function(data){
    var clusters = L.markerClusterGroup();
    var marks = L.geoJSON(data, {
        onEachFeature: function (feature,layer){
            layer.bindTooltip(feature.properties.name, {sticky: true});

            layer.addTo(clusters);

            layer.on('click', function(){
                window.open(feature.properties.url);
            });
        }
    });

    var mixed = {
        "ACIS Weather Stations": clusters //cluster of ACIS weather stations
    }

    mymap.addLayer(clusters);
    // L.control.layers(null, mixed).addTo(mymap);
});