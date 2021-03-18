// This script is used to call the different AvyCan reports, use custom marker symbols, cluster them, and display upon the map

///////////////////////////////////////////////////////////////////////////////////////////////

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

///////////////////////////////////////////////////////////////////////////////////////////////

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