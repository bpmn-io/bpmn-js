'use strict';

var svgAttr = require('tiny-svg/lib/attr'),
    svgCreate = require('tiny-svg/lib/create');


module.exports.componentsToPath = function(elements) {
  return elements.join(',').replace(/,?([A-z]),?/g, '$1');
};

function toSVGPoints(points) {
  var result = '';

  for (var i = 0, p; (p = points[i]); i++) {
    result += p.x + ',' + p.y + ' ';
  }

  return result;
}

module.exports.toSVGPoints = toSVGPoints;

module.exports.createLine = function(points, attrs) {

  var line = svgCreate('polyline');
  svgAttr(line, { points: toSVGPoints(points) });

  if (attrs) {
    svgAttr(line, attrs);
  }

  return line;
};

module.exports.updateLine = function(gfx, points) {
  svgAttr(gfx, { points: toSVGPoints(points) });

  return gfx;
};
