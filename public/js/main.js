/* global google MarkerClusterer $ */

var WORLD_STORIES = '/api/v1/stories/top';

$(document).ready(function () {
  var mapOpts = {
    // if changing zoom here, also change the corresponding class name on div#map in index.html
    center: new google.maps.LatLng(48.54416, 89.95123),
    zoom: 3,
    minZoom: 2,
    backgroundColor: 'rgb(21, 21, 21)',
    mapTypeControlOptions: { position: google.maps.ControlPosition.TOP_LEFT },
    mapTypeId: preferedMapType()
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

  $('#map').on('mouseover', '.story_marker', function(evt) {
    $('.story_marker').css('z-index', 'auto');
    $(this).css('z-index', 2);
  });

  $(document).keyup(function(evt) {
    if (evt.which === 27) { // ESC
      $('#story_details').removeClass('expanded');
    }
  });

});

function preferedMapType() {
  if (window.localStorage) {
    return window.localStorage.getItem('preferedMapType') || google.maps.MapTypeId.SATELLITE;
  }
  return google.maps.MapTypeId.SATELLITE;
}

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

function initMap(mapOpts) {
  var theMap = new google.maps.Map(document.getElementById('map'), mapOpts);
  $('#map').addClass(theMap.getMapTypeId());

  var socket = io.connect();
  socket.on('news', function (stories) {
    var theMarkers = stories.map(function (story) {
      var m;
      if (story.main_image) {
        m = new StoryMarker({
          position: new google.maps.LatLng(story.location[0], story.location[1]),
          story: story,
          icon: story.main_image,
          title: story.title
        });
        $(m.element).on('click', markerClickHandler.bind(this, m));
      }
      else {
        m = new google.maps.Marker({
          position: new google.maps.LatLng(story.location[0], story.location[1]),
          story: story,
          title: story.title
        });
        google.maps.event.addListener(m, 'click', markerClickHandler.bind(this, m));
      }
      return m;
    });

    // var theClusterer = new MarkerClusterer(theMap, theMarkers, {averageCenter: true});
    theMarkers.forEach(function (marker) {
      marker.setMap(theMap);
    });
  });

  // google.maps.event.addListener(theClusterer, 'click', clusterClickHandler);
  google.maps.event.addListener(theMap, 'zoom_changed', function () {
    var z = theMap.getZoom();
    $('#map').removeClass('zoom1 zoom2 zoom3 zoom4');
    if (z < 5) {
      $('#map').addClass('zoom' + z);
    }
  });

  google.maps.event.addListener(theMap, 'maptypeid_changed', function () {
    var type = theMap.getMapTypeId();
    $('#map').removeClass('roadmap satellite').addClass(type);
    if (window.localStorage) {
      window.localStorage.setItem('preferedMapType', type);
    }
  });

}