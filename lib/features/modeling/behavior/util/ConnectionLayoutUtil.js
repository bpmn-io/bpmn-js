import { getAnchorPointAdjustment } from './LayoutUtil';

/**
 * Calculate the new point after the connection waypoints got updated.
 *
 * @param {djs.model.Label} label
 * @param {Array<Point>} newWaypoints
 * @param {Array<Point>} oldWaypoints
 * @param {Object} hints
 *
 * @return {Point} point
 */
export function getConnectionAdjustment(position, newWaypoints, oldWaypoints, hints) {
  return getAnchorPointAdjustment(position, newWaypoints, oldWaypoints, hints).point;
}

