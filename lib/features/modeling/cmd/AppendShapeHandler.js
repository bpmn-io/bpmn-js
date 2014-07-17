'use strict';

var _ = require('lodash');


/**
 * A handler that implements reversible addition of shapes
 * to a source shape.
 */
function AppendShapeHandler() {}

module.exports = AppendShapeHandler;


/**
 * Appends a shape to a target shape
 *
 * @param {Object} context
 * @param {ElementDescriptor} context.source the source object
 * @param {ElementDescriptor} context.parent the parent object
 * @param {Point} [context.position] position of the new element
 */
AppendShapeHandler.prototype.execute = function(context) {
  var source = context.source;

  var parent = context.parent || source.parent;

  var position = context.position || {
    x: source.x + source.width + 100,
    y: source.y + source.height / 2
  };

  var target = this.createShape(source, position, parent, context);
  var connection = this.createConnection(source, target, parent, context);

  _.extend(context, {
    target: target,
    connection: connection
  });

  return target;
};

/**
 * Undo append operation
 */
AppendShapeHandler.prototype.revert = function(context) {
  this.removeConnection(context.connection);
  this.removeShape(context.target);
};

/**
 * Create a new shape at the given position.
 *
 * @param  {djs.model.Shape} source
 * @param  {Point} position
 * @param  {Object} context
 *
 * @return {djs.model.Shape}
 */
AppendShapeHandler.prototype.createShape = function(source, position, context) {
  throw new Error('subclass responsibility');
};

AppendShapeHandler.prototype.createConnection = function(source, target, context) {
  throw new Error('subclass responsibility');
};

AppendShapeHandler.prototype.removeShape = function(shape) {
  throw new Error('subclass responsibility');
};

AppendShapeHandler.prototype.removeConnection = function(connection) {
  throw new Error('subclass responsibility');
};

AppendShapeHandler.prototype.canExecute = function(context) {
  return true;
};