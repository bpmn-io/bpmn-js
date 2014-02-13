require('../core/Events');
require('../core/Canvas');
require('./services/Selection');
require('./services/Shapes');
require('./services/Rules');
require('./Interactivity');

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
function DragUI(events, selection, shapes, canvas, rules) {
  'use strict';

  var paper = canvas.getContext();

  function getChildGfx(shape) {

    var allGraphics = [ shapes.getGraphicsByShape(shape) ];

    _.forEach(shape.children, function(c) {
      allGraphics = allGraphics.concat(getChildGfx(c));
    });

    return allGraphics;
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

    dragger.attr({
      'class': 'djs-dragger',
      'x': bbox.x,
      'y': bbox.y
    });

    dragGroup.add(dragger);
  }

  events.on('shape.dragstart', function(event) {

    var dragCtx = event.dragCtx,
        dragShapes = dragCtx.shapes;

    var dragGroup = paper.group().attr('class', 'djs-drag-group');

    _.forEach(dragShapes, function(s) {

      addDragger(s, dragGroup);

      _.forEach(s.children, function(c) {
        addDragger(c, dragGroup);
      });

      _.forEach(getChildGfx(s), function(g) {
        g.addClass('djs-dragging');
      });
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

    var translateMatrix = new Snap.Matrix();
    translateMatrix.translate(dx, dy);
    dragGroup.transform(translateMatrix);
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
        shapes = dragCtx.shapes,
        dragGroup = dragCtx.dragGroup;

    _.forEach(shapes, function(shape) {
      _.forEach(getChildGfx(shape), function(gfx) {
        gfx.removeClass('djs-dragging');
      });
    });

    dragGroup.remove();
    
    if (dragCtx.hover) {
      removeDropMarkers(dragCtx.hover);
    }

    // restore selection
    selection.select(dragCtx.selection);
  });
}

Diagram.plugin('dragUI', [ 'events', 'selection', 'shapes', 'canvas', 'rules', 'drag', DragUI ]);

module.exports = DragUI;