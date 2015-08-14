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


var originalExecute = CreateShapeHandler.prototype.execute;

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
CreateLabelHandler.prototype.execute = function(context) {

  var label = context.shape;

  ensureValidDimensions(label);

  label.labelTarget = context.labelTarget;

  return originalExecute.call(this, context);
};

var originalRevert = CreateShapeHandler.prototype.revert;

/**
 * Undo append by removing the shape
 */
CreateLabelHandler.prototype.revert = function(context) {
  context.shape.labelTarget = null;

  return originalRevert.call(this, context);
};


////// helpers /////////////////////////////////////////

function ensureValidDimensions(label) {
  // make sure a label has valid { width, height } dimensions
  [ 'width', 'height' ].forEach(function(prop) {
    if (typeof label[prop] === 'undefined') {
      label[prop] = 0;
    }
  });
}