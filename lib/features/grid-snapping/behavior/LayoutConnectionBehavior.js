import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { pointsAligned } from 'diagram-js/lib/util/Geometry';

import {
  assign
} from 'min-dash';

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

    if (hints.connectionStart || hints.connectionEnd || hints.createElementsBehavior === false) {
      return;
    }

    if (!hasMiddleSegments(waypoints)) {
      return;
    }

    modeling.updateWaypoints(connection, self.snapMiddleSegments(waypoints));
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
  var gridSnapping = this._gridSnapping,
      snapped;

  waypoints = waypoints.slice();

  for (var i = 1; i < waypoints.length - 2; i++) {

    snapped = snapSegment(gridSnapping, waypoints[i], waypoints[i + 1]);

    waypoints[i] = snapped[0];
    waypoints[i + 1] = snapped[1];
  }

  return waypoints;
};


// helpers //////////

/**
 * Check whether a connection has a middle segments.
 *
 * @param {Array} waypoints
 *
 * @returns {boolean}
 */
function hasMiddleSegments(waypoints) {
  return waypoints.length > 3;
}

/**
 * Check whether an alignment is horizontal.
 *
 * @param {string} aligned
 *
 * @returns {boolean}
 */
function horizontallyAligned(aligned) {
  return aligned === 'h';
}

/**
 * Check whether an alignment is vertical.
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
function snapSegment(gridSnapping, segmentStart, segmentEnd) {

  var aligned = pointsAligned(segmentStart, segmentEnd);

  var snapped = {};

  if (horizontallyAligned(aligned)) {

    // snap horizontally
    snapped.y = gridSnapping.snapValue(segmentStart.y);
  }

  if (verticallyAligned(aligned)) {

    // snap vertically
    snapped.x = gridSnapping.snapValue(segmentStart.x);
  }

  if ('x' in snapped || 'y' in snapped) {
    segmentStart = assign({}, segmentStart, snapped);
    segmentEnd = assign({}, segmentEnd, snapped);
  }

  return [ segmentStart, segmentEnd ];
}