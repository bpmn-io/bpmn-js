'use strict';

var getMid = require('diagram-js/lib/layout/LayoutUtil').getMid;


/**
 * Fix broken dockings after DI imports.
 *
 * @param {EventBus} eventBus
 */
function ImportDockingFix(eventBus) {

  function adjustDocking(startPoint, nextPoint, elementMid) {

    var elementTop = {
      x: elementMid.x,
      y: elementMid.y - 50
    };

    var elementLeft = {
      x: elementMid.x - 50,
      y: elementMid.y
    };

    var verticalIntersect = lineIntersect(startPoint, nextPoint, elementMid, elementTop),
        horizontalIntersect = lineIntersect(startPoint, nextPoint, elementMid, elementLeft);

    // original is horizontal or vertical center cross intersection
    var centerIntersect;

    if (verticalIntersect && horizontalIntersect) {
      if (getDistance(verticalIntersect, elementMid) > getDistance(horizontalIntersect, elementMid)) {
        centerIntersect = horizontalIntersect;
      } else {
        centerIntersect = verticalIntersect;
      }
    } else {
      centerIntersect = verticalIntersect || horizontalIntersect;
    }

    startPoint.original = centerIntersect;
  }

  function fixDockings(connection) {
    var waypoints = connection.waypoints;

    adjustDocking(
      waypoints[0],
      waypoints[1],
      getMid(connection.source)
    );

    adjustDocking(
      waypoints[waypoints.length - 1],
      waypoints[waypoints.length - 2],
      getMid(connection.target)
    );
  }

  eventBus.on('bpmnElement.added', function(e) {

    var element = e.element;

    if (element.waypoints) {
      fixDockings(element);
    }
  });
}

ImportDockingFix.$inject = [ 'eventBus' ];

module.exports = ImportDockingFix;


/////// helpers //////////////////////////////////

function lineIntersect(l1s, l1e, l2s, l2e) {
  // if the lines intersect, the result contains the x and y of the
  // intersection (treating the lines as infinite) and booleans for
  // whether line segment 1 or line segment 2 contain the point
  var denominator, a, b, c, numerator;

  denominator = ((l2e.y - l2s.y) * (l1e.x - l1s.x)) - ((l2e.x - l2s.x) * (l1e.y - l1s.y));

  if (denominator == 0) {
    return null;
  }

  a = l1s.y - l2s.y;
  b = l1s.x - l2s.x;
  numerator = ((l2e.x - l2s.x) * a) - ((l2e.y - l2s.y) * b);

  c = numerator / denominator;

  // if we cast these lines infinitely in
  // both directions, they intersect here
  return {
    x: Math.round(l1s.x + (c * (l1e.x - l1s.x))),
    y: Math.round(l1s.y + (c * (l1e.y - l1s.y)))
  };
}

function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}