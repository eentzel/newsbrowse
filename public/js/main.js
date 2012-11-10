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

    $('#story_details').on('click', '#details_close', function(evt) {
        evt.preventDefault();
        $('#story_details').removeClass('expanded');
    });

});

function showStoryDetails(story) {
    var detailsTemplate = $('#details_template').html();

    $('#story_details')
        .html(Mustache.to_html(detailsTemplate, story))
        .addClass('expanded');
}

function markerClickHandler(marker) {
    showStoryDetails(marker.story);
}

function initMap(mapOpts) {
    var theMap = new google.maps.Map(document.getElementById('map'), mapOpts);
    var theMarkers = locations.map(function (l) {
        return new google.maps.Marker({
            position: new google.maps.LatLng(l.location.latitude, l.location.longitude),
            story: {
                description: "Get a dog up ya grouse no worries you little ripper budgie smugglers. It'll be aerial pingpong flamin as busy as a ugg boots. He hasn't got a smoko flamin he's got a massive fremantle doctor. Trent from punchy fair dinkum also trent from punchy blowie. We're going knock to mad as a outback.",
                url: 'http://www.example.com/',
                headline: 'This is a story'
            },
            title: l.full_address
        });
    });
    var theClusterer = new MarkerClusterer(theMap, theMarkers);

    theMarkers.forEach(function (marker) {
        google.maps.event.addListener(marker, 'click', markerClickHandler.bind(this, marker));
    });
}