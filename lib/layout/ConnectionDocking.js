'use strict';

/**
 * @memberOf djs.layout
 */

/**
 * @class DockingPointDescriptor
 */

/**
 * @name DockingPointDescriptor#point
 * @type djs.Point
 */

/**
 * @name DockingPointDescriptor#actual
 * @type djs.Point
 */

/**
 * @name DockingPointDescriptor#idx
 * @type Number
 */

/**
 * A layout component for connections that retrieves waypoint information.
 *
 * @class
 * @constructor
 */
function ConnectionDocking() {}

module.exports = ConnectionDocking;



/**
 * Return the actual waypoints of the connection (visually).
 *
 * @param  {djs.model.Connection} connection
 * @return {Array<djs.Point>}
 */
ConnectionDocking.prototype.getCroppedWaypoints = function(connection) {
  return connection.waypoints;
};

/**
 * Return the connection docking point on the specified shape
 *
 * @param  {djs.model.Connection} connection
 * @param  {djs.model.Shape} shape
 *
 * @return {DockingPointDescriptor}
 */
ConnectionDocking.prototype.getDockingPoint = function(connection, shape) {
  var point, idx = -1;

  if (shape === connection.target) {
    idx = connection.waypoints.length - 1;
  } else if (shape === connection.source) {
    idx = 0;
  }

  if (idx !== -1) {
    point = connection.waypoints[idx];

    return {
      point: point,
      actual: point,
      idx: idx
    };
  }

  return null;
};