// Script for drawing the separate AvyCan regions on the leaflet map and displaying the forecasted region rating

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