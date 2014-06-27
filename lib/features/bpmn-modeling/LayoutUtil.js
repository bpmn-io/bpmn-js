'use strict';

var getMidPoint = module.exports.getMidPoint = function(bounds) {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2
  };
};

module.exports.getDirectConnectionPoints = function(boundsA, boundsB) {
  return [
    // workaround until we can compute the extend of an element
    {
      x: boundsA.x + boundsA.width,
      y: boundsA.y + boundsA.height / 2
    },
    {
      x: boundsB.x,
      y: boundsB.y + boundsB.height / 2
    }
  ];
};