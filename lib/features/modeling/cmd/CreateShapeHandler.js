'use strict';

var _ = require('lodash');


/**
 * A handler that implements reversible addition of shapes.
 *
 * @param {canvas} Canvas
 * @param {elementFactory} ElementFactory
 */
function CreateShapeHandler(canvas, elementFactory) {
  this._canvas = canvas;
  this._elementFactory = elementFactory;
}

CreateShapeHandler.$inject = [ 'canvas', 'elementFactory' ];

module.exports = CreateShapeHandler;



////// api /////////////////////////////////////////


/**
 * Appends a shape to a target shape
 *
 * @param {Object} context
 * @param {ElementDescriptor} context.parent the parent object
 * @param {Point} context.position position of the new element
 */
CreateShapeHandler.prototype.execute = function(context) {

  var parent = this.getParent(context);

  if (!parent) {
    throw new Error('parent required');
  }

  var shape = context.shape || this.createElement(context.attrs, context);

  this.addElement(shape, parent, context);

  _.extend(context, {
    shape: shape
  });

  return shape;
};


/**
 * Undo append by removing the shape
 */
CreateShapeHandler.prototype.revert = function(context) {
  this._canvas.removeShape(context.shape);
};


////// helpers /////////////////////////////////////////

CreateShapeHandler.prototype.getParent = function(context) {
  return context.parent;
};

CreateShapeHandler.prototype.getPosition = function(context) {
  if (!context.position) {
    throw new Error('no position given');
  }

  return context.position;
};

CreateShapeHandler.prototype.addElement = function(shape, parent) {
  this._canvas.addShape(shape, parent);
};

CreateShapeHandler.prototype.setBounds = function(shape, context) {
  var bounds = this.getBounds(shape, context);

  // update bounds
  _.extend(shape, bounds);
};

CreateShapeHandler.prototype.getBounds = function(shape, context) {
  var position = this.getPosition(context),
      size = this.getSize(shape, context);

  return _.extend({
    x: position.x - size.width / 2,
    y: position.y - size.height / 2
  }, size);
};

CreateShapeHandler.prototype.getSize = function(shape, context) {
  return { width: shape.width || 100, height: shape.height || 100 };
};


/**
 * Create a new element
 *
 * @param {Object} attrs
 * @param {Object} context
 *
 * @return {djs.model.Shape}
 */
CreateShapeHandler.prototype.createElement = function(attrs, context) {
  var element = this._elementFactory.createShape(attrs);

  this.setBounds(element, context);

  return element;
};


CreateShapeHandler.prototype.canExecute = function(context) {
  return true;
};