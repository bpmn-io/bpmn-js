'use strict';

var _ = require('lodash');

var Elements = require('../../../util/Elements'),
    MoveShapeHandler = require('./MoveShapeHandler');


/**
 * A handler that implements reversible moving of shapes.
 */
function MoveShapesHandler(modeling, drop, commandStack) {
  this._modeling = modeling;
  this._drop     = drop;
  this._commandStack = commandStack;
}

MoveShapesHandler.$inject = [ 'modeling', 'drop', 'commandStack' ];

module.exports = MoveShapesHandler;


MoveShapesHandler.prototype.preExecute = function(context) {

  var shapes = context.shapes,
      delta  = context.delta,
      self   = this;

  _.forEach(shapes, function(shape) {

    self._commandStack.execute('shape.move', {
      shape: shape,
      delta: delta,
      hints: context.hints
    });
  });
};


MoveShapesHandler.prototype.execute = function(context) {
};


MoveShapesHandler.prototype.postExecute = function(context) {

  if (context.newParent) {
    this._drop.dropElements(context);
  }
};


MoveShapesHandler.prototype.revert = function(context) {

  var shapes = context.shapes,
      delta = context.delta;

  this._drop.revert(context);
};
