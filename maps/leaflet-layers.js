var mymap = L.map('mapid').setView([51.0447, -114.0719], 10);

L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{
    minZoom: 3,
    maxZoom: 17,
    detectRetina: false,
    attribution: 'Kartendaten: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, SRTM ' +
        '| Kartendarstellung: © <a href="https://opentopomap.org/">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
}).addTo(mymap);

var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent(clickModelContent(e.latlng))
        // .setContent("You clicked the map at " + e.latlng.lat.toFixed(5) + ", " + e.latlng.lng.toFixed(5))
        .openOn(mymap);
}

// Function to display the necessary weather prediction model text and info for popup
function clickModelContent(values){
    var lat = values.lat.toFixed(5);
    var lng = values.lng.toFixed(5);
    var HRDPS = "https://spotwx.com/products/grib_index.php?model=gem_lam_continental&lat=" + lat + "&lon=" + lng + "&tz=America/Edmonton";
    var RDPS = "https://spotwx.com/products/grib_index.php?model=gem_reg_10km&lat=" + lat + "&lon=" + lng + "&tz=America/Edmonton";
    var GDPS = "https://spotwx.com/products/grib_index.php?model=gem_glb_25km&lat=51.83578&lon=-112.85156&tz=America/Edmonton";
    var GEPS = "https://spotwx.com/products/grib_index.php?model=naefs_geps_0p5_raw&lat=51.83578&lon=-112.85156&tz=America/Edmonton";
    var HRRR = "https://spotwx.com/products/grib_index.php?model=hrrr_wrfprsf&lat=51.83578&lon=-112.85156&tz=America/Edmonton";
    var RAP = "https://spotwx.com/products/grib_index.php?model=rap_awp130pgrbf&lat=51.83578&lon=-112.85156&tz=America/Edmonton";
    var NAM = "https://spotwx.com/products/grib_index.php?model=nam_awphys&lat=51.83578&lon=-112.85156&tz=America/Edmonton";
    var str = "You clicked the map at " + lat + ", " + lng + "<p>" +
        "<h3>Weather Model Predictions</h3><p>" +
        '<a href="' + HRDPS + '" target="_blank" rel="noopener noreferrer">' + "HRDPS Continental (GEM-LAM), 2 Day, 2.5km res" + '</a><br>' +
        '<a href="' + RDPS + '" target="_blank" rel="noopener noreferrer">' + "RDPS (GEM-REG) 3.5 day, 10 km res" + '</a><br>' +
        '<a href="' + GDPS + '" target="_blank" rel="noopener noreferrer">' + "GDPS (GEM-GLB) 10 day, 25 km res" + '</a><br>' +
        '<a href="' + GEPS + '" target="_blank" rel="noopener noreferrer">' + "GEPS 16 day, 0.5 degree res" + '</a><br>' +
        '<a href="' + HRRR + '" target="_blank" rel="noopener noreferrer">' + "HRRR 18 hr 3 km res" + '</a><br>' +
        '<a href="' + RAP + '" target="_blank" rel="noopener noreferrer">' + "RAP 21 hr, 13 km res" + '</a><br>' +
        '<a href="' + NAM + '" target="_blank" rel="noopener noreferrer">' + "NAM 3.5 days, 12 km res" + '</a><br>'
        
    return str;
}

mymap.on('click', onMapClick);

////////////////////////////////////////////////////////////////
// This section of code is used to get the onclick location coordinates of and avy area for a popup
// variable to store coordinates of click
var clickedLatLng = {lat: null, lng: null};

// function called when line is clicked
function onPolyClick(e){
    clickedLatLng = e.latlng;
}

// function that creates popup content
function createPopupContent(values) {
    return function(){
        var url = "";

        // Check to see if the value contains an externalUrl, if not use default url, if it does use externalUrl
        if (values.properties.externalUrl == null) {
            url = values.properties.url;
        }else{
            url = values.properties.externalUrl;
        }
        return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + values.properties.name + '</a><p>' +
                clickModelContent(clickedLatLng)
    }
}
////////////////////////////////////////////////////////////////

