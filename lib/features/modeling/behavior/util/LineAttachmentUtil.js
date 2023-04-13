/**
 * @typedef {import('diagram-js/lib/util/Types').Point} Point
 *
 * @typedef { {
*   type: 'bendpoint' | 'segment';
*   position: Point;
*   segmentIndex: number;
*   bendpointIndex?: number;
*   relativeLocation?: number;
* } } Attachment
*/

var sqrt = Math.sqrt,
    min = Math.min,
    max = Math.max,
    abs = Math.abs;

/**
 * Calculate the square (power to two) of a number.
 *
 * @param {number} n
 *
 * @return {number}
 */
function sq(n) {
  return Math.pow(n, 2);
}

/**
 * Get distance between two points.
 *
 * @param {Point} p1
 * @param {Point} p2
 *
 * @return {number}
 */
function getDistance(p1, p2) {
  return sqrt(sq(p1.x - p2.x) + sq(p1.y - p2.y));
}

/**
 * Return the attachment of the given point on the specified line.
 *
 * The attachment is either a bendpoint (attached to the given point)
 * or segment (attached to a location on a line segment) attachment:
 *
 * ```javascript
 * var pointAttachment = {
 *   type: 'bendpoint',
 *   bendpointIndex: 3,
 *   position: { x: 10, y: 10 } // the attach point on the line
 * };
 *
 * var segmentAttachment = {
 *   type: 'segment',
 *   segmentIndex: 2,
 *   relativeLocation: 0.31, // attach point location between 0 (at start) and 1 (at end)
 *   position: { x: 10, y: 10 } // the attach point on the line
 * };
 * ```
 *
 * @param {Point} point
 * @param {Point[]} line
 *
 * @return {Attachment}
 */
export function getAttachment(point, line) {

  var idx = 0,
      segmentStart,
      segmentEnd,
      segmentStartDistance,
      segmentEndDistance,
      attachmentPosition,
      minDistance,
      intersections,
      attachment,
      attachmentDistance,
      closestAttachmentDistance,
      closestAttachment;

  for (idx = 0; idx < line.length - 1; idx++) {

    segmentStart = line[idx];
    segmentEnd = line[idx + 1];

    if (pointsEqual(segmentStart, segmentEnd)) {
      intersections = [ segmentStart ];
    } else {
      segmentStartDistance = getDistance(point, segmentStart);
      segmentEndDistance = getDistance(point, segmentEnd);

      minDistance = min(segmentStartDistance, segmentEndDistance);

      intersections = getCircleSegmentIntersections(segmentStart, segmentEnd, point, minDistance);
    }

    if (intersections.length < 1) {
      throw new Error('expected between [1, 2] circle -> line intersections');
    }

    // one intersection -> bendpoint attachment
    if (intersections.length === 1) {
      attachment = {
        type: 'bendpoint',
        position: intersections[0],
        segmentIndex: idx,
        bendpointIndex: pointsEqual(segmentStart, intersections[0]) ? idx : idx + 1
      };
    }

    // two intersections -> segment attachment
    if (intersections.length === 2) {

      attachmentPosition = mid(intersections[0], intersections[1]);

      attachment = {
        type: 'segment',
        position: attachmentPosition,
        segmentIndex: idx,
        relativeLocation: getDistance(segmentStart, attachmentPosition) / getDistance(segmentStart, segmentEnd)
      };
    }

    attachmentDistance = getDistance(attachment.position, point);

    if (!closestAttachment || closestAttachmentDistance > attachmentDistance) {
      closestAttachment = attachment;
      closestAttachmentDistance = attachmentDistance;
    }
  }

  return closestAttachment;
}

/**
 * Get the intersection between a circle and a line segment.
 *
 * @param {Point} s1 segment start
 * @param {Point} s2 segment end
 * @param {Point} cc circle center
 * @param {number} cr circle radius
 *
 * @return {Point[]} intersections
 */
function getCircleSegmentIntersections(s1, s2, cc, cr) {

  var baX = s2.x - s1.x;
  var baY = s2.y - s1.y;
  var caX = cc.x - s1.x;
  var caY = cc.y - s1.y;

  var a = baX * baX + baY * baY;
  var bBy2 = baX * caX + baY * caY;
  var c = caX * caX + caY * caY - cr * cr;

  var pBy2 = bBy2 / a;
  var q = c / a;

  var disc = pBy2 * pBy2 - q;

  // check against negative value to work around
  // negative, very close to zero results (-4e-15)
  // being produced in some environments
  if (disc < 0 && disc > -0.000001) {
    disc = 0;
  }

  if (disc < 0) {
    return [];
  }

  // if disc == 0 ... dealt with later
  var tmpSqrt = sqrt(disc);
  var abScalingFactor1 = -pBy2 + tmpSqrt;
  var abScalingFactor2 = -pBy2 - tmpSqrt;

  var i1 = {
    x: s1.x - baX * abScalingFactor1,
    y: s1.y - baY * abScalingFactor1
  };

  if (disc === 0) { // abScalingFactor1 == abScalingFactor2
    return [ i1 ];
  }

  var i2 = {
    x: s1.x - baX * abScalingFactor2,
    y: s1.y - baY * abScalingFactor2
  };

  // return only points on line segment
  return [ i1, i2 ].filter(function(p) {
    return isPointInSegment(p, s1, s2);
  });
}


function isPointInSegment(p, segmentStart, segmentEnd) {
  return (
    fenced(p.x, segmentStart.x, segmentEnd.x) &&
    fenced(p.y, segmentStart.y, segmentEnd.y)
  );
}

function fenced(n, rangeStart, rangeEnd) {

  // use matching threshold to work around
  // precision errors in intersection computation

  return (
    n >= min(rangeStart, rangeEnd) - EQUAL_THRESHOLD &&
    n <= max(rangeStart, rangeEnd) + EQUAL_THRESHOLD
  );
}

/**
 * Calculate the mid between two points.
 *
 * @param {Point} p1
 * @param {Point} p2
 *
 * @return {Point}
 */
function mid(p1, p2) {

  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  };
}

var EQUAL_THRESHOLD = 0.1;

function pointsEqual(p1, p2) {

  return (
    abs(p1.x - p2.x) <= EQUAL_THRESHOLD &&
    abs(p1.y - p2.y) <= EQUAL_THRESHOLD
  );
}
