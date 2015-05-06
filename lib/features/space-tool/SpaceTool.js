'use strict';

var SpaceUtil = require('./SpaceUtil');

var Cursor = require('../../util/Cursor');

var hasPrimaryModifier = require('../../util/Mouse').hasPrimaryModifier;

var abs = Math.abs,
    round = Math.round;

var HIGH_PRIORITY = 1500;

/**
 * A tool that allows users to create and remove space in a diagram.
 *
 * The tool needs to be activated manually via {@link SpaceTool#activate(MouseEvent)}.
 */
function SpaceTool(eventBus, dragging, elementRegistry, modeling, rules) {

  function canResize(shape) {
    var ctx = { shape: shape };
    return rules.allowed('shape.resize', ctx);
  }

  function activateSelection(event, autoActivate) {
    dragging.activate(event, 'spaceTool.selection', {
      cursor: 'crosshair',
      autoActivate: autoActivate,
      data: {
        context: {
          crosshair: {}
        }
      }
    });
  }

  function activateMakeSpace(event) {
    dragging.activate(event, 'spaceTool', {
      autoActivate: true,
      cursor: 'crosshair',
      data: {
        context: {}
      }
    });
  }


  eventBus.on('spaceTool.selection.end', function(event) {
    setTimeout(function() {
      activateMakeSpace(event.originalEvent);
    });
  });


  var AXIS_TO_DIMENSION = { x: 'width', y: 'height' },
      AXIS_INVERTED = { x: 'y', y: 'x' };


  function initializeMakeSpace(event, context) {

    var axis = abs(event.dx) > abs(event.dy) ? 'x' : 'y',
        offset = event['d' + axis],
        // start point of create space operation
        spacePos = event[axis] - offset,
        // list of moving shapes
        movingShapes = [],
        // list of resizing shapes
        resizingShapes = [];

    if (abs(offset) < 5) {
      return false;
    }

    // inverts the offset to choose the shapes
    // on the opposite side of the resizer if
    // a key modifier is pressed
    if (hasPrimaryModifier(event)) {
      offset *= -1;
    }

    // collect all elements that need to be moved _AND_
    // resized given on the initial create space position
    elementRegistry.forEach(function (shape) {
      var shapeStart = shape[ [ axis ]],
          shapeEnd = shapeStart + shape[ AXIS_TO_DIMENSION[ axis ]];

      // checking if it's root
      if (!shape.parent) {
        return;
      }

      // checking if it's a shape
      if (shape.waypoints) {
        return;
      }

      // shape after spacePos
      if (offset > 0 && shapeStart > spacePos) {
        return movingShapes.push(shape);
      }

      // shape before spacePos
      if (offset < 0 && shapeEnd < spacePos) {
        return movingShapes.push(shape);
      }

      // shape on top of spacePos, resize only if allowed
      if (shapeStart < spacePos && shapeEnd > spacePos && canResize(shape)) {
        return resizingShapes.push(shape);
      }
    });

    // store data in context
    context.axis = axis;
    context.direction = SpaceUtil.getDirection(axis, offset);
    context.movingShapes = movingShapes;
    context.resizingShapes = resizingShapes;

    Cursor.set('resize-' + (axis === 'x' ? 'ew' : 'ns'));

    return true;
  }


  eventBus.on('spaceTool.move', HIGH_PRIORITY , function(event) {

    var context = event.context;

    if (!context.initialized) {
      context.initialized = initializeMakeSpace(event, context);
    }
  });


  eventBus.on('spaceTool.end', function(event) {

    var context = event.context,
        axis = context.axis,
        direction = context.direction,
        movingShapes = context.movingShapes,
        resizingShapes = context.resizingShapes;

    // skip if create space has not been initialized yet
    if (!context.initialized) {
      return;
    }

    var delta = { x: round(event.dx), y: round(event.dy) };
    delta[ AXIS_INVERTED[ axis ] ] = 0;

    return modeling.createSpace(movingShapes, resizingShapes, delta, direction);
  });

  // API
  this.activateSelection = activateSelection;
  this.activateMakeSpace = activateMakeSpace;
}

SpaceTool.$inject = ['eventBus', 'dragging', 'elementRegistry', 'modeling', 'rules'];

module.exports = SpaceTool;