// Function to get date
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

var todaysDate = new Date();

var last7days = new Date();
last7days.setDate(todaysDate.getDate()-7);
todaysDate = formatDate(todaysDate);

last7days = formatDate(last7days);

var avyCanadaMIN_URL = "https://api.avalanche.ca/min/en/submissions?fromdate=" + last7days + "&todate=" + todaysDate + "&pagesize=1000";

// Display the Avalanche Canada avy areas on the map
$.getJSON( "https://avalanche.ca/api/forecasts", function(data) {
    L.geoJson(data,{
        style: avyCanadaLayerStyle,
        onEachFeature: function (feature, layer) {
            layer.on('mouseover', function () {
                this.setStyle({
                    'weight': 5.5
                });
            });

            layer.on('mouseout', function () {
                this.setStyle({
                    'weight': 2.5
                });
            });

            layer.on('click',onPolyClick);

            layer.bindPopup(
                createPopupContent(feature)
            );

            layer.bindTooltip(feature.properties.name, {sticky: true});
        }
    }).addTo(mymap);
})

// Display Avalanche Canada avy area forecast danger on map
$.getJSON("https://avalanche.ca/api/forecasts", function(data) {
    var jsonFeatures = [];
    data = JSON.parse(JSON.stringify(data.features));
    data.forEach(element =>{
        var lat = element.properties.centroid[1];
        var lon = element.properties.centroid[0];

        var feature = {
            type: 'Feature',
            properties: element.properties,
            geometry: {
                type: 'Point',
                coordinates: [lon,lat]
            }
        };
        jsonFeatures.push(feature);
    });

    var geoJson = { type: 'FeatureCollection', features: jsonFeatures};

    var marks = L.geoJson(geoJson,{
        pointToLayer: function (feature,latlng) {
            // function needs to be called to create markers as another getJSON will be used. Due to getJSON being asynch
            // it will not be able to return a value. Thus, markers will be added to the map within the next getJSON
            avyCanadaRegionRating(feature,latlng);
        }
    });
})

// Fucntion obtains the forecasted rating for the given region and the adds the marker to the map
function avyCanadaRegionRating(feature,latlng){
    var ratings;
    var combinedRatings;
    var forecastURL = "https://www.avalanche.ca" + feature.properties.forecastUrl;
    $.getJSON(forecastURL, function(data){
        combinedRatings = data.iconSet[0].ratings.alp; // obtains the alpine rating
        combinedRatings = combinedRatings + "-" + data.iconSet[0].ratings.tln; // obtains the treeline rating, and combines with alpine rating
        combinedRatings = combinedRatings + "-" + data.iconSet[0].ratings.btl; // obtains the below tree line rating, and combines with alpine and treeline rating
        //console.log(combinedRatings + ", " + forecastURL);
        ratings = combinedRatings;

        var url = "https://assets.avalanche.ca/graphics/forecast/rating/norating-norating-norating.svg";
        if (ratings != null) {
            // here the ratings numbers will be replaced with the word ratings, which are then used to get the corresponding svg
            const str  = ratings;
            const result = str.replace(new RegExp('0','g'),'norating').replace(new RegExp('1','g'),'low').replace(new RegExp('2','g'),'moderate').replace(new RegExp('3','g'),'considerable').replace(new RegExp('4','g'),'high').replace(new RegExp('5','g'),'extreme');

            url =  "https://assets.avalanche.ca/graphics/forecast/rating/" + result + ".svg"; // creates the url containing the forecast rating svg
        }
        
        // adds the marker to the map using the url to get a custom marker symbol for the region
        var mar = L.marker(latlng, {
            icon: L.icon({
                iconSize:[60,60],
                iconAnchor: [30,30],

                iconUrl: url
            })
        }).addTo(mymap);
        mar.on('click',function(){
            // Check to see if the value contains an externalUrl, if not use default url, if it does use externalUrl
            if (feature.properties.externalUrl == null) {
                url = feature.properties.url;
            }else{
                url = feature.properties.externalUrl;
            }
            window.open(url);
        })

    }).fail(function(data){ // if the getJSON fails then it may be because the forecastURL has a separate address, thus
        // the link svg will be used
        var mar = L.marker(latlng, {
            icon: L.icon({
                iconSize:[60,60],
                iconAnchor: [30,30],

                iconUrl: "https://assets.avalanche.ca/graphics/forecast/misc/link.svg"
            })
        }).addTo(mymap);
        mar.on('click',function(){
            // Check to see if the value contains an externalUrl, if not use default url, if it does use externalUrl
            if (feature.properties.externalUrl == null) {
                url = feature.properties.url;
            }else{
                url = feature.properties.externalUrl;
            }
            window.open(url);
        })
    });
}

