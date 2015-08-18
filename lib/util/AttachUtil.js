'use strict';

function getNewAttachPoint(point, oldBounds, newBounds) {
  var oldCenter = {
    x: oldBounds.x + (oldBounds.width / 2),
    y: oldBounds.y + (oldBounds.height / 2)
  };

  var newCenter = {
    x: newBounds.x + (newBounds.width / 2),
    y: newBounds.y + (newBounds.height / 2)
  };

  var oldDelta = {
    x: point.x - oldCenter.x,
    y: point.y - oldCenter.y
  };

  var newDelta = {
    x: oldDelta.x * (newBounds.width / oldBounds.width),
    y: oldDelta.y * (newBounds.height / oldBounds.height)
  };

  return {
    x: newCenter.x + newDelta.x,
    y: newCenter.y + newDelta.y
  };
}

module.exports.getNewAttachPoint = getNewAttachPoint;
