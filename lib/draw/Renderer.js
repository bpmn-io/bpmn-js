'use strict';

// required components

function flattenPoints(points) {
  var result = [];

  for (var i = 0, p; !!(p = points[i]); i++) {
    result.push(p.x);
    result.push(p.y);
  }

  return result;
}


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

Renderer.prototype.drawShape = function drawShape(gfxGroup, data) {
  if (data.width === undefined ||
      data.height === undefined) {

    throw new Error('must specify width and height properties for new shape');
  }

  return gfxGroup.rect(0, 0, data.width, data.height, 10, 10).attr(this.SHAPE_STYLE);
};

Renderer.prototype.drawConnection = function drawConnection(gfxGroup, data) {
  var points = flattenPoints(data.waypoints);
  return gfxGroup.polyline(points).attr(this.CONNECTION_STYLE);
};


Renderer.$inject = ['styles'];


module.exports = Renderer;
module.exports.flattenPoints = flattenPoints;