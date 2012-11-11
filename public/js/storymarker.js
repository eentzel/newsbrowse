/*
 * This is a custom subclass of google.maps.OverlayView. See:
 * https://developers.google.com/maps/documentation/javascript/reference#OverlayView
 * https://developers.google.com/maps/documentation/javascript/overlays#CustomOverlays
 */

var StoryMarker = (function () {

    function Marker( opts ) {
        this.position = opts.position;
        this.story = opts.story;
        this.icon = opts.icon;
        this.title = opts.title;

        this.createDomNodes();
    }
    Marker.prototype = new google.maps.OverlayView();

    function setStyle( el, value ) {
        if( document.all && ! window.opera ) {
            // you can't use setAttribute w/ "style" in IE
            el.style.cssText = value;
        } else {
            el.setAttribute( 'style', value );
        }
    }

    Marker.prototype.createDomNodes = function() {
        this.element = document.createElement('img');
        this.element.className = "story_marker";
        this.element.src = this.icon;
        setStyle( this.element,  "position: absolute;" );
    };

    /**
     * Called by MarkerClusterer
     */
    Marker.prototype.getDraggable = function() {
        return false;
    };

    /**
     * Called by MarkerClusterer
     */
    Marker.prototype.getPosition = function() {
        return this.position;
    };

    /**
     * Called by Google after this marker is added to a map via setMap()
     * @override
     */
    Marker.prototype.onAdd = function() {
        this.getPanes().floatPane.appendChild(this.element);
    };

    /**
     * Called by Google when this marker is removed from the map
     * @override
     */
    Marker.prototype.onRemove = function() {
        this.element.parentNode.removeChild( this.element );
        // this.element = null;
    };

    /**
     * Called by Google when this marker needs to be drawn
     * @override
     */
    Marker.prototype.draw = function() {
        var proj = this.getProjection(),
            markerXY = proj.fromLatLngToDivPixel( this.position ),
            left = markerXY.x - this.element.offsetWidth/2,
            top = markerXY.y - this.element.offsetHeight/2;

        this.element.style.left = left + 'px';
        this.element.style.top = top + 'px';
    };

    return Marker;
}());
