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
function pointsAligned(a, b) {
  switch (true) {
    case a.x === b.x:
      return 'h';
    case a.y === b.y:
      return 'v';
  }

  return false;
}

module.exports.pointsAligned = pointsAligned;


function roundPoint(point) {

  return {
    x: Math.round(point.x),
    y: Math.round(point.y)
  };
}

module.exports.roundPoint = roundPoint;


function pointsEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

module.exports.pointsEqual = pointsEqual;


function pointDistance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

module.exports.pointDistance = pointDistance;


function asTRBL(bounds) {
  return {
    top: bounds.y,
    right: bounds.x + (bounds.width || 0),
    bottom: bounds.y + (bounds.height || 0),
    left: bounds.x
  };
}

module.exports.asTRBL = asTRBL;


function getMidPoint(bounds) {
  return roundPoint({
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2
  });
}

module.exports.getMidPoint = getMidPoint;


////// orientation utils //////////////////////////////

function getOrientation(rect, reference, pointDistance) {

  pointDistance = pointDistance || 0;

  var rectOrientation = asTRBL(rect),
      referenceOrientation = asTRBL(reference);

  var top = rectOrientation.bottom + pointDistance <= referenceOrientation.top,
      right = rectOrientation.left - pointDistance >= referenceOrientation.right,
      bottom = rectOrientation.top - pointDistance >= referenceOrientation.bottom,
      left = rectOrientation.right + pointDistance <= referenceOrientation.left;

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
}

module.exports.getOrientation = getOrientation;


function hasAnyOrientation(rect, reference, pointDistance, locations) {

  if (_.isArray(pointDistance)) {
    locations = pointDistance;
    pointDistance = 0;
  }

  var orientation = getOrientation(rect, reference, pointDistance);

  return locations.indexOf(orientation) !== -1;
}

module.exports.hasAnyOrientation = hasAnyOrientation;



////// path utils //////////////////////////////

function getShapePath(gfx, bounds)  {

  var path = toPath(gfx),
      transformMatrix = bounds ? new Snap.Matrix(1, 0, 0, 1, bounds.x, bounds.y) : gfx.attr('transform').localMatrix;

  return Snap.path.map(path, transformMatrix);
}

module.exports.getShapePath = getShapePath;


function getConnectionPath(points) {

  // create a connection path from the connections waypoints
  return _.collect(points, function(p, idx) {
    p = p.original || p;
    return (idx ? 'L' : 'M') + p.x + ' ' + p.y;
  }).join('');
}

module.exports.getConnectionPath = getConnectionPath;


/**
 * Transforms a graphical object into a path representation
 *
 * @param  {SVGElement} gfx
 *
 * @return {Path}       a representation of the object as a path
 */
function toPath(gfx) {
  var visual = gfx.select('.djs-visual *');
  return Snap.path.get[visual.type](visual);
}

module.exports.toPath = toPath;


function getElementLineIntersection(elementPath, linePath, takeFirst) {

  var intersections = getIntersections(elementPath, linePath);

  // recognize intersections
  // only one -> choose
  // two close together -> choose first
  // two or more distinct -> throw
  // none -> ok (fallback to point itself)
  if (intersections.length === 1) {
    return roundPoint(intersections[0]);
  } else if (intersections.length === 2 && pointDistance(intersections[0], intersections[1]) < 1) {
    return roundPoint(intersections[0]);
  } else if (intersections.length > 1) {

    // searching for first intersection
    intersections = _.sortBy(intersections, function(i) {
      return i.segment2;
    });

    return roundPoint(intersections[takeFirst ? 0 : intersections.length - 1]);
  }

  return null;
}

module.exports.getElementLineIntersection = getElementLineIntersection;


function getIntersections(a, b) {
  return Snap.path.intersection(a, b);
}

module.exports.getIntersections = getIntersections;