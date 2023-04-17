import { getOrientation } from 'diagram-js/lib/layout/LayoutUtil';

/**
 * @typedef {import('diagram-js/lib/util/Types').DirectionTRBL} DirectionTRBL
 * @typedef {import('diagram-js/lib/util/Types').Point} Point
 * @typedef {import('diagram-js/lib/util/Types').Rect} Rect
 */

/**
 * @param {Point} position
 * @param {Rect} targetBounds
 *
 * @return {DirectionTRBL|null}
 */
export function getBoundaryAttachment(position, targetBounds) {

  var orientation = getOrientation(position, targetBounds, -15);

  if (orientation !== 'intersect') {
    return orientation;
  } else {
    return null;
  }
}