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
      newShape;


  var pos = {
    x: newData.x,
    y: newData.y
  };

  newShape = context.newShape = modeling.createShape(newData, pos, oldShape.parent);

  var incoming = oldShape.incoming,
      outgoing = oldShape.outgoing;

  forEach(incoming, function(connection) {
    var lastIndex = connection.waypoints.length - 1;
    if (canConnect(connection.source, newShape)) {
      modeling.reconnectEnd(connection, newShape, connection.waypoints[lastIndex]);
    }
  });

  forEach(outgoing, function(connection) {
    if (canConnect(newShape, connection.target)) {
      modeling.reconnectStart(connection, newShape, connection.waypoints[0]);
    }
  });

  return context.newShape;

  function canConnect(source, target) {

    return rules.allowed('connection.create', {
      source: source,
      target: target
    });
  }
};


ReplaceShapeHandler.prototype.execute = function(context) {
};


ReplaceShapeHandler.prototype.postExecute = function(context) {

  var modeling = this._modeling;

  var oldShape = context.oldShape;

  modeling.removeShape(oldShape);
};

ReplaceShapeHandler.prototype.revert = function(context) {
};
