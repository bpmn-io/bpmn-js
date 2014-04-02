require('../../core/EventBus');
require('../../core/Canvas');
require('../../core/ElementRegistry');

require('../../draw/Snap');
require('../../draw/Styles');

require('../selection/Service');
require('../services/Rules');

require('../Outline');

require('./Events');

var Diagram = require('../../Diagram'),
    _ = require('lodash'),
    ShapeUtil = require('../../util/ShapeUtil');


/**
 * @class
 *
 * A plugin that makes shapes draggable / droppable.
 * 
 * @param {EventBus} events the event bus
 * @param {Selection} selection the selection service
 * @param {ElementRegistry} shapes the shapes service
 * @param {Canvas} canvas the drawing canvas
 * @param {Snap} snap
 * @param {Styles} styles
 * @param {Rules} the rule engine
 */
function DragVisuals(events, selection, shapes, canvas, snap, styles, rules) {

  var paper = canvas.getContext();

  function getGfx(s) {
    return shapes.getGraphicsByShape(s);
  }

  function getVisualDragShapes(shapeList) {
    return ShapeUtil.selfAndDirectChildren(shapeList, true);
  }

  function getAllChildShapes(shapeList) {
    return ShapeUtil.selfAndAllChildren(shapeList, true);
  }

  function removeDropMarkers(gfx) {
    gfx
      .removeClass('drop-ok')
      .removeClass('drop-not-ok');
  }

  function addDropMarkers(gfx, canDrop) {
    var marker = canDrop ? 'drop-ok' : 'drop-not-ok';
    gfx.addClass(marker);
  }

  function addDragger(shape, dragGroup) {
    var gfx = shapes.getGraphicsByShape(shape);
    var dragger = gfx.clone();
    var bbox = gfx.getBBox();

    dragger.attr(styles.cls('djs-dragger', [], {
      x: bbox.x,
      y: bbox.y
    }));

    dragGroup.add(dragger);
  }

  events.on('shape.dragstart', function(event) {

    var dragCtx = event.dragCtx,
        dragShapes = dragCtx.shapes;

    var dragGroup = paper.group().attr('class', 'djs-drag-group').attr('pointer-events', 'none');

    var visuallyDraggedShapes = getVisualDragShapes(dragShapes),
        allDraggedShapes = getAllChildShapes(dragShapes);

    visuallyDraggedShapes.forEach(function(s) {
      addDragger(s, dragGroup);
    });

    // cache all dragged gfx
    // so that we can quickly undo their state changes later
    var allDraggedGfx = dragCtx.allDraggedGfx = allDraggedShapes.map(getGfx);

    allDraggedGfx.forEach(function(gfx) {
      gfx.addClass('djs-dragging');
    });

    // deselect shapes
    selection.select(null);

    dragCtx.dragGroup = dragGroup;
  });

  events.on('shape.dragmove', function(event) {

    var dragCtx = event.dragCtx,
        dx = dragCtx.dx,
        dy = dragCtx.dy,
        dragGroup = dragCtx.dragGroup;

    dragGroup.translate(dx, dy);
  });

  events.on('shape.dragover', function(event) {
    var dragCtx = event.dragCtx,
        gfx = event.gfx;

    var canDrop = rules.can('drop', dragCtx);

    addDropMarkers(gfx, canDrop);
  });

  events.on('shape.dragout', function(event) {
    var gfx = event.gfx;
    removeDropMarkers(gfx);
  });

  events.on('shape.dragend', function(event) {

    var dragCtx = event.dragCtx,
        allDraggedGfx = dragCtx.allDraggedGfx,
        dragGroup = dragCtx.dragGroup;

    // cache all dragged gfx
    if (allDraggedGfx) {
      allDraggedGfx.forEach(function(gfx) {
        gfx.removeClass('djs-dragging');
      });
    }

    dragGroup.remove();
    
    if (dragCtx.hoverGfx) {
      removeDropMarkers(dragCtx.hoverGfx);
    }

    // restore selection
    selection.select(dragCtx.selection);
  });
}

Diagram.plugin('dragVisuals', [
  'eventBus', 'selection', 'elementRegistry', 'canvas', 'snap', 'styles', 'rules', 'dragEvents', DragVisuals
]);

module.exports = DragVisuals;