'use strict';

var HIGH_PRIORITY = 1500;

function SpaceTool(eventBus, dragging, elementRegistry, modeling, rules) {

  function canResize(shape) {
    var ctx = { shape: shape };
    return rules.allowed('shape.resize', ctx);
  }

  function activate(event) {
    dragging.activate(event, 'spaceTool.bootstrap', {
      cursor: 'move',
      autoActivate: true,
      data: {
        context: {
          crosshair: {}
        }
      }
    });
  }

  function start(event) {
    dragging.activate(event, 'spaceTool', {
      cursor: 'grabbing',
      data: {
        context: {}
      }
    });
  }


  eventBus.on('spaceTool.bootstrap.end', function(event) {
    setTimeout(function() {
      start(event.originalEvent);
    });
  });


  eventBus.on('spaceTool.move', HIGH_PRIORITY , function (event) {
    // Which direction
    var axis = event.context.axis;
    var movingShapes = event.context.movingShapes;
    var resizingShapes = event.context.resizingShapes;
    var mapSize = { x: 'width', y: 'height' };
    var keyModifier = event.context.keyModifier;

    if (!axis) {
      axis = Math.abs(event.dx) > Math.abs(event.dy) ? 'x' : 'y';
    }

    // startPoint equals the endPoint - threshold
    var offset = event['d' + axis];
    var spacePos = event[axis] - offset;

    if(!movingShapes && !resizingShapes) {

      resizingShapes = [];
      movingShapes = [];

      if(event.originalEvent.altKey) {
        // inverts the offset to choose the opposite shapes
        offset *= -1;
        keyModifier = true;
      }

      // Objects that can be affected
      elementRegistry.forEach(function (shape) {
        // checking if it's root
        var shapeStart = shape[ [ axis ]];
        var shapeEnd = shapeStart + shape[ mapSize[ axis ]];


        if (!shape.parent) {
          return;
        }

        // checking if it's a shape
        if (shape.waypoints) {
          return;
        }

        // shape point greater than spacePos
        if (offset > 0 && shapeStart > spacePos) {
          return movingShapes.push(shape);
        }

        // shape point lesser than spacePos
        if (offset < 0 && shapeEnd < spacePos) {
          return movingShapes.push(shape);
        }

        // TODO: Add rule for can be resized
        if (shapeStart < spacePos && shapeEnd > spacePos && canResize(shape)) {
          return resizingShapes.push(shape);
        }
      });
    }

    event.context.axis = axis;
    event.context.movingShapes = movingShapes;
    event.context.resizingShapes = resizingShapes;
    event.context.keyModifier = keyModifier;
    return event;
  });


  eventBus.on('spaceTool.end', function (event) {

    var movingShapes = event.context.movingShapes;
    var resizingShapes = event.context.resizingShapes;

    var opposite = { x: 'y', y: 'x' };

    var delta = { x: event.dx, y: event.dy };
    delta[ opposite[ event.context.axis ] ] = 0;

    var ctx = {
      delta: delta,
      axis: event.context.axis,
      keyModifier: event.context.keyModifier
    };

    return modeling.createSpace(movingShapes, resizingShapes, ctx);
  });

  this.start = start;
  this.activate = activate;
}

SpaceTool.$inject = ['eventBus', 'dragging', 'elementRegistry', 'modeling', 'rules'];

module.exports = SpaceTool;
