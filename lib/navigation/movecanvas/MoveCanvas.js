var _ = require('lodash');

var Cursor = require('../../util/Cursor'),
    Dom = require('../../util/Dom');


function toPoint(point) {
  return { x: point.x, y: point.y };
}

function substract(p1, p2) {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y
  };
}

function length(point) {
  return Math.sqrt(Math.pow(point.x, 2) + Math.pow(point.y, 2));
}


var THRESHOLD = 15;


function MoveCanvas(eventBus, canvas) {

  var container = canvas._container,
      context;


  function handleMove(event) {

    var start = context.start,
        position = toPoint(event),
        delta = substract(position, start);

    if (!context.dragging && length(delta) > THRESHOLD) {
      context.dragging = true;

      Cursor.set('move');
    }

    if (context.dragging) {

      var lastPosition = context.last || context.start;

      var delta = substract(position, lastPosition);

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
    Dom.off(document, 'mousemove', handleMove);
    Dom.off(document, 'mouseup', handleEnd);

    context = null;

    Cursor.unset();

    // prevent select
    event.preventDefault();
  }

  function handleStart(event) {

    // reject non-left mouse button drags
    // left = 0
    if (event.button) {
      return;
    }

    context = {
      start: toPoint(event)
    };

    Dom.on(document, 'mousemove', handleMove);
    Dom.on(document, 'mouseup', handleEnd);

    // prevent select
    event.preventDefault();
  }

  Dom.on(container, 'mousedown', handleStart);
}


MoveCanvas.$inject = [ 'eventBus', 'canvas' ];

module.exports = MoveCanvas;