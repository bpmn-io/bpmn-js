'use strict';


/**
 * A handler that implements reversible deletion of Connections.
 *
 */
function DeleteConnectionHandler(canvas, modeling) {
  this._canvas = canvas;
  this._modeling = modeling;
}

DeleteConnectionHandler.$inject = [ 'canvas', 'modeling' ];

module.exports = DeleteConnectionHandler;


/**
 * - Remove attached label
 */
DeleteConnectionHandler.prototype.preExecute = function(context) {

  var connection = context.connection;

  context.label = connection.label;

  if (connection.label) {
    this._modeling.removeShape(connection.label);
  }

  connection.label  = null;
};

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
  var label  = context.label;

  connection.source = source;
  connection.target = target;
  connection.label  = label;

  this._canvas.addConnection(connection, context.parent);
};
