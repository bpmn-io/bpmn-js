'use strict';

var _ = require('lodash');

var Elements = require('../../util/Elements');

var Cursor = require('../../util/Cursor');


var MARKER_DRAGGING = 'djs-dragging',
    MARKER_DROP_OK = 'drop-ok',
    MARKER_DROP_NOT_OK = 'drop-not-ok';


/**
 * A plugin that makes shapes draggable / droppable.
 *
 * @class
 *
 * @param {EventBus} events
 * @param {Selection} selection
 * @param {ElementRegistry} elementRegistry
 * @param {Canvas} canvas
 * @param {Snap} snap
 * @param {Styles} styles
 * @param {Rules} rules
 */
function MoveVisuals(events, selection, elementRegistry, canvas, snap, styles, rules) {

  var root;

  function getGfx(e) {
    return elementRegistry.getGraphicsByElement(e);
  }

  function getVisualDragShapes(shapes) {
    return Elements.selfAndDirectChildren(shapes, true);
  }

  function getAllDraggedElements(shapes) {
    var allShapes = Elements.selfAndAllChildren(shapes, true);

    var allConnections = _.collect(allShapes, function(shape) {
      return (shape.incoming || []).concat(shape.outgoing || []);
    });

    return _.flatten(allShapes.concat(allConnections), true);
  }

  function removeDropMarkers(gfx) {
    gfx
      .removeClass(MARKER_DROP_OK)
      .removeClass(MARKER_DROP_NOT_OK);
  }

  function addDropMarkers(gfx, canDrop) {
    var marker = canDrop ? MARKER_DROP_OK : MARKER_DROP_NOT_OK;
    gfx.addClass(marker);
  }

  function addDragger(shape, dragGroup) {
    var gfx = getGfx(shape);
    var dragger = gfx.clone();
    var bbox = gfx.getBBox();

    dragger.attr(styles.cls('djs-dragger', [], {
      x: bbox.x,
      y: bbox.y
    }));

    dragGroup.add(dragger);
  }

  // cursor update
  events.on('shape.move.start', function() {
    Cursor.set('grabbing');
  });

  events.on([ 'shape.move.end', 'shape.move.cancel' ], function() {
    Cursor.unset();
  });


  events.on('shape.move.start', function(event) {

    var dragContext = event.dragContext,
        dragShapes = dragContext.shapes;

    var dragGroup = root.group().attr(styles.cls('djs-drag-group', [ 'no-events' ]));

    var visuallyDraggedShapes = getVisualDragShapes(dragShapes);

    visuallyDraggedShapes.forEach(function(s) {
      addDragger(s, dragGroup);
    });


    // cache all dragged elements / gfx
    // so that we can quickly undo their state changes later
    var allDraggedElements = dragContext.allDraggedElements = getAllDraggedElements(dragShapes);

    // add dragging marker
    _.forEach(allDraggedElements, function(e) {
      canvas.addMarker(e, MARKER_DRAGGING);
    });

    dragContext.selection = selection.get();
    dragContext.dragGroup = dragGroup;

    // deselect shapes
    selection.select(null);
  });

  events.on('shape.move', function(event) {

    var dragContext = event.dragContext,
        delta = dragContext.delta,
        dragGroup = dragContext.dragGroup;

    dragGroup.translate(delta.x, delta.y);
  });

  events.on('shape.move.over', function(event) {
    var dragContext = event.dragContext,
        gfx = event.gfx;

    var canDrop = rules.can('drop', dragContext);

    addDropMarkers(gfx, canDrop);
  });

  events.on('shape.move.out', function(event) {
    var gfx = event.gfx;
    removeDropMarkers(gfx);
  });

  events.on([ 'shape.move.end', 'shape.move.cancel' ], function(event) {

    var dragContext = event.dragContext,
        allDraggedElements = dragContext.allDraggedElements,
        dragGroup = dragContext.dragGroup;


    // remove dragging marker
    _.forEach(allDraggedElements, function(e) {
      canvas.removeMarker(e, MARKER_DRAGGING);
    });

    dragGroup.remove();

    if (dragContext.hoverGfx) {
      removeDropMarkers(dragContext.hoverGfx);
    }

    // restore selection
    selection.select(dragContext.selection);
  });


  // load root from initialized canvas

  events.on('canvas.init', function(event) {
    root = event.root;
  });

  events.on('diagram.destroy', function() {
    root = null;
  });
}


MoveVisuals.$inject = [
  'eventBus',
  'selection',
  'elementRegistry',
  'canvas',
  'snap',
  'styles',
  'rules'
];

module.exports = MoveVisuals;