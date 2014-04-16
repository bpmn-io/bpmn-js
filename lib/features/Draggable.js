var _ = require('lodash'),
    EventEmitter = require('../util/EventEmitter');

var DEFAULT_THRESHOLD = 10;

/**
 * A draggable implementation that fires drag related events
 * whenever the given gfx changes.
 */
function Draggable(gfx, options) {

  options = _.extend({
    threshold: DEFAULT_THRESHOLD,
    payload: {},
  }, options || {});


  function isThresholdReached(delta) {
    return Math.abs(delta.x) > options.threshold ||
           Math.abs(delta.y) > options.threshold;
  }

  var self = this;

  var externalEvents;

  var dragContext;

  function emit(name, event, raw) {

    var locals = _.extend({ dragContext: dragContext }, raw ? {} : options.payload || {});
    var dragEvent = _.extend({}, event, locals);

    self.emit(name, dragEvent);

    return dragEvent;
  }

  function dragOver(event) {
    var dragEvent = emit('dragover', event, true);

    if (!dragEvent.isDefaultPrevented()) {
      dragContext.hoverGfx = dragEvent.gfx;
    }
  }

  function dragOut(event) {
    if (dragContext.hoverGfx === event.gfx) {
      emit('dragout', event, true);
    }

    delete dragContext.hoverGfx;
  }

  function dragStart(x, y, event) {

    dragContext = _.extend({
      start: { x: x, y: y }
    }, options.payload);
  }

  function dragMove(dx, dy, x, y, event) {

    if (!dragContext) {
      return;
    }

    var graphics = dragContext.gfx;

    // update delta(x, y)
    _.extend(dragContext, {
      delta: { x: dx, y: dy }
    });

    // drag start
    if (!dragContext.dragging && isThresholdReached(dragContext.delta)) {

      if (externalEvents) {
        externalEvents.on('shape.hover', dragOver);
        externalEvents.on('shape.out', dragOut);
      }

      dragContext.dragging = true;

      emit('dragstart', event);
    }

    // drag move
    if (dragContext.dragging) {

      _.extend(dragContext, {
        delta: { x: dx, y: dy }
      });

      emit('drag', event);
    }
  }

  function dragEnd(x, y, event) {

    if (externalEvents) {
      externalEvents.off('shape.hover', dragOver);
      externalEvents.off('shape.out', dragOut);
    }

    if (dragContext && dragContext.dragging) {
      emit('dragend', event);
    }

    dragContext = null;
  }

  gfx.drag(dragMove, dragStart, dragEnd);

  /**
   * Detect drag over based on the given event stream
   * @param  {EventEmitter} events
   */
  this.withDragOver = function(events) {
    externalEvents = events;
    return this;
  };

  /**
   * Cancel the drag operation, if it is in progress.
   */
  this.cancelDrag = function() {

    if (dragContext && dragContext.dragging) {
      emit('dragcanceled', {});
    }

    dragContext = null;
  };

}

Draggable.prototype = EventEmitter.prototype;

module.exports = Draggable;