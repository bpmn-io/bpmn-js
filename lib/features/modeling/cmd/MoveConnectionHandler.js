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

  var connection = context.connection,
      delta = context.delta,
      newParent = this.getNewParent(context);

  // save old position + parent in context
  _.extend(context, {
    oldParent: connection.parent
  });

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
      oldParent = context.oldParent,
      delta = context.delta;

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


MoveConnectionHandler.prototype.getNewParent = function(context) {
  return context.newParent || context.connection.parent;
};