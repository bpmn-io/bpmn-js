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
 * @param {djs.model.Connection} connection
 * @param {djs.model.Base} [source]
 * @param {djs.model.Base} [target]
 *
 * @return {Array<djs.Point>}
 */
ConnectionDocking.prototype.getCroppedWaypoints = function(connection, source, target) {
  return connection.waypoints;
};

/**
 * Return the connection docking point on the specified shape
 *
 * @param {djs.model.Connection} connection
 * @param {djs.model.Shape} shape
 * @param {Boolean} [dockStart=false]
 *
 * @return {DockingPointDescriptor}
 */
ConnectionDocking.prototype.getDockingPoint = function(connection, shape, dockStart) {

  var waypoints = connection.waypoints,
      dockingIdx,
      dockingPoint;

  dockingIdx = dockStart ? 0 : waypoints.length - 1;
  dockingPoint = waypoints[dockingIdx];

  return {
    point: dockingPoint,
    actual: dockingPoint,
    idx: dockingIdx
  };
};