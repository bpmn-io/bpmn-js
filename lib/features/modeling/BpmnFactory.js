import {
  map,
  assign,
  pick
} from 'min-dash';

import {
  isAny
} from './util/ModelingUtil';

import {
  is
} from '../../util/ModelUtil';


export default function BpmnFactory(moddle) {
  this._model = moddle;
}

BpmnFactory.$inject = [ 'moddle' ];


BpmnFactory.prototype._needsId = function(element) {
  return isAny(element, [
    'bpmn:RootElement',
    'bpmn:FlowElement',
    'bpmn:MessageFlow',
    'bpmn:DataAssociation',
    'bpmn:Artifact',
    'bpmn:Participant',
    'bpmn:Lane',
    'bpmn:LaneSet',
    'bpmn:Process',
    'bpmn:Collaboration',
    'bpmndi:BPMNShape',
    'bpmndi:BPMNEdge',
    'bpmndi:BPMNDiagram',
    'bpmndi:BPMNPlane',
    'bpmn:Property',
    'bpmn:CategoryValue'
  ]);
};

BpmnFactory.prototype._ensureId = function(element) {

  // generate semantic ids for elements
  // bpmn:SequenceFlow -> SequenceFlow_ID
  var prefix;

  if (is(element, 'bpmn:Activity')) {
    prefix = 'Activity';
  } else if (is(element, 'bpmn:Event')) {
    prefix = 'Event';
  } else if (is(element, 'bpmn:Gateway')) {
    prefix = 'Gateway';
  } else if (isAny(element, [ 'bpmn:SequenceFlow', 'bpmn:MessageFlow' ])) {
    prefix = 'Flow';
  } else {
    prefix = (element.$type || '').replace(/^[^:]*:/g, '');
  }

  prefix += '_';

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
  var self = this;

  return map(waypoints, function(pos) {
    return self.createDiWaypoint(pos);
  });
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