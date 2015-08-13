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

  var connection = context.connection,
      delta = context.delta;

  var newParent = context.newParent || connection.parent,
      newParentIndex = context.newParentIndex,
      oldParent = connection.parent;

  // save old parent in context
  context.oldParent = oldParent;
  context.oldParentIndex = Collections.remove(oldParent.children, connection);

  // add to new parent at position
  Collections.add(newParent.children, connection, newParentIndex);

  // update parent
  connection.parent = newParent;


  var updateAnchors = (context.hints.updateAnchors !== false);

  // update waypoint positions
  forEach(connection.waypoints, function(p) {
    p.x += delta.x;
    p.y += delta.y;

    if (updateAnchors && p.original) {
      p.original.x += delta.x;
      p.original.y += delta.y;
    }
  });

  return connection;
};

MoveConnectionHandler.prototype.revert = function(context) {

  var connection = context.connection,
      newParent = connection.parent,
      oldParent = context.oldParent,
      oldParentIndex = context.oldParentIndex,
      delta = context.delta;

  // remove from newParent
  Collections.remove(newParent.children, connection);

  // restore previous location in old parent
  Collections.add(oldParent.children, connection, oldParentIndex);

  // restore parent
  connection.parent = oldParent;


  var updateAnchors = (context.hints.updateAnchors !== false);

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