// Display avy Canada MIN reports on the map 
$.getJSON(avyCanadaMIN_URL, function(dataSubs){
    var clusters = L.markerClusterGroup();
    var jsonFeatures = [];
    dataSubs = JSON.parse(JSON.stringify(dataSubs.items.data));
    dataSubs.forEach(element => {
        var lat = element.location.latitude;
        var lon = element.location.longitude;

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
        pointToLayer: function (feature,latlng) {
            // check to see if the MIN is an incident, if it is not then use normal MIN icon, if it is, use the MIN incident icon
            if (feature.properties.observations.incident == 0) {
                return L.marker(latlng, {icon: avyCanadaMINReports});
            } else {
                return L.marker(latlng, {icon: avyCanadaMINReportsIncident});
            }
        },
        onEachFeature: function (feature, layer) {
            layer.bindTooltip(feature.properties.title, {sticky: true});

            layer.addTo(clusters);

            layer.on('click', function(){
                window.open("https://www.avalanche.ca/mountain-information-network/submissions/" + feature.properties.id);
            });
        }
    // }).addTo(mymap);
    });

    var mixed = { 
        "MIN Reports": clusters
    }

    mymap.addLayer(clusters);
    L.control.layers(null, mixed).addTo(mymap);
})

// Display fatality reports
$.getJSON("https://avalancheca.cdn.prismic.io/api/v2/documents/search?page=1&pageSize=100&q=[[:d%20=%20date.after(my.fatal-accident.dateOfAccident,%20%222020-09-30%22)][:d%20=%20date.before(my.fatal-accident.dateOfAccident,%20%222021-10-01%22)]]&ref=YEefDBAAACAAiSgJ",function(dataFat){
    var clusters = L.markerClusterGroup();
    var jsonFeatures = [];
    dataFat = JSON.parse(JSON.stringify(dataFat.results));
    dataFat.forEach(element =>{
        var lat = element.data.location.latitude;
        var lon = element.data.location.longitude;

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
        pointToLayer: function (feature,latlng) {
            return L.marker(latlng, {icon: avyCanadaFatality});
        },
        onEachFeature: function (feature, layer) {
            layer.bindTooltip(feature.properties.data.title, {sticky: true});

            layer.addTo(clusters);

            layer.on('click', function(){
                window.open(feature.properties.href);
            });
        }
    // }).addTo(mymap);
    });
    mymap.addLayer(clusters);
})

// Display the MCRs from avy Canada
$.getJSON("https://avalanche.ca/api/mcr/", function(data){
    var clusters = L.markerClusterGroup();
    var jsonFeatures = [];
    data.forEach(element => {
        var lat = element.location[1];
        var lon = element.location[0];

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

    var geoJson = { type: 'FeatureCollection', features: jsonFeatures};

    var marks = L.geoJson(geoJson,{
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng, {icon: avyCanadaMCR});
        },
        onEachFeature: function(feature,layer){
            layer.bindTooltip(feature.properties.title, {sticky: true});

            layer.addTo(clusters);

            layer.on('click', function(){
                window.open(feature.properties.permalink);
            });
        }
    // }).addTo(mymap);
    });
    mymap.addLayer(clusters);
})

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

    L.control.layers(null, mixed).addTo(mymap)
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

    L.control.layers(null, mixed).addTo(mymap);
});