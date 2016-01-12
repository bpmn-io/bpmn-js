'use strict';

/**
 * Get the logarithm of x with base 10
 * @param  {Integer} value
 */
function log10(x) {
  return Math.log(x) / Math.log(10);
}

module.exports.log10 = log10;


function substract(p1, p2) {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y
  };
}

module.exports.substract = substract;
