import {
  assign,
  forEach
} from 'min-dash';

import inherits from 'inherits-browser';

import {
  add as collectionAdd,
  remove as collectionRemove
} from 'diagram-js/lib/util/Collections';

import {
  getBusinessObject,
  getDi,
  is
} from '../../util/ModelUtil';

import { isAny } from './util/ModelingUtil';

import {
  getLabel,
  isLabel,
  isLabelExternal
} from '../../util/LabelUtil';

import { isPlane } from '../../util/DrilldownUtil';

import { delta } from 'diagram-js/lib/util/PositionUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('./BpmnFactory').default} BpmnFactory
 * @typedef {import('diagram-js/lib/layout/CroppingConnectionDocking').default} CroppingConnectionDocking
 *
 * @typedef {import('../../model/Types').Connection} Connection
 * @typedef {import('../../model/Types').Element} Element
 * @typedef {import('../../model/Types').Shape} Shape
 * @typedef {import('../../model/Types').Parent} Parent
 * @typedef {import('../../model/Types').ModdleElement} ModdleElement
 */

/**
 * A handler responsible for updating the underlying BPMN 2.0 XML & DI
 * once changes on the diagram happen.
 *
 * @param {EventBus} eventBus
 * @param {BpmnFactory} bpmnFactory
 * @param {CroppingConnectionDocking} connectionDocking
 */
export default function BpmnUpdater(
    eventBus,
    bpmnFactory,
    connectionDocking
) {

  CommandInterceptor.call(this, eventBus);

  this._bpmnFactory = bpmnFactory;

  var self = this;


  // connection cropping //////////////////////

  // crop connection ends during create/update
  function cropConnection(e) {
    var context = e.context,
        hints = context.hints || {},
        connection;

    if (!context.cropped && hints.createElementsBehavior !== false) {
      connection = context.connection;
      connection.waypoints = connectionDocking.getCroppedWaypoints(connection);
      context.cropped = true;
    }
  }

  this.executed([
    'connection.layout',
    'connection.create'
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
    'connection.reconnect'
  ], ifBpmn(updateConnection));

  this.reverted([
    'connection.create',
    'connection.move',
    'connection.delete',
    'connection.reconnect'
  ], ifBpmn(updateConnection));


  // update waypoints
  function updateConnectionWaypoints(e) {
    self.updateConnectionWaypoints(e.context.connection);
  }

  this.executed([
    'connection.layout',
    'connection.move',
    'connection.updateWaypoints',
  ], ifBpmn(updateConnectionWaypoints));

  this.reverted([
    'connection.layout',
    'connection.move',
    'connection.updateWaypoints',
  ], ifBpmn(updateConnectionWaypoints));

  // update conditional/default flows
  this.executed('connection.reconnect', ifBpmn(function(event) {
    var context = event.context,
        connection = context.connection,
        oldSource = context.oldSource,
        newSource = context.newSource,
        connectionBo = getBusinessObject(connection),
        oldSourceBo = getBusinessObject(oldSource),
        newSourceBo = getBusinessObject(newSource);

    // remove condition from connection on reconnect to new source
    // if new source can NOT have condional sequence flow
    if (connectionBo.conditionExpression && !isAny(newSourceBo, [
      'bpmn:Activity',
      'bpmn:ExclusiveGateway',
      'bpmn:InclusiveGateway'
    ])) {
      context.oldConditionExpression = connectionBo.conditionExpression;

      delete connectionBo.conditionExpression;
    }

    // remove default from old source flow on reconnect to new source
    // if source changed
    if (oldSource !== newSource && oldSourceBo.default === connectionBo) {
      context.oldDefault = oldSourceBo.default;

      delete oldSourceBo.default;
    }
  }));

  this.reverted('connection.reconnect', ifBpmn(function(event) {
    var context = event.context,
        connection = context.connection,
        oldSource = context.oldSource,
        newSource = context.newSource,
        connectionBo = getBusinessObject(connection),
        oldSourceBo = getBusinessObject(oldSource),
        newSourceBo = getBusinessObject(newSource);

    // add condition to connection on revert reconnect to new source
    if (context.oldConditionExpression) {
      connectionBo.conditionExpression = context.oldConditionExpression;
    }

    // add default to old source on revert reconnect to new source
    if (context.oldDefault) {
      oldSourceBo.default = context.oldDefault;

      delete newSourceBo.default;
    }
  }));

  // update attachments
  function updateAttachment(e) {
    self.updateAttachment(e.context);
  }

  this.executed([ 'element.updateAttachment' ], ifBpmn(updateAttachment));
  this.reverted([ 'element.updateAttachment' ], ifBpmn(updateAttachment));


  // update BPMNLabel
  this.executed('element.updateLabel', ifBpmn(updateBPMNLabel));
  this.reverted('element.updateLabel', ifBpmn(updateBPMNLabel));

  function updateBPMNLabel(event) {
    const { element } = event.context,
          label = getLabel(element);
    const di = getDi(element),
          diLabel = di && di.get('label');

    if (isLabelExternal(element) || isPlane(element)) {
      return;
    }

    if (label && !diLabel) {
      di.set('label', bpmnFactory.create('bpmndi:BPMNLabel'));
    } else if (!label && diLabel) {
      di.set('label', undefined);
    }
  }
}

