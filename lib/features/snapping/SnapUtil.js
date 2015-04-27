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