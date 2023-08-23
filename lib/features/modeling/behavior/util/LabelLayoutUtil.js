import { findNewLineStartIndex, getAnchorPointAdjustment } from './LayoutUtil';

import { getMid } from 'diagram-js/lib/layout/LayoutUtil';

/**
 * @typedef {import('./LineAttachmentUtil').Attachment} Attachment
 *
 * @typedef {import('./LayoutUtil').FindNewLineStartIndexHints} FindNewLineStartIndexHints
 *
 * @typedef {import('../../../../model/Types').Label} Label
 *
 * @typedef {import('diagram-js/lib/util/Types').Point} Point
 */

/**
 * @param {Point[]} oldWaypoints
 * @param {Point[]} newWaypoints
 * @param {Attachment} attachment
 * @param {FindNewLineStartIndexHints} hints
 *
 * @return {number}
 */
export function findNewLabelLineStartIndex(oldWaypoints, newWaypoints, attachment, hints) {
  return findNewLineStartIndex(oldWaypoints, newWaypoints, attachment, hints);
}

/**
 * Calculate the required adjustment (move delta) for the given label
 * after the connection waypoints got updated.
 *
 * @param {Label} label
 * @param {Point[]} newWaypoints
 * @param {Point[]} oldWaypoints
 * @param {FindNewLineStartIndexHints} hints
 *
 * @return {Point}
 */
export function getLabelAdjustment(label, newWaypoints, oldWaypoints, hints) {
  var labelPosition = getMid(label);

  return getAnchorPointAdjustment(labelPosition, newWaypoints, oldWaypoints, hints).delta;
}