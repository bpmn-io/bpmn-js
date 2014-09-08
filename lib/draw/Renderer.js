'use strict';

var Snap = require('./Snap');


/**
 * @class Renderer
 *
 * The default renderer used for shapes and connections.
 *
 * @param {Styles} styles
 */
function Renderer(styles) {
  this.CONNECTION_STYLE = styles.style([ 'no-fill' ], { strokeWidth: 5, stroke: 'fuchsia' });
  this.SHAPE_STYLE = styles.style({ fill: 'white', stroke: 'fuchsia', strokeWidth: 2 });
}

module.exports = Renderer;

Renderer.$inject = ['styles'];


Renderer.prototype.drawShape = function drawShape(gfxGroup, data) {
  if (data.width === undefined ||
      data.height === undefined) {

    throw new Error('must specify width and height properties for new shape');
  }

  return gfxGroup.rect(0, 0, data.width, data.height, 10, 10).attr(this.SHAPE_STYLE);
};

Renderer.prototype.drawConnection = function drawConnection(gfxGroup, data) {
  return createLine(data.waypoints, this.CONNECTION_STYLE).appendTo(gfxGroup);
};


function toSVGPoints(points) {
  var result = '';

  for (var i = 0, p; !!(p = points[i]); i++) {
    result += p.x + ',' + p.y + ' ';
  }

  return result;
}

function createLine(points, attrs) {
  return Snap.create('polyline', { points: toSVGPoints(points) }).attr(attrs || {});
}

function updateLine(gfx, points) {
  return gfx.attr({ points: toSVGPoints(points) });
}

module.exports.createLine = createLine;
module.exports.updateLine = updateLine;