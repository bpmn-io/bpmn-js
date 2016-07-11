'use strict';

var Snap = require('../../../vendor/snapsvg');

var forEach = require('lodash/collection/forEach');

var MARKER_DRAGGING = 'djs-dragging',
    MARKER_RESIZING = 'djs-resizing';

var LOW_PRIORITY = 250;

/**
 * A plugin that makes shapes draggable / droppable.
 *
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 * @param {Canvas} canvas
 * @param {Styles} styles
 */

function SpaceToolVisuals(eventBus, elementRegistry, canvas, styles) {

  function isConnection(element) {
    return element.waypoints;
  }

  function getGfx(e) {
    return elementRegistry.getGraphics(e);
  }

  function removeMarkers(gfx) {

    if (gfx.node) {

      // snapsvg paper element
      forEach(gfx.node.childNodes, function(childNode) {
        if (childNode.node) {

          // recursion
          removeMarkers(childNode.node);

        } else if (childNode.childNodes) {

          forEach(childNode.childNodes, function(childNodeChild) {

            // recursion
            removeMarkers(childNodeChild);
          });

        }
      });

    } else {

      // plain svg element
      gfx.style.markerStart = '';
      gfx.style.markerEnd = '';
    }

  }

  function addDragger(shape, dragGroup) {
    var gfx = getGfx(shape);
    var dragger = gfx.clone();
    var bbox = gfx.getBBox();

    // remove markers from connections
    if (isConnection(shape)) {
      removeMarkers(dragger);
    }

    dragger.attr(styles.cls('djs-dragger', [], {
      x: bbox.x,
      y: bbox.y
    }));

    dragGroup.add(dragger);
  }

  function addFrame(shape, frameGroup, frames) {

    var frame = Snap.create('rect', {
      class: 'djs-resize-overlay',
      width:  shape.width,
      height: shape.height,
      x: shape.x,
      y: shape.y
    });

    frames.push({
      element: frame,
      initialWidth: frame.getBBox().width,
      initialHeight: frame.getBBox().height
    });

    frame.appendTo(frameGroup);
  }

  eventBus.on('spaceTool.selection.start', function(event) {
    var space = canvas.getLayer('space'),
        context = event.context;

    var orientation = {
      x: 'M 0,-10000 L 0,10000',
      y: 'M -10000,0 L 10000,0'
    };

    var crosshairGroup = space.group().attr(styles.cls('djs-crosshair-group', [ 'no-events' ]));

    crosshairGroup.path(orientation.x).addClass('djs-crosshair');
    crosshairGroup.path(orientation.y).addClass('djs-crosshair');

    context.crosshairGroup = crosshairGroup;
  });

  eventBus.on('spaceTool.selection.move', function(event) {
    var crosshairGroup = event.context.crosshairGroup;

    crosshairGroup.translate(event.x, event.y);
  });

  eventBus.on('spaceTool.selection.cleanup', function(event) {
    var context = event.context,
        crosshairGroup = context.crosshairGroup;

    if (crosshairGroup) {
      crosshairGroup.remove();
    }
  });


  // assign a low priority to this handler
  // to let others modify the move context before
  // we draw things
  eventBus.on('spaceTool.move', LOW_PRIORITY, function(event) {
    /*
      TODO (Ricardo): extend connections while adding space
    */

    var context = event.context,
        line = context.line,
        axis = context.axis,
        movingShapes = context.movingShapes,
        resizingShapes = context.resizingShapes;

    if (!context.initialized) {
      return;
    }

    if (!context.dragGroup) {
      var spaceLayer = canvas.getLayer('space');
      line = spaceLayer.path('M0,0 L0,0').addClass('djs-crosshair');

      context.line  = line;
      var dragGroup = canvas.getDefaultLayer().group().attr(styles.cls('djs-drag-group', [ 'no-events' ]));

      // shapes
      forEach(movingShapes, function(shape) {
        addDragger(shape, dragGroup, 'djs-dragger');
        canvas.addMarker(shape, MARKER_DRAGGING);
      });

      // connections
      var movingConnections = context.movingConnections = elementRegistry.filter(function(element, gfx) {
        var sourceIsMoving = false;

        forEach(movingShapes, function(shape) {
          forEach(shape.outgoing, function(connection) {
            if (element === connection) {
              sourceIsMoving = true;
            }
          });
        });

        var targetIsMoving = false;

        forEach(movingShapes, function(shape) {
          forEach(shape.incoming, function(connection) {
            if (element === connection) {
              targetIsMoving = true;
            }
          });
        });

        var sourceIsResizing = false;

        forEach(resizingShapes, function(shape) {
          forEach(shape.outgoing, function(connection) {
            if (element === connection) {
              sourceIsResizing = true;
            }
          });
        });

        var targetIsResizing = false;

        forEach(resizingShapes, function(shape) {
          forEach(shape.incoming, function(connection) {
            if (element === connection) {
              targetIsResizing = true;
            }
          });
        });

        return isConnection(element)
          && (sourceIsMoving || sourceIsResizing)
          && (targetIsMoving || targetIsResizing);
      });

      forEach(movingConnections, function(connection) {
        addDragger(connection, dragGroup, 'djs-dragger');
        canvas.addMarker(connection, MARKER_DRAGGING);
      });

      context.dragGroup = dragGroup;
    }

    if (!context.frameGroup) {
      var frameGroup = canvas.getDefaultLayer().group().attr(styles.cls('djs-frame-group', [ 'no-events' ])),
          frames = [];

      forEach(resizingShapes, function(shape) {
        addFrame(shape, frameGroup, frames);
        canvas.addMarker(shape, MARKER_RESIZING);
      });

      context.frameGroup = frameGroup;
      context.frames = frames;
    }

    var orientation = {
      x: 'M' + event.x + ', -10000 L' + event.x + ', 10000',
      y: 'M -10000, ' + event.y + ' L 10000, ' + event.y
    };

    line.attr({
      path: orientation[ axis ],
      display: ''
    });

    var opposite = { x: 'y', y: 'x' };
    var delta = { x: event.dx, y: event.dy };
    delta[ opposite[ context.axis ] ] = 0;

    context.dragGroup.translate(delta.x, delta.y);

    forEach(context.frames, function(frame) {
      if (frame.initialWidth + delta.x > 5) {
        frame.element.attr({ width: frame.initialWidth + delta.x });
      }

      if (frame.initialHeight + delta.y > 5) {
        frame.element.attr({ height: frame.initialHeight + delta.y });
      }
    });

  });

  eventBus.on('spaceTool.cleanup', function(event) {

    var context = event.context,
        movingShapes = context.movingShapes,
        movingConnections = context.movingConnections,
        resizingShapes = context.resizingShapes,
        line = context.line,
        dragGroup = context.dragGroup,
        frameGroup = context.frameGroup;

    // moving shapes
    forEach(movingShapes, function(shape) {
      canvas.removeMarker(shape, MARKER_DRAGGING);
    });

    // moving connections
    forEach(movingConnections, function(connection) {
      canvas.removeMarker(connection, MARKER_DRAGGING);
    });

    if (dragGroup) {
      line.remove();
      dragGroup.remove();
    }

    forEach(resizingShapes, function(shape) {
      canvas.removeMarker(shape, MARKER_RESIZING);
    });

    if (frameGroup) {
      frameGroup.remove();
    }

  });
}

SpaceToolVisuals.$inject = [ 'eventBus', 'elementRegistry', 'canvas', 'styles' ];

module.exports = SpaceToolVisuals;
