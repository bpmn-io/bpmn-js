import { getAnchorPointAdjustment } from './LayoutUtil';

/**
 * @typedef {import('diagram-js/lib/util/Types').Point} Point
 */

/**
 * Calculate the new point after the connection waypoints got updated.
 *
 * @param {Point} position
 * @param {Point[]} newWaypoints
 * @param {Point[]} oldWaypoints
 * @param {Object} hints
 *
 * @return {Point}
 */
export function getConnectionAdjustment(position, newWaypoints, oldWaypoints, hints) {
  return getAnchorPointAdjustment(position, newWaypoints, oldWaypoints, hints).point;
}

