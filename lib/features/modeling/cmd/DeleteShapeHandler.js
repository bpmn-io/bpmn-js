'use strict';

var _ = require('lodash');


/**
 * A handler that implements reversible deletion of shapes.
 *
 */
function DeleteShapeHandler(canvas, modeling) {
  this._canvas = canvas;
  this._modeling = modeling;
}

DeleteShapeHandler.$inject = [ 'canvas', 'modeling' ];

module.exports = DeleteShapeHandler;


/**
 *
 * - Remove connections
 * - Remove all direct children
 */
DeleteShapeHandler.prototype.preExecute = function(context) {

  var shape = context.shape,
      modeling = this._modeling;

  this._saveClear(shape.incoming, function(connection) {
    // To make sure that the connection isn't removed twice
    // For example if a container is removed
    modeling.removeConnection(connection);
  });

  this._saveClear(shape.outgoing, function(connection) {
    modeling.removeConnection(connection);
  });

  this._saveClear(shape.children, function(e) {
    modeling.removeShape(e);
  });
};


DeleteShapeHandler.prototype._saveClear = function(collection, remove) {

  var e;

  while (!!(e = collection[0])) {
    remove(e);
  }
};


/**
 * Remove shape and remember the parent
 */
DeleteShapeHandler.prototype.execute = function(context) {
  context.parent = context.shape.parent;
  this._canvas.removeShape(context.shape);
};


/**
 * Command revert implementation
 */
DeleteShapeHandler.prototype.revert = function(context) {
  this._canvas.addShape(context.shape, context.parent);
};

