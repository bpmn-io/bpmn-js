'use strict';

var assign = require('lodash/object/assign');

var LayoutUtil = require('./LayoutUtil');


function dockingToPoint(docking) {
  // use the dockings actual point and
  // retain the original docking
  return assign({ original: docking.point.original || docking.point }, docking.actual);
}


/**
 * A {@link ConnectionDocking} that crops connection waypoints based on
 * the path(s) of the connection source and target.
 *
 * @param {djs.core.ElementRegistry} elementRegistry
 */
function CroppingConnectionDocking(elementRegistry, graphicsFactory) {
  this._elementRegistry = elementRegistry;
  this._graphicsFactory = graphicsFactory;
}

CroppingConnectionDocking.$inject = [ 'elementRegistry', 'graphicsFactory' ];

module.exports = CroppingConnectionDocking;


/**
 * @inheritDoc ConnectionDocking#getCroppedWaypoints
 */
CroppingConnectionDocking.prototype.getCroppedWaypoints = function(connection, source, target) {

  source = source || connection.source;
  target = target || connection.target;

  var sourceDocking = this.getDockingPoint(connection, source, true),
      targetDocking = this.getDockingPoint(connection, target);

  var croppedWaypoints = connection.waypoints.slice(sourceDocking.idx + 1, targetDocking.idx);

  croppedWaypoints.unshift(dockingToPoint(sourceDocking));
  croppedWaypoints.push(dockingToPoint(targetDocking));

  return croppedWaypoints;
};

/**
 * Return the connection docking point on the specified shape
 *
 * @inheritDoc ConnectionDocking#getDockingPoint
 */
CroppingConnectionDocking.prototype.getDockingPoint = function(connection, shape, dockStart) {

  var waypoints = connection.waypoints,
      dockingIdx,
      dockingPoint,
      croppedPoint;

  dockingIdx = dockStart ? 0 : waypoints.length - 1;
  dockingPoint = waypoints[dockingIdx];

  croppedPoint = this._getIntersection(shape, connection, dockStart);

  return {
    point: dockingPoint,
    actual: croppedPoint || dockingPoint,
    idx: dockingIdx
  };
};


////// helper methods ///////////////////////////////////////////////////

CroppingConnectionDocking.prototype._getIntersection = function(shape, connection, takeFirst) {

  var shapePath = this._getShapePath(shape),
      connectionPath = this._getConnectionPath(connection);

  return LayoutUtil.getElementLineIntersection(shapePath, connectionPath, takeFirst);
};

CroppingConnectionDocking.prototype._getConnectionPath = function(connection) {
  return this._graphicsFactory.getConnectionPath(connection);
};

CroppingConnectionDocking.prototype._getShapePath = function(shape) {
  return this._graphicsFactory.getShapePath(shape);
};

CroppingConnectionDocking.prototype._getGfx = function(element) {
  return this._elementRegistry.getGraphics(element);
};
