'use strict';

var $ = require('jquery');

var mousewheel = require('jquery-mousewheel');
if (mousewheel !== $ && !$.mousewheel) { mousewheel($); }


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

    $(element).on('mousewheel', function(event) {

      var shift = event.shiftKey,
          ctrl = event.ctrlKey;

      var x = event.deltaX,
          y = event.deltaY;

      if (shift || ctrl) {
        var delta = {};

        if (ctrl) {
          delta.dx = SCROLL_OFFSET * x;
        } else {
          delta.dy = SCROLL_OFFSET * x;
        }

        canvas.scroll(delta);
      } else {
        zoom(y, { x: event.offsetX, y: event.offsetY });
      }

      event.preventDefault();
    });
  }

  events.on('canvas.init', function(e) {
    init(e.paper.node);
  });

  // API
  this.zoom = zoom;
  this.reset = reset;
}


ZoomScroll.$inject = [ 'eventBus', 'canvas' ];

module.exports = ZoomScroll;