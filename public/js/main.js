/* global google MarkerClusterer $ */

// var WORLD_STORIES = '/api/v1/stories/top';
var WORLD_STORIES = '/api/v1/stories/within?bottomleftlat=-89.48765458372031&bottomleftlng=-180&toprightlat=89.44365991287759&toprightlng=180';

$(document).ready(function () {
    var mapOpts = {
        center: new google.maps.LatLng(48.54416, 89.95123),
        zoom: 3,
        minZoom: 2,
        backgroundColor: 'rgb(21, 21, 21)',
        mapTypeControlOptions: { position: google.maps.ControlPosition.TOP_LEFT },
        mapTypeId: google.maps.MapTypeId.SATELLITE
    };

    if (false && "geolocation" in navigator) {
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

function showStoryDetails(stories) {
    var detailsTemplate = $('#details_template').html();

    $('#story_details')
        .html(Mustache.to_html(detailsTemplate, {stories: stories}))
        .addClass('expanded');
}

function markerClickHandler(marker) {
    showStoryDetails(marker.story);
}

function clusterClickHandler(cluster) {
    if (cluster.getMap().getZoom() > 16) {
        this.setZoomOnClick(false);
        var stories = cluster.getMarkers().map(function(m) {return m.story;});
        showStoryDetails(stories);
    }
    else {
        this.setZoomOnClick(true);
    }
}

function initMap(mapOpts) {
    var theMap = new google.maps.Map(document.getElementById('map'), mapOpts);

    $.ajax(WORLD_STORIES).then(function (stories) {
        var theMarkers = stories.map(function (story) {
            return new google.maps.Marker({
                position: new google.maps.LatLng(story.location[0], story.location[1]),
                story: story,
                title: story.title
            });
        });

        var theClusterer = new MarkerClusterer(theMap, theMarkers);
        theMarkers.forEach(function (marker) {
            google.maps.event.addListener(marker, 'click', markerClickHandler.bind(this, marker));
        });
        google.maps.event.addListener(theClusterer, 'click', clusterClickHandler);
    });
}