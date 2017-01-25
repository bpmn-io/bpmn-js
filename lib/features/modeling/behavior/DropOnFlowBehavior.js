'use strict';

var inherits = require('inherits');

var assign = require('lodash/object/assign');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var getApproxIntersection = require('diagram-js/lib/util/LineIntersection').getApproxIntersection;


function copy(obj) {
  return assign({}, obj);
}

function DropOnFlow(eventBus, bpmnRules, modeling) {

  CommandInterceptor.call(this, eventBus);

  /**
   * Reconnect start / end of a connection after
   * dropping an element on a flow.
   */

  function insertShape(shape, targetFlow, position) {
    var waypoints = targetFlow.waypoints,
        waypointsBefore, waypointsAfter, dockingPoint, source, target, reconnected;

    var intersection = getApproxIntersection(waypoints, position);

    if (intersection) {
      waypointsBefore = waypoints.slice(0, intersection.index);
      waypointsAfter = waypoints.slice(intersection.index + (intersection.bendpoint ? 1 : 0));

      dockingPoint = intersection.bendpoint ? waypoints[intersection.index] : position;

      waypointsBefore.push(copy(dockingPoint));
      waypointsAfter.unshift(copy(dockingPoint));
    }

    source = targetFlow.source;
    target = targetFlow.target;

    if (bpmnRules.canConnect(source, shape, targetFlow)) {
      // reconnect source -> inserted shape
      modeling.reconnectEnd(targetFlow, shape, waypointsBefore || position);

      reconnected = true;
    }

    if (bpmnRules.canConnect(shape, target, targetFlow)) {

      if (!reconnected) {
        // reconnect inserted shape -> end
        modeling.reconnectStart(targetFlow, shape, waypointsAfter || position);
      } else {
        modeling.connect(shape, target, { type: targetFlow.type, waypoints: waypointsAfter });
      }
    }
  }

  eventBus.on('shape.move.move', 250, function(event) {

    var context = event.context,
        target = context.target,
        targetFlow = context.targetFlow,
        shape = context.shape,
        shapes = context.shapes;

    if (shapes.length === 1 && bpmnRules.canInsert(shape, target)) {
      context.targetFlow = target;
      context.target = target.parent;
    } else if (targetFlow) {
      context.targetFlow = context.flowParent = null;
    }
  });

  eventBus.on('shape.move.end', 250, function(event) {

    var context = event.context,
        shape = context.shape,
        targetFlow = context.targetFlow,
        position = {
          x: shape.x + (shape.width / 2),
          y: shape.y + (shape.height / 2)
        };

    if (targetFlow) {
      insertShape(shape, targetFlow, position);
    }
  }, true);

  this.preExecute('shape.create', function(context) {

    var parent = context.parent,
        shape = context.shape;

    if (bpmnRules.canInsert(shape, parent)) {
      context.targetFlow = parent;
      context.parent = parent.parent;
    }
  }, true);


  this.postExecute('shape.create', function(context) {

    var shape = context.shape,
        targetFlow = context.targetFlow,
        position = context.position;

    if (targetFlow) {
      insertShape(shape, targetFlow, position);
    }
  }, true);
}

inherits(DropOnFlow, CommandInterceptor);

DropOnFlow.$inject = [ 'eventBus', 'bpmnRules', 'modeling' ];

module.exports = DropOnFlow;
