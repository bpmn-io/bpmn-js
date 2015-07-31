'use strict';


var log10 = require('../../util/Math').log10;

/**
 * Get the linear range between two zoom steps based on the
 * total number of zoom steps (defined as NUM_STEPS)
 */
module.exports.getStepRange = function(range, steps) {

  var minLinearRange = log10(range.min),
      maxLinearRange = log10(range.max);

  var absoluteLinearRange = Math.abs(minLinearRange) + Math.abs(maxLinearRange);

  return absoluteLinearRange / steps;
};

module.exports.cap = function(range, scale) {
  return Math.max(range.min, Math.min(range.max, scale));
};
