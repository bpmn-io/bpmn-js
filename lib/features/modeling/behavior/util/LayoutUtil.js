import {
  getDistancePointPoint,
  rotateVector,
  getAngle
} from './GeometricUtil';

import {
  getAttachment
} from './LineAttachmentUtil';

import {
  roundPoint
} from 'diagram-js/lib/layout/LayoutUtil';

/**
 * @typedef {import('diagram-js/lib/util/Types').Point} Point
 *
 * @typedef {import('./LineAttachmentUtil').Attachment} Attachment
 *
 * @typedef { {
 *   point: Point;
 *   delta: Point;
 * } } AnchorPointAdjustment
 *
 * @typedef { {
 *   segmentMove?: {
*     segmentStartIndex: number;
*     newSegmentStartIndex: number;
*   };
*   bendpointMove?: {
*     insert: boolean;
*     bendpointIndex: number;
*   };
*   connectionStart: boolean;
*   connectionEnd: boolean;
* } } FindNewLineStartIndexHints
 */

/**
 * @param {Point[]} oldWaypoints
 * @param {Point[]} newWaypoints
 * @param {Attachment} attachment
 * @param {FindNewLineStartIndexHints} hints
 *
 * @return {number}
 */
export function findNewLineStartIndex(oldWaypoints, newWaypoints, attachment, hints) {

  var index = attachment.segmentIndex;

  var offset = newWaypoints.length - oldWaypoints.length;

  // segmentMove happened
  if (hints.segmentMove) {

    var oldSegmentStartIndex = hints.segmentMove.segmentStartIndex,
        newSegmentStartIndex = hints.segmentMove.newSegmentStartIndex;

    // if point was on moved segment return new segment index
    if (index === oldSegmentStartIndex) {
      return newSegmentStartIndex;
    }

    // point is after new segment index
    if (index >= newSegmentStartIndex) {
      return (index + offset < newSegmentStartIndex) ? newSegmentStartIndex : index + offset;
    }

    // if point is before new segment index
    return index;
  }

  // bendpointMove happened
  if (hints.bendpointMove) {

    var insert = hints.bendpointMove.insert,
        bendpointIndex = hints.bendpointMove.bendpointIndex,
        newIndex;

    // waypoints length didnt change
    if (offset === 0) {
      return index;
    }

    // point behind new/removed bendpoint
    if (index >= bendpointIndex) {
      newIndex = insert ? index + 1 : index - 1;
    }

    // point before new/removed bendpoint
    if (index < bendpointIndex) {

      newIndex = index;

      // decide point should take right or left segment
      if (insert && attachment.type !== 'bendpoint' && bendpointIndex - 1 === index) {

        var rel = relativePositionMidWaypoint(newWaypoints, bendpointIndex);

        if (rel < attachment.relativeLocation) {
          newIndex++;
        }
      }
    }

    return newIndex;
  }

  // start/end changed
  if (offset === 0) {
    return index;
  }

  if (hints.connectionStart && index === 0) {
    return 0;
  }

  if (hints.connectionEnd && index === oldWaypoints.length - 2) {
    return newWaypoints.length - 2;
  }

  // if nothing fits, take the middle segment
  return Math.floor((newWaypoints.length - 2) / 2);
}


/**
 * Calculate the required adjustment (move delta) for the given point
 * after the connection waypoints got updated.
 *
 * @param {Point} position
 * @param {Point[]} newWaypoints
 * @param {Point[]} oldWaypoints
 * @param {FindNewLineStartIndexHints} hints
 *
 * @return {AnchorPointAdjustment} result
 */
export function getAnchorPointAdjustment(position, newWaypoints, oldWaypoints, hints) {

  var dx = 0,
      dy = 0;

  var oldPosition = {
    point: position,
    delta: { x: 0, y: 0 }
  };

  // get closest attachment
  var attachment = getAttachment(position, oldWaypoints),
      oldLabelLineIndex = attachment.segmentIndex,
      newLabelLineIndex = findNewLineStartIndex(oldWaypoints, newWaypoints, attachment, hints);


  // should never happen
  // TODO(@janstuemmel): throw an error here when connectionSegmentMove is refactored
  if (newLabelLineIndex < 0 ||
      newLabelLineIndex > newWaypoints.length - 2 ||
      newLabelLineIndex === null) {
    return oldPosition;
  }

  var oldLabelLine = getLine(oldWaypoints, oldLabelLineIndex),
      newLabelLine = getLine(newWaypoints, newLabelLineIndex),
      oldFoot = attachment.position;

  var relativeFootPosition = getRelativeFootPosition(oldLabelLine, oldFoot),
      angleDelta = getAngleDelta(oldLabelLine, newLabelLine);

  // special rule if label on bendpoint
  if (attachment.type === 'bendpoint') {

    var offset = newWaypoints.length - oldWaypoints.length,
        oldBendpointIndex = attachment.bendpointIndex,
        oldBendpoint = oldWaypoints[oldBendpointIndex];

    // bendpoint position hasn't changed, return same position
    if (newWaypoints.indexOf(oldBendpoint) !== -1) {
      return oldPosition;
    }

    // new bendpoint and old bendpoint have same index, then just return the offset
    if (offset === 0) {
      var newBendpoint = newWaypoints[oldBendpointIndex];

      dx = newBendpoint.x - attachment.position.x,
      dy = newBendpoint.y - attachment.position.y;

      return {
        delta: {
          x: dx,
          y: dy
        },
        point: {
          x: position.x + dx,
          y: position.y + dy
        }
      };
    }

    // if bendpoints get removed
    if (offset < 0 && oldBendpointIndex !== 0 && oldBendpointIndex < oldWaypoints.length - 1) {
      relativeFootPosition = relativePositionMidWaypoint(oldWaypoints, oldBendpointIndex);
    }
  }

  var newFoot = {
    x: (newLabelLine[1].x - newLabelLine[0].x) * relativeFootPosition + newLabelLine[0].x,
    y: (newLabelLine[1].y - newLabelLine[0].y) * relativeFootPosition + newLabelLine[0].y
  };

  // the rotated vector to label
  var newLabelVector = rotateVector({
    x: position.x - oldFoot.x,
    y: position.y - oldFoot.y
  }, angleDelta);

  // the new relative position
  dx = newFoot.x + newLabelVector.x - position.x;
  dy = newFoot.y + newLabelVector.y - position.y;

  return {
    point: roundPoint(newFoot),
    delta: roundPoint({
      x: dx,
      y: dy
    })
  };
}


// HELPERS //////////////////////

function relativePositionMidWaypoint(waypoints, idx) {

  var distanceSegment1 = getDistancePointPoint(waypoints[idx - 1], waypoints[idx]),
      distanceSegment2 = getDistancePointPoint(waypoints[idx], waypoints[idx + 1]);

  var relativePosition = distanceSegment1 / (distanceSegment1 + distanceSegment2);

  return relativePosition;
}

function getAngleDelta(l1, l2) {
  var a1 = getAngle(l1),
      a2 = getAngle(l2);
  return a2 - a1;
}

function getLine(waypoints, idx) {
  return [ waypoints[idx], waypoints[idx + 1] ];
}

function getRelativeFootPosition(line, foot) {

  var length = getDistancePointPoint(line[0], line[1]),
      lengthToFoot = getDistancePointPoint(line[0], foot);

  return length === 0 ? 0 : lengthToFoot / length;
}
