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

  var modeling = this._modeling,
      rules = this._rules;

  var oldShape = context.oldShape,
      newData = context.newData,
      hints = context.hints,
      newShape;


  // (1) place a new shape at the given position

  var position = {
    x: newData.x,
    y: newData.y
  };

  newShape = context.newShape = context.newShape || modeling.createShape(newData, position, oldShape.parent);


  // (2) update the host

  if (oldShape.host) {
    modeling.updateAttachment(newShape, oldShape.host);
  }


  // (3) adopt all children from the old shape

  if (hints.moveChildren !== false) {
    modeling.moveElements(oldShape.children, { x: 0, y: 0 }, newShape);
  }

  // (4) reconnect connections to the new shape (where allowed)

  var incoming = oldShape.incoming.slice(),
      outgoing = oldShape.outgoing.slice();

  forEach(incoming, function(connection) {
    var waypoints = connection.waypoints,
        docking = waypoints[waypoints.length - 1],
        allowed = rules.allowed('connection.reconnectEnd', {
          source: connection.source,
          target: newShape,
          connection: connection
        });

    if (allowed) {
      modeling.reconnectEnd(connection, newShape, docking);
    }
  });

  forEach(outgoing, function(connection) {
    var waypoints = connection.waypoints,
        docking = waypoints[0],
        allowed = rules.allowed('connection.reconnectStart', {
          source: newShape,
          target: connection.target,
          connection: connection
        });

    if (allowed) {
      modeling.reconnectStart(connection, newShape, docking);
    }
  });
};


ReplaceShapeHandler.prototype.postExecute = function(context) {
  var modeling = this._modeling;

  var oldShape = context.oldShape;

  modeling.removeShape(oldShape);
};


ReplaceShapeHandler.prototype.execute = function(context) {};

ReplaceShapeHandler.prototype.revert = function(context) {};
