'use strict';

/**
 * Get Resize direction given axis + offset
 *
 * @param {String} axis (x|y)
 * @param {Number} offset
 *
 * @return {String} (e|w|n|s)
 */
function getDirection(axis, offset) {

  if (axis === 'x') {
    if (offset > 0) {
      return 'e';
    }

    if (offset < 0) {
      return 'w';
    }
  }

  if (axis === 'y') {
    if (offset > 0) {
      return 's';
    }

    if (offset < 0) {
      return 'n';
    }
  }

  return null;
}

module.exports.getDirection = getDirection;

/**
 * Resize the given bounds by the specified delta from a given anchor point.
 *
 * @param {Bounds} bounds the bounding box that should be resized
 * @param {String} direction in which the element is resized (n, s, e, w)
 * @param {Point} delta of the resize operation
 *
 * @return {Bounds} resized bounding box
 */
module.exports.resizeBounds = function(bounds, direction, delta) {

  var dx = delta.x,
      dy = delta.y;

  switch (direction) {

    case 'n':
      return {
        x: bounds.x,
        y: bounds.y + dy,
        width: bounds.width,
        height: bounds.height - dy
      };

    case 's':
      return {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height + dy
      };

    case 'w':
      return {
        x: bounds.x + dx,
        y: bounds.y,
        width: bounds.width - dx,
        height: bounds.height
      };

    case 'e':
      return {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width + dx,
        height: bounds.height
      };

    default:
      throw new Error('unrecognized direction: ' + direction);
  }
};