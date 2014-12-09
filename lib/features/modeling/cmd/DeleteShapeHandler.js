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
 * - Remove connections
 * - Remove all direct children
 */
DeleteShapeHandler.prototype.preExecute = function(context) {

  var shape    = context.shape,
      label    = shape.label,
      modeling = this._modeling;

  // Clean up on removeShape(label)
  if (shape.labelTarget) {
    context.labelTarget = shape.labelTarget;
    shape.labelTarget = null;
  }

  // Remove label
  if (label) {
    this._modeling.removeShape(label);
  }

  // remove connections
  this._saveClear(shape.incoming, function(connection) {
    // To make sure that the connection isn't removed twice
    // For example if a container is removed
    modeling.removeConnection(connection);
  });

  this._saveClear(shape.outgoing, function(connection) {
    modeling.removeConnection(connection);
  });


  // remove children
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

  var shape = context.shape,
      parent = shape.parent;

  context.parent = parent;
  context.parentIndex = (parent.children && parent.children.indexOf(shape)) || -1;

  shape.label = null;

  this._canvas.removeShape(shape);
};


/**
 * Command revert implementation
 */
DeleteShapeHandler.prototype.revert = function(context) {

  var shape = context.shape,
      parent = context.parent,
      parentIndex = context.parentIndex,
      labelTarget = context.labelTarget;

  // add to previous parent at old position
  if (parent.children && parentIndex !== -1) {
    parent.children.splice(parentIndex, 0, shape);
  }

  if (labelTarget) {
    labelTarget.label = shape;
  }

  this._canvas.addShape(shape, parent);
};
