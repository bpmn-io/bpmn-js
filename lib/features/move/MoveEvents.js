var _ = require('lodash');

require('../../core/EventBus');
require('../../core/CommandStack');
require('../../core/ElementRegistry');

require('../selection/Service');

require('../InteractionEvents');


var MoveShapesHandler = require('../../commands/MoveShapesHandler'),
    Draggable = require('../Draggable'),
    Diagram = require('../../Diagram');


/**
 * @class
 *
 * A plugin that makes shapes draggable / droppable.
 * 
 * @param {EventBus} events the event bus
 * @param {Selection} selection the selection service
 * @param {ElementRegistry} shapes the shapes service
 * @param {CommandStack} commandStack the command stack to perform the actual move action
 */
function MoveEvents(events, selection, shapes, commandStack) {

  ///// execution of actual move ///////////////////////////
  
  function executeMove(ctx) {

    var delta = ctx.delta;

    var moveContext = {
      dx: delta.x,
      dy: delta.y,
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


  function makeDraggable(element, gfx) {

    var draggable = new Draggable(gfx, {
      payload: { gfx: gfx, element: element }
    }).withDragOver(events);

    draggable
      .on('dragstart', function(event) {

        var dragContext = event.dragContext;

        var selectedShapes = selection.getSelection(),
            dragShapes = Array.prototype.slice.call(selectedShapes),
            dragGraphics = [];

        // add drag target to selection if not done already
        if (dragShapes.indexOf(element) === -1) {
          dragShapes.push(element);
        }

        _.forEach(dragShapes, function(s) {
          var gfx = shapes.getGraphicsByShape(s);
          dragGraphics.push(gfx);
        });

        // attach additional information to the drag context
        _.extend(dragContext, {
          shapes: dragShapes,
          graphics: dragGraphics
        });

        /**
         * An event indicating that a drag operation has started
         *
         * @memberOf MoveEvents
         * 
         * @event shape.move.start
         * @type {Object}
         * 
         * @property {djs.ElementDescriptor} element the shape descriptor
         * @property {Object} gfx the graphical representation of the shape
         * @property {Object} dragContext the drag context
         */
        events.fire('shape.move.start', event);
      })
      .on('drag', function(event) {

        /**
         * An event indicating that a move happens during a drag operation
         *
         * @memberOf MoveEvents
         * 
         * @event shape.move
         * @type {Object}
         * 
         * @property {djs.ElementDescriptor} element the shape descriptor
         * @property {Object} gfx the graphical representation of the shape
         * @property {Object} dragCtx the drag context
         */
        events.fire('shape.move', event);
      })
      .on('dragover', function(event) {

        /**
         * An event indicating that a shape is dragged over another shape
         *
         * @memberOf MoveEvents
         * 
         * @event shape.move.over
         * @type {Object}
         * 
         * @property {djs.ElementDescriptor} element the shape descriptor
         * @property {Object} gfx the graphical object that is dragged over
         * @property {Object} dragContext the drag context
         */
        events.fire('shape.move.over', event);
      })
      .on('dragout', function(event) {

        /**
         * An event indicating that a shape is dragged out of another shape after 
         * it had been previously dragged over it
         *
         * @memberOf MoveEvents
         * 
         * @event shape.move.out
         * @type {Object}
         * 
         * @property {djs.ElementDescriptor} element the shape descriptor
         * @property {Object} gfx the graphical object that is dragged out
         * @property {Object} dragContext the drag context
         */
        events.fire('shape.move.out', event);
      })
      .on('dragend', function(event) {

        /**
         * An event indicating that a drag operation has ended
         *
         * @memberOf MoveEvents
         * 
         * @event shape.move.end
         * @type {Object}
         * 
         * @property {djs.ElementDescriptor} element the shape descriptor
         * @property {Object} gfx the graphical representation of the shape
         * @property {Object} dragCtx the drag context
         */
        events.fire('shape.move.end', event);

        if (!event.isDefaultPrevented()) {
          executeMove(event.dragContext);
        }
      })
      .on('dragcancel', function(event) {
        events.fire('shape.move.cancel', event);
      });
  }

  events.on('shape.added', function(event) {
    makeDraggable(event.element, event.gfx);
  });
}

Diagram.plugin('moveEvents', [
  'eventBus', 'selection', 'elementRegistry',
  'commandStack', 'interactionEvents', MoveEvents ]);

module.exports = MoveEvents;