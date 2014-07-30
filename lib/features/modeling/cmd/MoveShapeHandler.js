'use strict';

var _ = require('lodash');


/**
 * A handler that implements reversible moving of shapes.
 */
function MoveShapeHandler(modeling) {
  this._modeling = modeling;
}

MoveShapeHandler.$inject = [ 'modeling' ];

module.exports = MoveShapeHandler;


MoveShapeHandler.prototype.execute = function(context) {

  var shape = context.shape,
      delta = context.delta,
      newParent = this.getNewParent(context);

  // save old position + parent in context

  _.extend(context, {
    oldParent: shape.parent
  });

  // update shape parent + position
  _.extend(shape, {
    parent: newParent,
    x: shape.x + delta.dx,
    y: shape.y + delta.dy
  });

  return shape;
};

MoveShapeHandler.prototype.postExecute = function(context) {

  var shape = context.shape;

  var modeling = this._modeling;

  _.forEach(shape.incoming, function(c) {
    modeling.layoutConnection(c);
  });

  _.forEach(shape.outgoing, function(c) {
    modeling.layoutConnection(c);
  });
};

MoveShapeHandler.prototype.revert = function(context) {

  var shape = context.shape,
      oldParent = context.oldParent,
      delta = context.delta;

  _.extend(shape, {
    parent: oldParent,
    x: shape.x - delta.dx,
    y: shape.y - delta.dy
  });

  return shape;
};


MoveShapeHandler.prototype.getNewParent = function(context) {
  return context.newParent || context.shape.parent;
};