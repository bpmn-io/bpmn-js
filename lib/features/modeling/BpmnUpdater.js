'use strict';

var assign = require('lodash/object/assign'),
    inherits = require('inherits');

var Collections = require('diagram-js/lib/util/Collections'),
    Model = require('diagram-js/lib/model');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');


/**
 * A handler responsible for updating the underlying BPMN 2.0 XML + DI
 * once changes on the diagram happen
 */
function BpmnUpdater(eventBus, bpmnFactory, connectionDocking) {

  CommandInterceptor.call(this, eventBus);

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

  this.executed([
    'connection.layout',
    'connection.create',
    'connection.reconnectEnd',
    'connection.reconnectStart'
  ], cropConnection);

  this.reverted([ 'connection.layout' ], function(e) {
    delete e.context.cropped;
  });



  ////// BPMN + DI update /////////////////////////


  // update parent
  function updateParent(e) {
    self.updateParent(e.context.shape || e.context.connection);
  }

  this.executed([ 'shape.move',
                  'shape.create',
                  'shape.delete',
                  'connection.create',
                  'connection.move',
                  'connection.delete' ], updateParent);
  this.reverted([ 'shape.move',
                  'shape.create',
                  'shape.delete',
                  'connection.create',
                  'connection.move',
                  'connection.delete' ], updateParent);

  // update bounds
  function updateBounds(e) {
    self.updateBounds(e.context.shape);
  }

  this.executed([ 'shape.move', 'shape.create', 'shape.resize' ], updateBounds);
  this.reverted([ 'shape.move', 'shape.create', 'shape.resize' ], updateBounds);


  // attach / detach connection
  function updateConnection(e) {
    self.updateConnection(e.context.connection);
  }

  this.executed([
    'connection.create',
    'connection.move',
    'connection.delete',
    'connection.reconnectEnd',
    'connection.reconnectStart'
  ], updateConnection);

  this.reverted([
    'connection.create',
    'connection.move',
    'connection.delete',
    'connection.reconnectEnd',
    'connection.reconnectStart'
  ], updateConnection);


  // update waypoints
  function updateConnectionWaypoints(e) {
    self.updateConnectionWaypoints(e.context.connection);
  }

  this.executed([
    'connection.layout',
    'connection.move',
    'connection.updateWaypoints',
    'connection.reconnectEnd',
    'connection.reconnectStart'
  ], updateConnectionWaypoints);

  this.reverted([
    'connection.layout',
    'connection.move',
    'connection.updateWaypoints',
    'connection.reconnectEnd',
    'connection.reconnectStart'
  ], updateConnectionWaypoints);
}

inherits(BpmnUpdater, CommandInterceptor);

module.exports = BpmnUpdater;

BpmnUpdater.$inject = [ 'eventBus', 'bpmnFactory', 'connectionDocking'];


/////// implementation //////////////////////////////////


BpmnUpdater.prototype.updateParent = function(element) {

  // do not update BPMN 2.0 label parent
  if (element instanceof Model.Label) {
    return;
  }

  var parentShape = element.parent;

  var businessObject = element.businessObject,
      parentBusinessObject = parentShape && parentShape.businessObject,
      parentDi = parentBusinessObject && parentBusinessObject.di;

  this.updateSemanticParent(businessObject, parentBusinessObject);

  this.updateDiParent(businessObject.di, parentDi);
};


BpmnUpdater.prototype.updateBounds = function(shape) {

  var di = shape.businessObject.di;

  var bounds = (shape instanceof Model.Label) ? this._getLabel(di).bounds : di.bounds;

  assign(bounds, {
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

function getDefinitions(element) {
  while (element && !element.$instanceOf('bpmn:Definitions')) {
    element = element.$parent;
  }

  return element;
}

BpmnUpdater.prototype.updateSemanticParent = function(businessObject, newParent) {

  var containment;

  if (businessObject.$parent === newParent) {
    return;
  }

  if (businessObject.$instanceOf('bpmn:FlowElement')) {

    if (newParent && newParent.$instanceOf('bpmn:Participant')) {
      newParent = newParent.processRef;
    }

    containment = 'flowElements';

  } else

  if (businessObject.$instanceOf('bpmn:Artifact')) {

    while (newParent &&
           !newParent.$instanceOf('bpmn:Process') &&
           !newParent.$instanceOf('bpmn:SubProcess') &&
           !newParent.$instanceOf('bpmn:Collaboration')) {

      if (newParent.$instanceOf('bpmn:Participant')) {
        newParent = newParent.processRef;
        break;
      } else {
        newParent = newParent.$parent;
      }
    }

    containment = 'artifacts';
  } else

  if (businessObject.$instanceOf('bpmn:MessageFlow')) {
    containment = 'messageFlows';

  } else

  if (businessObject.$instanceOf('bpmn:Participant')) {
    containment = 'participants';

    // make sure the participants process is properly attached / detached
    // from the XML document

    var process = businessObject.processRef,
        definitions;

    if (process) {
      definitions = getDefinitions(businessObject.$parent || newParent);

      if (businessObject.$parent) {
        Collections.remove(definitions.get('rootElements'), process);
        process.$parent = null;
      }

      if (newParent) {
        Collections.add(definitions.get('rootElements'), process);
        process.$parent = definitions;
      }
    }
  }

  if (!containment) {
    throw new Error('no parent for ', businessObject, newParent);
  }

  var children;

  if (businessObject.$parent) {
    // remove from old parent
    children = businessObject.$parent.get(containment);
    Collections.remove(children, businessObject);
  }

  if (!newParent) {
    businessObject.$parent = null;
  } else {
    // add to new parent
    children = newParent.get(containment);
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