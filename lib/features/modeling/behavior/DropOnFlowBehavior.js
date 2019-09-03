import inherits from 'inherits';

import {
  assign,
  filter,
  find,
  isNumber
} from 'min-dash';

import { getMid } from 'diagram-js/lib/layout/LayoutUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  getApproxIntersection
} from 'diagram-js/lib/util/LineIntersection';


export default function DropOnFlowBehavior(eventBus, bpmnRules, modeling) {

  CommandInterceptor.call(this, eventBus);

  /**
   * Reconnect start / end of a connection after
   * dropping an element on a flow.
   */

  function insertShape(shape, targetFlow, positionOrBounds) {
    var waypoints = targetFlow.waypoints,
        waypointsBefore,
        waypointsAfter,
        dockingPoint,
        source,
        target,
        incomingConnection,
        outgoingConnection,
        oldOutgoing = shape.outgoing.slice(),
        oldIncoming = shape.incoming.slice();

    var mid;

    if (isNumber(positionOrBounds.width)) {
      mid = getMid(positionOrBounds);
    } else {
      mid = positionOrBounds;
    }

    var intersection = getApproxIntersection(waypoints, mid);

    if (intersection) {
      waypointsBefore = waypoints.slice(0, intersection.index);
      waypointsAfter = waypoints.slice(intersection.index + (intersection.bendpoint ? 1 : 0));

      // due to inaccuracy intersection might have been found
      if (!waypointsBefore.length || !waypointsAfter.length) {
        return;
      }

      dockingPoint = intersection.bendpoint ? waypoints[intersection.index] : mid;

      // if last waypointBefore is inside shape's bounds, ignore docking point
      if (!isPointInsideBBox(shape, waypointsBefore[waypointsBefore.length-1])) {
        waypointsBefore.push(copy(dockingPoint));
      }

      // if first waypointAfter is inside shape's bounds, ignore docking point
      if (!isPointInsideBBox(shape, waypointsAfter[0])) {
        waypointsAfter.unshift(copy(dockingPoint));
      }
    }

    source = targetFlow.source;
    target = targetFlow.target;

    if (bpmnRules.canConnect(source, shape, targetFlow)) {

      // reconnect source -> inserted shape
      modeling.reconnectEnd(targetFlow, shape, waypointsBefore || mid);

      incomingConnection = targetFlow;
    }

    if (bpmnRules.canConnect(shape, target, targetFlow)) {

      if (!incomingConnection) {

        // reconnect inserted shape -> end
        modeling.reconnectStart(targetFlow, shape, waypointsAfter || mid);

        outgoingConnection = targetFlow;
      } else {
        outgoingConnection = modeling.connect(
          shape, target, { type: targetFlow.type, waypoints: waypointsAfter }
        );
      }
    }

    var duplicateConnections = [].concat(

      incomingConnection && filter(oldIncoming, function(connection) {
        return connection.source === incomingConnection.source;
      }) || [],

      outgoingConnection && filter(oldOutgoing, function(connection) {
        return connection.source === outgoingConnection.source;
      }) || []
    );

    if (duplicateConnections.length) {
      modeling.removeElements(duplicateConnections);
    }
  }

  this.preExecute('elements.move', function(context) {

    var newParent = context.newParent,
        shapes = context.shapes,
        delta = context.delta,
        shape = shapes[0];

    if (!shape || !newParent) {
      return;
    }

    // if the new parent is a connection,
    // change it to the new parent's parent
    if (newParent && newParent.waypoints) {
      context.newParent = newParent = newParent.parent;
    }

    var shapeMid = getMid(shape);
    var newShapeMid = {
      x: shapeMid.x + delta.x,
      y: shapeMid.y + delta.y
    };

    // find a connection which intersects with the
    // element's mid point
    var connection = find(newParent.children, function(element) {
      var canInsert = bpmnRules.canInsert(shapes, element);

      return canInsert && getApproxIntersection(element.waypoints, newShapeMid);
    });

    if (connection) {
      context.targetFlow = connection;
      context.position = newShapeMid;
    }

  }, true);

  this.postExecuted('elements.move', function(context) {

    var shapes = context.shapes,
        targetFlow = context.targetFlow,
        position = context.position;

    if (targetFlow) {
      insertShape(shapes[0], targetFlow, position);
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

  this.postExecuted('shape.create', function(context) {

    var shape = context.shape,
        targetFlow = context.targetFlow,
        positionOrBounds = context.position;

    if (targetFlow) {
      insertShape(shape, targetFlow, positionOrBounds);
    }
  }, true);
}

inherits(DropOnFlowBehavior, CommandInterceptor);

DropOnFlowBehavior.$inject = [
  'eventBus',
  'bpmnRules',
  'modeling'
];


// helpers /////////////////////

function isPointInsideBBox(bbox, point) {
  var x = point.x,
      y = point.y;

  return x >= bbox.x &&
    x <= bbox.x + bbox.width &&
    y >= bbox.y &&
    y <= bbox.y + bbox.height;
}

function copy(obj) {
  return assign({}, obj);
}

