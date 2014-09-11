'use strict';

var _ = require('lodash');


/**
 * The basic modeling entry point.
 *
 * @param {EventBus} eventBus
 * @param {CommandStack} commandStack
 */
function Modeling(eventBus, commandStack) {
  this._commandStack = commandStack;
  this._eventBus = eventBus;

  var self = this;

  eventBus.on('diagram.init', function() {
    // register modeling handlers
    self.registerHandlers(commandStack);
  });
}

module.exports = Modeling;


/**
 * Register handlers with the command stack
 *
 * @param {CommandStack} commandStack
 */
Modeling.prototype.registerHandlers = function(commandStack) {
  commandStack.registerHandler('shape.create', require('./cmd/CreateShapeHandler'));
  commandStack.registerHandler('shape.delete', require('./cmd/DeleteShapeHandler'));
  commandStack.registerHandler('shape.move', require('./cmd/MoveShapeHandler'));

  commandStack.registerHandler('shape.append', require('./cmd/AppendShapeHandler'));

  commandStack.registerHandler('label.create', require('./cmd/CreateLabelHandler'));

  commandStack.registerHandler('connection.create', require('./cmd/CreateConnectionHandler'));
  commandStack.registerHandler('connection.delete', require('./cmd/DeleteConnectionHandler'));
  commandStack.registerHandler('connection.move', require('./cmd/MoveConnectionHandler'));
  commandStack.registerHandler('connection.layout', require('./cmd/LayoutConnectionHandler'));
};



///// modeling helpers /////////////////////////////////////////


Modeling.prototype.createConnection = function(source, target, attrs, parent) {

  var context = {
    source: source,
    target: target,
    parent: parent,
    attrs: attrs
  };

  this._commandStack.execute('connection.create', context);

  return context.connection;
};


Modeling.prototype.moveShape = function(shape, delta, newParent, hints) {

  var context = {
    shape: shape,
    delta: delta,
    newParent: newParent,
    hints: hints || {}
  };

  this._commandStack.execute('shape.move', context);
};


Modeling.prototype.moveConnection = function(connection, delta, newParent) {

  var context = {
    connection: connection,
    delta: delta,
    newParent: newParent
  };

  this._commandStack.execute('connection.move', context);
};


Modeling.prototype.layoutConnection = function(connection) {

  var context = {
    connection: connection
  };

  this._commandStack.execute('connection.layout', context);
};


Modeling.prototype.createShape = function(attrs, position, parent) {

  var context = {
    attrs: attrs,
    position: position,
    parent: parent
  };

  this._commandStack.execute('shape.create', context);

  return context.shape;
};


Modeling.prototype.createLabel = function(labelTarget, position, attrs, parent) {

  var context = {
    labelTarget: labelTarget,
    position: position,
    attrs: attrs,
    parent: parent
  };

  this._commandStack.execute('label.create', context);

  return context.shape;
};


Modeling.prototype.appendShape = function(source, attrs, position, parent, connection) {

  var context = {
    source: source,
    attrs: attrs,
    position: position,
    parent: parent,
    connection: connection || {}
  };

  this._commandStack.execute('shape.append', context);

  return context.shape;
};


Modeling.prototype.removeShape = function(shape) {
  var context = {
    shape: shape
  };

  this._commandStack.execute('shape.delete', context);
};


Modeling.prototype.removeConnection = function(connection) {
  var context = {
    connection: connection
  };

  this._commandStack.execute('connection.delete', context);
};

/**
 * Returns whether or not two elements can be connected via {@link #connect}.
 *
 * @param  {djs.model.Base} source
 * @param  {djs.model.Base} target
 * @return {Boolean}        false to indicate no, true to indicate yes and null to indicate ignore
 */
Modeling.prototype.canConnect = function(source, target) {
  return source.parent === target.parent;
};


Modeling.prototype.connect = function(source, target, attrs) {
  return this.createConnection(source, target, attrs || {}, source.parent);
};
