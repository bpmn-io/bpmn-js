'use strict';


/**
 * A handler that implements reversible deletion of Connections.
 *
 */
function DeleteConnectionHandler(canvas) {
  this._canvas = canvas;
}

DeleteConnectionHandler.$inject = [ 'canvas' ];

module.exports = DeleteConnectionHandler;


DeleteConnectionHandler.prototype.execute = function(context) {

  var connection = context.connection;

  context.parent = connection.parent;
  context.source = connection.source;
  context.target = connection.target;

  this._canvas.removeConnection(connection);

  connection.source = null;
  connection.target = null;
};

/**
 * Command revert implementation.
 */
DeleteConnectionHandler.prototype.revert = function(context) {

  var connection = context.connection;
  var source = context.source;
  var target = context.target;

  connection.source = source;
  connection.target = target;

  this._canvas.addConnection(connection, context.parent);
};

