'use strict';

var _ = require('lodash');


/**
 * A handler that implements reversible moving of connections.
 *
 * The handler differs from the layout connection handler in a sense
 * that it preserves the connection layout.
 */
function MoveConnectionHandler() { }

module.exports = MoveConnectionHandler;


MoveConnectionHandler.prototype.execute = function(context) {

  var connection  = context.connection,
      delta       = context.delta,
      self        = this;


  var newParent = self.getNewParent(connection, context),
      oldParent = connection.parent;

  // save old position + parent in context
  context.oldParent = oldParent;
  context.oldParentIndex = (oldParent.children && oldParent.children.indexOf(connection)) || -1;

  // update waypoint positions
  _.forEach(connection.waypoints, function(p) {
    p.x += delta.x;
    p.y += delta.y;

    if (p.original) {
      p.original.x += delta.x;
      p.original.y += delta.y;
    }
  });

  // update parent
  connection.parent = newParent;

  return connection;
};

MoveConnectionHandler.prototype.revert = function(context) {

  var connection = context.connection,
      oldParent   = context.oldParent,
      oldParentIndex = context.oldParentIndex,
      delta       = context.delta;


  // add to old parent at previous position
  if (oldParent.children && oldParentIndex !== -1) {
    oldParent.children.splice(oldParentIndex, 0, connection);
  }

  // restore parent
  connection.parent = oldParent;

  // revert to old waypoint positions
  _.forEach(connection.waypoints, function(p) {
    p.x -= delta.x;
    p.y -= delta.y;

    if (p.original) {
      p.original.x -= delta.x;
      p.original.y -= delta.y;
    }
  });

  return connection;
};


MoveConnectionHandler.prototype.getNewParent = function(connection, context) {
  return context.newParent || connection.parent;
};
