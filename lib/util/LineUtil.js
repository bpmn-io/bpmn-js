import {
  sortBy
} from 'min-dash';

import {
  getDistancePointLine,
  perpendicularFoot
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
 * @param {Point} point
 * @param {Line[]} lines
 *
 * @return {Point}
 */
export function getReferencePoint(point, lines) {

  if (!lines.length) {
    return;
  }

  var nearestLine = getNearestLine(point, lines);

  return perpendicularFoot(point, nearestLine);
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
 * Returns the nearest line for a given point by distance.
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
      distance: getDistancePointLine(point, line)
    };
  });

  var sorted = sortBy(distances, 'distance');

  return sorted[0].line;
}
