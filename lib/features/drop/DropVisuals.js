'use strict';

var _ = require('lodash');

function DropVisuals(eventBus, canvas, dragSupport, rules) {

    this._eventBus    = eventBus;
    this._canvas      = canvas;
    this._dragSupport = dragSupport;

    eventBus.on('shape.move.hover', function(context) {

      var element     = context.element,
          dragContext = dragSupport.getDragContext(),
          canDrop     = dropAllowed(element, dragContext);

      if (dragContext) {
        canvas.addMarker(element, canDrop ? 'drop-ok' : 'drop-not-ok');
      }
    });

    eventBus.on('shape.move.out', function(event) {
      var gfx = event.gfx;
      if (gfx) {
        gfx.removeClass('drop-ok');
        gfx.removeClass('drop-not-ok');
      }
    });

    // remove marker after drag operation
    eventBus.on([ 'shape.move.end', 'shape.drag.cancel' ], function(e) {

      var context = e.dragContext,
          element = context.hoverElement;

      if (element) {
        canvas.removeMarker(element, 'drop-ok');
        canvas.removeMarker(element, 'drop-not-ok');
      }
    });

    function dropAllowed(target, dragContext) {
      if (!dragContext || !dragContext.allDraggedElements) {
        return false;
      }

      // if target and source is identically no drop is allowed
      _.forEach(dragContext.allDraggedElements, function(element) {
        if (element.id === target.id) {
          return false;
        }
      });


      var context = {
        source: dragContext.allDraggedElements,
        target: target
      };

      return rules.can('drop', context);
    }
}

DropVisuals.$inject = [ 'eventBus', 'canvas', 'dragSupport', 'rules' ];

module.exports = DropVisuals;
