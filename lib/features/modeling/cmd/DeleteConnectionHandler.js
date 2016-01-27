'use strict';

var Collections = require('../../../util/Collections');


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
  context.parentIndex = Collections.indexOf(parent.children, connection);

  context.source = connection.source;
  context.target = connection.target;

  this._canvas.removeConnection(connection);

  connection.source = null;
  connection.target = null;
  connection.label  = null;

  return connection;
};

/**
 * Command revert implementation.
 */
DeleteConnectionHandler.prototype.revert = function(context) {

  var connection = context.connection,
      parent = context.parent,
      parentIndex = context.parentIndex;

  connection.source = context.source;
  connection.target = context.target;

  // restore previous location in old parent
  Collections.add(parent.children, connection, parentIndex);

  this._canvas.addConnection(connection, parent);

  return connection;
};
