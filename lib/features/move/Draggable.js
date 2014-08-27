'use strict';

var _ = require('lodash');

var DRAG_THRESHOLD = 5;

function isThresholdReached(dx, dy) {
  return Math.abs(dx) > DRAG_THRESHOLD ||
         Math.abs(dy) > DRAG_THRESHOLD;
}

/**
 * A draggable implementation that fires drag related events
 * whenever the given gfx changes.
 *
 * @param {snapsvg.Element} gfx
 * @param {Object} options
 */
function Draggable(element, gfx, handlers) {

  this._data = { element: element, gfx: gfx };
  this._dragContext = null;

  this._handlers = handlers;

  gfx.drag(this.dragMove, this.dragStart, this.dragEnd, this, this, this);
}

module.exports = Draggable;

Draggable.prototype._fire = function(event, e) {

  if (this._handlers[event]) {
    this._handlers[event]({
      dragContext: this._dragContext,
      x: e && e.x,
      y: e && e.y
    });
  }
};

Draggable.prototype.dragMove = function(dx, dy, x, y, event) {

  var dragContext = this._dragContext;

  if (!dragContext) {
    return;
  }

  var gfx = dragContext.gfx;

  // update delta(x, y)
  dragContext.delta = { x: dx, y: dy };

  // drag start
  if (!dragContext.dragging && isThresholdReached(dx, dy)) {
    dragContext.dragging = true;

    this._fire('start', event);
  }

  // drag move
  if (dragContext.dragging) {
    this._fire('move', event);
  }
};

Draggable.prototype.dragStart = function(x, y, event) {

  // reject non-left mouse button drags
  // left = 0
  if (event.button) {
    return;
  }

  (event.originalEvent || event).stopPropagation();

  this._dragContext = _.extend({
    start: { x: x, y: y }
  }, this._data);
};

Draggable.prototype.dragEnd = function() {

  if (this._dragContext && this._dragContext.dragging) {
    this._fire('end');
  }

  this._dragContext = null;
};

/**
 * Cancel active drag operation
 */
Draggable.prototype.cancelDrag = function() {

  if (this._dragContext && this._dragContext.dragging) {
    this._fire('cancel');
  }

  this._dragContext = null;
};


Draggable.prototype.destroy = function() {
  this._data.gfx.undrag();
};