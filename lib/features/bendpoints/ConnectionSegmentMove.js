'use strict';

var Geometry = require('../../util/Geometry'),
    BendpointUtil = require('./BendpointUtil'),
    LayoutUtil = require('../../layout/LayoutUtil');

var MARKER_CONNECT_HOVER = 'connect-hover',
    MARKER_CONNECT_UPDATING = 'djs-updating';

function axisAdd(point, axis, delta) {
  return axisSet(point, axis, point[axis] + delta);
}

function axisSet(point, axis, value) {
  return {
    x: (axis === 'x' ? value : point.x),
    y: (axis === 'y' ? value : point.y)
  };
}

function axisFenced(position, segmentStart, segmentEnd, axis) {

  var maxValue = Math.max(segmentStart[axis], segmentEnd[axis]),
      minValue = Math.min(segmentStart[axis], segmentEnd[axis]);

  var padding = 20;

  var fencedValue = Math.min(Math.max(minValue + padding, position[axis]), maxValue - padding);

  return axisSet(segmentStart, axis, fencedValue);
}

function flipAxis(axis) {
  return axis === 'x' ? 'y' : 'x';
}

/**
 * Get the docking point on the given element.
 *
 * Compute a reasonable docking, if non exists.
 *
 * @param  {Point} point
 * @param  {djs.model.Shape} referenceElement
 * @param  {String} moveAxis (x|y)
 *
 * @return {Point}
 */
function getDocking(point, referenceElement, moveAxis) {

  var referenceMid,
      inverseAxis;

  if (point.original) {
    return point.original;
  } else {
    referenceMid = LayoutUtil.getMid(referenceElement);
    inverseAxis = flipAxis(moveAxis);

    return axisSet(point, inverseAxis, referenceMid[inverseAxis]);
  }
}

/**
 * A component that implements moving of bendpoints
 */
