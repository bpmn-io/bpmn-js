'use strict';

var _ = require('lodash');

var BpmnModdle = require('bpmn-moddle');

var Collections = require('diagram-js/lib/util/Collections');


function BpmnFactory() {
  this._model = BpmnModdle.instance();
  this._uuid = 1;
}

BpmnFactory.$inject = [ ];


BpmnFactory.prototype._needsId = function(element) {
  return element.$instanceOf('bpmn:RootElement') ||
         element.$instanceOf('bpmn:FlowElement') ||
         element.$instanceOf('bpmn:Artifact') ||
         element.$instanceOf('bpmndi:BPMNShape') ||
         element.$instanceOf('bpmndi:BPMNEdge') ||
         element.$instanceOf('bpmndi:BPMNDiagram') ||
         element.$instanceOf('bpmndi:BPMNPlane');
};

BpmnFactory.prototype._ensureId = function(element) {
  if (!element.id && this._needsId(element)) {
    element.id = '' + (++this._uuid);
  }
};


BpmnFactory.prototype.create = function(type, attrs) {
  var element = this._model.create(type, attrs || {});

  this._ensureId(element);

  return element;
};


BpmnFactory.prototype.createDiShape = function(semantic, position, attrs) {

  position = position || { x: 0, y: 0 };

  var bounds;

  if (semantic.$instanceOf('bpmn:Task')) {
    bounds = { width: 100, height: 80 };
  } else {
    bounds = { width: 36, height: 36 };
  }

  _.extend(bounds, {
    x: (position.x || 0) - bounds.width / 2,
    y: (position.y || 0) - bounds.height / 2
  });

  return this.create('bpmndi:BPMNShape', _.extend({
    bpmnElement: semantic,
    bounds: this.createDiBounds(bounds)
  }, attrs));
};


BpmnFactory.prototype.createDiBounds = function(bounds) {
  return this.create('dc:Bounds', bounds);
};


BpmnFactory.prototype.createDiWaypoint = function(point) {
  return this.create('dc:Point', point);
};


BpmnFactory.prototype.createDiEdge = function(sequenceFlow, points, attrs) {

  var waypoints = _.map(points, function(pos) {
    return this.createDiWaypoint(pos);
  }, this);

  return this.create('bpmndi:BPMNEdge', _.extend({
    bpmnElement: sequenceFlow,
    waypoint: waypoints
  }, attrs));
};


BpmnFactory.prototype.disconnectSequenceFlow = function(sequenceFlow) {
  Collections.remove(sequenceFlow.sourceRef && sequenceFlow.sourceRef.get('outgoing'), sequenceFlow);
  Collections.remove(sequenceFlow.targetRef && sequenceFlow.targetRef.get('incoming'), sequenceFlow);

  _.extend(sequenceFlow, {
    sourceRef: null,
    targetRef: null
  });
};


BpmnFactory.prototype.connectSequenceFlow = function(sequenceFlow, source, target) {

  _.extend(sequenceFlow, {
    sourceRef: source,
    targetRef: target
  });

  source.get('outgoing').push(sequenceFlow);
  target.get('incoming').push(sequenceFlow);
};


module.exports = BpmnFactory;