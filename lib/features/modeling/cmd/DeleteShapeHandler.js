'use strict';

var Collections = require('../../../util/Collections');


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
      parent = shape.parent,
      host;

  context.parent = parent;
  context.parentIndex = Collections.indexOf(parent.children, shape);

  if ((host = shape.host)) {
    context.hostIndex = Collections.indexOf(host.attachers, shape);

    Collections.remove(host && host.attachers, shape);
  }

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
      labelTarget = context.labelTarget,
      host;

  // restore previous location in old parent
  Collections.add(parent.children, shape, parentIndex);

  if ((host = shape.host)) {
    Collections.add(host && host.attachers, shape, context.hostIndex);
  }

  if (labelTarget) {
    labelTarget.label = shape;
  }

  this._canvas.addShape(shape, parent);
};
