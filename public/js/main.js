/* global google $ */

$(document).ready(function () {
    var mapOpts = {
        center: new google.maps.LatLng(-27.606286439866967, 135.94821875),
        zoom: 4,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById('map'), mapOpts);
});
