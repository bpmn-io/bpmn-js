'use strict';

var forEach = require('lodash/collection/forEach');

var Collections = require('../../../util/Collections');


/**
 * A handler that implements reversible moving of connections.
 *
 * The handler differs from the layout connection handler in a sense
 * that it preserves the connection layout.
 */
function MoveConnectionHandler() { }

module.exports = MoveConnectionHandler;


MoveConnectionHandler.prototype.execute = function(context) {

  var updateAnchors = (context.hints.updateAnchors !== false);

  var connection  = context.connection,
      delta       = context.delta;

  var newParent = this.getNewParent(connection, context),
      oldParent = connection.parent;

  // save old position + parent in context
  context.oldParent = oldParent;
  context.oldParentIndex = Collections.indexOf(oldParent.children, connection);

  // update waypoint positions
  forEach(connection.waypoints, function(p) {
    p.x += delta.x;
    p.y += delta.y;

    if (updateAnchors && p.original) {
      p.original.x += delta.x;
      p.original.y += delta.y;
    }
  });

  // update parent
  connection.parent = newParent;

  return connection;
};

MoveConnectionHandler.prototype.revert = function(context) {

  var updateAnchors = (context.hints.updateAnchors !== false);

  var connection = context.connection,
      oldParent = context.oldParent,
      oldParentIndex = context.oldParentIndex,
      delta = context.delta;

  // restore previous location in old parent
  Collections.add(oldParent.children, connection, oldParentIndex);

  // restore parent
  connection.parent = oldParent;

  // revert to old waypoint positions
  forEach(connection.waypoints, function(p) {
    p.x -= delta.x;
    p.y -= delta.y;

    if (updateAnchors && p.original) {
      p.original.x -= delta.x;
      p.original.y -= delta.y;
    }
  });

  return connection;
};


MoveConnectionHandler.prototype.getNewParent = function(connection, context) {
  return context.newParent || connection.parent;
};
