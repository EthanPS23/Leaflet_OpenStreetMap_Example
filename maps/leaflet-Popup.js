// Script for controling the different popups that occur on the leaflet map

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
// This section of code is used to get the onclick location coordinates of an avy area for a popup
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