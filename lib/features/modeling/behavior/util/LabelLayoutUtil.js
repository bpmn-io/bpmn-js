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


export function findNewLabelLineStartIndex(oldWaypoints, newWaypoints, attachment, hints) {

  var index = attachment.segmentIndex;

  var offset = newWaypoints.length - oldWaypoints.length;

  // segmentMove happend
  if (hints.segmentMove) {

    var oldSegmentStartIndex = hints.segmentMove.segmentStartIndex,
        newSegmentStartIndex = hints.segmentMove.newSegmentStartIndex;

    // if label was on moved segment return new segment index
    if (index === oldSegmentStartIndex) {
      return newSegmentStartIndex;
    }

    // label is after new segment index
    if (index >= newSegmentStartIndex) {
      return (index+offset < newSegmentStartIndex) ? newSegmentStartIndex : index+offset;
    }

    // if label is before new segment index
    return index;
  }

  // bendpointMove happend
  if (hints.bendpointMove) {

    var insert = hints.bendpointMove.insert,
        bendpointIndex = hints.bendpointMove.bendpointIndex,
        newIndex;

    // waypoints length didnt change
    if (offset === 0) {
      return index;
    }

    // label behind new/removed bendpoint
    if (index >= bendpointIndex) {
      newIndex = insert ? index + 1 : index - 1;
    }

    // label before new/removed bendpoint
    if (index < bendpointIndex) {

      newIndex = index;

      // decide label should take right or left segment
      if (insert && attachment.type !== 'bendpoint' && bendpointIndex-1 === index) {

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

  if (hints.connectionStart) {
    return (index === 0) ? 0 : null;
  }

  if (hints.connectionEnd) {
    return (index === oldWaypoints.length - 2) ? newWaypoints.length - 2 : null;
  }

  // if nothing fits, return null
  return null;
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

  var x = 0,
      y = 0;

  var labelPosition = getLabelMid(label);

  // get closest attachment
  var attachment = getAttachment(labelPosition, oldWaypoints),
      oldLabelLineIndex = attachment.segmentIndex,
      newLabelLineIndex = findNewLabelLineStartIndex(oldWaypoints, newWaypoints, attachment, hints);

  if (newLabelLineIndex === null) {
    return { x: x, y: y };
  }

  // should never happen
  // TODO(@janstuemmel): throw an error here when connectionSegmentMove is refactored
  if (newLabelLineIndex < 0 ||
      newLabelLineIndex > newWaypoints.length - 2) {
    return { x: x, y: y };
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

    // bendpoint position hasnt changed, return same position
    if (newWaypoints.indexOf(oldBendpoint) !== -1) {
      return { x: x, y: y };
    }

    // new bendpoint and old bendpoint have same index, then just return the offset
    if (offset === 0) {
      var newBendpoint = newWaypoints[oldBendpointIndex];

      return {
        x: newBendpoint.x - attachment.position.x,
        y: newBendpoint.y - attachment.position.y
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
    x: labelPosition.x - oldFoot.x,
    y: labelPosition.y - oldFoot.y
  }, angleDelta);

  // the new relative position
  x = newFoot.x + newLabelVector.x - labelPosition.x;
  y = newFoot.y + newLabelVector.y - labelPosition.y;

  return roundPoint({
    x: x,
    y: y
  });
}


// HELPERS //////////////////////

function relativePositionMidWaypoint(waypoints, idx) {

  var distanceSegment1 = getDistancePointPoint(waypoints[idx-1], waypoints[idx]),
      distanceSegment2 = getDistancePointPoint(waypoints[idx], waypoints[idx+1]);

  var relativePosition = distanceSegment1 / (distanceSegment1 + distanceSegment2);

  return relativePosition;
}

function getLabelMid(label) {
  return {
    x: label.x + label.width / 2,
    y: label.y + label.height / 2
  };
}

function getAngleDelta(l1, l2) {
  var a1 = getAngle(l1),
      a2 = getAngle(l2);
  return a2 - a1;
}

function getLine(waypoints, idx) {
  return [ waypoints[idx], waypoints[idx+1] ];
}

function getRelativeFootPosition(line, foot) {

  var length = getDistancePointPoint(line[0], line[1]),
      lengthToFoot = getDistancePointPoint(line[0], foot);

  return length === 0 ? 0 : lengthToFoot / length;
}
