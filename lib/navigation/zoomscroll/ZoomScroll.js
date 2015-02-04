'use strict';

var domEvent = require('min-dom/lib/event');

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
    var factor = 1 + (direction / ZOOM_OFFSET);

    canvas.zoom(cap(currentZoom * factor), position);
  }


  function init(element) {

    domEvent.bind(element, 'wheel', function(event) {

      var factor = event.deltaMode === 0 ? 1/40 : 1/2;

      var shift = event.shiftKey,
          ctrl = event.ctrlKey;

      var x = event.deltaX * factor,
          y = event.deltaY * factor;

      if (shift || ctrl) {
        var delta = {};

        if (ctrl) {
          delta.dx = SCROLL_OFFSET * (x || y);
        } else {
          delta.dy = SCROLL_OFFSET * (x || y);
        }

        canvas.scroll(delta);
      } else {
        var offset = {};

        // gecko=layer*, other=offset*
        if (isNaN(event.offsetX)) {
          offset = {
            x: event.layerX,
            y: event.layerY
          };
        } else {
          offset = {
            x: event.offsetX,
            y: event.offsetY
          };
        }

        // zoom in relative to diagram {x,y} coordinates
        zoom(y, offset);
      }

      event.preventDefault();
    });
  }

  events.on('canvas.init', function(e) {
    init(e.svg.node);
  });

  // API
  this.zoom = zoom;
  this.reset = reset;
}


ZoomScroll.$inject = [ 'eventBus', 'canvas' ];

module.exports = ZoomScroll;

