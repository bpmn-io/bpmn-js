'use strict';

var Geometry = require('../../util/Geometry'),
    BendpointUtil = require('./BendpointUtil');

var MARKER_OK = 'connect-ok',
    MARKER_NOT_OK = 'connect-not-ok',
    MARKER_CONNECT_HOVER = 'connect-hover',
    MARKER_CONNECT_UPDATING = 'djs-updating';

var COMMAND_BENDPOINT_UPDATE = 'connection.updateWaypoints',
    COMMAND_RECONNECT_START = 'connection.reconnectStart',
    COMMAND_RECONNECT_END = 'connection.reconnectEnd';

var round = Math.round;


/**
 * A component that implements moving of bendpoints
 */
function BendpointMove(injector, eventBus, canvas, dragging, graphicsFactory, rules, modeling) {

  // optional connection docking integration
  var connectionDocking = injector.get('connectionDocking', false);


  // API

  this.start = function(event, connection, bendpointIndex, insert) {

    var type,
        context,
        waypoints = connection.waypoints,
        gfx = canvas.getGraphics(connection);

    if (!insert && bendpointIndex === 0) {
      type = COMMAND_RECONNECT_START;
    } else
    if (!insert && bendpointIndex === waypoints.length - 1) {
      type = COMMAND_RECONNECT_END;
    } else {
      type = COMMAND_BENDPOINT_UPDATE;
    }

    context = {
      connection: connection,
      bendpointIndex: bendpointIndex,
      insert: insert,
      type: type
    };

    dragging.init(event, 'bendpoint.move', {
      data: {
        connection: connection,
        connectionGfx: gfx,
        context: context
      }
    });
  };


  // DRAGGING IMPLEMENTATION


  function redrawConnection(data) {
    graphicsFactory.update('connection', data.connection, data.connectionGfx);
  }

  function filterRedundantWaypoints(waypoints) {
    return waypoints.filter(function(r, idx) {
      return !Geometry.pointsOnLine(waypoints[idx - 1], waypoints[idx + 1], r);
    });
  }

  eventBus.on('bendpoint.move.start', function(e) {

    var context = e.context,
        connection = context.connection,
        originalWaypoints = connection.waypoints,
        waypoints = originalWaypoints.slice(),
        insert = context.insert,
        idx = context.bendpointIndex;

    context.originalWaypoints = originalWaypoints;

    if (insert) {
      // insert placeholder for bendpoint to-be-added
      waypoints.splice(idx, 0, null);
    }

    connection.waypoints = waypoints;

    // add dragger gfx
    context.draggerGfx = BendpointUtil.addBendpoint(canvas.getLayer('overlays'));
    context.draggerGfx.addClass('djs-dragging');

    canvas.addMarker(connection, MARKER_CONNECT_UPDATING);
  });

  eventBus.on('bendpoint.move.hover', function(e) {

    e.context.hover = e.hover;
    canvas.addMarker(e.hover, MARKER_CONNECT_HOVER);
  });

  eventBus.on([
    'bendpoint.move.out',
    'bendpoint.move.cleanup'
  ], function(e) {

    // remove connect marker
    // if it was added
    var hover = e.context.hover;

    if (hover) {
      canvas.removeMarker(hover, MARKER_CONNECT_HOVER);
      canvas.removeMarker(hover, e.context.target ? MARKER_OK : MARKER_NOT_OK);
    }
  });

  eventBus.on('bendpoint.move.move', function(e) {

    var context = e.context,
        moveType = context.type,
        connection = e.connection,
        source, target;

    connection.waypoints[context.bendpointIndex] = { x: e.x, y: e.y };

    if (connectionDocking) {

      if (context.hover) {
        if (moveType === COMMAND_RECONNECT_START) {
          source = context.hover;
        }

        if (moveType === COMMAND_RECONNECT_END) {
          target = context.hover;
        }
      }

      connection.waypoints = connectionDocking.getCroppedWaypoints(connection, source, target);
    }

    // asks whether reconnect / bendpoint move / bendpoint add
    // is allowed at the given position
    var allowed = context.allowed = rules.allowed(context.type, context);

    if (allowed) {

      if (context.hover) {
        canvas.removeMarker(context.hover, MARKER_NOT_OK);
        canvas.addMarker(context.hover, MARKER_OK);

        context.target = context.hover;
      }
    } else
    if (allowed === false) {
      if (context.hover) {
        canvas.removeMarker(context.hover, MARKER_OK);
        canvas.addMarker(context.hover, MARKER_NOT_OK);

        context.target = null;
      }
    }

    // add dragger gfx
    context.draggerGfx.translate(e.x, e.y);

    redrawConnection(e);
  });

  eventBus.on([
    'bendpoint.move.end',
    'bendpoint.move.cancel'
  ], function(e) {

    var context = e.context,
        hover = context.hover,
        connection = context.connection;

    // remove dragger gfx
    context.draggerGfx.remove();
    context.newWaypoints = connection.waypoints.slice();
    connection.waypoints = context.originalWaypoints;
    canvas.removeMarker(connection, MARKER_CONNECT_UPDATING);

    if (hover) {
      canvas.removeMarker(hover, MARKER_OK);
      canvas.removeMarker(hover, MARKER_NOT_OK);
    }
  });

  eventBus.on('bendpoint.move.end', function(e) {

    var context = e.context,
        waypoints = context.newWaypoints,
        bendpointIndex = context.bendpointIndex,
        bendpoint = waypoints[bendpointIndex],
        allowed = context.allowed;

    // ensure we have actual pixel values bendpoint
    // coordinates (important when zoom level was > 1 during move)
    bendpoint.x = round(bendpoint.x);
    bendpoint.y = round(bendpoint.y);

    if (allowed && context.type === COMMAND_RECONNECT_START) {
      modeling.reconnectStart(context.connection, context.target, bendpoint);
    } else
    if (allowed && context.type === COMMAND_RECONNECT_END) {
      modeling.reconnectEnd(context.connection, context.target, bendpoint);
    } else
    if (allowed !== false && context.type === COMMAND_BENDPOINT_UPDATE) {
      modeling.updateWaypoints(context.connection, filterRedundantWaypoints(waypoints));
    } else {
      redrawConnection(e);

      return false;
    }
  });

  eventBus.on('bendpoint.move.cancel', function(e) {
    redrawConnection(e);
  });
}

BendpointMove.$inject = [ 'injector', 'eventBus', 'canvas', 'dragging', 'graphicsFactory', 'rules', 'modeling' ];

module.exports = BendpointMove;
