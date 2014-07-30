'use strict';

/**
 * @class djs.layout.DockingPointDescriptor
 * @memberOf djs.layout
 */

/**
 * @memberOf djs.layout.DockingPointDescriptor
 * @member {djs.Point} point
 * @instance
 */

/**
 * @memberOf djs.layout.DockingPointDescriptor
 * @member {djs.Point} actual
 * @instance
 */

/**
 * @memberOf djs.layout.DockingPointDescriptor
 * @member {Number} idx
 * @instance
 */

/**
 * A layout component for connections that retrieves waypoint information.
 *
 * @class djs.layout.ConnectionLayouter
 * @memberOf djs.layout
 * @constructor
 */
function ConnectionLayouter() {}

module.exports = ConnectionLayouter;



/**
 * Return the actual waypoints of the connection (visually).
 *
 * @method ConnectionLayouter#getCroppedWaypoints
 *
 * @param  {djs.model.Connection} connection
 * @return {Array<djs.Point>}
 */
ConnectionLayouter.prototype.getCroppedWaypoints = function(connection) {
  return connection.waypoints;
};

/**
 * Return the connection docking point on the specified shape
 *
 * @method ConnectionLayouter#getDockingPoint
 *
 * @param  {djs.model.Connection} connection
 * @param  {djs.model.Shape} shape
 * @return {djs.layout.DockingPointDescriptor}
 */
ConnectionLayouter.prototype.getDockingPoint = function(connection, shape) {
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