'use strict';

var LayoutUtil = require('./Util');

var MIN_DISTANCE = 20;


var roundPoint = LayoutUtil.roundPoint;


/**
 * Returns the mid points for a manhattan connection between two points.
 *
 * @example
 *
 * [a]----[x]
 *         |
 *        [x]--->[b]
 *
 * @param  {Point} a
 * @param  {Point} b
 * @param  {String} directions
 *
 * @return {Array<Point>}
 */
module.exports.getMidPoints = function(a, b, directions) {

  directions = directions || 'h:h';

  var xmid, ymid;

  // one point, next to a
  if (directions === 'h:v') {
    return [ { x: b.x, y: a.y } ];
  } else
  // one point, above a
  if (directions === 'v:h') {
    return [ { x: a.x, y: b.y } ];
  } else
  // vertical edge xmid
  if (directions === 'h:h') {
    xmid = Math.round((b.x - a.x) / 2 + a.x);

    return [
      { x: xmid, y: a.y },
      { x: xmid, y: b.y }
    ];
  } else
  // horizontal edge ymid
  if (directions === 'v:v') {
    ymid = Math.round((b.y - a.y) / 2 + a.y);

    return [
      { x: a.x, y: ymid },
      { x: b.x, y: ymid }
    ];
  } else {
    throw new Error(
      'unknown directions: <' + directions + '>: ' +
      'directions must be specified as {a direction}:{b direction} (direction in h|v)');
  }
};


/**
 * Create a connection between the two points according
 * to the manhattan layout (only horizontal and vertical) edges.
 *
 * @param {Point} a
 * @param {Point} b
 *
 * @param {String} [directions='h:h'] specifies manhattan directions for each point as {adirection}:{bdirection}.
                   A directionfor a point is either `h` (horizontal) or `v` (vertical)
 *
 * @return {Array<Point>}
 */
module.exports.connectPoints = function(a, b, directions) {

  var points = [];

  if (!LayoutUtil.pointsInLine(a, b)) {
    points = this.getMidPoints(a, b, directions);
  }

  points.unshift(a);
  points.push(b);

  return points;
};


/**
 * Connect two rect angles using a manhattan layouted connection.
 *
 * @param {Bounds} source source rectangle
 * @param {Bounds} target target rectangle
 * @param {Point} start source docking
 * @param {Point} end target docking
 *
 * @return {Array<Point>} connection points
 */
module.exports.connectRectangles = function(source, target, start, end) {

  var orientation = LayoutUtil.getOrientation(source, target, MIN_DISTANCE);

  var directions = this.getDirections(source, target);

  start = start || LayoutUtil.getMidPoint(source);
  end = end || LayoutUtil.getMidPoint(target);

  // overlapping elements
  if (!directions) {
    return;
  }

  if (directions === 'h:h') {

    switch (orientation) {
      case 'top-right':
      case 'right':
      case 'bottom-right':
        start = { original: start, x: source.x, y: start.y };
        end = { original: end, x: target.x + target.width, y: end.y };
        break;
      case 'top-left':
      case 'left':
      case 'bottom-left':
        start = { original: start, x: source.x + source.width, y: start.y };
        end = { original: end, x: target.x, y: end.y };
        break;
    }
  }

  if (directions === 'v:v') {

    switch (orientation) {
      case 'top-left':
      case 'top':
      case 'top-right':
        start = { original: start, x: start.x, y: source.y + source.height };
        end = { original: end, x: end.x, y: target.y };
        break;
      case 'bottom-left':
      case 'bottom':
      case 'bottom-right':
        start = { original: start, x: start.x, y: source.y };
        end = { original: end, x: end.x, y: target.y + target.height };
        break;
    }
  }

  return this.connectPoints(start, end, directions);
};


/**
 * Returns the default manhattan directions connecting two rectangles.
 *
 * @param {Bounds} source
 * @param {Bounds} target
 * @param {Boolean} preferVertical
 *
 * @return {String}
 */
module.exports.getDirections = function(source, target, preferVertical) {
  var orientation = LayoutUtil.getOrientation(source, target, MIN_DISTANCE);

  switch (orientation) {
    case 'intersect':
      return null;

    case 'top':
    case 'bottom':
      return 'v:v';
    case 'left':
    case 'right':
      return 'h:h';
    default:
      return preferVertical ? 'v:v' : 'h:h';
  }
};