inherits(BpmnUpdater, CommandInterceptor);

BpmnUpdater.$inject = [
  'eventBus',
  'bpmnFactory',
  'connectionDocking'
];


// implementation //////////////////////

/**
 * @param { {
 *   shape: Shape;
 *   host: Shape;
 * } } context
 */
BpmnUpdater.prototype.updateAttachment = function(context) {

  var shape = context.shape,
      businessObject = shape.businessObject,
      host = shape.host;

  businessObject.attachedToRef = host && host.businessObject;
};

/**
 * @param {Element} element
 * @param {Parent} oldParent
 */
BpmnUpdater.prototype.updateParent = function(element, oldParent) {

  // do not update BPMN 2.0 label parent
  if (isLabel(element)) {
    return;
  }

  // data stores in collaborations are handled separately by DataStoreBehavior
  if (is(element, 'bpmn:DataStoreReference') &&
      element.parent &&
      is(element.parent, 'bpmn:Collaboration')) {
    return;
  }

  var parentShape = element.parent;

  var businessObject = element.businessObject,
      di = getDi(element),
      parentBusinessObject = parentShape && parentShape.businessObject,
      parentDi = getDi(parentShape);

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

  this.updateDiParent(di, parentDi);
};

/**
 * @param {Shape} shape
 */
