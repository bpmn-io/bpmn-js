'use strict';

var Snap = require('snapsvg');

var _ = require('lodash');

var LayoutUtil = require('./Util');

/**
 * @memberOf djs.layout
 */


function toPoint(docking) {
  return _.extend({ original: docking.point.original || docking.point }, docking.actual);
}

function distance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

/**
 * A {@link ConnectionDocking} that crops connection waypoints based on
 * the path(s) of the connection source and target.
 *
 * @class
 * @constructor
 *
 * @param {djs.core.ElementRegistry} elementRegistry
 */
function CroppingConnectionDocking(elementRegistry) {
  this._elementRegistry = elementRegistry;
}

CroppingConnectionDocking.$inject = [ 'elementRegistry' ];

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

  var dockingPoint, point, idx = -1;

  var intersections = this._getIntersections(shape, connection);

  // recognize intersections
  // only one -> choose
  // two close together -> choose first
  // two or more distinct -> throw
  // none -> ok (fallback to point itself)
  if (intersections.length === 1) {
    dockingPoint = LayoutUtil.roundPoint(intersections[0]);
  } else if (intersections.length === 2 && distance(intersections[0], intersections[1]) < 1) {
    dockingPoint = LayoutUtil.roundPoint(intersections[0]);
  } else if (intersections.length > 1) {

    // searching for first intersection
    intersections = _.sortBy(intersections, function(i) {
      return i.segment2;
    });

    dockingPoint = LayoutUtil.roundPoint(intersections[connection.target === shape ? intersections.length - 1 : 0]);
  }

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

CroppingConnectionDocking.prototype._getIntersections = function(shape, connection) {
  var shapePath = this._getShapePath(shape);
  var connectionPath = this._getConnectionPath(connection);

  return Snap.path.intersection(shapePath, connectionPath);
};

CroppingConnectionDocking.prototype._getConnectionPath = function(connection) {

  // create a connection path from the connections waypoints
  return _.collect(connection.waypoints, function(p, idx) {
    return (idx ? 'L' : 'M') + p.x + ' ' + p.y;
  }).join('');
};

CroppingConnectionDocking.prototype._getShapePath = function(shape) {

  var gfx = this._getGfx(shape),
      visual = this._getVisual(gfx);


  var path = this._toPath(visual),
      transform = gfx.attr('transform');

  return Snap.path.map(path, new Snap.Matrix(1, 0, 0, 1, shape.x, shape.y));
};

CroppingConnectionDocking.prototype._toPath = function(gfx) {
  return Snap.path.get[gfx.type](gfx);
};

CroppingConnectionDocking.prototype._getGfx = function(element) {
  return this._elementRegistry.getGraphicsByElement(element);
};

CroppingConnectionDocking.prototype._getVisual = function(gfx) {
  return gfx.select('.djs-visual *');
};