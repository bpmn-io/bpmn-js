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

  var connection = context.connection,
      parent = connection.parent,
      connectionSiblings = parent.children;

  var oldIndex = connectionSiblings.indexOf(connection);

  assign(context, {
    oldWaypoints: connection.waypoints,
    oldIndex: oldIndex
  });

  sendToFront(connection);

  connection.waypoints = this._layouter.layoutConnection(connection, context.hints);

  return connection;
};

LayoutConnectionHandler.prototype.revert = function(context) {

  var connection = context.connection,
      parent = connection.parent,
      connectionSiblings = parent.children,
      currentIndex = connectionSiblings.indexOf(connection),
      oldIndex = context.oldIndex;

  connection.waypoints = context.oldWaypoints;

  if (oldIndex !== currentIndex) {

    // change position of connection in shape
    connectionSiblings.splice(currentIndex, 1);
    connectionSiblings.splice(oldIndex, 0, connection);
  }

  return connection;
};

// connections should have a higher z-order as there source and targets
function sendToFront(connection) {

  var connectionSiblings = connection.parent.children;

  var connectionIdx = connectionSiblings.indexOf(connection),
      sourceIdx = findIndex(connectionSiblings, connection.source),
      targetIdx = findIndex(connectionSiblings, connection.target),

      // ensure we do not send the connection back
      // if it is already in front
      insertIndex = Math.max(sourceIdx + 1, targetIdx + 1, connectionIdx);

  if (connectionIdx < insertIndex) {
    connectionSiblings.splice(insertIndex, 0, connection); // add to new position
    connectionSiblings.splice(connectionIdx, 1); // remove from old position
  }

  function findIndex(array, obj) {

    var index = array.indexOf(obj);
    if (index < 0 && obj) {
      var parent = obj.parent;
      index = findIndex(array, parent);
    }
    return index;
  }

  return insertIndex;
}
