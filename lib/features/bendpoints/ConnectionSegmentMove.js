'use strict';

var Geometry = require('../../util/Geometry'),
    BendpointUtil = require('./BendpointUtil'),
    Layout = require('../../layout/LayoutUtil'),
    cloneDeep = require('lodash/lang/cloneDeep'),
    pick = require('lodash/object/pick');

var MARKER_OK = 'connect-ok',
    MARKER_NOT_OK = 'connect-not-ok',
    MARKER_CONNECT_HOVER = 'connect-hover',
    MARKER_CONNECT_UPDATING = 'djs-updating';

function copyPoint(point) {
  return pick(point, [ 'x', 'y' ]);
}


/**
 * A component that implements moving of bendpoints
 */
function BendpointParallelMove(injector, eventBus, canvas, dragging, graphicsFactory, rules, modeling) {

  // optional connection docking integration
  var connectionDocking;
  try {
    connectionDocking = injector.get('connectionDocking');
  } catch (e) {}


  // API

  this.start = function(event, connection, idx) {

    var context,
        waypoints = connection.waypoints,
        gfx = canvas.getGraphics(connection),
        p0 = waypoints[idx - 1],
        p1 = waypoints[idx],
        wpFirst = waypoints[0],
        wpLast = waypoints[waypoints.length - 1];

    // create docking points if we don't have them already
    wpFirst.original = wpFirst.original || copyPoint(wpFirst);
    wpLast.original = wpLast.original || copyPoint(wpLast);

    context = {
      p0: p0,
      p1: p1,
      source: connection.source,
      target: connection.target,
      horizontal: p0.x !== p1.x,
      vertical: p0.y !== p1.y,
      connection: connection
    };

    dragging.activate(event, 'connectionSegment.move', {
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

  eventBus.on('connectionSegment.move.start', function(e) {

    // diagonal lines are losers
    if(e.context.horizontal && e.context.vertical) {
      return null;
    }

    var context = e.context,
        connection = e.connection,
        layer = canvas.getLayer('overlays');

    context.originalWaypoints = cloneDeep(connection.waypoints);
    context.waypoints = connection.waypoints;

    // add dragger gfx
    context.draggerGfx = BendpointUtil.addParallelDragMarker(context.p0, context.p1, layer);
    context.draggerGfx.addClass('djs-dragging');

    canvas.addMarker(connection, MARKER_CONNECT_UPDATING);

    return true;
  });

  eventBus.on('connectionSegment.move.hover', function(e) {

    e.context.hover = e.hover;
    canvas.addMarker(e.hover, MARKER_CONNECT_HOVER);
  });

  eventBus.on([
    'connectionSegment.move.out',
    'connectionSegment.move.cleanup'
  ], function(e) {

    // remove connect marker
    // if it was added
    var hover = e.context.hover;

    if (hover) {
      canvas.removeMarker(hover, MARKER_CONNECT_HOVER);
      canvas.removeMarker(hover, e.context.target ? MARKER_OK : MARKER_NOT_OK);
    }
  });

  eventBus.on('connectionSegment.move.move', function(e) {

    var context = e.context,
        source = Layout.asShape(context.source),
        target = Layout.asShape(context.target),
        waypoints = context.waypoints,
        idxLast = function() { return waypoints.length - 1; },
        p0 = context.p0,
        p1 = context.p1,
        newPosition = {x:e.x, y:e.y},
        // horizontal line is moving on y-axis, vertical on x-axis.
        axis = context.horizontal ? 'y' : 'x',
        otherAxis = axis === 'y' ? 'x' : 'y';

    p0[axis] = p1[axis] = newPosition[axis];

    if (connectionDocking) {
      context.croppedWaypoints = connectionDocking.getCroppedWaypoints(context.connection);
    }

    // special handling for first intersection
    if( p0 === waypoints[0] ) {

      p0.original = p0.original || {x:source.center.x, y:source.center.y};

      if(context.croppedWaypoints) {
        p0[otherAxis] = context.croppedWaypoints[0][otherAxis];
      }

      if( lostConnection(p0, source) ) {

        // first waypoint lost its connection to the element
        closeConnection(p0, waypoints, 0);
        waypoints[0].original = context.originalWaypoints[0].original;
        p0[otherAxis] = waypoints[0].original[otherAxis];

        if(context.croppedWaypoints) {
          //TODO: this should not be necessary but fixes cropping on big deltas
          context.croppedWaypoints = connectionDocking.getCroppedWaypoints(context.connection);
          waypoints[0][axis] = context.croppedWaypoints[0][axis];
        }

      } else {
        p0.original[axis] = p0[axis];
      }

    } else if( inBounds(p0, source) ) {

      p0.original = waypoints[0].original;
      waypoints.splice(0, waypoints.indexOf(p0));
    }

    if( p1 === waypoints[idxLast()]) {

      p1.original = p1.original || {x:target.center.x, y:target.center.y};

      if(context.croppedWaypoints) {
        p1[otherAxis] = context.croppedWaypoints[context.croppedWaypoints.length - 1][otherAxis];
      }

      if( lostConnection(p1, target) ) {

        var owpLast = context.originalWaypoints.length - 1;

        // last waypoint lost its connection to the element
        closeConnection(p1, waypoints, idxLast() + 1);
        waypoints[idxLast()].original = context.originalWaypoints[owpLast].original;
        p1[otherAxis] = waypoints[idxLast()][otherAxis];

        if(context.croppedWaypoints) {
          //TODO: this should not be necessary but fixes cropping on big deltas
          context.croppedWaypoints = connectionDocking.getCroppedWaypoints(context.connection);
          var lastCropped = context.croppedWaypoints.length - 1;
          waypoints[idxLast()][axis] = context.croppedWaypoints[lastCropped][axis];
        }

      } else {
        p1.original[axis] = p1[axis];
      }

    } else if( inBounds(p1, target) ) {
      p1.original = waypoints[idxLast()].original;
      waypoints.splice(waypoints.indexOf(p1) + 1);
    }

    // add dragger gfx
    e.context.draggerGfx.translate(e.x, e.y);

    redrawConnection(e);
  });

  eventBus.on([
    'connectionSegment.move.end',
    'connectionSegment.move.cancel'
  ], function(e) {

    var context = e.context,
        connection = context.connection;

    // remove dragger gfx
    context.draggerGfx.remove();

    context.newWaypoints = connection.waypoints.slice();
    connection.waypoints = context.originalWaypoints;

    canvas.removeMarker(connection, MARKER_CONNECT_UPDATING);
  });

  eventBus.on('connectionSegment.move.end', function(e) {

    var context = e.context,
        waypoints = context.newWaypoints,
        allowed = context.allowed;

    // ensure we have actual pixel values bendpoint
    // coordinates (important when zoom level was > 1 during move)
    waypoints.forEach(function(wp) {
      wp.x = Math.round(wp.x);
      wp.y = Math.round(wp.y);
    });

    if (allowed !== false) {
      modeling.updateWaypoints(context.connection, filterRedundantWaypoints(waypoints));
    } else {
      redrawConnection(e);
      return false;
    }

  });

  eventBus.on('connectionSegment.move.cancel', function(e) {
    redrawConnection(e);
  });
}

function inBounds(p, rect, padding) {

  padding = padding || 0;

  return p.x >= rect.left - padding && p.x <= rect.right + padding &&
         p.y >= rect.top - padding && p.y <= rect.bottom + padding;
}

function lostConnection(p, element) {
  return !inBounds(p, element); // && inBounds(p.original, element);
}

function closeConnection(p, waypoints, idx) {

  var newPoint = { x: p.original.x, y: p.original.y, original: p.original };

  delete p.original;
  waypoints.splice(idx, 0, newPoint);
}

BendpointParallelMove.$inject = [
  'injector', 'eventBus', 'canvas',
  'dragging', 'graphicsFactory', 'rules',
  'modeling'
];

module.exports = BendpointParallelMove;

