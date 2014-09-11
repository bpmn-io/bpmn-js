'use strict';

var _ = require('lodash');

var Snap = require('snapsvg');

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

module.exports.distance = function(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
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


////// orientation utils //////////////////////////////

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



////// path utils //////////////////////////////

module.exports.getShapePath = function(gfx, bounds)  {

  var path = this.toPath(gfx),
      transformMatrix = bounds ? new Snap.Matrix(1, 0, 0, 1, bounds.x, bounds.y) : gfx.attr('transform').localMatrix;

  return Snap.path.map(path, transformMatrix);
};

module.exports.getConnectionPath = function(points) {

  // create a connection path from the connections waypoints
  return _.collect(points, function(p, idx) {
    return (idx ? 'L' : 'M') + p.x + ' ' + p.y;
  }).join('');
};

/**
 * Transforms a graphical object into a path representation
 *
 * @param  {SVGElement} gfx
 *
 * @return {Path}       a representation of the object as a path
 */
module.exports.toPath = function(gfx) {
  var visual = gfx.select('.djs-visual *');
  return Snap.path.get[visual.type](visual);
};

module.exports.getElementLineIntersection = function(elementPath, linePath, takeFirst) {

  var intersections = this.getIntersections(elementPath, linePath);

  // recognize intersections
  // only one -> choose
  // two close together -> choose first
  // two or more distinct -> throw
  // none -> ok (fallback to point itself)
  if (intersections.length === 1) {
    return this.roundPoint(intersections[0]);
  } else if (intersections.length === 2 && this.distance(intersections[0], intersections[1]) < 1) {
    return this.roundPoint(intersections[0]);
  } else if (intersections.length > 1) {

    // searching for first intersection
    intersections = _.sortBy(intersections, function(i) {
      return i.segment2;
    });

    return this.roundPoint(intersections[takeFirst ? 0 : intersections.length - 1]);
  }

  return null;
};

module.exports.getIntersections = function(a, b) {
  return Snap.path.intersection(a, b);
};