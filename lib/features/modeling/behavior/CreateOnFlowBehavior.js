'use strict';

var inherits = require('inherits');

var assign = require('lodash/object/assign');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var getApproxIntersection = require('diagram-js/lib/util/LineIntersection').getApproxIntersection;


function copy(obj) {
  return assign({}, obj);
}

function CreateOnFlowBehavior(eventBus, bpmnRules, modeling) {

  CommandInterceptor.call(this, eventBus);

  /**
   * Reconnect start / end of a connection after
   * dropping an element on a flow.
   */

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
        position = context.position,
        source,
        target,
        reconnected,
        intersection,
        waypoints,
        waypointsBefore,
        waypointsAfter,
        dockingPoint;

    if (targetFlow) {

      waypoints = targetFlow.waypoints;


      intersection = getApproxIntersection(waypoints, position);

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
        modeling.reconnectEnd(targetFlow, shape, waypointsBefore || copy(position));

        reconnected = true;
      }

      if (bpmnRules.canConnect(shape, target, targetFlow)) {

        if (!reconnected) {
          // reconnect inserted shape -> end
          modeling.reconnectStart(targetFlow, shape, waypointsAfter || copy(position));
        } else {
          modeling.connect(shape, target, { type: targetFlow.type, waypoints: waypointsAfter });
        }
      }
    }
  }, true);
}

inherits(CreateOnFlowBehavior, CommandInterceptor);

CreateOnFlowBehavior.$inject = [ 'eventBus', 'bpmnRules', 'modeling' ];

module.exports = CreateOnFlowBehavior;
