require('../core/Events');
require('./services/Selection');
require('./services/Shapes');
require('./Interactivity');
require('../core/Canvas');

var Snap = require('snapsvg');

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
function Drag(events, selection, shapes, canvas) {

  var DRAG_START_THRESHOLD = 10;

  function makeDraggable(shape, graphics) {

    var dragCtx;
    var dragGroup;

    graphics.drag(function dragging(dx, dy, x, y, e) {

      var graphics = dragCtx.graphics;

      if (!dragCtx.dragging) {

        // activate visual drag once a certain threshold is reached
        if (Math.abs(dx) > DRAG_START_THRESHOLD || Math.abs(dy) > DRAG_START_THRESHOLD) {

          if(!dragGroup) {
            dragGroup = canvas.getContext().group();
            dragGroup.attr('class', 'djs-drag-group');
          }

          _.forEach(graphics, function(gfx) {
            var dragger = gfx.clone();
            
            dragger.attr({
              'class': 'djs-dragger',
              'x': gfx.parent().getBBox(false).x,
              'y': gfx.parent().getBBox(false).y
            });

            gfx.dragger = dragger;
            gfx.addClass('djs-dragging');

            dragGroup.add(dragger);
          });

          selection.select(null);
          dragCtx.dragging = true;

          events.fire('shape.dragstart', { element: shape, gfx: graphics, drag: dragCtx });
        }
      }
      
      // update draggers with new coordinates
      if (dragCtx.dragging) {

        var translateMatrix = new Snap.Matrix();
        translateMatrix.translate(dx,dy);
        dragGroup.transform(translateMatrix);
      }
    }, function dragStart(x, y, e) {

      var selectedShapes = selection.getSelection(),
          dragShapes = Array.prototype.slice.call(selectedShapes),
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
        gfx.removeClass('djs-dragging');

        if (gfx.dragger) {
          gfx.dragger.remove();
          delete gfx.dragger;
        }

        selection.select(dragCtx.selection);

        if (dragCtx.dragging) {
          events.fire('shape.dragend', { element: shape, gfx: graphics, drag: dragCtx });
        }
        if(dragGroup) {
          dragGroup.remove();
          dragGroup = undefined;
        }
      });

      dragCtx = null;
    });
  }

  events.on('shape.added', function(event) {
    var shape = event.element,
        graphics = event.gfx;

    makeDraggable(shape, graphics);
  });
}

Diagram.plugin('drag', [ 'events', 'selection', 'shapes', 'canvas', 'interactivity', Drag ]);

module.exports = Drag;