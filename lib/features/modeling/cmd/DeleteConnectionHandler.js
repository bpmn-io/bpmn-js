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

  // Remove label
  if (connection.label) {
    this._modeling.removeShape(connection.label);
  }
};

DeleteConnectionHandler.prototype.execute = function(context) {

  var connection = context.connection,
      parent = connection.parent;

  context.parent = parent;
  context.parentIndex = (parent.children && parent.children.indexOf(connection)) || -1;

  context.source = connection.source;
  context.target = connection.target;

  this._canvas.removeConnection(connection);

  connection.source = null;
  connection.target = null;
  connection.label  = null;
};

/**
 * Command revert implementation.
 */
DeleteConnectionHandler.prototype.revert = function(context) {

  var connection = context.connection,
      parent = context.parent,
      parentIndex = context.parentIndex,
      source = context.source,
      target = context.target;

  connection.source = source;
  connection.target = target;

  // add to previous parent at old position
  if (parent.children && parentIndex !== -1) {
    parent.children.splice(parentIndex, 0, connection);
  }

  this._canvas.addConnection(connection, parent);
};
