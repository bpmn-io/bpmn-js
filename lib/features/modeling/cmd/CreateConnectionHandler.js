'use strict';


function CreateConnectionHandler(canvas, layouter) {
  this._canvas = canvas;
  this._layouter = layouter;
}

CreateConnectionHandler.$inject = [ 'canvas', 'layouter' ];

module.exports = CreateConnectionHandler;



////// api /////////////////////////////////////////

/**
 * Appends a shape to a target shape
 *
 * @param {Object} context
 * @param {djs.element.Base} context.source the source object
 * @param {djs.element.Base} context.target the parent object
 * @param {Point} context.position position of the new element
 */
CreateConnectionHandler.prototype.execute = function(context) {

  var source = context.source,
      target = context.target,
      parent = context.parent;

  if (!source || !target) {
    throw new Error('source and target required');
  }

  if (!parent) {
    throw new Error('parent required');
  }

  var connection = context.connection;

  connection.source = source;
  connection.target = target;

  if (!connection.waypoints) {
    connection.waypoints = this._layouter.layoutConnection(connection);
  }

  // add connection
  this._canvas.addConnection(connection, parent);

  return connection;
};

CreateConnectionHandler.prototype.revert = function(context) {
  var connection = context.connection;

  this._canvas.removeConnection(connection);

  connection.source = null;
  connection.target = null;
};