'use strict';

var _ = require('lodash');

var Collections = require('diagram-js/lib/util/Collections');


/**
 * A handler responsible for updating the underlying BPMN 2.0 XML + DI
 * once changes on the diagram happen
 */
function BpmnUpdater(eventBus, bpmnFactory, connectionDocking) {

  this._eventBus = eventBus;
  this._bpmnFactory = bpmnFactory;

  var self = this;



  ////// connection cropping /////////////////////////

  // crop connection ends during create/update
  function cropConnection(e) {
    var context = e.context,
        connection;

    if (!context.cropped) {
      connection = context.connection;
      connection.waypoints = connectionDocking.getCroppedWaypoints(connection);
      context.cropped = true;
    }
  }

  this.executed([ 'connection.layout', 'connection.create' ], cropConnection);

  this.reverted([ 'connection.layout' ], function(e) {
    delete e.context.cropped;
  });



  ////// BPMN + DI update /////////////////////////


  // update parent
  function updateShapeParent(e) {
    self.updateShapeParent(e.context.shape || e.context.connection);
  }

  this.executed([ 'shape.move',
                  'shape.create',
                  'shape.delete',
                  'connection.create',
                  'connection.delete' ], updateShapeParent);
  this.reverted([ 'shape.move',
                  'shape.create',
                  'shape.delete',
                  'connection.create',
                  'connection.delete' ], updateShapeParent);


  // update bounds
  function updateBounds(e) {
    self.updateBounds(e.context.shape);
  }

  this.executed([ 'shape.move', 'shape.create' ], updateBounds);
  this.reverted([ 'shape.move', 'shape.create' ], updateBounds);


  // attach / detach connection
  function updateConnection(e) {
    self.updateConnection(e.context.connection);
  }

  this.executed([ 'connection.create', 'connection.move', 'connection.delete' ], updateConnection);
  this.reverted([ 'connection.create', 'connection.move', 'connection.delete' ], updateConnection);


  // update waypoints
  function updateConnectionWaypoints(e) {
    self.updateConnectionWaypoints(e.context.connection);
  }

  this.executed([ 'connection.layout', 'connection.move' ], updateConnectionWaypoints);
  this.reverted([ 'connection.layout', 'connection.move' ], updateConnectionWaypoints);
}

module.exports = BpmnUpdater;

BpmnUpdater.$inject = [ 'eventBus', 'bpmnFactory', 'connectionDocking'];


/////// implementation //////////////////////////////////


BpmnUpdater.prototype.updateShapeParent = function(shape) {
  var parentShape = shape.parent;

  var businessObject = shape.businessObject,
      parentBusinessObject = parentShape && parentShape.businessObject,
      parentDi = parentBusinessObject && parentBusinessObject.di;

  this.updateSemanticParent(businessObject, parentBusinessObject);

  this.updateDiParent(businessObject.di, parentDi);
};


BpmnUpdater.prototype.updateBounds = function(shape) {

  var di = shape.businessObject.di;

  var bounds = shape.type === 'label' ? this._getLabel(di).bounds : di.bounds;

  _.extend(bounds, {
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height
  });
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


BpmnUpdater.prototype.updateConnectionWaypoints = function(connection) {
  connection.businessObject.di.set('waypoint', this._bpmnFactory.createDiWaypoints(connection.waypoints));
};


BpmnUpdater.prototype.updateConnection = function(connection) {

  var businessObject = connection.businessObject,
      newSource = connection.source && connection.source.businessObject,
      newTarget = connection.target && connection.target.businessObject;

  var inverseSet = businessObject.$instanceOf('bpmn:SequenceFlow');

  if (businessObject.sourceRef !== newSource) {
    if (inverseSet) {
      Collections.remove(businessObject.sourceRef && businessObject.sourceRef.get('outgoing'), businessObject);

      if (newSource) {
        newSource.get('outgoing').push(businessObject);
      }
    }

    businessObject.sourceRef = newSource;
  }
  if (businessObject.targetRef !== newTarget) {
    if (inverseSet) {
      Collections.remove(businessObject.targetRef && businessObject.targetRef.get('incoming'), businessObject);

      if (newTarget) {
        newTarget.get('incoming').push(businessObject);
      }
    }

    businessObject.targetRef = newTarget;
  }

  businessObject.di.set('waypoint', this._bpmnFactory.createDiWaypoints(connection.waypoints));
};


/////// helpers /////////////////////////////////////////

BpmnUpdater.prototype._getLabel = function(di) {
  if (!di.label) {
    di.label = this._bpmnFactory.createDiLabel();
  }

  return di.label;
};

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
