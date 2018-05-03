import {
  assign,
  forEach
} from 'min-dash';

import inherits from 'inherits';

import {
  remove as collectionRemove,
  add as collectionAdd
} from 'diagram-js/lib/util/Collections';

import {
  Label
} from 'diagram-js/lib/model';

import {
  getBusinessObject,
  is
} from '../../util/ModelUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

/**
 * A handler responsible for updating the underlying BPMN 2.0 XML + DI
 * once changes on the diagram happen
 */
export default function BpmnUpdater(
    eventBus, bpmnFactory, connectionDocking,
    translate) {

  CommandInterceptor.call(this, eventBus);

  this._bpmnFactory = bpmnFactory;
  this._translate = translate;

  var self = this;



  // connection cropping //////////////////////

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



  // BPMN + DI update //////////////////////


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

  this.executed([
    'shape.move',
    'shape.create',
    'shape.delete',
    'connection.create',
    'connection.move',
    'connection.delete'
  ], ifBpmn(updateParent));

  this.reverted([
    'shape.move',
    'shape.create',
    'shape.delete',
    'connection.create',
    'connection.move',
    'connection.delete'
  ], ifBpmn(reverseUpdateParent));

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
      if (is(child, 'bpmn:BaseElement')) {
        self.updateParent(child);
      }
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

  this.executed([ 'shape.move', 'shape.create', 'shape.resize' ], ifBpmn(function(event) {

    // exclude labels because they're handled separately during shape.changed
    if (event.context.shape.type === 'label') {
      return;
    }

    updateBounds(event);
  }));

  this.reverted([ 'shape.move', 'shape.create', 'shape.resize' ], ifBpmn(function(event) {

    // exclude labels because they're handled separately during shape.changed
    if (event.context.shape.type === 'label') {
      return;
    }

    updateBounds(event);
  }));

  // Handle labels separately. This is necessary, because the label bounds have to be updated
  // every time its shape changes, not only on move, create and resize.
  eventBus.on('shape.changed', function(event) {
    if (event.element.type === 'label') {
      updateBounds({ context: { shape: event.element } });
    }
  });

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
    if (oldSource && oldSource.default === businessObject) {
      context.default = oldSource.default;
      oldSource.default = undefined;
    }

    // on reconnectEnd -> default flow
    if ((businessObject.sourceRef && businessObject.sourceRef.default) &&
        !(is(newTarget, 'bpmn:Activity') ||
          is(newTarget, 'bpmn:EndEvent') ||
          is(newTarget, 'bpmn:Gateway') ||
          is(newTarget, 'bpmn:IntermediateThrowEvent'))) {
      context.default = businessObject.sourceRef.default;
      businessObject.sourceRef.default = undefined;
    }

    // on reconnectStart -> conditional flow
    if (oldSource && (businessObject.conditionExpression) &&
      !(is(newSource, 'bpmn:Activity') ||
        is(newSource, 'bpmn:Gateway'))) {
      context.conditionExpression = businessObject.conditionExpression;
      businessObject.conditionExpression = undefined;
    }

    // on reconnectEnd -> conditional flow
    if (oldTarget && (businessObject.conditionExpression) &&
        !(is(newTarget, 'bpmn:Activity') ||
          is(newTarget, 'bpmn:EndEvent') ||
          is(newTarget, 'bpmn:Gateway') ||
          is(newTarget, 'bpmn:IntermediateThrowEvent'))) {
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

BpmnUpdater.$inject = [
  'eventBus',
  'bpmnFactory',
  'connectionDocking',
  'translate'
];


// implementation //////////////////////

BpmnUpdater.prototype.updateAttachment = function(context) {

  var shape = context.shape,
      businessObject = shape.businessObject,
      host = shape.host;

  businessObject.attachedToRef = host && host.businessObject;
};

BpmnUpdater.prototype.updateParent = function(element, oldParent) {
  // do not update BPMN 2.0 label parent
  if (element instanceof Label) {
    return;
  }

  // data stores in collaborations are handled seperately by DataStoreBehavior
  if (is(element, 'bpmn:DataStoreReference') &&
      element.parent &&
      is(element.parent, 'bpmn:Collaboration')) {
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

  var target = (shape instanceof Label) ? this._getLabel(di) : di;

  var bounds = target.bounds;

  if (!bounds) {
    bounds = this._bpmnFactory.createDiBounds();
    target.set('bounds', bounds);
  }

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
    collectionRemove(oldRefs, businessObject);
  }

  if (is(newContainment, 'bpmn:Lane')) {
    newRefs = newContainment.get('flowNodeRef');
    collectionAdd(newRefs, businessObject);
  }
};


// update existing sourceElement and targetElement di information
BpmnUpdater.prototype.updateDiConnection = function(di, newSource, newTarget) {

  if (di.sourceElement && di.sourceElement.bpmnElement !== newSource) {
    di.sourceElement = newSource && newSource.di;
  }

  if (di.targetElement && di.targetElement.bpmnElement !== newTarget) {
    di.targetElement = newTarget && newTarget.di;
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
    collectionRemove(planeElements, di);
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

BpmnUpdater.prototype.updateSemanticParent = function(businessObject, newParent, visualParent) {

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
        } while (is(newParent, 'bpmn:Lane'));

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
        collectionRemove(definitions.get('rootElements'), process);
        process.$parent = null;
      }

      if (newParent) {
        collectionAdd(definitions.get('rootElements'), process);
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
    collectionRemove(children, businessObject);
  }

  if (!newParent) {
    businessObject.$parent = null;
  } else {
    // add to new parent
    children = newParent.get(containment);
    children.push(businessObject);
    businessObject.$parent = newParent;
  }

  if (visualParent) {
    var diChildren = visualParent.get(containment);

    collectionRemove(children, businessObject);

    if (newParent) {

      if (!diChildren) {
        diChildren = [];
        newParent.set(containment, diChildren);
      }

      diChildren.push(businessObject);
    }
  }
};


BpmnUpdater.prototype.updateConnectionWaypoints = function(connection) {
  connection.businessObject.di.set('waypoint', this._bpmnFactory.createDiWaypoints(connection.waypoints));
};


BpmnUpdater.prototype.updateConnection = function(context) {

  var connection = context.connection,
      businessObject = getBusinessObject(connection),
      newSource = getBusinessObject(connection.source),
      newTarget = getBusinessObject(connection.target),
      visualParent;

  if (!is(businessObject, 'bpmn:DataAssociation')) {

    var inverseSet = is(businessObject, 'bpmn:SequenceFlow');

    if (businessObject.sourceRef !== newSource) {
      if (inverseSet) {
        collectionRemove(businessObject.sourceRef && businessObject.sourceRef.get('outgoing'), businessObject);

        if (newSource && newSource.get('outgoing')) {
          newSource.get('outgoing').push(businessObject);
        }
      }

      businessObject.sourceRef = newSource;
    }

    if (businessObject.targetRef !== newTarget) {
      if (inverseSet) {
        collectionRemove(businessObject.targetRef && businessObject.targetRef.get('incoming'), businessObject);

        if (newTarget && newTarget.get('incoming')) {
          newTarget.get('incoming').push(businessObject);
        }
      }

      businessObject.targetRef = newTarget;
    }
  } else

  if (is(businessObject, 'bpmn:DataInputAssociation')) {
    // handle obnoxious isMsome sourceRef
    businessObject.get('sourceRef')[0] = newSource;

    visualParent = context.parent || context.newParent || newTarget;

    this.updateSemanticParent(businessObject, newTarget, parent.businessObject);
  } else

  if (is(businessObject, 'bpmn:DataOutputAssociation')) {
    visualParent = context.parent || context.newParent || newSource;

    this.updateSemanticParent(businessObject, newSource, visualParent);

    // targetRef = new target
    businessObject.targetRef = newTarget;
  }

  this.updateConnectionWaypoints(connection);

  this.updateDiConnection(businessObject.di, newSource, newTarget);
};


// helpers //////////////////////

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
