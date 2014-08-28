'use strict';

var _ = require('lodash');

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
 * @param {ElementDescriptor} context.attrs additional attributes for the new shape
 * @param {ElementDescriptor} context.source the source object
 * @param {ElementDescriptor} context.parent the parent object
 * @param {Point} context.position position of the new element
 */
AppendShapeHandler.prototype.preExecute = function(context) {

  if (!context.source) {
    throw new Error('source required');
  }

  var parent = this.getParent(context);

  var shape = this._modeling.createShape(context.attrs, context.position, parent);

  _.extend(context, {
    shape: shape
  });
};

AppendShapeHandler.prototype.postExecute = function(context) {
  var attrs = context.connection.attrs,
      parent = context.connection.parent || context.shape.parent;

  // create connection
  this._modeling.createConnection(context.source, context.shape, attrs, parent);
};

AppendShapeHandler.prototype.getParent = function(context) {
  return context.parent || context.source.parent;
};