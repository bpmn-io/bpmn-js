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
        var offset = {};

        // Gecko Browser should use _offsetX
        if(!event.originalEvent.offsetX) {
          offset = {
            x: event.originalEvent._offsetX,
            y: event.originalEvent._offsetY
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
    init(e.paper.node);
  });

  // API
  this.zoom = zoom;
  this.reset = reset;
}


ZoomScroll.$inject = [ 'eventBus', 'canvas' ];

module.exports = ZoomScroll;

// Thx to https://bugzilla.mozilla.org/show_bug.cgi?id=69787#c37
// for providing a work around for missing offsetX in Gecko
Object.defineProperties(MouseEvent.prototype, {
  _offsetRelativeElement: {
    get: function() {
      var element = this.target;
      while (['block', 'inline-block', 'list-item', 'table', 'inline-table', 'table-caption',
        'table-column', 'table-colgroup', 'table-header-group', 'table-row-group', 'table-footer-group',
        'table-row', 'table-cell'].indexOf(window.getComputedStyle(element).display) === -1) {

        element = element.parentNode;
      }

      return element;
    }
  },
  _offsetX: {
    get: function() {
      return this.clientX - this._offsetRelativeElement.getBoundingClientRect().left;
    }
  },
  _offsetY: {
    get: function() {
      return this.clientY - this._offsetRelativeElement.getBoundingClientRect().top;
    }
  }
});