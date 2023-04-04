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

/**
 * @typedef {import('../../BaseModeler').Moddle} Moddle
 * @typedef {import('../../BaseViewer').ModdleElement} ModdleElement
 *
 * @typedef {import('diagram-js/lib/util/Types').Point} Point
 */

/**
 * @param {Moddle} moddle
 */
export default function BpmnFactory(moddle) {
  this._model = moddle;
}

BpmnFactory.$inject = [ 'moddle' ];

/**
 * @param {ModdleElement} element
 *
 * @returns {boolean}
 */
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

/**
 * @param {ModdleElement} element
 */
BpmnFactory.prototype._ensureId = function(element) {
  if (element.id) {
    this._model.ids.claim(element.id, element);
    return;
  }

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

/**
 * Create BPMN element.
 *
 * @param {string} type
 * @param {Object} [attrs]
 *
 * @returns {ModdleElement}
 */
BpmnFactory.prototype.create = function(type, attrs) {
  var element = this._model.create(type, attrs || {});

  this._ensureId(element);

  return element;
};

/**
 * @returns {ModdleElement}
 */
BpmnFactory.prototype.createDiLabel = function() {
  return this.create('bpmndi:BPMNLabel', {
    bounds: this.createDiBounds()
  });
};

/**
 * @returns {ModdleElement}
 */
BpmnFactory.prototype.createDiShape = function(semantic, attrs) {
  return this.create('bpmndi:BPMNShape', assign({
    bpmnElement: semantic,
    bounds: this.createDiBounds()
  }, attrs));
};

/**
 * @returns {ModdleElement}
 */
BpmnFactory.prototype.createDiBounds = function(bounds) {
  return this.create('dc:Bounds', bounds);
};

/**
 * @param {Point[]} waypoints
 *
 * @returns {ModdleElement[]}
 */
BpmnFactory.prototype.createDiWaypoints = function(waypoints) {
  var self = this;

  return map(waypoints, function(pos) {
    return self.createDiWaypoint(pos);
  });
};

/**
 * @param {Point} point
 *
 * @returns {ModdleElement}
 */
BpmnFactory.prototype.createDiWaypoint = function(point) {
  return this.create('dc:Point', pick(point, [ 'x', 'y' ]));
};

/**
 * @param {ModdleElement} semantic
 * @param {Object} attrs
 *
 * @returns {ModdleElement}
 */
BpmnFactory.prototype.createDiEdge = function(semantic, attrs) {
  return this.create('bpmndi:BPMNEdge', assign({
    bpmnElement: semantic,
    waypoint: this.createDiWaypoints([])
  }, attrs));
};

/**
 * @param {ModdleElement} semantic
 * @param {Object} attrs
 *
 * @returns {ModdleElement}
 */
BpmnFactory.prototype.createDiPlane = function(semantic, attrs) {
  return this.create('bpmndi:BPMNPlane', assign({
    bpmnElement: semantic
  }, attrs));
};