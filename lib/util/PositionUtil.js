'use strict';

function center(bounds) {
  return {
    x: bounds.x + (bounds.width / 2),
    y: bounds.y + (bounds.height / 2)
  };
}

module.exports.center = center;


function delta(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}

module.exports.delta = delta;
