'use strict';

var getNewAttachPoint = require('../../../../util/AttachUtil').getNewAttachPoint;

function getResizedSourceAnchor(connection, shape, oldBounds) {

  var waypoints = safeGetWaypoints(connection),
      oldAnchor = waypoints[0];

  return getNewAttachPoint(oldAnchor.original || oldAnchor, oldBounds, shape);
}

module.exports.getResizedSourceAnchor = getResizedSourceAnchor;


function getResizedTargetAnchor(connection, shape, oldBounds) {

  var waypoints = safeGetWaypoints(connection),
      oldAnchor = waypoints[waypoints.length - 1];

  return getNewAttachPoint(oldAnchor.original || oldAnchor, oldBounds, shape);
}

module.exports.getResizedTargetAnchor = getResizedTargetAnchor;


function getMovedSourceAnchor(connection, source, moveDelta) {
  return getResizedSourceAnchor(connection, source, substractPosition(source, moveDelta));
}

module.exports.getMovedSourceAnchor = getMovedSourceAnchor;


function getMovedTargetAnchor(connection, target, moveDelta) {
  return getResizedTargetAnchor(connection, target, substractPosition(target, moveDelta));
}

module.exports.getMovedTargetAnchor = getMovedTargetAnchor;


//////// helpers ////////////////////////////////////

function substractPosition(bounds, delta) {
  return {
    x: bounds.x - delta.x,
    y: bounds.y - delta.y,
    width: bounds.width,
    height: bounds.height
  };
}


/**
 * Return waypoints of given connection; throw if non exists (should not happen!!).
 *
 * @param {Connection} connection
 *
 * @return {Array<Point>}
 */
function safeGetWaypoints(connection) {

  var waypoints = connection.waypoints;

  if (!waypoints.length) {
    throw new Error('connection#' + connection.id + ': no waypoints');
  }

  return waypoints;
}
