'use strict';

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


module.exports.getMinResizeBounds = function(direction, currentBounds, minDimensions) {
  
  switch(direction) {
    case 'nw':
      return {
        x: currentBounds.x + currentBounds.width - minDimensions.width,
        y: currentBounds.y + currentBounds.height - minDimensions.height,
        width: minDimensions.width,
        height: minDimensions.height
      };
    case 'sw':
      return {
        x: currentBounds.x + currentBounds.width - minDimensions.width,
        y: currentBounds.y,
        width: minDimensions.width,
        height: minDimensions.height
      };
    case 'ne':
      return {
        x: currentBounds.x,
        y: currentBounds.y + currentBounds.height - minDimensions.height,
        width: minDimensions.width,
        height: minDimensions.height
      };
    case 'se':
      return {
        x: currentBounds.x,
        y: currentBounds.y,
        width: minDimensions.width,
        height: minDimensions.height
      };
    default:
      throw new Error('unrecognized direction: ' + direction);
  }
};


