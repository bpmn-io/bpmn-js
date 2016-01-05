'use strict';

var map = require('lodash/collection/map'),
    assign = require('lodash/object/assign'),
    pick = require('lodash/object/pick');


function BpmnFactory(moddle) {
  this._model = moddle;
}

BpmnFactory.$inject = [ 'moddle' ];


BpmnFactory.prototype._needsId = function(element) {
  return element.$instanceOf('bpmn:RootElement') ||
         element.$instanceOf('bpmn:FlowElement') ||
         element.$instanceOf('bpmn:MessageFlow') ||
         element.$instanceOf('bpmn:DataAssociation') ||
         element.$instanceOf('bpmn:Artifact') ||
         element.$instanceOf('bpmn:Participant') ||
         element.$instanceOf('bpmn:Lane') ||
         element.$instanceOf('bpmn:Process') ||
         element.$instanceOf('bpmn:Collaboration') ||
         element.$instanceOf('bpmndi:BPMNShape') ||
         element.$instanceOf('bpmndi:BPMNEdge') ||
         element.$instanceOf('bpmndi:BPMNDiagram') ||
         element.$instanceOf('bpmndi:BPMNPlane') ||
         element.$instanceOf('bpmn:Property');
};

BpmnFactory.prototype._ensureId = function(element) {

  // generate semantic ids for elements
  // bpmn:SequenceFlow -> SequenceFlow_ID
  var prefix = (element.$type || '').replace(/^[^:]*:/g, '') + '_';

  if (!element.id && this._needsId(element)) {
    element.id = this._model.ids.nextPrefixed(prefix, element);
  }
};


BpmnFactory.prototype.create = function(type, attrs) {
  var element = this._model.create(type, attrs || {});

  this._ensureId(element);

  return element;
};


BpmnFactory.prototype.createDiLabel = function() {
  return this.create('bpmndi:BPMNLabel', {
    bounds: this.createDiBounds()
  });
};


BpmnFactory.prototype.createDiShape = function(semantic, bounds, attrs) {

  return this.create('bpmndi:BPMNShape', assign({
    bpmnElement: semantic,
    bounds: this.createDiBounds(bounds)
  }, attrs));
};


BpmnFactory.prototype.createDiBounds = function(bounds) {
  return this.create('dc:Bounds', bounds);
};


BpmnFactory.prototype.createDiWaypoints = function(waypoints) {
  return map(waypoints, function(pos) {
    return this.createDiWaypoint(pos);
  }, this);
};

BpmnFactory.prototype.createDiWaypoint = function(point) {
  return this.create('dc:Point', pick(point, [ 'x', 'y' ]));
};


BpmnFactory.prototype.createDiEdge = function(semantic, waypoints, attrs) {
  return this.create('bpmndi:BPMNEdge', assign({
    bpmnElement: semantic
  }, attrs));
};

BpmnFactory.prototype.createDiPlane = function(semantic) {
  return this.create('bpmndi:BPMNPlane', {
    bpmnElement: semantic
  });
};

module.exports = BpmnFactory;
