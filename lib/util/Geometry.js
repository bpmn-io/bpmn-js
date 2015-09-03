'use strict';

/**
 * Computes the distance between two points
 *
 * @param  {Point}  p
 * @param  {Point}  q
 *
 * @return {Number}  distance
 */
var pointDistance = module.exports.pointDistance = function(p, q) {
  return Math.sqrt(Math.pow(q.x - p.x, 2) + Math.pow(q.y - p.y, 2));
};

/**
 * Returns true if the point r is on the line between p and y
 *
 * @param  {Point}  p
 * @param  {Point}  q
 * @param  {Point}  r
 *
 * @return {Boolean}
 */
module.exports.pointsOnLine = function(p, q, r) {

  if (!p || !q || !r) {
    return false;
  }

  var val = (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x),
      dist = pointDistance(p, q);

  // @see http://stackoverflow.com/a/907491/412190
  return Math.abs(val / dist) < 5;
};

/**
 * Returns true if the point p is inside the rectangle rect
 *
 * @param  {Point}  p
 * @param  {Rect}   rect
 * @param  {Number} tolerance
 *
 * @return {Boolean}
 */
module.exports.pointInRect = function(p, rect, tolerance) {
  tolerance = tolerance || 0;

  return p.x > rect.x - tolerance &&
         p.y > rect.y - tolerance &&
         p.x < rect.x + rect.width + tolerance &&
         p.y < rect.y + rect.height + tolerance;
};

/**
 * Returns orientation of a line between two points
 *
 * @param  {Point}  p
 * @param  {Point}  q
 *
 * @return {String} orientation ("horizontal"|"vertical"|"diagonal")
 */
module.exports.getOrientation = function(p, q) {
  var orientation = "diagonal";

  if (p.x === q.x && p.y !== q.y) {
    orientation = "vertical";
  }
  
  if (p.y === q.y && p.x !== q.x) {
    orientation = "horizontal";
  }

  return orientation;
};

/**
 * Returns a point in the middle of points p and q
 *
 * @param  {Point}  p
 * @param  {Point}  q
 *
 * @return {Point} middle point
 */
module.exports.getMidPoint = function(p, q) {
  return {
    x: Math.round(p.x + ((q.x - p.x) / 2.0)),
    y: Math.round(p.y + ((q.y - p.y) / 2.0))
  };
};
