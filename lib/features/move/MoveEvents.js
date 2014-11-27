'use strict';

var _ = require('lodash');


/**
 * A plugin that makes shapes draggable / droppable.
 *
 * @param {EventBus} eventBus
 * @param {DragSupport} dragSupport
 * @param {Modeling} modeling
 * @param {Selection} selection
 * @param {Rules} rules
 */
function MoveEvents(eventBus, dragSupport, modeling, selection, rules) {

  function execute(dragContext) {
    if (dragContext.canExecute) {
      modeling.moveShapes(dragContext.shapes, dragContext.delta, dragContext.hoverElement);
    }
  }

  function checkExecutable(dragContext) {

    var executable = dragContext.canExecute = rules.allowed('shapes.move', {
      shapes: dragContext.shapes,
      delta: dragContext.delta || { x: 0, y: 0 },
      newParent: dragContext.hoverElement || dragContext.element.parent
    });

    return executable;
  }

  function removeNested(dragShapes) {

    var ids = _.inject(dragShapes, function(map, e) {
      map[e.id] = e;

      return map;
    }, {});

    var elements = { };

    return _.filter(dragShapes, function(s) {
      while (!!(s = s.parent)) {
        if (ids[s.id]) {
          return false;
        }
      }

      return true;
    });
  }

  eventBus.on('shape.added', function(event) {
    dragSupport.add(event.element);
  });

  eventBus.on('shape.remove', function(event) {
    dragSupport.remove(event.element);
  });

  eventBus.on('shape.drag.start', function(event) {

    var dragContext = event.dragContext,
        dragShapes = selection.get().slice();

    // add drag target to selection if not done already
    if (dragShapes.indexOf(dragContext.element) === -1) {
      dragShapes.push(dragContext.element);
    }

    // ensure we remove nested elements in the collection
    dragShapes = removeNested(dragShapes);

    // attach shapes to drag context
    _.extend(dragContext, {
      shapes: dragShapes
    });

    // check if we can move the elements
    if (!checkExecutable(dragContext)) {
      return false;
    }

    /**
     * An event indicating that a drag operation has started
     *
     * @memberOf MoveEvents
     *
     * @event shape.move.start
     *
     * @type {Object}
     * @property {djs.ElementDescriptor} element the shape descriptor
     * @property {Object} gfx the graphical representation of the shape
     * @property {Object} dragContext the drag context
     */
    eventBus.fire('shape.move.start', event);
  });

  eventBus.on('shape.drag.move', function(event) {

    checkExecutable(event.dragContext);

    /**
     * An event indicating that a move happens during a drag operation
     *
     * @memberOf MoveEvents
     *
     * @event shape.move
     *
     * @type {Object}
     * @property {djs.ElementDescriptor} element the shape descriptor
     * @property {Object} gfx the graphical representation of the shape
     * @property {Object} dragCtx the drag context
     */
    eventBus.fire('shape.move', event);
  });

  eventBus.on('shape.drag.hover', function(event) {

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
    eventBus.fire('shape.move.hover', event);
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

    execute(event.dragContext);
  });

  eventBus.on('shape.drag.cancel', function(event) {
    eventBus.fire('shape.move.cancel', event);
  });
}

MoveEvents.$inject = [ 'eventBus', 'dragSupport', 'modeling', 'selection', 'rules' ];

module.exports = MoveEvents;
