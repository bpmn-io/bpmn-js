'use strict';

var flatten = require('lodash/array/flatten'),
    forEach = require('lodash/collection/forEach'),
    filter = require('lodash/collection/filter'),
    find = require('lodash/collection/find'),
    map = require('lodash/collection/map');

var Elements = require('../../util/Elements');

var LOW_PRIORITY = 500;

var MARKER_DRAGGING = 'djs-dragging',
    MARKER_OK = 'drop-ok',
    MARKER_NOT_OK = 'drop-not-ok',
    MARKER_ATTACH = 'attach-ok';


/**
 * A plugin that makes shapes draggable / droppable.
 *
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 * @param {Canvas} canvas
 * @param {Styles} styles
 */
function MoveVisuals(eventBus, elementRegistry, canvas, styles) {

  function getGfx(e) {
    return elementRegistry.getGraphics(e);
  }

  function getVisualDragShapes(shapes) {

    var elements = Elements.selfAndDirectChildren(shapes, true);
    var filteredElements = removeEdges(elements);

    return filteredElements;
  }

  function getAllDraggedElements(shapes) {
    var allShapes = Elements.selfAndAllChildren(shapes, true);

    var allConnections = map(allShapes, function(shape) {
      return (shape.incoming || []).concat(shape.outgoing || []);
    });

    return flatten(allShapes.concat(allConnections), true);
  }

  /**
   * Add a dragger for the given shape in the specific
   * move context.
   *
   * @param {Object} context
   * @param {djs.model.Base} element
   */
  function addDragger(context, element) {

    var dragGroup = context.dragGroup;

    if (!dragGroup) {
      dragGroup = context.dragGroup =
        canvas.getDefaultLayer()
          .group()
            .attr(styles.cls('djs-drag-group', [ 'no-events' ]));
    }

    var gfx = getGfx(element),
        dragger = gfx.clone(),
        bbox = gfx.getBBox();

    dragger.attr(styles.cls('djs-dragger', [], {
      x: bbox.x,
      y: bbox.y
    }));

    dragGroup.add(dragger);
  }

  // expose to other components
  // that plug into the drag behavior
  this.addDragger = addDragger;


  // assign a low priority to this handler
  // to let others modify the move context before
  // we draw things
  //
  eventBus.on('shape.move.start', LOW_PRIORITY, function(event) {

    var context = event.context,
        dragShapes = context.shapes;

    var visuallyDraggedShapes = getVisualDragShapes(dragShapes);

    visuallyDraggedShapes.forEach(function(shape) {
      addDragger(context, shape);
    });

    // cache all dragged elements / gfx
    // so that we can quickly undo their state changes later
    var allDraggedElements = context.allDraggedElements = getAllDraggedElements(dragShapes);

    // add dragging marker
    forEach(allDraggedElements, function(e) {
      canvas.addMarker(e, MARKER_DRAGGING);
    });
  });

  // assign a low priority to this handler
  // to let others modify the move context before
  // we draw things
  //
  eventBus.on('shape.move.move', LOW_PRIORITY, function(event) {

    var context = event.context,
        dragGroup = context.dragGroup,
        target = context.target,
        canExecute = context.canExecute;

    if (target) {
      switch (canExecute) {
        case 'attach':
          canvas.addMarker(target, MARKER_ATTACH);
        break;
        default:
          canvas.addMarker(target, context.canExecute ? MARKER_OK : MARKER_NOT_OK);
      }
    }

    dragGroup.translate(event.dx, event.dy);
  });

  eventBus.on([ 'shape.move.out', 'shape.move.cleanup' ], function(event) {
    var context = event.context,
        canExecute = context.canExecute,
        target = context.target;

    if (target) {
      switch (canExecute) {
        case 'attach':
          canvas.removeMarker(target, MARKER_ATTACH);
        break;
        default:
          canvas.removeMarker(target, canExecute ? MARKER_OK : MARKER_NOT_OK);
      }
    }
  });

  eventBus.on('shape.move.cleanup', function(event) {

    var context = event.context,
        allDraggedElements = context.allDraggedElements,
        dragGroup = context.dragGroup;


    // remove dragging marker
    forEach(allDraggedElements, function(e) {
      canvas.removeMarker(e, MARKER_DRAGGING);
    });

    if (dragGroup) {
      dragGroup.remove();
    }
  });
}

// returns elements minus all connections
// where source or target is not elements
function removeEdges(elements) {

  var filteredElements = filter(elements, function(element) {

    if (!element.waypoints) { // shapes
      return true;
    } else {                  // connections
      var srcFound = find(elements, element.source);
      var targetFound = find(elements, element.target);

      return srcFound && targetFound;
    }
  });

  return filteredElements;
}

MoveVisuals.$inject = [ 'eventBus', 'elementRegistry', 'canvas', 'styles' ];

module.exports = MoveVisuals;
