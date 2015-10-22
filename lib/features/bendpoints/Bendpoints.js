'use strict';

var domEvent = require('min-dom/lib/event'),
    BendpointUtil = require('./BendpointUtil'),
    Geometry = require('../../util/Geometry');

var BENDPOINT_CLS = BendpointUtil.BENDPOINT_CLS;
var DRAGMARKER_CLS = BendpointUtil.DRAGMARKER_CLS;

var getApproxIntersection = require('../../util/LineIntersection').getApproxIntersection;


/**
 * A service that adds editable bendpoints to connections.
 */
function Bendpoints(eventBus, canvas, interactionEvents, bendpointMove, connectionSegmentMove) {

  function getConnectionIntersection(waypoints, event) {
    var localPosition = BendpointUtil.toCanvasCoordinates(canvas, event),
        intersection = getApproxIntersection(waypoints, localPosition);

    return intersection;
  }

  function isIntersectionMiddle(intersection, waypoints, treshold) {
    var idx = intersection.index,
        p = intersection.point,
        p0, p1, mid, aligned, xDelta, yDelta;

    if (idx <= 0 || intersection.bendpoint) {
      return false;
    }

    p0 = waypoints[idx - 1];
    p1 = waypoints[idx];
    mid = Geometry.getMidPoint(p0, p1),
    aligned = Geometry.pointsAligned(p0, p1);
    xDelta = Math.abs(p.x - mid.x);
    yDelta = Math.abs(p.y - mid.y);

    return aligned && xDelta <= treshold && yDelta <= treshold;
  }

  function activateBendpointMove(event, connection) {
    var waypoints = connection.waypoints,
        intersection = getConnectionIntersection(waypoints, event);

    if (!intersection) {
      return;
    }

    if (isIntersectionMiddle(intersection, waypoints, 10)) {
      connectionSegmentMove.start(event, connection, intersection.index);
    } else {
      bendpointMove.start(event, connection, intersection.index, !intersection.bendpoint);
    }
  }

  function getBendpointsContainer(element, create) {

    var layer = canvas.getLayer('overlays'),
        gfx = layer.select('.djs-bendpoints[data-element-id=' + element.id + ']');

    if (!gfx && create) {
      gfx = layer.group().addClass('djs-bendpoints').attr('data-element-id', element.id);

      domEvent.bind(gfx.node, 'mousedown', function(event) {
        activateBendpointMove(event, element);
      });
    }

    return gfx;
  }

  function createBendpoints(gfx, connection) {
    connection.waypoints.forEach(function(p, idx) {
      BendpointUtil.addBendpoint(gfx).translate(p.x, p.y);
    });

    // add floating bendpoint
    BendpointUtil.addBendpoint(gfx, 'floating');
  }

  function createDragMarkers(gfx, connection) {

    var waypoints = connection.waypoints;

    for(var i=1; i < waypoints.length; i++) {
      BendpointUtil.addSegmentDragger(gfx, waypoints[i - 1], waypoints[i]);
    }
  }

  function clearBendpoints(gfx) {
    gfx.selectAll('.' + BENDPOINT_CLS).forEach(function(s) {
      s.remove();
    });
  }

  function clearDragMarkers(gfx) {
    gfx.selectAll('.' + DRAGMARKER_CLS).forEach(function(s) {
      s.remove();
    });
  }

  function addBendpointsAndDragMarkers(connection) {

    var gfx = getBendpointsContainer(connection);

    if (!gfx) {
      gfx = getBendpointsContainer(connection, true);
      createBendpoints(gfx, connection);
      createDragMarkers(gfx, connection);
    }

    return gfx;
  }

  function updateBendpoints(connection) {

    var gfx = getBendpointsContainer(connection);

    if (gfx) {
      clearBendpoints(gfx);
      createBendpoints(gfx, connection);
    }
  }

  function updateDragMarkers(connection) {

    var gfx = getBendpointsContainer(connection);

    if (gfx) {
      clearDragMarkers(gfx);
      createDragMarkers(gfx, connection);
    }
  }

  eventBus.on('connection.changed', function(event) {
    updateBendpoints(event.element);
    updateDragMarkers(event.element);
  });

  eventBus.on('connection.remove', function(event) {
    var gfx = getBendpointsContainer(event.element);
    if (gfx) {
      gfx.remove();
    }
  });

  eventBus.on('element.marker.update', function(event) {

    var element = event.element,
        bendpointsGfx;

    if (!element.waypoints) {
      return;
    }

    bendpointsGfx = addBendpointsAndDragMarkers(element);
    bendpointsGfx[event.add ? 'addClass' : 'removeClass'](event.marker);
  });

  eventBus.on('element.mousemove', function(event) {

    var element = event.element,
        waypoints = element.waypoints,
        bendpointsGfx,
        floating,
        intersection;

    if (waypoints) {

      bendpointsGfx = getBendpointsContainer(element, true);
      floating = bendpointsGfx.select('.floating');

      if (!floating) {
        return;
      }

      intersection = getConnectionIntersection(waypoints, event.originalEvent);

      if (intersection) {
        floating.translate(intersection.point.x, intersection.point.y);
      }
    }
  });

  eventBus.on('element.mousedown', function(event) {

    var originalEvent = event.originalEvent,
        element = event.element,
        waypoints = element.waypoints;

    if (!waypoints) {
      return;
    }

    activateBendpointMove(originalEvent, element, waypoints);
  });

  eventBus.on('selection.changed', function(event) {
    var newSelection = event.newSelection,
        primary = newSelection[0];

    if (primary && primary.waypoints) {
      addBendpointsAndDragMarkers(primary);
    }
  });

  eventBus.on('element.hover', function(event) {
    var element = event.element;

    if (element.waypoints) {
      addBendpointsAndDragMarkers(element);
      interactionEvents.registerEvent(event.gfx.node, 'mousemove', 'element.mousemove');
    }
  });

  eventBus.on('element.out', function(event) {
    interactionEvents.unregisterEvent(event.gfx.node, 'mousemove', 'element.mousemove');
  });
}

Bendpoints.$inject = [
  'eventBus', 'canvas', 'interactionEvents',
  'bendpointMove', 'connectionSegmentMove'
];

module.exports = Bendpoints;
