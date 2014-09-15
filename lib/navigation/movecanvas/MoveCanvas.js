'use strict';

var $ = require('jquery');
var _ = require('lodash');

function MoveCanvas(events, canvas) {

  var THRESHOLD = 10;

  function init(element) {

    var context = {};

    function getPosition(e) {
      return { x: e.clientX, y: e.clientY };
    }

    function getDelta(p1, p2) {
      return {
        x: p1.x - p2.x,
        y: p1.y - p2.y
      };
    }

    function isThresholdReached(delta) {
      return Math.abs(delta.x) > THRESHOLD || Math.abs(delta.y) > THRESHOLD;
    }

    function cursor(value) {
      var current = document.body.style.cursor || '';

      if (value !== undefined) {
        document.body.style.cursor = value;
      }

      return current;
    }

    function handleMove(event) {

      var position = getPosition(event);


      if (!context.dragging && isThresholdReached(getDelta(context.start, position))) {
        context.dragging = true;

        context.cursor = cursor('move');
      }


      if (context.dragging) {

        var lastPos = context.last || context.start;

        var delta = getDelta(position, lastPos);

        canvas.scroll({
          dx: delta.x,
          dy: delta.y
        });

        context.last = position;
      }

      // prevent select
      event.preventDefault();
    }


    function handleEnd(event) {
      $(element).off('mousemove', handleMove);
      $(document).off('mouseup', handleEnd);

      if (context) {
        cursor(context.cursor);
      }

      // prevent select
      event.preventDefault();
    }

    function handleStart(event) {

      // reject non-left mouse button drags
      // left = 0
      if (event.button) {
        return;
      }

      var position = getPosition(event);

      context = {
        start: position
      };

      $(element).on('mousemove', handleMove);
      $(document).on('mouseup', handleEnd);

      // prevent select
      event.preventDefault();
    }

    $(element).on('mousedown', handleStart);
  }

  events.on('canvas.init', function(e) {
    init(e.paper.node);
  });
}


MoveCanvas.$inject = [ 'eventBus', 'canvas' ];

module.exports = MoveCanvas;