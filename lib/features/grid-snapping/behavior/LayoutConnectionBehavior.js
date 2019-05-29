import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { pointsAligned } from 'diagram-js/lib/util/Geometry';

var HIGH_PRIORITY = 3000;


/**
 * Snaps connections with Manhattan layout.
 */
export default function LayoutConnectionBehavior(eventBus, gridSnapping, modeling) {
  CommandInterceptor.call(this, eventBus);

  this._gridSnapping = gridSnapping;

  var self = this;

  this.postExecuted([
    'connection.create',
    'connection.layout'
  ], HIGH_PRIORITY, function(event) {
    var context = event.context,
        connection = context.connection,
        hints = context.hints || {},
        waypoints = connection.waypoints;

    if (hints.connectionStart || hints.connectionEnd) {
      return;
    }

    if (hasMiddleSegments(waypoints)) {
      modeling.updateProperties(connection, {
        waypoints: self.snapMiddleSegments(waypoints)
      });
    }
  });
}

LayoutConnectionBehavior.$inject = [
  'eventBus',
  'gridSnapping',
  'modeling'
];

inherits(LayoutConnectionBehavior, CommandInterceptor);

/**
 * Snap middle segments of a given connection.
 *
 * @param {Array<Point>} waypoints
 *
 * @returns {Array<Point>}
 */
LayoutConnectionBehavior.prototype.snapMiddleSegments = function(waypoints) {
  var gridSnapping = this._gridSnapping;

  var middleSegments = getMiddleSegments(waypoints);

  middleSegments.forEach(function(middleSegment) {
    var segmentStart = middleSegment.start,
        segmentEnd = middleSegment.end;

    var aligned = pointsAligned(segmentStart, segmentEnd);

    if (horizontallyAligned(aligned)) {

      // snap horizontally
      segmentStart.y = segmentEnd.y = gridSnapping.snapValue(segmentStart.y);
    }

    if (verticallyAligned(aligned)) {

      // snap vertically
      segmentStart.x = segmentEnd.x = gridSnapping.snapValue(segmentStart.x);
    }
  });

  return waypoints;
};



// helpers //////////

/**
 * Check wether a connection has a middle segments.
 *
 * @param {Array} waypoints
 *
 * @returns {boolean}
 */
function hasMiddleSegments(waypoints) {
  return waypoints.length > 3;
}

/**
 * Check wether an alignment is horizontal.
 *
 * @param {string} aligned
 *
 * @returns {boolean}
 */
function horizontallyAligned(aligned) {
  return aligned === 'h';
}

/**
 * Check wether an alignment is vertical.
 *
 * @param {string} aligned
 *
 * @returns {boolean}
 */
function verticallyAligned(aligned) {
  return aligned === 'v';
}

/**
 * Get middle segments from a given connection.
 *
 * @param {Array} waypoints
 *
 * @returns {Array}
 */
function getMiddleSegments(waypoints) {
  var middleSegments = [];

  for (var i = 1; i < waypoints.length - 2; i++) {
    middleSegments.push({
      start: waypoints[i],
      end: waypoints[i + 1]
    });
  }

  return middleSegments;
}
