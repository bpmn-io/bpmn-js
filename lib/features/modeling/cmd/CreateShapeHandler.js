'use strict';

var assign = require('lodash/object/assign');

var round = Math.round;


/**
 * A handler that implements reversible addition of shapes.
 *
 * @param {canvas} Canvas
 */
function CreateShapeHandler(canvas) {
  this._canvas = canvas;
}

CreateShapeHandler.$inject = [ 'canvas' ];

module.exports = CreateShapeHandler;



////// api /////////////////////////////////////////


/**
 * Appends a shape to a target shape
 *
 * @param {Object} context
 * @param {djs.model.Base} context.parent the parent object
 * @param {Point} context.position position of the new element
 */
CreateShapeHandler.prototype.execute = function(context) {

  var shape = context.shape,
      positionOrBounds = context.position,
      parent = context.parent,
      parentIndex = context.parentIndex;

  if (!parent) {
    throw new Error('parent required');
  }

  if (!positionOrBounds) {
    throw new Error('position required');
  }

  // (1) add at event center position _or_ at given bounds
  if (positionOrBounds.width !== undefined) {
    assign(shape, positionOrBounds);
  } else {
    assign(shape, {
      x: positionOrBounds.x - round(shape.width / 2),
      y: positionOrBounds.y - round(shape.height / 2)
    });
  }

  // (2) add to canvas
  this._canvas.addShape(shape, parent, parentIndex);

  return shape;
};


/**
 * Undo append by removing the shape
 */
CreateShapeHandler.prototype.revert = function(context) {

  // (3) remove form canvas
  this._canvas.removeShape(context.shape);
};