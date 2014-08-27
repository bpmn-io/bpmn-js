'use strict';

module.exports.pointsInLine = function(a, b) {
  return a.x === b.x || a.y === b.y;
};



module.exports.roundPoint = function(point) {

  return {
    x: Math.round(point.x),
    y: Math.round(point.y)
  };
};


module.exports.asTRBL = function(bounds) {
  return {
    top: bounds.y,
    right: bounds.x + bounds.width,
    bottom: bounds.y + bounds.height,
    left: bounds.x
  };
};

module.exports.getMidPoint = function(bounds) {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2
  };
};

module.exports.getOrientation = function(rect, reference, distance) {

  distance = distance || 0;

  var rectOrientation = this.asTRBL(rect),
      referenceOrientation = this.asTRBL(reference);

  var top = rectOrientation.bottom + distance <= referenceOrientation.top,
      right = rectOrientation.left - distance >= referenceOrientation.right,
      bottom = rectOrientation.top - distance >= referenceOrientation.bottom,
      left = rectOrientation.right + distance <= referenceOrientation.left;

  var vertical = top ? 'top' : (bottom ? 'bottom' : null),
      horizontal = left ? 'left' : (right ? 'right' : null);

  if (horizontal && vertical) {
    return vertical + '-' + horizontal;
  } else
  if (horizontal || vertical) {
    return horizontal || vertical;
  } else {
    return 'intersect';
  }
};