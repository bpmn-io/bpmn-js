'use strict';

var roundPoint = require('../layout/LayoutUtil').roundPoint;


function center(bounds) {
  return {
    x: bounds.x + (bounds.width / 2),
    y: bounds.y + (bounds.height / 2)
  };
}

function delta(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}

/**
 * Calculates the absolute point relative to the new element's position
 *
 * @param {point} point [absolute]
 * @param {bounds} oldBounds
 * @param {bounds} newBounds
 *
 * @return {point} point [absolute]
 */
function getNewAttachPoint(point, oldBounds, newBounds) {
  var oldCenter = center(oldBounds),
      newCenter = center(newBounds),
      oldDelta = delta(point, oldCenter);

  var newDelta = {
    x: oldDelta.x * (newBounds.width / oldBounds.width),
    y: oldDelta.y * (newBounds.height / oldBounds.height)
  };

  return roundPoint({
    x: newCenter.x + newDelta.x,
    y: newCenter.y + newDelta.y
  });
}

module.exports.getNewAttachPoint = getNewAttachPoint;


/**
 * Calculates the shape's delta relative to a new position
 * of a certain element's bounds
 *
 * @param {djs.model.Shape} point [absolute]
 * @param {bounds} oldBounds
 * @param {bounds} newBounds
 *
 * @return {delta} delta
 */
function getNewAttachShapeDelta(shape, oldBounds, newBounds) {
  var shapeCenter = center(shape),
      oldCenter = center(oldBounds),
      newCenter = center(newBounds),
      shapeDelta = delta(shape, shapeCenter),
      oldCenterDelta = delta(shapeCenter, oldCenter);

  var newCenterDelta = {
    x: oldCenterDelta.x * (newBounds.width / oldBounds.width),
    y: oldCenterDelta.y * (newBounds.height / oldBounds.height)
  };

  var newShapeCenter = {
    x: newCenter.x + newCenterDelta.x,
    y: newCenter.y + newCenterDelta.y
  };

  return roundPoint({
    x: newShapeCenter.x + shapeDelta.x - shape.x,
    y: newShapeCenter.y + shapeDelta.y - shape.y
  });
}

module.exports.getNewAttachShapeDelta = getNewAttachShapeDelta;
