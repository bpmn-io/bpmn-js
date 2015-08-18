'use strict';

var forEach = require('lodash/collection/forEach');

var getNewAttachPoint = require('../../../util/AttachUtil').getNewAttachPoint;

/**
 * Update the anchors of
 */
function UpdateAnchorsHandler() { }

module.exports = UpdateAnchorsHandler;

/**
 * Update anchors on the element according to the delta movement.
 *
 * @param {context} context
 * @param {djs.model.Element} context.element
 * @param {dc.Bounds} context.oldBounds
 *
 * @return Array<djs.model.Connection>
 */
UpdateAnchorsHandler.prototype.execute = function(context) {

  var element = context.element,
      oldBounds = context.oldBounds;

  // storing all changed connections for revert
  var changedConnections = context.changedConnections = [];

  // Array containing all the previous original points
  var oldAnchors = context.oldAnchors = [];


  /**
   * Update anchors for all connections,
   * taking anchorPosition = (start|end) into account
   */
  function updateAnchors(connections, anchorPosition) {
    forEach(connections, function(c) {

      var waypoints = c.waypoints,
          pointIndex = anchorPosition === 'end' ? waypoints.length - 1 : 0,
          point = waypoints[pointIndex];

      oldAnchors.push({ point: point, oldOriginal: point.original });

      // calculate the new original point
      // based on the old orgininal
      // fall back to actual point if no old original is set
      point.original = getNewAttachPoint(point.original || point, oldBounds, element);

      changedConnections.push(c);
    });
  }

  updateAnchors(element.incoming, 'end');
  updateAnchors(element.outgoing, 'start');

  return changedConnections;
};

UpdateAnchorsHandler.prototype.revert = function(context) {
  var oldAnchors = context.oldAnchors,
      changedConnections = context.changedConnections;

  forEach(oldAnchors, function(anchor) {
    // replace point.original with the old version
    // we stored during execute
    anchor.point.original = anchor.oldOriginal;
  });

  return changedConnections;
};