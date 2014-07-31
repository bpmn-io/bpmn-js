'use strict';

var _ = require('lodash');
var $ = require('jquery');
var idGenerator = new (require('../../util/IdGenerator'))('ov');

/**
 * @class
 *
 * A plugin that add an API that allows to add HTML overlays to diagram Shapes.
 *
 * Translations on the canvas will also take place on the overlays.
 * Changes in zoom level have no effect to the overlay.
 *
 * @param {eventBus} The event bus
 * @param {canvas} Instance of the canvas service
 */
function Overlays(eventBus, canvas, elementRegistry) {
  var self = this;

  var ZOOM_LOW_LIMIT  = 0.5;
  var ZOOM_UPPER_LIMIT  = 2.0;

  this._overlays = {};
  this._elementRegistry = elementRegistry;
  this._canvas = canvas;
  this._setOverlayPosition = setOverlayPosition;
  this._setOverlayVisible = setOverlayVisible;
  this._idGenerator = idGenerator;

  function setOverlaysPosition(viewBox) {
    _.forEach(self._overlays, function(overlay) {
      setOverlayPosition(overlay, viewBox);
    });
  }

  function setOverlaysVisible() {
    var zoom = canvas.zoom();

    _.forEach(self._overlays, function(overlay) {
      setOverlayVisible(overlay, zoom);
    });
  }

  function setOverlayVisible(overlay, zoom) {
    var m = zoom < (overlay.config.minZoom || ZOOM_LOW_LIMIT);
    var u = zoom > (overlay.config.maxZoom || ZOOM_UPPER_LIMIT);

    if(m || u) {
      overlay.overlayContainer.style.display = 'none';
    } else {
      overlay.overlayContainer.style.display = '';
    }
  }

  function setOverlayPosition(overlay, viewBox) {
    var top  = overlay.config.x ? overlay.config.x : overlay.shape.x;
    var left = overlay.config.y ? overlay.config.y : overlay.shape.y;

    var a = viewBox.scale || 1;
    var d = viewBox.scale || 1;
    var e = viewBox.x || 0;
    var f = viewBox.y || 0;

    var matrixString = 'matrix(' +
      '1,0,0,1,' +
      (e + (top * a)) + ',' +
      (f + (left * d)) + ')';

    overlay.overlayContainer.style.transform = matrixString;
  }

  function init() {
    self._overlayParentContainer = canvas.getContainer();

    /**
     * @event overlaycontainer.init - Overlay types should register for this event
     *                                 and should register itself at the overlay service
     */
    eventBus.fire('overlaycontainer.init', {});
  }

  // Register event handler
  eventBus.on('canvas.init', function() {
    init();
  });

  eventBus.on('canvas.viewbox.changed', function(event) {
    setOverlaysPosition(event.viewbox);
    setOverlaysVisible();
  });

  eventBus.on('shape.changed', function(event) {
    var overlay;
    _.forEach(self._overlays, function(_overlay) {
      if(_overlay.shape.id === event.element.id) {
        overlay = _overlay;
      }
    });
    if(overlay && !overlay.x) {
      setOverlayPosition(overlay, canvas.viewBox());
    }
  });

  eventBus.on('shape.removed', function(event) {
    var overlay;
    _.forEach(self._overlays, function(_overlay) {
      if(_overlay.shape.id === event.element.id) {
        overlay = _overlay;
      }
    });
    if(!!overlay) {
      self.removeOverlay(overlay.id);
    }
  });
  return this;
}



Overlays.prototype._createOverlayInstanceContainer = function(id) {

  var overlayContainer = $('<div/>', {
    class: 'overlay-container',
    id: id
  }).insertBefore($(this._canvas.getContainer()).find( 'svg' ));

  overlayContainer.css({
    position: 'absolute'
  });

  return overlayContainer.get(0);
};

Overlays.prototype.getOverlays = function() {
  return _.clone(this._overlays);
};

/**
 * Adds a HTML overlay to an element.
 *
 * @param {Shape} shape - Attach overlay to this shape
 * @param {Object} overlayConfig - <pre>{
 *   html: '&lt;div&gt;Test&lt;/div&gt;', // String containing valid HTML or a jQuery object
 *   minZoom: 0.2,            // (optional) minimum zoom level until the overlay will hidden
 *   maxZoom: 1.8,            // (optional) maximum zoom level until the overlay will hidden
 *   x:  50,                  // (optional) use x instead of element.position.x
 *   y:  50                   // (optional) use y instead of element.position.y
 * }</pre>
 *
 * The property html could be a string or a jQuery object.
 */
Overlays.prototype.addOverlay = function(shape, overlayConfig) {

  var id = this._idGenerator.next();
  _.extend(overlayConfig, {
    id: id
  });

  var overlayContainer = this._createOverlayInstanceContainer(id);

  var html = $(overlayConfig.html);
  $(overlayContainer).append(html);

  this._overlays[id] = {
    id: id,
    overlayContainer: overlayContainer,
    shape: shape,
    config: overlayConfig
  };

  this._setOverlayPosition(this._overlays[id], this._canvas.viewbox());
  this._setOverlayVisible(this._overlays[id], this._canvas.zoom());

  return id;
};

Overlays.prototype.removeOverlay = function(id) {
  $('#' + id).remove();
  delete this._overlays[id];
};

Overlays.$inject = [ 'eventBus', 'canvas', 'elementRegistry' ];

module.exports = Overlays;