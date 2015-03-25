'use strict';

function getDirection(axis, offset) {
  /* TODO (Ricardo): Another possible implementation
  var direction = {
    n: axis === 'y' && offset < 0
  };
  */

  if(axis === 'x') {
    if(offset > 0) {
      return 'e';
    }
    if(offset < 0) {
      return 'w';
    }
  }
  if(axis === 'y') {
    if(offset > 0) {
      return 's';
    }
    if(offset < 0) {
      return 'n';
    }
  }
}

/**
 * Resize the given bounds by the specified delta from a given anchor point.
 *
 * @param {Bounds} bounds the bounding box that should be resized
 * @param {String} direction in which the element is resized (n, s, e, w)
 * @param {Point} delta of the resize operation
 *
 * @return {Bounds} resized bounding box
 */
module.exports.resizeBounds = function(bounds, axis, delta) {

  var dx = delta.x,
      dy = delta.y,
      offset = delta[ axis ];

  var direction = getDirection(axis, offset);

  switch (direction) {

    case 'n':
      return {
        x: bounds.x,
        y: bounds.y + dy,
        width: bounds.width,
        height: bounds.height + Math.abs(dy)
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
        width: bounds.width + Math.abs(dx),
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


module.exports.resizeBoundsModifier = function(bounds, axis, delta) {

  var dx = delta.x,
      dy = delta.y,
      offset = delta[ axis ];

  var direction = getDirection(axis, offset);

  switch (direction) {

    case 'n':
      return {
        x: bounds.x,
        y: bounds.y + dy,
        width: bounds.width,
        height: bounds.height + dy
      };

    case 's':
      return {
        x: bounds.x,
        y: bounds.y + Math.abs(dy),
        width: bounds.width,
        height: bounds.height - dy
      };

    case 'w':
      return {
        x: bounds.x + dx,
        y: bounds.y,
        width: bounds.width + dx,
        height: bounds.height
      };

    case 'e':
      return {
        x: bounds.x + Math.abs(dx),
        y: bounds.y,
        width: bounds.width - dx,
        height: bounds.height
      };

    default:
      throw new Error('unrecognized direction: ' + direction);
  }
};

