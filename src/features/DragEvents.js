require('../core/Events');
require('../core/CommandStack');
require('../core/Shapes');

require('./services/Selection');

require('./BasicInteractionEvents');

var MoveShapesHandler = require('../commands/MoveShapes'),
    Diagram = require('../Diagram'),
    _ = require('lodash');


/**
 * @class
 *
 * A plugin that makes shapes draggable / droppable.
 * 
 * @param {Events} events the event bus
 * @param {Selection} selection the selection service
 * @param {Shapes} shapes the shapes service
 * @param {CommandStack} commandStack the command stack to perform the actual move action
 */
function Drag(events, selection, shapes, commandStack) {

  var DRAG_START_THRESHOLD = 10;

  function dragStartThresholdReached(dx, dy) {
    return Math.abs(dx) > DRAG_START_THRESHOLD ||
           Math.abs(dy) > DRAG_START_THRESHOLD;
  }


  ///// execution of actual move ///////////////////////////
  
  function executeMove(ctx) {

    var moveContext = {
      dx: ctx.dx,
      dy: ctx.dy,
      shapes: ctx.shapes
    };

    var hoverGfx = ctx.hoverGfx;
    
    if (hoverGfx) {
      moveContext.newParent = shapes.getShapeByGraphics(hoverGfx);
    }

    commandStack.execute('shape.move', moveContext);
  }

  // commandStack default move handler registration
  commandStack.registerHandler('shape.move', MoveShapesHandler);


  ///// draggable implementation ////////////////////////////
  
  function makeDraggable(shape, gfx) {

    var dragCtx;

    function dragOver(event) {
      var dragEvt = _.extend({}, event, { dragCtx: dragCtx });

      /**
       * An event indicating that a shape is dragged over another shape
       *
       * @memberOf Drag
       * 
       * @event shape.dragover
       * @type {Object}
       * 
       * @property {djs.ElementDescriptor} element the shape descriptor
       * @property {Object} gfx the graphical representation of the shape
       * @property {Object} dragCtx the drag context
       */
      events.fire('shape.dragover', dragEvt);

      dragCtx.hoverGfx = event.gfx;
    }

    function dragOut(event) {
      var dragEvt = _.extend({}, event, { dragCtx: dragCtx });

      /**
       * An event indicating that a shape is dragged out of another shape after 
       * it had been previously dragged over it
       *
       * @memberOf Drag
       * 
       * @event shape.dragout
       * @type {Object}
       * 
       * @property {djs.ElementDescriptor} element the shape descriptor
       * @property {Object} gfx the graphical representation of the shape
       * @property {Object} dragCtx the drag context
       */
      events.fire('shape.dragout', dragEvt);

      delete dragCtx.hoverGfx;
    }

    gfx.drag(function dragging(dx, dy, x, y, e) {

      var graphics = dragCtx.graphics;

      // drag start
      if (!dragCtx.dragging && dragStartThresholdReached(dx, dy)) {

        events.on('shape.hover', dragOver);
        events.on('shape.out', dragOut);

        dragCtx.dragging = true;

        /**
         * An event indicating that a drag operation has started
         *
         * @memberOf Drag
         * 
         * @event shape.dragstart
         * @type {Object}
         * 
         * @property {djs.ElementDescriptor} element the shape descriptor
         * @property {Object} gfx the graphical representation of the shape
         * @property {Object} dragCtx the drag context
         */
        events.fire('shape.dragstart', { element: shape, gfx: gfx, dragCtx: dragCtx });
      }

      // drag move
      if (dragCtx.dragging) {

        _.extend(dragCtx, {
          dx: dx, dy: dy
        });

        /**
         * An event indicating that a move happens during a drag operation
         *
         * @memberOf Drag
         * 
         * @event shape.dragmove
         * @type {Object}
         * 
         * @property {djs.ElementDescriptor} element the shape descriptor
         * @property {Object} gfx the graphical representation of the shape
         * @property {Object} dragCtx the drag context
         */
        events.fire('shape.dragmove', { element: shape, gfx: gfx, dragCtx: dragCtx });
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
          shapes: dragShapes,
          graphics: dragGraphics,
          selection: selectedShapes
        };
    }, function dragEnd(x, y, e) {

      events.off('shape.hover', dragOver);
      events.off('shape.out', dragOut);

      if (dragCtx.dragging) {

        var event = { element: shape, gfx: gfx, dragCtx: dragCtx };

        /**
         * An event indicating that a drag operation has ended
         *
         * @memberOf Drag
         * 
         * @event shape.dragstart
         * @type {Object}
         * 
         * @property {djs.ElementDescriptor} element the shape descriptor
         * @property {Object} gfx the graphical representation of the shape
         * @property {Object} dragCtx the drag context
         */
        events.fire('shape.dragend', event);

        if (!event.isDefaultPrevented()) {
          executeMove(event.dragCtx);
        }
      }

      dragCtx = null;
    });
  }

  events.on('shape.added', function(event) {
    var shape = event.element,
        gfx = event.gfx;

    makeDraggable(shape, gfx);
  });
}

Diagram.plugin('dragEvents', [ 'events', 'selection', 'shapes', 'commandStack', 'basicInteractionEvents', Drag ]);

module.exports = Drag;