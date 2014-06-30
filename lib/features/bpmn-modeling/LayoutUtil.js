'use strict';

var getMidPoint = module.exports.getMidPoint = function(bounds) {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2
  };
};

module.exports.getDirectConnectionPoints = function(boundsA, boundsB) {
  return [
    getMidPoint(boundsA),
    getMidPoint(boundsB)
  ];
};