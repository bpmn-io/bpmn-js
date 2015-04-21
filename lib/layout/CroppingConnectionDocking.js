'use strict';

var assign = require('lodash/object/assign');

var LayoutUtil = require('./LayoutUtil');


function toPoint(docking) {
  return assign({ original: docking.point.original || docking.point }, docking.actual);
}


/**
 * A {@link ConnectionDocking} that crops connection waypoints based on
 * the path(s) of the connection source and target.
 *
 * @param {djs.core.ElementRegistry} elementRegistry
 */
function CroppingConnectionDocking(elementRegistry, renderer) {
  this._elementRegistry = elementRegistry;
  this._renderer = renderer;
}

CroppingConnectionDocking.$inject = [ 'elementRegistry', 'renderer' ];

module.exports = CroppingConnectionDocking;


/**
 * @inheritDoc ConnectionDocking#getCroppedWaypoints
 */
CroppingConnectionDocking.prototype.getCroppedWaypoints = function(connection) {

  var sourceDocking = this.getDockingPoint(connection, connection.source),
      targetDocking = this.getDockingPoint(connection, connection.target);

  var waypoints = connection.waypoints.slice(sourceDocking.idx + 1, targetDocking.idx);

  waypoints.unshift(toPoint(sourceDocking));
  waypoints.push(toPoint(targetDocking));

  return waypoints;
};

/**
 * Return the connection docking point on the specified shape
 *
 * @inheritDoc ConnectionDocking#getDockingPoint
 */
CroppingConnectionDocking.prototype.getDockingPoint = function(connection, shape) {

  var point, idx = -1,
      dockingPoint = this._getIntersection(shape, connection);

  if (shape === connection.target) {
    idx = connection.waypoints.length - 1;
  } else if (shape === connection.source) {
    idx = 0;
  } else {
    throw new Error('connection not properly connected');
  }

  if (idx !== -1) {
    point = connection.waypoints[idx];

    return {
      point: point,
      actual: dockingPoint || point,
      idx: idx
    };
  }

  return null;
};


////// helper methods ///////////////////////////////////////////////////

CroppingConnectionDocking.prototype._getIntersection = function(shape, connection) {

  var shapePath = this._getShapePath(shape),
      connectionPath = this._getConnectionPath(connection);

  return LayoutUtil.getElementLineIntersection(shapePath, connectionPath, connection.source === shape);
};

CroppingConnectionDocking.prototype._getConnectionPath = function(connection) {
  return this._renderer.getConnectionPath(connection);
};

CroppingConnectionDocking.prototype._getShapePath = function(shape) {
  return this._renderer.getShapePath(shape);
};

CroppingConnectionDocking.prototype._getGfx = function(element) {
  return this._elementRegistry.getGraphics(element);
};