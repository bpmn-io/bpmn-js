'use strict';

var _ = require('lodash');


/**
 * @class
 *
 * A plugin that makes shapes draggable / droppable.
 *
 * @param {EventBus} eventBus
 * @param {Selection} selection
 * @param {ElementRegistry} elementRegistry
 * @param {DragSupport} dragSupport
 * @param {Modeling} modeling
 */
function MoveEvents(eventBus, selection, elementRegistry, dragSupport, modeling) {

  this._eventBus = eventBus;
  this._selection = selection;
  this._elementRegistry = elementRegistry;
  this._dragSupport = dragSupport;
  this._modeling = modeling;

  /**
   * Map shapeId -> draggable
   * @type {Object}
   */
  this._draggables = {};

  this._init();
}


MoveEvents.$inject = [ 'eventBus', 'selection', 'elementRegistry', 'dragSupport', 'modeling' ];

module.exports = MoveEvents;


MoveEvents.prototype._init = function() {
  var dragSupport = this._dragSupport,
      eventBus = this._eventBus,
      selection = this._selection;

  eventBus.on('shape.added', function(event) {
    dragSupport.add(event.element);
  });

  eventBus.on('shape.remove', function(event) {
    dragSupport.remove(event.element);
  });

  eventBus.on('shape.drag.start', function(event) {

    var dragContext = event.dragContext;

    /*
    var selectedShapes = selection.get(),
        dragShapes = Array.prototype.slice.call(selectedShapes),
        dragGraphics = [];
    */

    var dragShapes = [];

    // add drag target to selection if not done already
    if (dragShapes.indexOf(dragContext.element) === -1) {
      dragShapes.push(dragContext.element);
    }

    // attach additional information to the drag context
    _.extend(dragContext, {
      shapes: dragShapes
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
    eventBus.fire('shape.move.start', event);
  });

  eventBus.on('shape.drag.move', function(event) {
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
    eventBus.fire('shape.move', event);
  });

  eventBus.on('shape.drag.over', function(event) {

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
    eventBus.fire('shape.move.over', event);
  });

  eventBus.on('shape.drag.out', function(event) {

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
    eventBus.fire('shape.move.out', event);
  });


  var self = this;

  eventBus.on('shape.drag.end', function(event) {

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
    eventBus.fire('shape.move.end', event);

    if (!event.isDefaultPrevented()) {
      self.execute(event.dragContext);
    }
  });

  eventBus.on('shape.drag.cancel', function(event) {
    eventBus.fire('shape.move.cancel', event);
  });
};


MoveEvents.prototype.execute = function(ctx) {
  var hoverGfx = ctx.hoverGfx;

  // move first selected shape only
  this._modeling.moveShape(ctx.shapes[0], ctx.delta, hoverGfx && this._elementRegistry.getByGraphics(hoverGfx));
};