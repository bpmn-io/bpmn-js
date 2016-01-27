'use strict';

var Cursor = require('../../util/Cursor'),
    ClickTrap = require('../../util/ClickTrap'),
    substract = require('../../util/Math').substract,
    domEvent = require('min-dom/lib/event'),
    Event = require('../../util/Event');



function length(point) {
  return Math.sqrt(Math.pow(point.x, 2) + Math.pow(point.y, 2));
}


var THRESHOLD = 15;


function MoveCanvas(eventBus, canvas) {

  var container = canvas._container,
      context;


  function handleMove(event) {

    var start = context.start,
        position = Event.toPoint(event),
        delta = substract(position, start);

    if (!context.dragging && length(delta) > THRESHOLD) {
      context.dragging = true;

      // prevent mouse click in this
      // interaction sequence
      ClickTrap.install();

      Cursor.set('grab');
    }

    if (context.dragging) {

      var lastPosition = context.last || context.start;

      delta = substract(position, lastPosition);

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
    domEvent.unbind(document, 'mousemove', handleMove);
    domEvent.unbind(document, 'mouseup', handleEnd);

    context = null;

    Cursor.unset();

    // prevent select
    Event.stopEvent(event);
  }

  function handleStart(event) {

    // reject non-left left mouse button or modifier key
    if (event.button || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    context = {
      start: Event.toPoint(event)
    };

    domEvent.bind(document, 'mousemove', handleMove);
    domEvent.bind(document, 'mouseup', handleEnd);

    // prevent select
    Event.stopEvent(event);
  }

  domEvent.bind(container, 'mousedown', handleStart);
}


MoveCanvas.$inject = [ 'eventBus', 'canvas' ];

module.exports = MoveCanvas;
