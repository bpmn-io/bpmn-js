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
function BpmnUpdater(eventBus, bpmnFactory, connectionDocking, translate) {

  CommandInterceptor.call(this, eventBus);

  this._bpmnFactory = bpmnFactory;
  this._translate = translate;

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
    var context = e.context;

    self.updateParent(context.shape || context.connection, context.oldParent);
  }

  function reverseUpdateParent(e) {
    var context = e.context;

    var element = context.shape || context.connection,
        // oldParent is the (old) new parent, because we are undoing
        oldParent = context.parent || context.newParent;

    self.updateParent(element, oldParent);
  }

  this.executed([ 'shape.move',
                  'shape.create',
                  'shape.delete',
                  'connection.create',
                  'connection.move',
                  'connection.delete' ], ifBpmn(updateParent));

  this.reverted([ 'shape.move',
                  'shape.create',
                  'shape.delete',
                  'connection.create',
                  'connection.move',
                  'connection.delete' ], ifBpmn(reverseUpdateParent));

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
    var shape = e.context.shape;

    if (!is(shape, 'bpmn:BaseElement')) {
      return;
    }

    self.updateBounds(shape);
  }

  this.executed([ 'shape.move', 'shape.create', 'shape.resize' ], ifBpmn(updateBounds));
  this.reverted([ 'shape.move', 'shape.create', 'shape.resize' ], ifBpmn(updateBounds));


  // attach / detach connection
  function updateConnection(e) {
    self.updateConnection(e.context);
  }

  this.executed([
    'connection.create',
    'connection.move',
    'connection.delete',
    'connection.reconnectEnd',
    'connection.reconnectStart'
  ], ifBpmn(updateConnection));

  this.reverted([
    'connection.create',
    'connection.move',
    'connection.delete',
    'connection.reconnectEnd',
    'connection.reconnectStart'
  ], ifBpmn(updateConnection));


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
  ], ifBpmn(updateConnectionWaypoints));

  this.reverted([
    'connection.layout',
    'connection.move',
    'connection.updateWaypoints',
    'connection.reconnectEnd',
    'connection.reconnectStart'
  ], ifBpmn(updateConnectionWaypoints));


  // update Default & Conditional flows
  this.executed([
    'connection.reconnectEnd',
    'connection.reconnectStart'
  ], ifBpmn(function(e) {
    var context = e.context,
        connection = context.connection,
        businessObject = getBusinessObject(connection),
        oldSource = getBusinessObject(context.oldSource),
        oldTarget = getBusinessObject(context.oldTarget),
        newSource = getBusinessObject(connection.source),
        newTarget = getBusinessObject(connection.target);

    if (oldSource === newSource || oldTarget === newTarget) {
      return;
    }

    // on reconnectStart -> default flow
    if (oldSource && oldSource.default) {
      context.default = oldSource.default;
      oldSource.default = undefined;
    }

    // on reconnectEnd -> default flow
    if ((businessObject.sourceRef && businessObject.sourceRef.default) && !is(newTarget, 'bpmn:Activity')) {
      context.default = businessObject.sourceRef.default;
      businessObject.sourceRef.default = undefined;
    }

    // on reconnectStart -> condtional flow
    if ((businessObject.conditionExpression) && is(oldSource, 'bpmn:Activity')) {
      context.conditionExpression = businessObject.conditionExpression;
      businessObject.conditionExpression = undefined;
    }

    // on reconnectEnd -> condtional flow
    if ((businessObject.conditionExpression) && !is(newTarget, 'bpmn:Activity')) {
      context.conditionExpression = businessObject.conditionExpression;
      businessObject.conditionExpression = undefined;
    }
  }));

  this.reverted([
    'connection.reconnectEnd',
    'connection.reconnectStart'
  ], ifBpmn(function(e) {
    var context = e.context,
        connection = context.connection,
        businessObject = getBusinessObject(connection),
        newSource = getBusinessObject(connection.source);

    // default flow
    if (context.default) {
      if (is(newSource, 'bpmn:ExclusiveGateway') || is(newSource, 'bpmn:InclusiveGateway') ||
          is(newSource, 'bpmn:Activity')) {
        newSource.default = context.default;
      }
    }

    // conditional flow
    if (context.conditionExpression && is(newSource, 'bpmn:Activity')) {
      businessObject.conditionExpression = context.conditionExpression;
    }
  }));

  // update attachments
  function updateAttachment(e) {
    self.updateAttachment(e.context);
  }

  this.executed([ 'element.updateAttachment' ], ifBpmn(updateAttachment));
  this.reverted([ 'element.updateAttachment' ], ifBpmn(updateAttachment));
}

inherits(BpmnUpdater, CommandInterceptor);

module.exports = BpmnUpdater;

BpmnUpdater.$inject = [ 'eventBus', 'bpmnFactory', 'connectionDocking', 'translate' ];


/////// implementation //////////////////////////////////

BpmnUpdater.prototype.updateAttachment = function(context) {

  var shape = context.shape,
      businessObject = shape.businessObject,
      host = shape.host;

  businessObject.attachedToRef = host && host.businessObject;
};

