/* global google MarkerClusterer $ */

$(document).ready(function () {
    var mapOpts = {
        center: new google.maps.LatLng(38.9695, -98.1347),
        zoom: 4,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(p) {
            mapOpts.center = new google.maps.LatLng(p.coords.latitude, p.coords.longitude);
            mapOpts.zoom = 11;
            initMap(mapOpts);
        }, initMap.bind(this, mapOpts), {timeout: 3000});
    }
    else {
        initMap(mapOpts);
    }

});

function initMap(mapOpts) {
    var theMap = new google.maps.Map(document.getElementById('map'), mapOpts);
    var theMarkers = locations.map(function (l) {
        return new google.maps.Marker({
            position: new google.maps.LatLng(l.location.latitude, l.location.longitude),
            title: l.full_address
        });
    });
    var theClusterer = new MarkerClusterer(theMap, theMarkers);
}