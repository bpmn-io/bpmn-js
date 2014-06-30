'use strict';

var _ = require('lodash');

var BpmnModdle = require('bpmn-moddle');



function BpmnFactory() {
  this._model = BpmnModdle.instance();
  this._uuid = 1;
}

BpmnFactory.$inject = [ ];


BpmnFactory.prototype._ensureId = function(element) {
  if (element.id === undefined) {
    element.id = '' + (++this._uuid);
  }
};

BpmnFactory.prototype.create = function(type, attrs) {
  var element = this._model.create(type, attrs);

  this._ensureId(element);

  return element;
};

BpmnFactory.prototype.createDiShape = function(semantic, position, attrs) {

  position = position || { x: 0, y: 0 };

  var bounds;

  if (semantic.$instanceOf('bpmn:Task')) {
    bounds = { width: 100, height: 80 };
  } else {
    bounds = { width: 50, height: 50 };
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

  var sourceDi = sequenceFlow.sourceRef.di,
      targetDi = sequenceFlow.targetRef.di;

  var waypoints = _.map(points, function(pos) {
    return this.createDiWaypoint(pos);
  }, this);

  return this.create('bpmndi:BPMNEdge', _.extend({
    bpmnElement: sequenceFlow,
    waypoint: waypoints
  }, attrs));
};

BpmnFactory.prototype.createSequenceFlow = function(source, target, attrs) {

  var sequenceFlow = this.create('bpmn:SequenceFlow', _.extend({
    sourceRef: source,
    targetRef: target
  }, attrs));

  source.get('outgoing').push(sequenceFlow);
  target.get('incoming').push(sequenceFlow);

  return sequenceFlow;
};


module.exports = BpmnFactory;