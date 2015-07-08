'use strict';

var assign = require('lodash/object/assign'),
    forEach = require('lodash/collection/forEach');

var MoveHelper = require('./helper/MoveHelper');


/**
 * A handler that implements reversible moving of shapes.
 */
function MoveShapeHandler(modeling) {
  this._modeling = modeling;

  this._helper = new MoveHelper(modeling);
}

MoveShapeHandler.$inject = [ 'modeling' ];

module.exports = MoveShapeHandler;


MoveShapeHandler.prototype.preExecute = function (context) {

  var modeling = this._modeling;

  modeling.updateParent(context.shape, context.newParent);
};

MoveShapeHandler.prototype.execute = function(context) {

  var shape = context.shape,
      delta = context.delta;

  // update shape position
  assign(shape, {
    x: shape.x + delta.x,
    y: shape.y + delta.y
  });

  return shape;
};

MoveShapeHandler.prototype.revert = function(context) {

  var shape = context.shape,
      delta = context.delta;

  // revert to old position
  assign(shape, {
    x: shape.x - delta.x,
    y: shape.y - delta.y
  });

  return shape;
};

MoveShapeHandler.prototype.postExecute = function(context) {

  var shape = context.shape,
      delta = context.delta;

  var modeling = this._modeling;

  if (context.hints.updateAnchors !== false) {
    modeling.updateAnchors(shape, delta);
  }

  if (context.hints.layout !== false) {
    forEach(shape.incoming, function(c) {
      modeling.layoutConnection(c, { endChanged: true });
    });

    forEach(shape.outgoing, function(c) {
      modeling.layoutConnection(c, { startChanged: true });
    });
  }

  if (context.hints.recurse !== false) {
    this.moveChildren(context);
  }

};

MoveShapeHandler.prototype.moveChildren = function(context) {

  var delta = context.delta,
      shape = context.shape;

  this._helper.moveRecursive(shape.children, delta, null);
};
