// Script for the leaflet map

var mymap = L.map('mapid').setView([51.0447, -114.0719], 10);

L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{
    minZoom: 3,
    maxZoom: 17,
    detectRetina: false,
    attribution: 'Kartendaten: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, SRTM ' +
        '| Kartendarstellung: © <a href="https://opentopomap.org/">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
}).addTo(mymap);