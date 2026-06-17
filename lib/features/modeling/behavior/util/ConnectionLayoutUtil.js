import { getAnchorPointAdjustment } from './LayoutUtil.js';

/**
 * @typedef {import('diagram-js/lib/util/Types.js').Point} Point
 *
 * @typedef {import('./LayoutUtil.js').FindNewLineStartIndexHints} FindNewLineStartIndexHints
 */

/**
 * Calculate the new point after the connection waypoints got updated.
 *
 * @param {Point} position
 * @param {Point[]} newWaypoints
 * @param {Point[]} oldWaypoints
 * @param {FindNewLineStartIndexHints} hints
 *
 * @return {Point}
 */
export function getConnectionAdjustment(position, newWaypoints, oldWaypoints, hints) {
  return getAnchorPointAdjustment(position, newWaypoints, oldWaypoints, hints).point;
}

