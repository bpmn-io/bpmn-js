'use strict';

var domEvent = require('min-dom/lib/event');

var hasPrimaryModifier = require('../../util/Mouse').hasPrimaryModifier,
    hasSecondaryModifier = require('../../util/Mouse').hasSecondaryModifier;


function ZoomScroll(events, canvas) {

  var RANGE = { min: 0.2, max: 4 };

  var ZOOM_OFFSET = 5;
  var SCROLL_OFFSET = 50;

  function cap(scale) {
    return Math.max(RANGE.min, Math.min(RANGE.max, scale));
  }

  function reset() {
    canvas.zoom('fit-viewport');
  }

  function zoom(direction, position) {

    var currentZoom = canvas.zoom();
    var factor = Math.pow(1 + Math.abs(direction / ZOOM_OFFSET) , direction > 0 ? 1 : -1);

    canvas.zoom(cap(currentZoom * factor), position);
  }


  function init(element) {

    domEvent.bind(element, 'wheel', function(event) {

      var factor = event.deltaMode === 0 ? 1/40 : 1/2;

      // mouse-event: SELECTION_KEY
      // mouse-event: AND_KEY
      var isZoom = hasPrimaryModifier(event),
          isHorizontalScroll = hasSecondaryModifier(event);

      var x = event.deltaX * factor,
          y = event.deltaY * factor;

      if (isZoom) {

        var elementRect = element.getBoundingClientRect();

        var offset =  {
          x: event.x - elementRect.left,
          y: event.y - elementRect.top
        };

        // zoom in relative to diagram {x,y} coordinates
        zoom(y * -1, offset);
      } else {
        var delta = {};

        if (isHorizontalScroll) {
          delta.dx = SCROLL_OFFSET * (x || y);
        } else {
          delta.dy = SCROLL_OFFSET * (x || y);
        }

        canvas.scroll(delta);
      }

      event.preventDefault();
    });
  }

  events.on('canvas.init', function(e) {
    init(canvas._container);
  });

  // API
  this.zoom = zoom;
  this.reset = reset;
}


ZoomScroll.$inject = [ 'eventBus', 'canvas' ];

module.exports = ZoomScroll;

