'use strict';

var CreateShapeHandler = require('./CreateShapeHandler');


/**
 * A handler that attaches a label to a given target shape.
 *
 * @param {canvas} Canvas
 * @param {elementFactory} ElementFactory
 */
function CreateLabelHandler(canvas, elementFactory) {
  this._canvas = canvas;
  this._elementFactory = elementFactory;
}

CreateLabelHandler.prototype = Object.create(CreateShapeHandler.prototype);

CreateLabelHandler.$inject = [ 'canvas', 'elementFactory' ];

module.exports = CreateLabelHandler;



////// api /////////////////////////////////////////


/**
 * Appends a label to a target shape.
 *
 * @method CreateLabelHandler#execute
 *
 * @param {Object} context
 * @param {ElementDescriptor} context.target the element the label is attached to
 * @param {ElementDescriptor} context.parent the parent object
 * @param {Point} context.position position of the new element
 */

/**
 * Undo append by removing the shape
 */
CreateLabelHandler.prototype.revert = function(context) {
  context.shape.labelTarget = null;
  this._canvas.removeShape(context.shape);
};


////// helpers /////////////////////////////////////////

CreateLabelHandler.prototype.getParent = function(context) {
  return context.parent || context.labelTarget && context.labelTarget.parent;
};

CreateLabelHandler.prototype.getSize = function(shape, context) {
  return { width: shape.width || 100, height: shape.height || 50 };
};

CreateLabelHandler.prototype.addElement = function(shape, parent, context) {
  shape.labelTarget = context.labelTarget;
  this._canvas.addShape(shape, parent, true);
};

CreateLabelHandler.prototype.createElement = function(attrs, context) {
  var element = this._elementFactory.createLabel(attrs);

  this.setBounds(element, context);

  return element;
};