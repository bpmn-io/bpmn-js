'use strict';

var max = Math.max,
    min = Math.min;


/**
 * Resize the given bounds by the specified delta from a given anchor point.
 *
 * @param {Bounds} bounds the bounding box that should be resized
 * @param {String} direction in which the element is resized (nw, ne, se, sw)
 * @param {Point} delta of the resize operation
 *
 * @return {Bounds} resized bounding box
 */
module.exports.resizeBounds = function(bounds, direction, delta) {

  var dx = delta.x,
      dy = delta.y;

  switch (direction) {

    case 'nw':
      return {
        x: bounds.x + dx,
        y: bounds.y + dy,
        width: bounds.width - dx,
        height: bounds.height - dy
      };

    case 'sw':
      return {
        x: bounds.x + dx,
        y: bounds.y,
        width: bounds.width - dx,
        height: bounds.height + dy
      };

    case 'ne':
      return {
        x: bounds.x,
        y: bounds.y + dy,
        width: bounds.width + dx,
        height: bounds.height - dy
      };

    case 'se':
      return {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width + dx,
        height: bounds.height + dy
      };

    default:
      throw new Error('unrecognized direction: ' + direction);
  }
};

module.exports.reattachPoint = function(bounds, newBounds, point) {

  var sx = bounds.width / newBounds.width,
      sy = bounds.height / newBounds.height;

  return {
    x: Math.round((newBounds.x + newBounds.width / 2)) - Math.floor(((bounds.x + bounds.width / 2) - point.x) / sx),
    y: Math.round((newBounds.y + newBounds.height / 2)) - Math.floor(((bounds.y + bounds.height / 2) - point.y) / sy)
  };
};


module.exports.ensureMinBounds = function(currentBounds, minBounds) {
  var topLeft = {
    x: Math.min(currentBounds.x, minBounds.x),
    y: Math.min(currentBounds.y, minBounds.y)
  };

  var bottomRight = {
    x: Math.max(currentBounds.x + currentBounds.width, minBounds.x + minBounds.width),
    y: Math.max(currentBounds.y + currentBounds.height, minBounds.y + minBounds.height)
  };

  return {
    x: topLeft.x,
    y: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y
  };
};

function toTLBR(bounds) {
  return {
    top: bounds.y,
    left: bounds.x,
    bottom: bounds.y + bounds.height,
    right: bounds.x + bounds.width
  };
}

module.exports.getMinResizeBounds = function(direction, currentBounds, minDimensions, childrenBounds) {

  var currentBox = toTLBR(currentBounds);

  var minBox = {
    top: /n/.test(direction) ? currentBox.bottom - minDimensions.height : currentBox.top,
    left: /w/.test(direction) ? currentBox.right - minDimensions.width : currentBox.left,
    bottom: /s/.test(direction) ? currentBox.top + minDimensions.height : currentBox.bottom,
    right: /e/.test(direction) ? currentBox.left + minDimensions.width : currentBox.right
  };

  var childrenBox = childrenBounds ? toTLBR(childrenBounds) : minBox;

  var combinedBox = {
    top: min(minBox.top, childrenBox.top),
    left: min(minBox.left, childrenBox.left),
    bottom: max(minBox.bottom, childrenBox.bottom),
    right: max(minBox.right, childrenBox.right),
  };

  return {
    x: combinedBox.left,
    y: combinedBox.top,
    width: combinedBox.right - combinedBox.left,
    height: combinedBox.bottom - combinedBox.top
  };
};