BpmnUpdater.prototype.updateBounds = function(shape) {

  var di = getDi(shape),
      embeddedLabelBounds = getEmbeddedLabelBounds(shape);

  // update embedded label bounds if possible
  if (embeddedLabelBounds) {
    var embeddedLabelBoundsDelta = delta(embeddedLabelBounds, di.get('bounds'));

    assign(embeddedLabelBounds, {
      x: shape.x + embeddedLabelBoundsDelta.x,
      y: shape.y + embeddedLabelBoundsDelta.y
    });
  }

  var target = isLabel(shape) ? this._getLabel(di) : di;

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

/**
 * @param {ModdleElement} businessObject
 * @param {ModdleElement} newContainment
 * @param {ModdleElement} oldContainment
 */
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

/**
 * @param {Connection} connection
 * @param {Element} newSource
 * @param {Element} newTarget
 */
BpmnUpdater.prototype.updateDiConnection = function(connection, newSource, newTarget) {
  var connectionDi = getDi(connection),
      newSourceDi = getDi(newSource),
      newTargetDi = getDi(newTarget);

  if (connectionDi.sourceElement && connectionDi.sourceElement.bpmnElement !== getBusinessObject(newSource)) {
    connectionDi.sourceElement = newSource && newSourceDi;
  }

  if (connectionDi.targetElement && connectionDi.targetElement.bpmnElement !== getBusinessObject(newTarget)) {
    connectionDi.targetElement = newTarget && newTargetDi;
  }

};

/**
 * @param {ModdleElement} di
 * @param {ModdleElement} parentDi
 */
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

/**
 * @param {ModdleElement} element
 *
 * @return {ModdleElement}
 */
function getDefinitions(element) {
  while (element && !is(element, 'bpmn:Definitions')) {
    element = element.$parent;
  }

  return element;
}

/**
 * @param {ModdleElement} container
 *
 * @return {ModdleElement}
 */
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

/**
 * @param {ModdleElement} businessObject
 * @param {ModdleElement} newParent
 * @param {ModdleElement} visualParent
 */
BpmnUpdater.prototype.updateSemanticParent = function(businessObject, newParent, visualParent) {

  var containment;

  if (businessObject.$parent === newParent) {
    return;
  }

  if (is(businessObject, 'bpmn:DataInput') || is(businessObject, 'bpmn:DataOutput')) {

    if (is(newParent, 'bpmn:Participant') && 'processRef' in newParent) {
      newParent = newParent.processRef;
    }

    // already in correct ioSpecification
    if ('ioSpecification' in newParent && newParent.ioSpecification === businessObject.$parent) {
      return;
    }
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
    throw new Error(`no parent for <${ businessObject.id }> in <${ newParent.id }>`);
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

/**
 * @param {Connection} connection
 */
BpmnUpdater.prototype.updateConnectionWaypoints = function(connection) {
  var di = getDi(connection);

  di.set('waypoint', this._bpmnFactory.createDiWaypoints(connection.waypoints));
};

/**
 * @param { {
 *   connection: Connection;
 *   parent: Parent;
 *   newParent: Parent;
 * } } context
 */
BpmnUpdater.prototype.updateConnection = function(context) {
  var connection = context.connection,
      businessObject = getBusinessObject(connection),
      newSource = connection.source,
      newSourceBo = getBusinessObject(newSource),
      newTarget = connection.target,
      newTargetBo = getBusinessObject(connection.target),
      visualParent;

  if (!is(businessObject, 'bpmn:DataAssociation')) {

    var inverseSet = is(businessObject, 'bpmn:SequenceFlow');

    if (businessObject.sourceRef !== newSourceBo) {
      if (inverseSet) {
        collectionRemove(businessObject.sourceRef && businessObject.sourceRef.get('outgoing'), businessObject);

        if (newSourceBo && newSourceBo.get('outgoing')) {
          newSourceBo.get('outgoing').push(businessObject);
        }
      }

      businessObject.sourceRef = newSourceBo;
    }

    if (businessObject.targetRef !== newTargetBo) {
      if (inverseSet) {
        collectionRemove(businessObject.targetRef && businessObject.targetRef.get('incoming'), businessObject);

        if (newTargetBo && newTargetBo.get('incoming')) {
          newTargetBo.get('incoming').push(businessObject);
        }
      }

      businessObject.targetRef = newTargetBo;
    }
  } else

  if (is(businessObject, 'bpmn:DataInputAssociation')) {

    // handle obnoxious isMsome sourceRef
    businessObject.get('sourceRef')[0] = newSourceBo;

    visualParent = context.parent || context.newParent || newTargetBo;

    this.updateSemanticParent(businessObject, newTargetBo, visualParent);
  } else

  if (is(businessObject, 'bpmn:DataOutputAssociation')) {
    visualParent = context.parent || context.newParent || newSourceBo;

    this.updateSemanticParent(businessObject, newSourceBo, visualParent);

    // targetRef = new target
    businessObject.targetRef = newTargetBo;
  }

  this.updateConnectionWaypoints(connection);

  this.updateDiConnection(connection, newSource, newTarget);
};


// helpers //////////////////////

BpmnUpdater.prototype._getLabel = function(di) {
  if (!di.label) {
    di.label = this._bpmnFactory.createDiLabel();
  }

  return di.label;
};


/**
 * Call function if shape or connection is BPMN element.
 *
 * @param  {Function} fn
 *
 * @return {Function}
 */
function ifBpmn(fn) {

  return function(event) {

    var context = event.context,
        element = context.shape || context.connection || context.element;

    if (is(element, 'bpmn:BaseElement')) {
      fn(event);
    }
  };
}

/**
 * Return dc:Bounds of bpmndi:BPMNLabel if exists.
 *
 * @param {Shape} shape
 *
 * @return {ModdleElement|undefined}
 */
function getEmbeddedLabelBounds(shape) {
  if (!is(shape, 'bpmn:Activity')) {
    return;
  }

  var di = getDi(shape);

  if (!di) {
    return;
  }

  var label = di.get('label');

  if (!label) {
    return;
  }

  return label.get('bounds');
}