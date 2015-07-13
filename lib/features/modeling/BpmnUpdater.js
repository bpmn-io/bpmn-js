'use strict';

var assign = require('lodash/object/assign'),
    forEach = require('lodash/collection/forEach'),
    inherits = require('inherits');

var Collections = require('diagram-js/lib/util/Collections'),
    Model = require('diagram-js/lib/model');

var getBusinessObject = require('../../util/ModelUtil').getBusinessObject,
    is = require('../../util/ModelUtil').is;

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

  /*
   * ## Updating Parent
   *
   * When morphing a Process into a Collaboration or vice-versa,
   * make sure that both the *semantic* and *di* parent of each element
   * is updated.
   *
   */
  function updateRoot(event) {
    var context = event.context,
        oldRoot = context.oldRoot,
        children = oldRoot.children;

    forEach(children, function(child) {
      self.updateParent(child);
    });
  }

  this.executed([ 'canvas.updateRoot' ], updateRoot);
  this.reverted([ 'canvas.updateRoot' ], updateRoot);


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

  // update attachments
  function updateAttachment(e) {
    self.updateAttachment(e.context);
  }

  this.executed([ 'shape.attach' ], updateAttachment);
  this.reverted([ 'shape.attach' ], updateAttachment);
}

inherits(BpmnUpdater, CommandInterceptor);

module.exports = BpmnUpdater;

BpmnUpdater.$inject = [ 'eventBus', 'bpmnFactory', 'connectionDocking'];


/////// implementation //////////////////////////////////

BpmnUpdater.prototype.updateAttachment = function(context) {

  var shape = context.shape,
      businessObject = shape.businessObject,
      host = shape.host;

  businessObject.attachedToRef = host && host.businessObject;
};

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

  if (parentDi && !is(parentDi, 'bpmndi:BPMNPlane')) {
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
  while (element && !is(element, 'bpmn:Definitions')) {
    element = element.$parent;
  }

  return element;
}

BpmnUpdater.prototype.updateSemanticParent = function(businessObject, newParent) {

  var containment;

  if (businessObject.$parent === newParent) {
    return;
  }

  if (is(businessObject, 'bpmn:FlowElement')) {

    if (newParent && is(newParent, 'bpmn:Participant')) {
      newParent = newParent.processRef;
    }

    containment = 'flowElements';

  } else

  if (is(businessObject, 'bpmn:Artifact')) {

    while (newParent &&
           !is(newParent, 'bpmn:Process') &&
           !is(newParent, 'bpmn:SubProcess') &&
           !is(newParent, 'bpmn:Collaboration')) {

      if (is(newParent, 'bpmn:Participant')) {
        newParent = newParent.processRef;
        break;
      } else {
        newParent = newParent.$parent;
      }
    }

    containment = 'artifacts';
  } else

  if (is(businessObject, 'bpmn:MessageFlow')) {
    containment = 'messageFlows';

  } else

  if (is(businessObject, 'bpmn:Participant')) {
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

  var businessObject = getBusinessObject(connection),
      newSource = getBusinessObject(connection.source),
      newTarget = getBusinessObject(connection.target);

  var inverseSet = is(businessObject, 'bpmn:SequenceFlow');

  if (businessObject.sourceRef !== newSource) {
    if (inverseSet) {
      Collections.remove(businessObject.sourceRef && businessObject.sourceRef.get('outgoing'), businessObject);

      if (newSource && newSource.get('outgoing')) {
        newSource.get('outgoing').push(businessObject);
      }
    }

    businessObject.sourceRef = newSource;
  }
  if (businessObject.targetRef !== newTarget) {
    if (inverseSet) {
      Collections.remove(businessObject.targetRef && businessObject.targetRef.get('incoming'), businessObject);

      if (newTarget && newTarget.get('incoming')) {
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
