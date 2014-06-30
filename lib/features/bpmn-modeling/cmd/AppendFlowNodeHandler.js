'use strict';

var LayoutUtil = require('../LayoutUtil');

var AppendShapeHandler = require('diagram-js/lib/features/modeling/cmd/AppendShapeHandler');

var Refs = require('object-refs');

var diRefs = new Refs({ name: 'bpmnElement', enumerable: true }, { name: 'di' });


function AppendFlowNodeHandler(canvas, bpmnFactory, bpmnImporter) {
  AppendShapeHandler.call(this);

  this._bpmnImporter = bpmnImporter;
  this._bpmnFactory = bpmnFactory;

  this._canvas = canvas;
}

AppendFlowNodeHandler.prototype = Object.create(AppendShapeHandler.prototype);

AppendFlowNodeHandler.$inject = [ 'canvas', 'bpmnFactory', 'bpmnImporter' ];


AppendFlowNodeHandler.prototype.createShape = function(source, position, parent, context) {

  var sourceSemantic = source.businessObject,
      parentSemantic = parent.businessObject;

  var target = context.target,
      targetSemantic,
      targetDi;

  // create semantic
  targetSemantic = this._bpmnFactory.create(context.type, {
    id: target && target.businessObject.id
  });

  // add to model
  parentSemantic.get('flowElements').push(targetSemantic);
  targetSemantic.$parent = parentSemantic;

  // create di
  targetDi = this._bpmnFactory.createDiShape(targetSemantic, position, {
    id: targetSemantic.id + '_di'
  });

  diRefs.bind(targetSemantic, 'di');
  targetSemantic.di = targetDi;

  // add to model
  sourceSemantic.di.$parent.get('planeElement').push(targetDi);
  targetDi.$parent = sourceSemantic.di.$parent;

  return this._bpmnImporter.add(targetSemantic, parent);
};


AppendFlowNodeHandler.prototype.createConnection = function(source, target, parent, context) {

  var sourceSemantic = source.businessObject,
      targetSemantic = target.businessObject,
      parentSemantic = parent.businessObject;

  var flowSemantic,
      flowDi;

  var connection = context.connection;

  // create semantic
  flowSemantic = this._bpmnFactory.createSequenceFlow(sourceSemantic, targetSemantic, {
    id: connection && connection.businessObject.id
  });

  // add to model
  parentSemantic.get('flowElements').push(flowSemantic);
  flowSemantic.$parent = parentSemantic;

  // create di
  var waypoints = LayoutUtil.getDirectConnectionPoints(sourceSemantic.di.bounds, targetSemantic.di.bounds);

  flowDi = this._bpmnFactory.createDiEdge(flowSemantic, waypoints, {
    id: flowSemantic.id + '_di'
  });

  diRefs.bind(flowSemantic, 'di');
  flowSemantic.di = flowDi;

  // add to model
  sourceSemantic.di.$parent.get('planeElement').push(flowDi);
  flowDi.$parent = sourceSemantic.di.$parent;

  return this._bpmnImporter.add(flowSemantic, parent);
};


AppendFlowNodeHandler.prototype.removeShape = function(shape) {

  var semantic = shape.businessObject,
      parentSemantic = semantic.$parent;

  // remove semantic
  parentSemantic.get('flowElements').splice(parentSemantic.get('flowElements').indexOf(semantic), 1);
  semantic.$parent = null;

  // remove di
  var di = semantic.di;
  di.$parent.get('planeElement').splice(di.$parent.get('planeElement').indexOf(di), 1);
  di.$parent = null;

  // actual remove shape
  return this._canvas.removeShape(shape);
};


AppendFlowNodeHandler.prototype.removeConnection = function(connection) {

  var semantic = connection.businessObject,
      parentSemantic = semantic.$parent;

  // remove semantic
  parentSemantic.get('flowElements').splice(parentSemantic.get('flowElements').indexOf(semantic), 1);

  // remove di
  var di = semantic.di;
  di.$parent.get('planeElement').splice(di.$parent.get('planeElement').indexOf(di), 1);
  di.$parent = null;

  // remove refs in source / target
  semantic.sourceRef.outgoing.splice(semantic.sourceRef.outgoing.indexOf(semantic), 1);
  semantic.targetRef.incoming.splice(semantic.targetRef.incoming.indexOf(semantic), 1);

  semantic.sourceRef = null;
  semantic.targetRef = null;
  semantic.$parent = null;

  // actual remove connection
  return this._canvas.removeConnection(connection);
};

module.exports = AppendFlowNodeHandler;