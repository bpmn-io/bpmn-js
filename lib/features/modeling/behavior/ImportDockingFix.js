import {
  getMid
} from 'diagram-js/lib/layout/LayoutUtil';

import lineIntersect from './util/LineIntersect';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 */

/**
 * Fix broken dockings after DI imports.
 *
 * @param {EventBus} eventBus
 */
export default function ImportDockingFix(eventBus) {

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

ImportDockingFix.$inject = [
  'eventBus'
];


// helpers //////////////////////

function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}