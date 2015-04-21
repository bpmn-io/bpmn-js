'use strict';

var Snap = require('../../vendor/snapsvg');


/**
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
  return gfxGroup.rect(0, 0, data.width || 0, data.height || 0).attr(this.SHAPE_STYLE);
};

Renderer.prototype.drawConnection = function drawConnection(gfxGroup, data) {
  return createLine(data.waypoints, this.CONNECTION_STYLE).appendTo(gfxGroup);
};

function componentsToPath(components) {
  return components.join(',').replace(/,?([A-z]),?/g, '$1');
}

/**
 * Gets the default SVG path of a shape that represents it's visual bounds.
 *
 * @param {djs.model.Shape} shape
 * @return {string} svg path
 */
Renderer.prototype.getShapePath = function getShapePath(shape) {

  var x = shape.x,
      y = shape.y,
      width = shape.width,
      height = shape.height;

  var shapePath = [
    ['M', x, y],
    ['l', width, 0],
    ['l', 0, height],
    ['l', -width, 0],
    ['z']
  ];

  return componentsToPath(shapePath);
};

/**
 * Gets the default SVG path of a connection that represents it's visual bounds.
 *
 * @param {djs.model.Connection} connection
 * @return {string} svg path
 */
Renderer.prototype.getConnectionPath = function getConnectionPath(connection) {
  var waypoints = connection.waypoints;

  var connectionPath = [
    [ 'M', waypoints[0].x, waypoints[0].y ]
  ];

  for (var i = 1; i < waypoints.length; i++) {
    connectionPath.push([ 'L', waypoints[i].x, waypoints[i].y ]);
  }

  return componentsToPath(connectionPath);
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