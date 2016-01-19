'use strict';

var domEvent = require('min-dom/lib/event');

var hasPrimaryModifier = require('../../util/Mouse').hasPrimaryModifier,
    hasSecondaryModifier = require('../../util/Mouse').hasSecondaryModifier;

var isMac = require('../../util/Platform').isMac;

var getStepRange = require('./ZoomUtil').getStepRange,
    cap = require('./ZoomUtil').cap;

var log10 = require('../../util/Math').log10;

var assign = require('lodash/object/assign');

var RANGE = { min: 0.2, max: 4 },
    NUM_STEPS = 10;

var DEFAULT_OPTIONS = {
    disabled: false
};

/**
 * An implementation of zooming and scrolling within the {@link Canvas}.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
function ZoomScroll(eventBus, canvas, config) {

  this.options = assign({}, DEFAULT_OPTIONS, config.zoomScroll || {});

  // console.log("Config:");
  // console.log(config.zoomScroll);
  // console.log(this.options);

  this._canvas = canvas;
  this._container = canvas._container;

  var self = this;

  eventBus.on('canvas.init', function(e) {
    self._init();
  });
}


ZoomScroll.prototype.scroll = function scroll(delta) {
  this._canvas.scroll(delta);
};


ZoomScroll.prototype.reset = function reset() {
  this._canvas.zoom('fit-viewport');
};


ZoomScroll.prototype.zoom = function zoom(direction, position) {
  var canvas = this._canvas;
  var currentZoom = canvas.zoom(false);

  var factor = Math.pow(1 + Math.abs(direction) , direction > 0 ? 1 : -1);

  canvas.zoom(cap(RANGE, currentZoom * factor), position);
};

/**
 * Zoom along fixed zoom steps
 *
 * @param {Integer} direction zoom direction (1 for zooming in, -1 for out)
 */
ZoomScroll.prototype.stepZoom = function stepZoom(direction, position) {

  var canvas = this._canvas,
      stepRange = getStepRange(RANGE, NUM_STEPS);

  direction = direction > 0 ? 1 : -1;

  var currentLinearZoomLevel = log10(canvas.zoom());

  // snap to a proximate zoom step
  var newLinearZoomLevel = Math.round(currentLinearZoomLevel / stepRange) * stepRange;

  // increase or decrease one zoom step in the given direction
  newLinearZoomLevel += stepRange * direction;

  // calculate the absolute logarithmic zoom level based on the linear zoom level
  // (e.g. 2 for an absolute x2 zoom)
  var newLogZoomLevel = Math.pow(10, newLinearZoomLevel);

  canvas.zoom(cap(RANGE, newLogZoomLevel), position);
};


ZoomScroll.prototype.setEnabled = function setEnabled(enabled) {

    // console.log("called setEnabled(" + enabled + ")");

    var element = this._container;
    var self = this;

    function bindWheel(event) {

        event.preventDefault();

        // mouse-event: SELECTION_KEY
        // mouse-event: AND_KEY
        var isVerticalScroll = hasPrimaryModifier(event),
            isHorizontalScroll = hasSecondaryModifier(event);

        var factor;

        if (isVerticalScroll || isHorizontalScroll) {

          if (isMac) {
            factor = event.deltaMode === 0 ? 1.25 : 50;
          } else {
            factor = event.deltaMode === 0 ? 1/40 : 1/2;
          }

          var delta = {};

          if (isHorizontalScroll) {
            delta.dx = (factor * (event.deltaX || event.deltaY));
          } else {
            delta.dy = (factor * event.deltaY);
          }
          self.scroll(delta);
        } else {
          factor = (event.deltaMode === 0 ? 1/40 : 1/2);

          var elementRect = element.getBoundingClientRect();

          var offset =  {
            x: event.clientX - elementRect.left,
            y: event.clientY - elementRect.top
          };

          // zoom in relative to diagram {x,y} coordinates
          self.zoom(event.deltaY * factor / (-5), offset);
        }
    }

    if(enabled) {
        // bin wheel to dom
        domEvent.bind(element, 'wheel', bindWheel, true);
    } else {
        domEvent.unbind(element, 'wheel', bindWheel, true);
    }
};


ZoomScroll.prototype._init = function() {

  var disabled = this.options.disabled;

  this.setEnabled(!disabled);

};


ZoomScroll.$inject = [ 'eventBus', 'canvas', 'config' ];

module.exports = ZoomScroll;
