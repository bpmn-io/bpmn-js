'use strict';

var abs = Math.abs,
    round = Math.round;


/**
 * Snap value to a collection of reference values.
 *
 * @param  {Number} value
 * @param  {Array<Number>} values
 * @param  {Number} [tolerance=10]
 *
 * @return {Number} the value we snapped to or null, if none snapped
 */
function snapTo(value, values, tolerance) {
  tolerance = tolerance === undefined ? 10 : tolerance;

  var idx, snapValue;

  for (idx = 0; idx < values.length; idx++) {
    snapValue = values[idx];

    if (abs(snapValue - value) <= tolerance) {
      return snapValue;
    }
  }
}

module.exports.snapTo = snapTo;


function topLeft(bounds) {
  return {
    x: bounds.x,
    y: bounds.y
  };
}

module.exports.topLeft = topLeft;


function mid(bounds, defaultValue) {

  if (!bounds || isNaN(bounds.x) || isNaN(bounds.y)) {
    return defaultValue;
  }

  return {
    x: round(bounds.x + bounds.width / 2),
    y: round(bounds.y + bounds.height / 2)
  };
}

module.exports.mid = mid;


function bottomRight(bounds) {
  return {
    x: bounds.x + bounds.width,
    y: bounds.y + bounds.height
  };
}

module.exports.bottomRight = bottomRight;


function calcSnapEdges(bounds, shape, shapeMid) {
  var shapeBounds,
      shapeTopLeft,
      shapeBottomRight;

  shapeMid = mid(shape, bounds);

  shapeBounds = {
    width: shape.width,
    height: shape.height,
    x: isNaN(shape.x) ? round(shapeMid.x - shape.width / 2) : shape.x,
    y: isNaN(shape.y) ? round(shapeMid.y - shape.height / 2) : shape.y,
  };

  shapeTopLeft = topLeft(shapeBounds);
  shapeBottomRight = bottomRight(shapeBounds);

  return {
    'top-left': {
        x: shapeTopLeft.x - bounds.x,
        y: shapeTopLeft.y - bounds.y
    },
    'bottom-right': {
        x: shapeBottomRight.x - bounds.x,
        y: shapeBottomRight.y - bounds.y
    }
  };
}

module.exports.calcSnapEdges = calcSnapEdges;


function isInbetween(int, tolerance) {
  return int < 1 - tolerance && int > tolerance;
}

module.exports.isInbetween = isInbetween;


function relativePosition(bounds, target) {
  var sizeX = target.x + target.width,
      sizeY = target.y + target.height;

  return {
    vertical: (sizeY - bounds.y) / (sizeY - target.y),
    horizontal:(sizeX - bounds.x) / (sizeX - target.x)
  };
}

module.exports.relativePosition = relativePosition;


function isGreater(a, b) {
  return a > b;
}

function closestEdge(bounds, target) {
  var isTopOrBottom = {},
      isLeftOrRight = {};

  var position = relativePosition(bounds, target);

  var verticalRelative = isGreater(position.vertical, 0.5);

  var horizontalRelative = isGreater(position.horizontal, 0.5);

  isTopOrBottom.edge = verticalRelative ? 'top' : 'bottom';

  isLeftOrRight.edge = horizontalRelative ? 'left' : 'right';

  isTopOrBottom.val = verticalRelative ? (1 - position.vertical) : position.vertical;

  isLeftOrRight.val = horizontalRelative ? (1 - position.horizontal) : position.horizontal;

  return isTopOrBottom.val <= isLeftOrRight.val ? isTopOrBottom.edge : isLeftOrRight.edge;
}

module.exports.closestEdge = closestEdge;


function isOutside(bounds, target, tolerance) {
  var position = relativePosition(bounds, target);

  return isInbetween(position.vertical, tolerance) && isInbetween(position.horizontal, tolerance);
}

module.exports.isOutside = isOutside;
