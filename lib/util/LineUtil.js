import {
  sortBy
} from 'min-dash';

import {
  getDistancePointPoint
} from 'diagram-js/lib/features/bendpoints/GeometricUtil';

/**
 * @typedef {import('diagram-js/lib/util/Types').Point} Point
 * @typedef {import('diagram-js/lib/util/Types').Rect} Rect
 *
 * @typedef {Point[]} Line
 */

/**
 * Generates the nearest point (reference point) for a given point
 * onto a given set of lines.
 *
 * The reference point is clamped to the actual line segments, i.e. it
 * always lies on one of the given lines (docking to a segment end /
 * bendpoint if necessary) instead of on the infinite line extending a
 * segment.
 *
 * @param {Point} point
 * @param {Line[]} lines
 *
 * @return {Point|undefined}
 */
export function getReferencePoint(point, lines) {

  if (!lines.length) {
    return;
  }

  var nearestLine = getNearestLine(point, lines);

  return getClosestPointOnLine(point, nearestLine);
}

/**
 * Convert the given bounds to a lines array containing all edges.
 *
 * @param {Rect|Point} bounds
 *
 * @return {Line[]}
 */
export function asEdges(bounds) {
  return [
    [ // top
      {
        x: bounds.x,
        y: bounds.y
      },
      {
        x: bounds.x + (bounds.width || 0),
        y: bounds.y
      }
    ],
    [ // right
      {
        x: bounds.x + (bounds.width || 0),
        y: bounds.y
      },
      {
        x: bounds.x + (bounds.width || 0),
        y: bounds.y + (bounds.height || 0)
      }
    ],
    [ // bottom
      {
        x: bounds.x,
        y: bounds.y + (bounds.height || 0)
      },
      {
        x: bounds.x + (bounds.width || 0),
        y: bounds.y + (bounds.height || 0)
      }
    ],
    [ // left
      {
        x: bounds.x,
        y: bounds.y
      },
      {
        x: bounds.x,
        y: bounds.y + (bounds.height || 0)
      }
    ]
  ];
}

/**
 * Returns the nearest line for a given point by the distance to the
 * closest point on each (clamped) line segment.
 *
 * @param {Point} point
 * @param {Line[]} lines
 *
 * @return {Line}
 */
function getNearestLine(point, lines) {

  var distances = lines.map(function(line) {
    return {
      line: line,
      distance: getDistancePointPoint(point, getClosestPointOnLine(point, line))
    };
  });

  var sorted = sortBy(distances, 'distance');

  return sorted[0].line;
}

/**
 * Returns the point on a line segment that is closest to the given point,
 * clamped to the segment's start and end.
 *
 * @param {Point} point
 * @param {Line} line
 *
 * @return {Point}
 */
function getClosestPointOnLine(point, line) {
  var start = line[0],
      end = line[1];

  var dx = end.x - start.x,
      dy = end.y - start.y;

  var lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return { x: start.x, y: start.y };
  }

  var t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared;

  t = Math.max(0, Math.min(1, t));

  return {
    x: start.x + t * dx,
    y: start.y + t * dy
  };
}
