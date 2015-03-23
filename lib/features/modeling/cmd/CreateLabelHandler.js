'use strict';

var inherits = require('inherits');

var CreateShapeHandler = require('./CreateShapeHandler');


/**
 * A handler that attaches a label to a given target shape.
 *
 * @param {canvas} Canvas
 */
function CreateLabelHandler(canvas) {
  CreateShapeHandler.call(this, canvas);
}

inherits(CreateLabelHandler, CreateShapeHandler);

CreateLabelHandler.$inject = [ 'canvas' ];

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

CreateLabelHandler.prototype.addElement = function(shape, parent, context) {
  shape.labelTarget = context.labelTarget;
  this._canvas.addShape(shape, parent, true);
};