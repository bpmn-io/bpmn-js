'use strict';

var LayoutUtil = require('../LayoutUtil'),
    Collections = require('diagram-js/lib/util/Collections');

var hasExternalLabel = require('../../../util/Label').hasExternalLabel;

var AppendShapeHandler = require('diagram-js/lib/features/modeling/cmd/AppendShapeHandler');

var Refs = require('object-refs');

var diRefs = new Refs({ name: 'bpmnElement', enumerable: true }, { name: 'di' });


function AppendFlowNodeHandler(canvas, bpmnFactory, bpmnImporter, elementFactory) {
  AppendShapeHandler.call(this);

  this._canvas = canvas;

  this._bpmnFactory = bpmnFactory;
  this._bpmnImporter = bpmnImporter;
  this._elementFactory = elementFactory;
}

AppendFlowNodeHandler.prototype = Object.create(AppendShapeHandler.prototype);

AppendFlowNodeHandler.$inject = [ 'canvas', 'bpmnFactory', 'bpmnImporter', 'elementFactory' ];


AppendFlowNodeHandler.prototype.createShape = function(source, position, parent, context) {

  var bpmnFactory = this._bpmnFactory,
      elementFactory = this._elementFactory,
      canvas = this._canvas;

  var sourceSemantic = source.businessObject,
      parentSemantic = parent.businessObject;

  var target = context.target,
      targetSemantic,
      targetDi;

  // we need to create shape + bpmn elements
  if (!target) {
    // create semantic
    targetSemantic = bpmnFactory.create(context.type);

    // create di
    targetDi = bpmnFactory.createDiShape(targetSemantic, position, {
      id: targetSemantic.id + '_di'
    });

    // bind semantic -> di -> semantic
    diRefs.bind(targetSemantic, 'di');
    targetSemantic.di = targetDi;

    // create node
    target = elementFactory.createShape(targetSemantic);

    // add label
    if (hasExternalLabel(targetSemantic)) {
      target.label = elementFactory.createLabel(targetSemantic, target);
    }
  }

  // load di + semantic from target
  else {
    targetSemantic = target.businessObject;
    targetDi = targetSemantic.di;
  }

  // reconnect everything

  // wire semantic
  parentSemantic.get('flowElements').push(targetSemantic);
  targetSemantic.$parent = parentSemantic;

  // wire di
  sourceSemantic.di.$parent.get('planeElement').push(targetDi);
  targetDi.$parent = sourceSemantic.di.$parent;

  canvas.addShape(target, parent);

  if (target.label) {
    canvas.addShape(target.label, parent);
  }

  return target;
};


AppendFlowNodeHandler.prototype.createConnection = function(source, target, parent, context) {

  var bpmnFactory = this._bpmnFactory,
      elementFactory = this._elementFactory,
      canvas = this._canvas;

  var sourceSemantic = source.businessObject,
      targetSemantic = target.businessObject,
      parentSemantic = parent.businessObject;

  var connection = context.connection,
      connectionSemantic,
      connectionDi;


  // we need to create connection + bpmn elements
  if (!connection) {

    // create semantic
    connectionSemantic = bpmnFactory.create('bpmn:SequenceFlow');

    // create di
    var waypoints = LayoutUtil.getDirectConnectionPoints(sourceSemantic.di.bounds, targetSemantic.di.bounds);

    connectionDi = bpmnFactory.createDiEdge(connectionSemantic, waypoints, {
      id: connectionSemantic.id + '_di'
    });

    // bind semantic -> di -> semantic
    diRefs.bind(connectionSemantic, 'di');
    connectionSemantic.di = connectionDi;

    // create connection
    connection = elementFactory.createConnection(connectionSemantic);

    // add label
    if (hasExternalLabel(connectionSemantic)) {
      connection.label = elementFactory.createLabel(connectionSemantic, connection);
    }
  }

  // load di + semantic from target
  else {
    connectionSemantic = connection.businessObject;
    connectionDi = connectionSemantic.di;
  }

  // connect
  bpmnFactory.connectSequenceFlow(connectionSemantic, sourceSemantic, targetSemantic);

  // TODO(nre): connect connection

  // wire semantic
  parentSemantic.get('flowElements').push(connectionSemantic);
  connectionSemantic.$parent = parentSemantic;

  // wire di
  sourceSemantic.di.$parent.get('planeElement').push(connectionDi);
  connectionDi.$parent = sourceSemantic.di.$parent;

  canvas.addConnection(connection, parent);

  if (connection.label) {
    canvas.addShape(connection.label, parent);
  }

  return connection;
};


AppendFlowNodeHandler.prototype.removeShape = function(shape) {

  var semantic = shape.businessObject,
      di = semantic.di,
      parentSemantic = semantic.$parent;

  // undo wire semantic
  parentSemantic.get('flowElements').splice(parentSemantic.get('flowElements').indexOf(semantic), 1);
  semantic.$parent = null;

  // undo wire di
  di.$parent.get('planeElement').splice(di.$parent.get('planeElement').indexOf(di), 1);
  di.$parent = null;

  // remove label
  if (shape.label) {
    this._canvas.removeShape(shape.label);
  }

  // actual remove shape
  return this._canvas.removeShape(shape);
};


AppendFlowNodeHandler.prototype.removeConnection = function(connection) {

  var semantic = connection.businessObject,
      di = semantic.di,
      parentSemantic = semantic.$parent;

  // undo wire semantic
  Collections.remove(parentSemantic.get('flowElements'), semantic);
  semantic.$parent = null;

  // undo wire di
  Collections.remove(di.$parent.get('planeElement'), di);
  di.$parent = null;

  // undo wire refs
  this._bpmnFactory.disconnectSequenceFlow(semantic);

  // TODO(nre): disconnect connection


  // remove label
  if (connection.label) {
    this._canvas.removeShape(connection.label);
  }

  // actual remove connection
  return this._canvas.removeConnection(connection);
};

module.exports = AppendFlowNodeHandler;