function ConnectionSegmentMove(injector, eventBus, canvas, dragging, graphicsFactory, rules, modeling) {

  // optional connection docking integration
  var connectionDocking = injector.get('connectionDocking', false);


  // API

  this.start = function(event, connection, idx) {

    var context,
        gfx = canvas.getGraphics(connection),
        segmentStartIndex = idx - 1,
        segmentEndIndex = idx,
        waypoints = connection.waypoints,
        segmentStart = waypoints[segmentStartIndex],
        segmentEnd = waypoints[segmentEndIndex],
        direction,
        axis;

    direction = Geometry.pointsAligned(segmentStart, segmentEnd);

    // do not move diagonal connection
    if (!direction) {
      return;
    }

    // the axis where we are going to move things
    axis = direction === 'v' ? 'y' : 'x';

    if (segmentStartIndex === 0) {
      segmentStart = getDocking(segmentStart, connection.source, axis);
    }

    if (segmentEndIndex === waypoints.length - 1) {
      segmentEnd = getDocking(segmentEnd, connection.target, axis);
    }

    context = {
      connection: connection,
      segmentStartIndex: segmentStartIndex,
      segmentEndIndex: segmentEndIndex,
      segmentStart: segmentStart,
      segmentEnd: segmentEnd,
      axis: axis
    };

    dragging.init(event, 'connectionSegment.move', {
      cursor: axis === 'x' ? 'resize-ew' : 'resize-ns',
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

  function updateDragger(context, segmentOffset, event) {

    var newWaypoints = context.newWaypoints,
        segmentStartIndex = context.segmentStartIndex + segmentOffset,
        segmentStart = newWaypoints[segmentStartIndex],
        segmentEndIndex = context.segmentEndIndex + segmentOffset,
        segmentEnd = newWaypoints[segmentEndIndex],
        axis = flipAxis(context.axis);

    // make sure the dragger does not move
    // outside the connection
    var draggerPosition = axisFenced(event, segmentStart, segmentEnd, axis);

    // update dragger
    context.draggerGfx.translate(draggerPosition.x, draggerPosition.y);
  }

  function filterRedundantWaypoints(waypoints) {
    return waypoints.filter(function(r, idx) {
      return !Geometry.pointsOnLine(waypoints[idx - 1], waypoints[idx + 1], r);
    });
  }

  eventBus.on('connectionSegment.move.start', function(e) {

    var context = e.context,
        connection = e.connection,
        layer = canvas.getLayer('overlays');

    context.originalWaypoints = connection.waypoints.slice();

    // add dragger gfx
    context.draggerGfx = BendpointUtil.addSegmentDragger(layer, context.segmentStart, context.segmentEnd);
    context.draggerGfx.addClass('djs-dragging');

    canvas.addMarker(connection, MARKER_CONNECT_UPDATING);
  });

  eventBus.on('connectionSegment.move.move', function(e) {

    var context = e.context,
        connection = context.connection,
        segmentStartIndex = context.segmentStartIndex,
        segmentEndIndex = context.segmentEndIndex,
        segmentStart = context.segmentStart,
        segmentEnd = context.segmentEnd,
        axis = context.axis;

    var newWaypoints = context.originalWaypoints.slice(),
        newSegmentStart = axisAdd(segmentStart, axis, e['d' + axis]),
        newSegmentEnd = axisAdd(segmentEnd, axis, e['d' + axis]);

    // original waypoint count and added / removed
    // from start waypoint delta. We use the later
    // to retrieve the updated segmentStartIndex / segmentEndIndex
    var waypointCount = newWaypoints.length,
        segmentOffset = 0;

    // move segment start / end by axis delta
    newWaypoints[segmentStartIndex] = newSegmentStart;
    newWaypoints[segmentEndIndex] = newSegmentEnd;

    var sourceToSegmentOrientation,
        targetToSegmentOrientation;

    // handle first segment
    if (segmentStartIndex < 2) {
      sourceToSegmentOrientation = LayoutUtil.getOrientation(connection.source, newSegmentStart);

      // first bendpoint, remove first segment if intersecting
      if (segmentStartIndex === 1) {

        if (sourceToSegmentOrientation === 'intersect') {
          newWaypoints.shift();
          newWaypoints[0] = newSegmentStart;
          segmentOffset--;
        }
      }

      // docking point, add segment if not intersecting anymore
      else {
        if (sourceToSegmentOrientation !== 'intersect') {
          newWaypoints.unshift(segmentStart);
          segmentOffset++;
        }
      }
    }

    // handle last segment
    if (segmentEndIndex > waypointCount - 3) {
      targetToSegmentOrientation = LayoutUtil.getOrientation(connection.target, newSegmentEnd);

      // last bendpoint, remove last segment if intersecting
      if (segmentEndIndex === waypointCount - 2) {

        if (targetToSegmentOrientation === 'intersect') {
          newWaypoints.pop();
          newWaypoints[newWaypoints.length - 1] = newSegmentEnd;
        }
      }

      // last bendpoint, remove last segment if intersecting
      else {
        if (targetToSegmentOrientation !== 'intersect') {
          newWaypoints.push(segmentEnd);
        }
      }
    }

    // update connection waypoints
    connection.waypoints = newWaypoints;

    // crop connection, if docking service is provided
    if (connectionDocking) {
      connection.waypoints = newWaypoints = connectionDocking.getCroppedWaypoints(connection);
    }

    // save new waypoints in context
    context.newWaypoints = newWaypoints;

    // update dragger position
    updateDragger(context, segmentOffset, e);

    // redraw connection
    redrawConnection(e);
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
    }
  });

  eventBus.on('connectionSegment.move.cleanup', function(e) {

    var context = e.context,
        connection = context.connection;

    // remove dragger gfx
    if (context.draggerGfx) {
      context.draggerGfx.remove();
    }

    canvas.removeMarker(connection, MARKER_CONNECT_UPDATING);
  });

  eventBus.on([
    'connectionSegment.move.cancel',
    'connectionSegment.move.end'
  ], function(e) {
    var context = e.context,
        connection = context.connection;

    connection.waypoints = context.originalWaypoints;

    redrawConnection(e);
  });

  eventBus.on('connectionSegment.move.end', function(e) {

    var context = e.context,
        waypoints = context.newWaypoints;

    // ensure we have actual pixel values bendpoint
    // coordinates (important when zoom level was > 1 during move)
    waypoints.forEach(function(wp) {
      wp.x = Math.round(wp.x);
      wp.y = Math.round(wp.y);
    });

    modeling.updateWaypoints(context.connection, filterRedundantWaypoints(waypoints));
  });
}


ConnectionSegmentMove.$inject = [
  'injector', 'eventBus', 'canvas',
  'dragging', 'graphicsFactory', 'rules',
  'modeling'
];

module.exports = ConnectionSegmentMove;