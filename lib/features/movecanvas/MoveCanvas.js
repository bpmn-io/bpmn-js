'use strict';

var $ = require('jquery');


function MoveCanvas(events, canvas) {

  var THRESHOLD = 20;

  function init(element) {

    var context;

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

      var delta = getDelta(context.start, position);

      if (!context.dragging && isThresholdReached(delta)) {
        context.dragging = true;

        context.cursor = cursor('move');
      }

      if (context.dragging) {

        var box = context.viewbox;

        canvas.viewbox({
          x: box.x + delta.x / box.scale,
          y: box.y + delta.y / box.scale,
          width: box.width,
          height: box.height
        });
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

      var position = getPosition(event);

      context = {
        viewbox: canvas.viewbox(),
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