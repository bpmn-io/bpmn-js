'use strict';

var assign = require('lodash/object/assign');


/**
 * A handler that implements reversible moving of shapes.
 */
function LayoutConnectionHandler(layouter) {
  this._layouter = layouter;
}

LayoutConnectionHandler.$inject = [ 'layouter' ];

module.exports = LayoutConnectionHandler;


LayoutConnectionHandler.prototype.execute = function(context) {

  var connection = context.connection;

  assign(context, {
    oldWaypoints: connection.waypoints
  });

  connection.waypoints = this._layouter.getConnectionWaypoints(connection);

  return connection;
};

LayoutConnectionHandler.prototype.revert = function(context) {
  var connection = context.connection;
  connection.waypoints = context.oldWaypoints;

  return connection;
};