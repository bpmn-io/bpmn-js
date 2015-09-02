'use strict';

var Snap = require('../../vendor/snapsvg');


module.exports.componentsToPath = function(elements) {
  return elements.join(',').replace(/,?([A-z]),?/g, '$1');
};

function toSVGPoints(points) {
  var result = '';

  for (var i = 0, p; !!(p = points[i]); i++) {
    result += p.x + ',' + p.y + ' ';
  }

  return result;
}

module.exports.toSVGPoints = toSVGPoints;

module.exports.createLine = function(points, attrs) {
  return Snap.create('polyline', { points: toSVGPoints(points) }).attr(attrs || {});
};

module.exports.updateLine = function(gfx, points) {
  return gfx.attr({ points: toSVGPoints(points) });
};
