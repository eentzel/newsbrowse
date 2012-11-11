/* global google MarkerClusterer $ */

var WORLD_STORIES = '/api/v1/stories/top';

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
    $(document).keyup(function(evt) {
        if (evt.which === 27) { // ESC
            $('#story_details').removeClass('expanded');
        }
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

function shouldExplode(cluster) {
    var span = cluster.getBounds().toSpan(),
        lat = span.lat(),
        lng = span.lng(),
        distance = Math.sqrt(lat*lat + lng*lng);

    return distance > 0;
}

function clusterClickHandler(cluster) {
    if (shouldExplode(cluster)) {
        this.setZoomOnClick(true);
    }
    else {
        this.setZoomOnClick(false);
        var stories = cluster.getMarkers().map(function(m) {return m.story;});
        showStoryDetails(stories);
    }
}

var icons = (function() {
    var i = 0;
    var choices = [
        'http://graphics8.nytimes.com/images/2012/11/08/world/asia/20121108BEIJING-slide-05W8/20121108BEIJING-slide-05W8-thumbStandard.jpg',
        'http://graphics8.nytimes.com/images/2012/11/11/world/PACIFIC/PACIFIC-thumbStandard.jpg',
        'http://graphics8.nytimes.com/images/2012/11/11/fashion/11PLAYBOY_SPAN/11PLAYBOY_SPAN-thumbStandard.jpg',
        'http://graphics8.nytimes.com/images/2012/11/10/world/egypt1/egypt1-thumbStandard.jpg',
        'http://graphics8.nytimes.com/images/2012/10/13/world/asia/gandhi-nehru-dynasty-slide-C1SX/gandhi-nehru-dynasty-slide-C1SX-thumbStandard.jpg',
        'http://graphics8.nytimes.com/images/2012/11/10/world/10iht-manila-babies/10iht-manila-babies-thumbStandard-v2.jpg',
        'http://graphics8.nytimes.com/images/2012/11/07/world/middleeast/07lede_israel1/07lede_israel1-thumbStandard.jpg'
    ];

    return {
        next: function() {
            i = (i + 1) % choices.length;
            return choices[i];
        }
    };
})();

function initMap(mapOpts) {
    var theMap = new google.maps.Map(document.getElementById('map'), mapOpts);

    $.ajax(WORLD_STORIES).then(function (stories) {
        var theMarkers = stories.map(function (story) {
            return new StoryMarker({
                position: new google.maps.LatLng(story.location[0], story.location[1]),
                story: story,
                icon: icons.next(),
                title: story.title
            });
        });

        // var theClusterer = new MarkerClusterer(theMap, theMarkers, {averageCenter: true});
        theMarkers.forEach(function (marker) {
            marker.setMap(theMap);
            $(marker.element).on('click', markerClickHandler.bind(this, marker));
        });
        // google.maps.event.addListener(theClusterer, 'click', clusterClickHandler);
    });
}