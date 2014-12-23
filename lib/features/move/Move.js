var _ = require('lodash');


var LOW_PRIORITY = 500,
    HIGH_PRIORITY = 1500;

/**
 * Return a filtered list of elements that do not contain
 * those nested into others.
 *
 * @param  {Array<djs.model.Base>} elements
 *
 * @return {Array<djs.model.Base>} filtered
 */
function removeNested(elements) {

  var ids = _.groupBy(elements, 'id');

  return _.filter(elements, function(element) {
    while (!!(element = element.parent)) {
      if (ids[element.id]) {
        return false;
      }
    }

    return true;
  });
}



/**
 * A plugin that makes shapes draggable / droppable.
 *
 * @param {EventBus} eventBus
 * @param {Dragging} dragging
 * @param {Modeling} modeling
 * @param {Selection} selection
 * @param {Rules} rules
 */
function MoveEvents(eventBus, dragging, modeling, selection, rules) {

  // rules

  function canMove(shapes, delta, target) {

    return rules.allowed('shapes.move', {
      shapes: shapes,
      delta: delta,
      newParent: target
    });
  }


  // move events

  // assign a high priority to this handler to setup the environment
  // others may hook up later, e.g. at default priority and modify
  // the move environment
  //
  eventBus.on('shape.move.start', HIGH_PRIORITY, function(event) {

    var context = event.context,
        shape = event.shape,
        shapes = selection.get().slice();

    // move only single shape shape if the dragged element
    // is not part of the current selection
    if (shapes.indexOf(shape) === -1) {
      shapes = [ shape ];
    }

    // ensure we remove nested elements in the collection
    shapes = removeNested(shapes);

    // attach shapes to drag context
    _.extend(context, {
      shapes: shapes,
      shape: shape
    });

    // check if we can move the elements
    if (!canMove(shapes)) {
      // suppress move operation
      event.stopPropagation();

      return false;
    }
  });

  // assign a low priority to this handler
  // to let others modify the move event before we update
  // the context
  //
  eventBus.on('shape.move.move', LOW_PRIORITY, function(event) {

    var context = event.context,
        shapes = context.shapes,
        hover = event.hover,
        delta = { x: event.dx, y: event.dy },
        canExecute;

    // check if we can move the elements
    canExecute = canMove(shapes, delta, hover);

    context.delta = delta;
    context.canExecute = canExecute;

    // simply ignore move over
    if (canExecute === null) {
      context.target = null;

      return;
    }

    context.target = hover;
  });

  eventBus.on('shape.move.end', function(event) {

    var context = event.context;

    if (context.canExecute) {
      modeling.moveShapes(context.shapes, context.delta, context.target);
    }
  });


  // move activation

  eventBus.on('element.mousedown', function(event) {
    start(event.originalEvent, event.element);
  });


  function start(event, element, activate) {

    // do not move connections or the root element
    if (element.waypoints || !element.parent) {
      return;
    }

    dragging.activate(event, 'shape.move', {
      cursor: 'grabbing',
      autoActivate: activate,
      data: {
        shape: element,
        context: {}
      }
    });
  }

  // API

  this.start = start;
}

MoveEvents.$inject = [ 'eventBus', 'dragging', 'modeling', 'selection', 'rules' ];

module.exports = MoveEvents;
