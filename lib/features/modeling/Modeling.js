'use strict';

var _ = require('lodash');

var model = require('../../model');

/**
 * The basic modeling entry point.
 *
 * @param {EventBus} eventBus
 * @param {ElementFactory} elementFactory
 * @param {CommandStack} commandStack
 */
function Modeling(eventBus, elementFactory, commandStack) {
  this._eventBus = eventBus;
  this._elementFactory = elementFactory;
  this._commandStack = commandStack;

  var self = this;

  eventBus.on('diagram.init', function() {
    // register modeling handlers
    self.registerHandlers(commandStack);
  });
}

Modeling.$inject = [ 'eventBus', 'elementFactory', 'commandStack' ];

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
  commandStack.registerHandler('shapes.move', require('./cmd/MoveShapesHandler'));
  commandStack.registerHandler('shape.resize', require('./cmd/ResizeShapeHandler'));

  commandStack.registerHandler('shape.append', require('./cmd/AppendShapeHandler'));

  commandStack.registerHandler('label.create', require('./cmd/CreateLabelHandler'));

  commandStack.registerHandler('connection.create', require('./cmd/CreateConnectionHandler'));
  commandStack.registerHandler('connection.delete', require('./cmd/DeleteConnectionHandler'));
  commandStack.registerHandler('connection.move', require('./cmd/MoveConnectionHandler'));
  commandStack.registerHandler('connection.layout', require('./cmd/LayoutConnectionHandler'));
};



///// modeling helpers /////////////////////////////////////////


Modeling.prototype.moveShape = function(shape, delta, newParent, hints) {

  var context = {
    shape: shape,
    delta:  delta,
    newParent: newParent,
    hints: hints || {}
  };

  this._commandStack.execute('shape.move', context);
};


Modeling.prototype.moveShapes = function(shapes, delta, newParent, hints) {

  var context = {
    shapes: shapes,
    delta: delta,
    newParent: newParent,
    hints: hints || {}
  };

  this._commandStack.execute('shapes.move', context);
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


Modeling.prototype.createConnection = function(source, target, connection, parent) {

  connection = this._create('connection', connection);

  var context = {
    source: source,
    target: target,
    parent: parent,
    connection: connection
  };

  this._commandStack.execute('connection.create', context);

  return context.connection;
};


Modeling.prototype.createShape = function(shape, position, parent) {

  shape = this._create('shape', shape);

  var context = {
    position: position,
    parent: parent,
    shape: shape
  };

  this._commandStack.execute('shape.create', context);

  return context.shape;
};


Modeling.prototype.createLabel = function(labelTarget, position, label, parent) {

  label = this._create('label', label);

  var context = {
    labelTarget: labelTarget,
    position: position,
    parent: parent,
    shape: label
  };

  this._commandStack.execute('label.create', context);

  return context.shape;
};


Modeling.prototype.appendShape = function(source, shape, position, parent, connection, connectionParent) {

  shape = this._create('shape', shape);

  var context = {
    source: source,
    position: position,
    parent: parent,
    shape: shape,
    connection: connection,
    connectionParent: connectionParent
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

Modeling.prototype.resizeShape = function(shape, newBounds) {
  var context = {
    shape: shape,
    newBounds: newBounds
  };

  this._commandStack.execute('shape.resize', context);
};

Modeling.prototype.connect = function(source, target, attrs) {
  return this.createConnection(source, target, attrs || {}, source.parent);
};


Modeling.prototype._create = function(type, attrs) {
  if (attrs instanceof model.Base) {
    return attrs;
  } else {
    return this._elementFactory.create(type, attrs);
  }
};