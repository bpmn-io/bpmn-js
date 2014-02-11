require('../core/Events');
require('./Selection');
require('./Shapes');
require('./Interactivity');

var Diagram = require('../Diagram'),
    _ = require('../util/underscore');


/**
 * @class
 *
 * A plugin that makes shapes draggable / droppable.
 * 
 * @param {Events} events the event bus
 * @param {Selection} selection the selection service
 * @param {Shapes} shapes the shapes service
 */
function Drag(events, selection, shapes) {

  var DRAG_START_THRESHOLD = 10;

  function makeDraggable(shape, graphics) {

    var dragCtx;

    graphics.drag(function dragging(dx, dy, x, y, e) {

      var graphics = dragCtx.graphics;

      if (!dragCtx.dragging) {

        // activate visual drag once a certain threshold is reached
        if (dx > DRAG_START_THRESHOLD || dy > DRAG_START_THRESHOLD) {
          //TODO add to group and move group only
          _.forEach(graphics, function(gfx) {
            var dragger = gfx.clone();
            dragger.attr('class', 'dragger');

            gfx.dragger = dragger;
            gfx.addClass('dragging');
          });

          selection.select(null);
          dragCtx.dragging = true;

          events.fire('shape.dragstart', { element: shape, gfx: graphics, drag: dragCtx });
        }
      }
      
      // update draggers with new coordinates
      if (dragCtx.dragging) {
        _.forEach(graphics, function(gfx) {

          var dragger = gfx.dragger;
          var translateMatrix = new Snap.Matrix();
          translateMatrix.translate(dx,dy);
          dragger.transform(translateMatrix);
        });
      }
    }, function dragStart(x, y, e) {

      var selectedShapes = selection.getSelection(),
          dragShapes = selectedShapes.filter(function(s) { return s.draggable; }),
          dragGraphics = [];

        // add drag target to selection if not done already
        if (dragShapes.indexOf(shape) === -1) {
            dragShapes.push(shape);
        }

        _.forEach(dragShapes, function(s) {
            var gfx = shapes.getGraphicsByShape(s);
            dragGraphics.push(gfx);
        });

        // prepare a drag ctx that gets later activated when
        // a given drag threshold is reached
        dragCtx = {
          dragging: false,
          shapes: dragShapes,
          graphics: dragGraphics,
          selection: selectedShapes
        };
    }, function dragEnd(x, y, e) {

      _.forEach(dragCtx.graphics, function(gfx) {
        gfx.removeClass('dragging');

        if (gfx.dragger) {
          gfx.dragger.remove();
          delete gfx.dragger;
        }

        selection.select(dragCtx.selection);

        if (dragCtx.dragging) {
          events.fire('shape.dragend', { element: shape, gfx: graphics, drag: dragCtx });
        }
      });

      dragCtx = null;
    });
  }

  events.on('shape.added', function(event) {
    var shape = event.element,
        graphics = event.gfx;

    if (shape.draggable) {
      makeDraggable(shape, graphics);
    }
  });
}

Diagram.plugin('drag', [ 'events', 'selection', 'shapes', 'interactivity', Drag ]);

module.exports = Drag;