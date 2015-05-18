'use strict';

var domEvent = require('min-dom/lib/event');

var hasPrimaryModifier = require('../../util/Mouse').hasPrimaryModifier,
    hasSecondaryModifier = require('../../util/Mouse').hasSecondaryModifier;

var isMac = require('../../util/Platform').isMac;


function ZoomScroll(events, canvas) {

  var RANGE = { min: 0.2, max: 4 };

  function cap(scale) {
    return Math.max(RANGE.min, Math.min(RANGE.max, scale));
  }

  function reset() {
    canvas.zoom('fit-viewport');
  }

  function zoom(direction, position) {

    var currentZoom = canvas.zoom();
    var factor = Math.pow(1 + Math.abs(direction) , direction > 0 ? 1 : -1);

    canvas.zoom(cap(currentZoom * factor), position);
  }

  function scroll(delta) {
    canvas.scroll(delta);
  }

  function init(element) {

    domEvent.bind(element, 'wheel', function(event) {

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

        scroll(delta);
      } else {
        factor = (event.deltaMode === 0 ? 1/40 : 1/2);

        var elementRect = element.getBoundingClientRect();

        var offset =  {
          x: event.clientX - elementRect.left,
          y: event.clientY - elementRect.top
        };

        // zoom in relative to diagram {x,y} coordinates
        zoom(event.deltaY * factor / (-5), offset);
      }
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

