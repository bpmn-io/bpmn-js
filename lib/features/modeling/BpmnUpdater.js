'use strict';

var _ = require('lodash');

var Collections = require('diagram-js/lib/util/Collections');


/**
 * A handler responsible for updating the underlying BPMN 2.0 XML + DI
 * once changes on the diagram happen
 */
function BpmnUpdater(eventBus, bpmnFactory) {

  this._eventBus = eventBus;
  this._bpmnFactory = bpmnFactory;

  var self = this;

  this.executed('shape.create', function(e) {
    self.createShapeDi(e.context.shape);
  });

  this.executed('connection.create', function(e) {
    self.createConnectionDi(e.context.connection);
  });


  function updateShapeParent(e) {
    self.updateShapeParent(e.context.shape || e.context.connection);
  }

  this.executed([ 'shape.move', 'shape.create', 'connection.create' ], updateShapeParent);
  this.reverted([ 'shape.move', 'shape.create', 'connection.create' ], updateShapeParent);


  function updateConnection(e) {
    self.updateConnection(e.context.connection);
  }

  this.executed([ 'connection.create' ], updateConnection);
  this.reverted([ 'connection.create' ], updateConnection);
}

module.exports = BpmnUpdater;

BpmnUpdater.$inject = [ 'eventBus', 'bpmnFactory' ];


/////// implementation //////////////////////////////////

BpmnUpdater.prototype.createShapeDi = function(shape) {

  var businessObject = shape.businessObject;
  if (!businessObject.di) {
    businessObject.di = this._bpmnFactory.createDiShape(businessObject, shape, {
      id: businessObject.id + '_di'
    });
  }
};

BpmnUpdater.prototype.createConnectionDi = function(connection) {
  var businessObject = connection.businessObject;
  if (!businessObject.di) {
    businessObject.di = this._bpmnFactory.createDiEdge(businessObject, connection.waypoints, {
      id: businessObject.id + '_di'
    });
  }
};

BpmnUpdater.prototype.updateShapeParent = function(shape) {
  var parentShape = shape.parent;

  var businessObject = shape.businessObject,
      parentBusinessObject = parentShape && parentShape.businessObject,
      parentDi = parentBusinessObject && parentBusinessObject.di;

  this.updateSemanticParent(businessObject, parentBusinessObject);

  this.updateDiParent(businessObject.di, parentDi);
};

BpmnUpdater.prototype.updateDiParent = function(di, parentDi) {

  if (parentDi && !parentDi.$instanceOf('bpmndi:BPMNPlane')) {
    parentDi = parentDi.$parent;
  }

  if (di.$parent === parentDi) {
    return;
  }

  var planeElements = (parentDi || di.$parent).get('planeElement');

  if (parentDi) {
    planeElements.push(di);
    di.$parent = parentDi;
  } else {
    Collections.remove(planeElements, di);
    di.$parent = null;
  }
};


BpmnUpdater.prototype.updateSemanticParent = function(businessObject, newParent) {

  if (businessObject.$parent === newParent) {
    return;
  }

  var children;

  if (businessObject.$parent) {
    // remove from old parent
    children = businessObject.$parent.get('flowElements');
    Collections.remove(children, businessObject);
  }

  if (!newParent) {
    businessObject.$parent = null;
  } else {
    // add to new parent
    children = newParent.get('flowElements');
    children.push(businessObject);
    businessObject.$parent = newParent;
  }
};


BpmnUpdater.prototype.updateConnection = function(connection) {

  var businessObject = connection.businessObject,
      newSource = connection.source && connection.source.businessObject,
      newTarget = connection.target && connection.target.businessObject;

  if (businessObject.sourceRef !== newSource) {
    Collections.remove(businessObject.sourceRef && businessObject.sourceRef.get('outgoing'), businessObject);

    if (newSource) {
      newSource.get('outgoing').push(businessObject);
    }

    businessObject.sourceRef = newSource;
  }

  if (businessObject.targetRef !== newTarget) {
    Collections.remove(businessObject.targetRef && businessObject.targetRef.get('incoming'), businessObject);

    if (newTarget) {
      newTarget.get('incoming').push(businessObject);
    }

    businessObject.targetRef = newTarget;
  }

  businessObject.di.set('waypoint', this._bpmnFactory.createDiWaypoints(connection.waypoints));
};


/////// helpers /////////////////////////////////////////


BpmnUpdater.prototype.pre = function(commands, callback) {
  this.on(commands, 'preExecute', callback);
};

BpmnUpdater.prototype.executed = function(commands, callback) {
  this.on(commands, 'executed', callback);
};

BpmnUpdater.prototype.reverted = function(commands, callback) {
  this.on(commands, 'reverted', callback);
};

BpmnUpdater.prototype.on = function(commands, suffix, callback) {

  commands = _.isArray(commands) ? commands : [ commands ];

  _.forEach(commands, function(c) {
    this._eventBus.on('commandStack.' + c + '.' + suffix, callback);
  }, this);
};
