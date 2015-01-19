'use strict';

var NoopHandler = require('./NoopHandler');


/**
 * A handler that implements reversible appending of shapes
 * to a source shape.
 *
 * @param {canvas} Canvas
 * @param {elementFactory} ElementFactory
 * @param {modeling} Modeling
 */
function AppendShapeHandler(modeling) {
  this._modeling = modeling;
}

AppendShapeHandler.prototype = Object.create(NoopHandler.prototype);

AppendShapeHandler.$inject = [ 'modeling' ];

module.exports = AppendShapeHandler;


////// api /////////////////////////////////////////////

/**
 * Creates a new shape
 *
 * @param {Object} context
 * @param {ElementDescriptor} context.shape the new shape
 * @param {ElementDescriptor} context.source the source object
 * @param {ElementDescriptor} context.parent the parent object
 * @param {Point} context.position position of the new element
 */
AppendShapeHandler.prototype.preExecute = function(context) {

  if (!context.source) {
    throw new Error('source required');
  }

  var parent = context.parent || context.source.parent,
      shape = this._modeling.createShape(context.shape, context.position, parent);

  context.shape = shape;
};

AppendShapeHandler.prototype.postExecute = function(context) {
  var parent = context.connectionParent || context.shape.parent;

  // create connection
  this._modeling.createConnection(context.source, context.shape, context.connection, parent);
};