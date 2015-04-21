'use strict';

var forEach = require('lodash/collection/forEach'),
    assign = require('lodash/object/assign');


/**
 * Update the anchors of
 */
function UpdateAnchorsHandler() { }

module.exports = UpdateAnchorsHandler;


UpdateAnchorsHandler.prototype.execute = function(context) {

  // update connection anchors
  return this.updateAnchors(context.element, context.delta);
};

UpdateAnchorsHandler.prototype.revert = function(context) {

  var delta = context.delta,
      revertedDelta = { x: -1 * delta.x, y: -1 * delta.y };

  // revert update connection anchors
  return this.updateAnchors(context.element, revertedDelta);
};

/**
 * Update anchors on the element according to the delta movement.
 *
 * @param {djs.model.Element} element
 * @param {Point} delta
 *
 * @return Array<djs.model.Connection>
 */
UpdateAnchorsHandler.prototype.updateAnchors = function(element, delta) {

  function add(point, delta) {
    return {
      x: point.x + delta.x,
      y: point.y + delta.y
    };
  }

  function updateAnchor(waypoint) {
    var original = waypoint.original;

    waypoint.original = assign(original || {}, add(original || waypoint, delta));
  }

  var changed = [];

  forEach(element.incoming, function(c) {
    var waypoints = c.waypoints;
    updateAnchor(waypoints[waypoints.length - 1]);

    changed.push(c);
  });

  forEach(element.outgoing, function(c) {
    var waypoints = c.waypoints;
    updateAnchor(waypoints[0]);

    changed.push(c);
  });

  return changed;
};