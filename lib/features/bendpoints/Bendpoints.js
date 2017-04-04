'use strict';

var forEach = require('lodash/collection/forEach');

var domEvent = require('min-dom/lib/event'),
    domQuery = require('min-dom/lib/query'),
    BendpointUtil = require('./BendpointUtil');

var pointsAligned = require('../../util/Geometry').pointsAligned,
    getMidPoint = require('../../util/Geometry').getMidPoint;

var BENDPOINT_CLS = BendpointUtil.BENDPOINT_CLS,
    SEGMENT_DRAGGER_CLS = BendpointUtil.SEGMENT_DRAGGER_CLS;

var getApproxIntersection = require('../../util/LineIntersection').getApproxIntersection;

var svgAppend = require('tiny-svg/lib/append'),
    svgAttr = require('tiny-svg/lib/attr'),
    svgClasses = require('tiny-svg/lib/classes'),
    svgCreate = require('tiny-svg/lib/create'),
    svgRemove = require('tiny-svg/lib/remove');

var translate = require('../../util/SvgTransformUtil').translate;


/**
 * A service that adds editable bendpoints to connections.
 */
function Bendpoints(eventBus, canvas, interactionEvents,
                    bendpointMove, connectionSegmentMove) {

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
    mid = getMidPoint(p0, p1),
    aligned = pointsAligned(p0, p1);
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

  function bindInteractionEvents(node, eventName, element) {

    domEvent.bind(node, eventName, function(event) {
      interactionEvents.triggerMouseEvent(eventName, event, element);
      event.stopPropagation();
    });
  }

  function getBendpointsContainer(element, create) {

    var layer = canvas.getLayer('overlays'),
        gfx = domQuery('.djs-bendpoints[data-element-id=' + element.id + ']', layer);

    if (!gfx && create) {
      gfx = svgCreate('g');
      svgAttr(gfx, { 'data-element-id': element.id });
      svgClasses(gfx).add('djs-bendpoints');

      svgAppend(layer, gfx);

      bindInteractionEvents(gfx, 'mousedown', element);
      bindInteractionEvents(gfx, 'click', element);
      bindInteractionEvents(gfx, 'dblclick', element);
    }

    return gfx;
  }

  function createBendpoints(gfx, connection) {
    connection.waypoints.forEach(function(p, idx) {
      var bendpoint = BendpointUtil.addBendpoint(gfx);

      svgAppend(gfx, bendpoint);

      translate(bendpoint, p.x, p.y);
    });

    // add floating bendpoint
    BendpointUtil.addBendpoint(gfx, 'floating');
  }

  function createSegmentDraggers(gfx, connection) {

    var waypoints = connection.waypoints;

    var segmentStart,
        segmentEnd;

    for (var i = 1; i < waypoints.length; i++) {

      segmentStart = waypoints[i - 1];
      segmentEnd = waypoints[i];

      if (pointsAligned(segmentStart, segmentEnd)) {
        BendpointUtil.addSegmentDragger(gfx, segmentStart, segmentEnd);
      }
    }
  }

  function clearBendpoints(gfx) {
    forEach(domQuery.all('.' + BENDPOINT_CLS, gfx), function(node) {
      svgRemove(node);
    });
  }

  function clearSegmentDraggers(gfx) {
    forEach(domQuery.all('.' + SEGMENT_DRAGGER_CLS, gfx), function(node) {
      svgRemove(node);
    });
  }

  function addHandles(connection) {

    var gfx = getBendpointsContainer(connection);

    if (!gfx) {
      gfx = getBendpointsContainer(connection, true);

      createBendpoints(gfx, connection);
      createSegmentDraggers(gfx, connection);
    }

    return gfx;
  }

  function updateHandles(connection) {

    var gfx = getBendpointsContainer(connection);

    if (gfx) {
      clearSegmentDraggers(gfx);
      clearBendpoints(gfx);
      createSegmentDraggers(gfx, connection);
      createBendpoints(gfx, connection);
    }
  }

  eventBus.on('connection.changed', function(event) {
    updateHandles(event.element);
  });

  eventBus.on('connection.remove', function(event) {
    var gfx = getBendpointsContainer(event.element);

    if (gfx) {
      svgRemove(gfx);
    }
  });

  eventBus.on('element.marker.update', function(event) {

    var element = event.element,
        bendpointsGfx;

    if (!element.waypoints) {
      return;
    }

    bendpointsGfx = addHandles(element);

    if (event.add) {
      svgClasses(bendpointsGfx).add(event.marker);
    } else {
      svgClasses(bendpointsGfx).remove(event.marker);
    }
  });

  eventBus.on('element.mousemove', function(event) {

    var element = event.element,
        waypoints = element.waypoints,
        bendpointsGfx,
        floating,
        intersection;

    if (waypoints) {
      bendpointsGfx = getBendpointsContainer(element, true);
      floating = domQuery('.floating', bendpointsGfx);

      if (!floating) {
        return;
      }

      intersection = getConnectionIntersection(waypoints, event.originalEvent);

      if (intersection) {
        translate(floating, intersection.point.x, intersection.point.y);
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
      addHandles(primary);
    }
  });

  eventBus.on('element.hover', function(event) {
    var element = event.element;

    if (element.waypoints) {
      addHandles(element);
      interactionEvents.registerEvent(event.gfx, 'mousemove', 'element.mousemove');
    }
  });

  eventBus.on('element.out', function(event) {
    interactionEvents.unregisterEvent(event.gfx, 'mousemove', 'element.mousemove');
  });

  // update bendpoint container data attribute on element ID change
  eventBus.on('element.updateId', function(context) {
    var element = context.element,
        newId = context.newId;

    if (element.waypoints) {
      var bendpointContainer = getBendpointsContainer(element);

      if (bendpointContainer) {
        svgAttr(bendpointContainer, { 'data-element-id': newId });
      }
    }
  });

  // API

  this.addHandles = addHandles;
  this.updateHandles = updateHandles;
  this.getBendpointsContainer = getBendpointsContainer;
}

Bendpoints.$inject = [
  'eventBus', 'canvas', 'interactionEvents',
  'bendpointMove', 'connectionSegmentMove'
];

module.exports = Bendpoints;
