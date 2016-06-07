'use strict';

var forEach = require('lodash/collection/forEach');


/**
 * A handler that implements reversible replacing of shapes.
 * Internally the old shape will be removed and the new shape will be added.
 *
 *
 * @class
 * @constructor
 *
 * @param {canvas} Canvas
 */
function ReplaceShapeHandler(modeling, rules) {
  this._modeling = modeling;
  this._rules = rules;
}

ReplaceShapeHandler.$inject = [ 'modeling', 'rules' ];

module.exports = ReplaceShapeHandler;



////// api /////////////////////////////////////////


/**
 * Replaces a shape with an replacement Element.
 *
 * The newData object should contain type, x, y.
 *
 * If possible also the incoming/outgoing connection
 * will be restored.
 *
 * @param {Object} context
 */
ReplaceShapeHandler.prototype.preExecute = function(context) {

  var self = this,
      modeling = this._modeling,
      rules = this._rules;

  var oldShape = context.oldShape,
      newData = context.newData,
      hints = context.hints,
      newShape;

  function canReconnect(type, source, target, connection) {
    return rules.allowed(type, {
      source: source,
      target: target,
      connection: connection
    });
  }


  // (1) place a new shape at the given position

  var position = {
    x: newData.x,
    y: newData.y
  };

  newShape = context.newShape = context.newShape || self.createShape(newData, position, oldShape.parent);


  // (2) update the host

  if (oldShape.host) {
    modeling.updateAttachment(newShape, oldShape.host);
  }


  // (3) adopt all children from the old shape

  var children;

  if (hints.moveChildren !== false) {
    children = oldShape.children.slice();

    modeling.moveElements(children, { x: 0, y: 0 }, newShape);
  }

  // (4) reconnect connections to the new shape (where allowed)

  var incoming = oldShape.incoming.slice(),
      outgoing = oldShape.outgoing.slice();

  forEach(incoming, function(connection) {
    var waypoints = connection.waypoints,
        docking = waypoints[waypoints.length - 1],
        source = connection.source,
        allowed = canReconnect('connection.reconnectEnd', source, newShape, connection);

    if (allowed) {
      self.reconnectEnd(connection, newShape, docking);
    }
  });

  forEach(outgoing, function(connection) {
    var waypoints = connection.waypoints,
        docking = waypoints[0],
        target = connection.target,
        allowed = canReconnect('connection.reconnectStart', newShape, target, connection);

    if (allowed) {
      self.reconnectStart(connection, newShape, docking);
    }

  });
};


ReplaceShapeHandler.prototype.postExecute = function(context) {
  var modeling = this._modeling;

  var oldShape = context.oldShape,
      newShape = context.newShape;

  // if an element gets resized on replace, layout the connection again
  forEach(newShape.incoming, function(c) {
    modeling.layoutConnection(c, { endChanged: true });
  });

  forEach(newShape.outgoing, function(c) {
    modeling.layoutConnection(c, { startChanged: true });
  });

  modeling.removeShape(oldShape);
};


ReplaceShapeHandler.prototype.execute = function(context) {};

ReplaceShapeHandler.prototype.revert = function(context) {};


ReplaceShapeHandler.prototype.createShape = function(shape, position, target) {
  var modeling = this._modeling;
  return modeling.createShape(shape, position, target);
};


ReplaceShapeHandler.prototype.reconnectStart = function(connection, newSource, dockingPoint) {
  var modeling = this._modeling;
  modeling.reconnectStart(connection, newSource, dockingPoint);
};


ReplaceShapeHandler.prototype.reconnectEnd = function(connection, newTarget, dockingPoint) {
  var modeling = this._modeling;
  modeling.reconnectEnd(connection, newTarget, dockingPoint);
};
