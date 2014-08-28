'use strict';

var _ = require('lodash');


function CreateConnectionHandler(canvas, elementFactory, layouter) {
  this._canvas = canvas;
  this._elementFactory = elementFactory;
  this._layouter = layouter;
}

CreateConnectionHandler.$inject = [ 'canvas', 'elementFactory', 'layouter' ];

module.exports = CreateConnectionHandler;



////// api /////////////////////////////////////////

/**
 * Appends a shape to a target shape
 *
 * @param {Object} context
 * @param {ElementDescriptor} context.source the source object
 * @param {ElementDescriptor} context.target the parent object
 * @param {Point} context.position position of the new element
 */
CreateConnectionHandler.prototype.execute = function(context) {

  var source = context.source,
      target = context.target,
      parent = this.getParent(context);

  if (!source || !target) {
    throw new Error('source and target required');
  }

  if (!parent) {
    throw new Error('parent required');
  }

  var connection = context.connection || this.createConnection(context.attrs, context);

  connection.source = source;
  connection.target = target;

  if (!connection.waypoints) {
    connection.waypoints = this._layouter.getConnectionWaypoints(connection);
  }

  // add connection
  this._canvas.addConnection(connection, parent);

  _.extend(context, {
    connection: connection
  });

  return connection;
};


CreateConnectionHandler.prototype.revert = function(context) {
  var connection = context.connection;

  this._canvas.removeConnection(connection);

  connection.source = null;
  connection.target = null;
};


//////// utilities /////////////////////////////////////////

CreateConnectionHandler.prototype.getParent = function(context) {
  return context.parent;
};


/**
 * Create a new connection
 *
 * @param {Object} attrs
 * @param {Object} context
 *
 * @return {djs.model.Connection}
 */
CreateConnectionHandler.prototype.createConnection = function(attrs, context) {
  return this._elementFactory.createConnection(attrs);
};
