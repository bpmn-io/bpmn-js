'use strict';

var _ = require('lodash');


/**
 * Returns whether two points are in a horizontal or vertical line.
 *
 * @param {Point} a
 * @param {Point} b
 *
 * @return {String|Boolean} returns false if the points are not
 *                          aligned or 'h|v' if they are aligned
 *                          horizontally / vertically.
 */
module.exports.pointsAligned = function(a, b) {
  switch (true) {
    case a.x === b.x:
      return 'h';
    case a.y === b.y:
      return 'v';
  }

  return false;
};

module.exports.roundPoint = function(point) {

  return {
    x: Math.round(point.x),
    y: Math.round(point.y)
  };
};

module.exports.isPointInRect = function(p, rect, tolerance) {
  tolerance = tolerance || 0;

  return p.x > rect.x - tolerance &&
         p.y > rect.y - tolerance &&
         p.x < rect.x + rect.width + tolerance &&
         p.y < rect.y + rect.height + tolerance;
};

module.exports.pointsEqual = function(a, b) {
  return a.x === b.x && a.y === b.y;
};

module.exports.asTRBL = function(bounds) {
  return {
    top: bounds.y,
    right: bounds.x + (bounds.width || 0),
    bottom: bounds.y + (bounds.height || 0),
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

module.exports.hasAnyOrientation = function(rect, reference, distance, locations) {

  if (_.isArray(distance)) {
    locations = distance;
    distance = 0;
  }

  var orientation = this.getOrientation(rect, reference, distance);

  return locations.indexOf(orientation) !== -1;
};