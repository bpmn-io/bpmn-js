'use strict';

var _ = require('lodash');


/**
 * A handler that implements reversible moving of connections.
 *
 * The handler differs from the layout connection handler in a sense
 * that it preserves the connection layout.
 */
function MoveConnectionsHandler(commandStack) {
  this._commandStack = commandStack;
}

MoveConnectionsHandler.$inject = [ 'commandStack' ];

module.exports = MoveConnectionsHandler;


MoveConnectionsHandler.prototype.preExecute = function(context) {

   var connections = context.connections,
       delta  = context.delta,
       self   = this;

   _.forEach(connections, function(connection) {

     self._commandStack.execute('connection.move', {
       connection: connection,
       delta: delta,
       hints: context.hints
     });
   });

   return connections;
 };


MoveConnectionsHandler.prototype.execute = function(context) {

  var connections = context.connections;

  return connections;
};

MoveConnectionsHandler.prototype.revert = function(context) {

  var connections = context.connections,
      oldParent   = context.oldParent,
      delta       = context.delta;

  _.forEach(connections, function(connection) {

    // restore parent
    connection.parent = context.oldParent;
  });
};


MoveConnectionsHandler.prototype.getNewParent = function(connection, context) {
  return context.newParent || connection.parent;
};
