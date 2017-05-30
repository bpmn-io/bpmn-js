'use strict';

var assign = require('lodash/object/assign');


/**
 * A handler that implements reversible moving of shapes.
 */
function LayoutConnectionHandler(layouter, canvas) {
  this._layouter = layouter;
  this._canvas = canvas;
}

LayoutConnectionHandler.$inject = [ 'layouter', 'canvas' ];

module.exports = LayoutConnectionHandler;

LayoutConnectionHandler.prototype.execute = function(context) {

  var connection = context.connection;

  var oldWaypoints = connection.waypoints;

  assign(context, {
    oldWaypoints: oldWaypoints
  });

  connection.waypoints = this._layouter.layoutConnection(connection, context.hints);

  return connection;
};

LayoutConnectionHandler.prototype.revert = function(context) {

  var connection = context.connection;

  connection.waypoints = context.oldWaypoints;

  return connection;
};
