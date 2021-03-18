// This script displays the Avalanche Canada avy areas on the map
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