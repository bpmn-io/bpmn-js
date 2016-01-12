'use strict';

var hasPrimaryModifier = require('../../util/Mouse').hasPrimaryModifier,
    substract = require('../../util/Math').substract;


var HIGH_PRIORITY = 1500;


function HandTool(eventBus, canvas, dragging) {
  var self = this;

  this._dragging = dragging;

  eventBus.on('element.mousedown', HIGH_PRIORITY, function(event) {
    if (hasPrimaryModifier(event)) {
      self.activateMove(event.originalEvent);

      event.stopPropagation();

      return false;
    }
  });

  eventBus.on('hand.end', function(event) {
    var target = event.originalEvent.target;

    // only reactive on diagram click
    // on some occasions, event.hover is not set and we have to check if the target is an svg
    if (!event.hover && !(target instanceof SVGElement)) {
      return;
    }

    eventBus.once('hand.ended', function() {
      self.activateMove(event.originalEvent, { reactivateHand: true });
    });
  });

  eventBus.on('hand.move.start', function(event) {
    var context = event.context;

    context.start = { x: event.x, y: event.y };
  });

  eventBus.on('hand.move.move', function(event) {
    var context = event.context,
        start = context.start,
        delta = context.delta;

    var position = { x: event.x, y: event.y },
        scale = canvas.viewbox().scale;

    var lastPosition = context.last || start;

    delta = substract(position, lastPosition);

    canvas.scroll({
      dx: delta.x * scale,
      dy: delta.y * scale
    });

    context.last = position;
  });

  eventBus.on('hand.move.end', function(event) {
    var context = event.context,
        reactivateHand = context.reactivateHand;

    // Don't reactivate if the user is using the keyboard keybinding
    if (!hasPrimaryModifier(event) && reactivateHand) {

      eventBus.once('hand.move.ended', function(event) {
        self.activateHand(event.originalEvent, true);
      });

    }

    return false;
  });
}

HandTool.$inject = [
  'eventBus',
  'canvas',
  'dragging'
];

module.exports = HandTool;


HandTool.prototype.activateMove = function(event, autoActivate, context) {
  if (typeof autoActivate === 'object') {
    context = autoActivate;
    autoActivate = false;
  }

  this._dragging.activate(event, 'hand.move', {
    autoActivate: autoActivate,
    cursor: 'move',
    data: {
      context: context || {}
    }
  });
};

HandTool.prototype.activateHand = function(event, autoActivate) {

  this._dragging.activate(event, 'hand', {
    trapClick: false,
    autoActivate: autoActivate,
    cursor: 'move'
  });
};
