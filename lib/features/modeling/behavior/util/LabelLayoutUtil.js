import { findNewLineStartIndex, getAnchorPointAdjustment } from './LayoutUtil';

export function findNewLabelLineStartIndex(oldWaypoints, newWaypoints, attachment, hints) {
  return findNewLineStartIndex(oldWaypoints, newWaypoints, attachment, hints);
}


/**
 * Calculate the required adjustment (move delta) for the given label
 * after the connection waypoints got updated.
 *
 * @param {djs.model.Label} label
 * @param {Array<Point>} newWaypoints
 * @param {Array<Point>} oldWaypoints
 * @param {Object} hints
 *
 * @return {Point} delta
 */
export function getLabelAdjustment(label, newWaypoints, oldWaypoints, hints) {
  var labelPosition = getLabelMid(label);

  return getAnchorPointAdjustment(labelPosition, newWaypoints, oldWaypoints, hints).delta;
}


// HELPERS //////////////////////

function getLabelMid(label) {
  return {
    x: label.x + label.width / 2,
    y: label.y + label.height / 2
  };
}