BpmnUpdater.prototype.updateParent = function(element, oldParent) {
  // do not update BPMN 2.0 label parent
  if (element instanceof Model.Label) {
    return;
  }

  var parentShape = element.parent;

  var businessObject = element.businessObject,
      parentBusinessObject = parentShape && parentShape.businessObject,
      parentDi = parentBusinessObject && parentBusinessObject.di;

  if (is(element, 'bpmn:FlowNode')) {
    this.updateFlowNodeRefs(businessObject, parentBusinessObject, oldParent && oldParent.businessObject);
  }

  if (is(element, 'bpmn:DataOutputAssociation')) {
    if (element.source) {
      parentBusinessObject = element.source.businessObject;
    } else {
      parentBusinessObject = null;
    }
  }

  if (is(element, 'bpmn:DataInputAssociation')) {
    if (element.target) {
      parentBusinessObject = element.target.businessObject;
    } else {
      parentBusinessObject = null;
    }
  }

  this.updateSemanticParent(businessObject, parentBusinessObject);

  if (is(element, 'bpmn:DataObjectReference') && businessObject.dataObjectRef) {
    this.updateSemanticParent(businessObject.dataObjectRef, parentBusinessObject);
  }

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

BpmnUpdater.prototype.updateFlowNodeRefs = function(businessObject, newContainment, oldContainment) {

  if (oldContainment === newContainment) {
    return;
  }

  var oldRefs, newRefs;

  if (is (oldContainment, 'bpmn:Lane')) {
    oldRefs = oldContainment.get('flowNodeRef');
    Collections.remove(oldRefs, businessObject);
  }

  if (is(newContainment, 'bpmn:Lane')) {
    newRefs = newContainment.get('flowNodeRef');
    Collections.add(newRefs, businessObject);
  }
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

BpmnUpdater.prototype.getLaneSet = function(container) {

  var laneSet, laneSets;

  // bpmn:Lane
  if (is(container, 'bpmn:Lane')) {
    laneSet = container.childLaneSet;

    if (!laneSet) {
      laneSet = this._bpmnFactory.create('bpmn:LaneSet');
      container.childLaneSet = laneSet;
      laneSet.$parent = container;
    }

    return laneSet;
  }

  // bpmn:Participant
  if (is(container, 'bpmn:Participant')) {
    container = container.processRef;
  }

  // bpmn:FlowElementsContainer
  laneSets = container.get('laneSets');
  laneSet = laneSets[0];

  if (!laneSet) {
    laneSet = this._bpmnFactory.create('bpmn:LaneSet');
    laneSet.$parent = container;
    laneSets.push(laneSet);
  }

  return laneSet;
};

BpmnUpdater.prototype.updateSemanticParent = function(businessObject, newParent) {

  var containment,
      translate = this._translate;

  if (businessObject.$parent === newParent) {
    return;
  }

  if (is(businessObject, 'bpmn:Lane')) {

    if (newParent) {
      newParent = this.getLaneSet(newParent);
    }

    containment = 'lanes';
  } else

  if (is(businessObject, 'bpmn:FlowElement')) {

    if (newParent) {

      if (is(newParent, 'bpmn:Participant')) {
        newParent = newParent.processRef;
      } else

      if (is(newParent, 'bpmn:Lane')) {
        do {
          // unwrap Lane -> LaneSet -> (Lane | FlowElementsContainer)
          newParent = newParent.$parent.$parent;
        } while(is(newParent, 'bpmn:Lane'));

      }
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
  } else

  if (is(businessObject, 'bpmn:DataOutputAssociation')) {
    containment = 'dataOutputAssociations';
  } else

  if (is(businessObject, 'bpmn:DataInputAssociation')) {
    containment = 'dataInputAssociations';
  }

  if (!containment) {
    throw new Error(translate(
      'no parent for {element} in {parent}',
      {
        element: businessObject.id,
        parent: newParent.id
      }
    ));
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


BpmnUpdater.prototype.updateConnection = function(context) {

  var connection = context.connection,
      businessObject = getBusinessObject(connection),
      newSource = getBusinessObject(connection.source),
      newTarget = getBusinessObject(connection.target);

  if (!is(businessObject, 'bpmn:DataAssociation')) {

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
  } else

  if (is(businessObject, 'bpmn:DataInputAssociation')) {
    // handle obnoxious isMany sourceRef
    businessObject.get('sourceRef')[0] = newSource;

    // targetRef = new parent
    this.updateSemanticParent(businessObject, newTarget);
  } else

  if (is(businessObject, 'bpmn:DataOutputAssociation')) {
    // sourceRef = new parent
    this.updateSemanticParent(businessObject, newSource);

    // targetRef = new target
    businessObject.targetRef = newTarget;
  }

  this.updateConnectionWaypoints(connection);
};


/////// helpers /////////////////////////////////////////

BpmnUpdater.prototype._getLabel = function(di) {
  if (!di.label) {
    di.label = this._bpmnFactory.createDiLabel();
  }

  return di.label;
};


/**
 * Make sure the event listener is only called
 * if the touched element is a BPMN element.
 *
 * @param  {Function} fn
 * @return {Function} guarded function
 */
function ifBpmn(fn) {

  return function(event) {

    var context = event.context,
        element = context.shape || context.connection;

    if (is(element, 'bpmn:BaseElement')) {
      fn(event);
    }
  };
}
