'use strict';

var hasPrimaryModifier = require('../../util/Mouse').hasPrimaryModifier;


var HIGH_PRIORITY = 1500;
var HAND_CURSOR = 'grab';

function HandTool(eventBus, canvas, dragging, toolManager) {
  this._dragging = dragging;


  toolManager.registerTool('hand', {
    tool: 'hand',
    dragging: 'hand.move'
  });

  eventBus.on('element.mousedown', HIGH_PRIORITY, function(event) {
    if (hasPrimaryModifier(event)) {
      this.activateMove(event.originalEvent);

      return false;
    }
  }, this);


  eventBus.on('hand.end', function(event) {
    var target = event.originalEvent.target;

    // only reactive on diagram click
    // on some occasions, event.hover is not set and we have to check if the target is an svg
    if (!event.hover && !(target instanceof SVGElement)) {
      return false;
    }

    eventBus.once('hand.ended', function() {
      this.activateMove(event.originalEvent, { reactivate: true });
    }, this);

  }, this);


  eventBus.on('hand.move.move', function(event) {
    var scale = canvas.viewbox().scale;

    canvas.scroll({
      dx: event.dx * scale,
      dy: event.dy * scale
    });
  });

  eventBus.on('hand.move.end', function(event) {
    var context = event.context,
        reactivate = context.reactivate;

    // Don't reactivate if the user is using the keyboard keybinding
    if (!hasPrimaryModifier(event) && reactivate) {

      eventBus.once('hand.move.ended', function(event) {
        this.activateHand(event.originalEvent, true, true);
      }, this);

    }

    return false;
  }, this);

}

HandTool.$inject = [
  'eventBus',
  'canvas',
  'dragging',
  'toolManager'
];

module.exports = HandTool;


HandTool.prototype.activateMove = function(event, autoActivate, context) {
  if (typeof autoActivate === 'object') {
    context = autoActivate;
    autoActivate = false;
  }

  this._dragging.init(event, 'hand.move', {
    autoActivate: autoActivate,
    cursor: HAND_CURSOR,
    data: {
      context: context || {}
    }
  });
};

HandTool.prototype.activateHand = function(event, autoActivate, reactivate) {
  this._dragging.init(event, 'hand', {
    trapClick: false,
    autoActivate: autoActivate,
    cursor: HAND_CURSOR,
    data: {
      context: {
        reactivate: reactivate
      }
    }
  });
};

HandTool.prototype.toggle = function() {
  if (this.isActive()) {
    this._dragging.cancel();
  } else {
    this.activateHand();
  }
};

HandTool.prototype.isActive = function() {
  var context = this._dragging.context();

  return context && /^hand/.test(context.prefix);
};
