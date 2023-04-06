import {
  assign
} from 'min-dash';

import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { getConnectionAdjustment as getConnectionAnchorPoint } from './util/ConnectionLayoutUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../Modeling').default} Modeling
 */

/**
 * A component that makes sure that Associations connected to Connections
 * are updated together with the Connection.
 *
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 */
export default function LayoutConnectionBehavior(eventBus, modeling) {

  CommandInterceptor.call(this, eventBus);

  function getnewAnchorPoint(event, point) {

    var context = event.context,
        connection = context.connection,
        hints = assign({}, context.hints),
        newWaypoints = context.newWaypoints || connection.waypoints,
        oldWaypoints = context.oldWaypoints;


    if (typeof hints.startChanged === 'undefined') {
      hints.startChanged = !!hints.connectionStart;
    }

    if (typeof hints.endChanged === 'undefined') {
      hints.endChanged = !!hints.connectionEnd;
    }

    return getConnectionAnchorPoint(point, newWaypoints, oldWaypoints, hints);
  }

  this.postExecute([
    'connection.layout',
    'connection.updateWaypoints'
  ], function(event) {
    var context = event.context;

    var connection = context.connection,
        outgoing = connection.outgoing,
        incoming = connection.incoming;

    incoming.forEach(function(connection) {
      var endPoint = connection.waypoints[connection.waypoints.length - 1];
      var newEndpoint = getnewAnchorPoint(event, endPoint);

      var newWaypoints = [].concat(connection.waypoints.slice(0, -1), [ newEndpoint ]);

      modeling.updateWaypoints(connection, newWaypoints);
    });

    outgoing.forEach(function(connection) {
      var startpoint = connection.waypoints[0];
      var newStartpoint = getnewAnchorPoint(event, startpoint);

      var newWaypoints = [].concat([ newStartpoint ], connection.waypoints.slice(1));

      modeling.updateWaypoints(connection, newWaypoints);
    });

  });


  this.postExecute([
    'connection.move'
  ], function(event) {
    var context = event.context;

    var connection = context.connection,
        outgoing = connection.outgoing,
        incoming = connection.incoming,
        delta = context.delta;

    incoming.forEach(function(connection) {
      var endPoint = connection.waypoints[connection.waypoints.length - 1];
      var newEndpoint = {
        x: endPoint.x + delta.x,
        y: endPoint.y + delta.y
      };

      var newWaypoints = [].concat(connection.waypoints.slice(0, -1), [ newEndpoint ]);

      modeling.updateWaypoints(connection, newWaypoints);
    });

    outgoing.forEach(function(connection) {
      var startpoint = connection.waypoints[0];
      var newStartpoint = {
        x: startpoint.x + delta.x,
        y: startpoint.y + delta.y
      };

      var newWaypoints = [].concat([ newStartpoint ], connection.waypoints.slice(1));

      modeling.updateWaypoints(connection, newWaypoints);
    });

  });

}

inherits(LayoutConnectionBehavior, CommandInterceptor);

LayoutConnectionBehavior.$inject = [
  'eventBus',
  'modeling'
];
