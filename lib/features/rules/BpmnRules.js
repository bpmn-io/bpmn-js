import {
  find,
  some,
  every,
  forEach
} from 'min-dash';

import inherits from 'inherits';

import {
  is,
  getBusinessObject
} from '../../util/ModelUtil';

import {
  isAny
} from '../modeling/util/ModelingUtil';

import {
  isLabel
} from '../../util/LabelUtil';

import {
  isExpanded,
  isEventSubProcess,
  isInterrupting,
  hasErrorEventDefinition,
  hasEscalationEventDefinition,
  hasCompensateEventDefinition
} from '../../util/DiUtil';

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';

import {
  getBoundaryAttachment as isBoundaryAttachment
} from '../snapping/BpmnSnappingUtil';


/**
 * BPMN specific modeling rule
 */
export default function BpmnRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

inherits(BpmnRules, RuleProvider);

BpmnRules.$inject = [ 'eventBus' ];

BpmnRules.prototype.init = function() {

  this.addRule('connection.create', function(context) {
    var source = context.source,
        target = context.target,
        hints = context.hints || {},
        targetParent = hints.targetParent,
        targetAttach = hints.targetAttach;

    // don't allow incoming connections on
    // newly created boundary events
    // to boundary events
    if (targetAttach) {
      return false;
    }

    // temporarily set target parent for scoping
    // checks to work
    if (targetParent) {
      target.parent = targetParent;
    }

    try {
      return canConnect(source, target);
    } finally {
      // unset temporary target parent
      if (targetParent) {
        target.parent = null;
      }
    }
  });

  this.addRule('connection.reconnectStart', function(context) {

    var connection = context.connection,
        source = context.hover || context.source,
        target = connection.target;

    return canConnect(source, target, connection);
  });

  this.addRule('connection.reconnectEnd', function(context) {

    var connection = context.connection,
        source = connection.source,
        target = context.hover || context.target;

    return canConnect(source, target, connection);
  });

  this.addRule('connection.updateWaypoints', function(context) {
    // OK! but visually ignore
    return null;
  });

  this.addRule('shape.resize', function(context) {

    var shape = context.shape,
        newBounds = context.newBounds;

    return canResize(shape, newBounds);
  });

  this.addRule('elements.move', function(context) {

    var target = context.target,
        shapes = context.shapes,
        position = context.position;

    return canAttach(shapes, target, null, position) ||
           canReplace(shapes, target, position) ||
           canMove(shapes, target, position) ||
           canInsert(shapes, target, position);
  });

  this.addRule('shape.create', function(context) {
    return canCreate(
      context.shape,
      context.target,
      context.source,
      context.position
    );
  });

  this.addRule('shape.attach', function(context) {

    return canAttach(
      context.shape,
      context.target,
      null,
      context.position
    );
  });

  this.addRule('element.copy', function(context) {
    var collection = context.collection,
        element = context.element;

    return canCopy(collection, element);
  });

  this.addRule('element.paste', function(context) {
    var parent = context.parent,
        element = context.element,
        position = context.position,
        source = context.source,
        target = context.target;

    if (source || target) {
      return canConnect(source, target);
    }

    return canAttach([ element ], parent, null, position) || canCreate(element, parent, null, position);
  });

  this.addRule('elements.paste', function(context) {
    var tree = context.tree,
        target = context.target;

    return canPaste(tree, target);
  });
};

BpmnRules.prototype.canConnectMessageFlow = canConnectMessageFlow;

BpmnRules.prototype.canConnectSequenceFlow = canConnectSequenceFlow;

BpmnRules.prototype.canConnectDataAssociation = canConnectDataAssociation;

BpmnRules.prototype.canConnectAssociation = canConnectAssociation;

BpmnRules.prototype.canMove = canMove;

BpmnRules.prototype.canAttach = canAttach;

BpmnRules.prototype.canReplace = canReplace;

BpmnRules.prototype.canDrop = canDrop;

BpmnRules.prototype.canInsert = canInsert;

BpmnRules.prototype.canCreate = canCreate;

BpmnRules.prototype.canConnect = canConnect;

BpmnRules.prototype.canResize = canResize;

BpmnRules.prototype.canCopy = canCopy;

/**
 * Utility functions for rule checking
 */

function nonExistantOrLabel(element) {
  return !element || isLabel(element);
}

function isSame(a, b) {
  return a === b;
}

function getOrganizationalParent(element) {

  do {
    if (is(element, 'bpmn:Process')) {
      return getBusinessObject(element);
    }

    if (is(element, 'bpmn:Participant')) {
      return (
        getBusinessObject(element).processRef ||
        getBusinessObject(element)
      );
    }
  } while ((element = element.parent));

}

function isTextAnnotation(element) {
  return is(element, 'bpmn:TextAnnotation');
}

function isCompensationBoundary(element) {
  return is(element, 'bpmn:BoundaryEvent') &&
         hasEventDefinition(element, 'bpmn:CompensateEventDefinition');
}

function isForCompensation(e) {
  return getBusinessObject(e).isForCompensation;
}

function isSameOrganization(a, b) {
  var parentA = getOrganizationalParent(a),
      parentB = getOrganizationalParent(b);

  return parentA === parentB;
}

function isMessageFlowSource(element) {
  return (
    is(element, 'bpmn:InteractionNode') && (
      !is(element, 'bpmn:Event') || (
        is(element, 'bpmn:ThrowEvent') &&
        hasEventDefinitionOrNone(element, 'bpmn:MessageEventDefinition')
      )
    )
  );
}

function isMessageFlowTarget(element) {
  return (
    is(element, 'bpmn:InteractionNode') &&
    !isForCompensation(element) && (
      !is(element, 'bpmn:Event') || (
        is(element, 'bpmn:CatchEvent') &&
        hasEventDefinitionOrNone(element, 'bpmn:MessageEventDefinition')
      )
    )
  );
}

function getScopeParent(element) {

  var parent = element;

  while ((parent = parent.parent)) {

    if (is(parent, 'bpmn:FlowElementsContainer')) {
      return getBusinessObject(parent);
    }

    if (is(parent, 'bpmn:Participant')) {
      return getBusinessObject(parent).processRef;
    }
  }

  return null;
}

function isSameScope(a, b) {
  var scopeParentA = getScopeParent(a),
      scopeParentB = getScopeParent(b);

  return scopeParentA && (scopeParentA === scopeParentB);
}

function hasEventDefinition(element, eventDefinition) {
  var bo = getBusinessObject(element);

  return !!find(bo.eventDefinitions || [], function(definition) {
    return is(definition, eventDefinition);
  });
}

function hasEventDefinitionOrNone(element, eventDefinition) {
  var bo = getBusinessObject(element);

  return (bo.eventDefinitions || []).every(function(definition) {
    return is(definition, eventDefinition);
  });
}

function isSequenceFlowSource(element) {
  return (
    is(element, 'bpmn:FlowNode') &&
    !is(element, 'bpmn:EndEvent') &&
    !isEventSubProcess(element) &&
    !(is(element, 'bpmn:IntermediateThrowEvent') &&
      hasEventDefinition(element, 'bpmn:LinkEventDefinition')
    ) &&
    !isCompensationBoundary(element) &&
    !isForCompensation(element)
  );
}

function isSequenceFlowTarget(element) {
  return (
    is(element, 'bpmn:FlowNode') &&
    !is(element, 'bpmn:StartEvent') &&
    !is(element, 'bpmn:BoundaryEvent') &&
    !isEventSubProcess(element) &&
    !(is(element, 'bpmn:IntermediateCatchEvent') &&
      hasEventDefinition(element, 'bpmn:LinkEventDefinition')
    ) &&
    !isForCompensation(element)
  );
}

function isEventBasedTarget(element) {
  return (
    is(element, 'bpmn:ReceiveTask') || (
      is(element, 'bpmn:IntermediateCatchEvent') && (
        hasEventDefinition(element, 'bpmn:MessageEventDefinition') ||
        hasEventDefinition(element, 'bpmn:TimerEventDefinition') ||
        hasEventDefinition(element, 'bpmn:ConditionalEventDefinition') ||
        hasEventDefinition(element, 'bpmn:SignalEventDefinition')
      )
    )
  );
}

function isConnection(element) {
  return element.waypoints;
}

function getParents(element) {

  var parents = [];

  while (element) {
    element = element.parent;

    if (element) {
      parents.push(element);
    }
  }

  return parents;
}

function isParent(possibleParent, element) {
  var allParents = getParents(element);
  return allParents.indexOf(possibleParent) !== -1;
}

function canConnect(source, target, connection) {

  if (nonExistantOrLabel(source) || nonExistantOrLabel(target)) {
    return null;
  }

  if (!is(connection, 'bpmn:DataAssociation')) {

    if (canConnectMessageFlow(source, target)) {
      return { type: 'bpmn:MessageFlow' };
    }

    if (canConnectSequenceFlow(source, target)) {
      return { type: 'bpmn:SequenceFlow' };
    }
  }

  var connectDataAssociation = canConnectDataAssociation(source, target);

  if (connectDataAssociation) {
    return connectDataAssociation;
  }

  if (isCompensationBoundary(source) && isForCompensation(target)) {
    return {
      type: 'bpmn:Association',
      associationDirection: 'One'
    };
  }

  if (canConnectAssociation(source, target)) {

    return {
      type: 'bpmn:Association'
    };
  }

  return false;
}

/**
 * Can an element be dropped into the target element
 *
 * @return {Boolean}
 */
function canDrop(element, target, position) {

  // can move labels everywhere
  if (isLabel(element) && !isConnection(target)) {
    return true;
  }

  // disallow to create elements on collapsed pools
  if (is(target, 'bpmn:Participant') && !isExpanded(target)) {
    return false;
  }

  // allow to create new participants on
  // on existing collaboration and process diagrams
  if (is(element, 'bpmn:Participant')) {
    return is(target, 'bpmn:Process') || is(target, 'bpmn:Collaboration');
  }

  // allow creating lanes on participants and other lanes only
  if (is(element, 'bpmn:Lane')) {
    return is(target, 'bpmn:Participant') || is(target, 'bpmn:Lane');
  }

  if (is(element, 'bpmn:BoundaryEvent')) {
    return false;
  }

  // drop flow elements onto flow element containers
  // and participants
  if (is(element, 'bpmn:FlowElement') && !is(element, 'bpmn:DataStoreReference')) {
    if (is(target, 'bpmn:FlowElementsContainer')) {
      return isExpanded(target);
    }

    return isAny(target, [ 'bpmn:Participant', 'bpmn:Lane' ]);
  }

  // account for the fact that data associations are always
  // rendered and moved to top (Process or Collaboration level)
  //
  // artifacts may be placed wherever, too
  if (isAny(element, [ 'bpmn:Artifact', 'bpmn:DataAssociation', 'bpmn:DataStoreReference' ])) {
    return isAny(target, [
      'bpmn:Collaboration',
      'bpmn:Lane',
      'bpmn:Participant',
      'bpmn:Process',
      'bpmn:SubProcess' ]);
  }

  if (is(element, 'bpmn:MessageFlow')) {
    return is(target, 'bpmn:Collaboration')
      || element.source.parent == target
      || element.target.parent == target;
  }

  return false;
}

function canPaste(tree, target) {
  var topLevel = tree[0],
      participants;

  if (is(target, 'bpmn:Collaboration')) {
    return every(topLevel, function(e) {
      return e.type === 'bpmn:Participant';
    });
  }

  if (is(target, 'bpmn:Process')) {
    participants = some(topLevel, function(e) {
      return e.type === 'bpmn:Participant';
    });

    return !(participants && target.children.length > 0);
  }

  // disallow to create elements on collapsed pools
  if (is(target, 'bpmn:Participant') && !isExpanded(target)) {
    return false;
  }

  if (is(target, 'bpmn:FlowElementsContainer')) {
    return isExpanded(target);
  }

  return isAny(target, [
    'bpmn:Collaboration',
    'bpmn:Lane',
    'bpmn:Participant',
    'bpmn:Process',
    'bpmn:SubProcess' ]);
}

function isBoundaryEvent(element) {
  return !isLabel(element) && is(element, 'bpmn:BoundaryEvent');
}

function isLane(element) {
  return is(element, 'bpmn:Lane');
}

/**
 * We treat IntermediateThrowEvents as boundary events during create,
 * this must be reflected in the rules.
 */
function isBoundaryCandidate(element) {
  return isBoundaryEvent(element) ||
        (is(element, 'bpmn:IntermediateThrowEvent') && !element.parent);
}


function canAttach(elements, target, source, position) {

  if (!Array.isArray(elements)) {
    elements = [ elements ];
  }

  // disallow appending as boundary event
  if (source) {
    return false;
  }

  // only (re-)attach one element at a time
  if (elements.length !== 1) {
    return false;
  }

  var element = elements[0];

  // do not attach labels
  if (isLabel(element)) {
    return false;
  }

  // only handle boundary events
  if (!isBoundaryCandidate(element)) {
    return false;
  }

  // allow default move operation
  if (!target) {
    return true;
  }

  // disallow drop on event sub processes
  if (isEventSubProcess(target)) {
    return false;
  }

  // only allow drop on non compensation activities
  if (!is(target, 'bpmn:Activity') || isForCompensation(target)) {
    return false;
  }

  // only attach to subprocess border
  if (position && !isBoundaryAttachment(position, target)) {
    return false;
  }

  return 'attach';
}


/**
 * Defines how to replace elements for a given target.
 *
 * Returns an array containing all elements which will be replaced.
 *
 * @example
 *
 *  [{ id: 'IntermediateEvent_2',
 *     type: 'bpmn:StartEvent'
 *   },
 *   { id: 'IntermediateEvent_5',
 *     type: 'bpmn:EndEvent'
 *   }]
 *
 * @param  {Array} elements
 * @param  {Object} target
 *
 * @return {Object} an object containing all elements which have to be replaced
 */
function canReplace(elements, target, position) {

  if (!target) {
    return false;
  }

  var canExecute = {
    replacements: []
  };

  forEach(elements, function(element) {

    if (!isEventSubProcess(target)) {

      if (is(element, 'bpmn:StartEvent') &&
          element.type !== 'label' &&
          canDrop(element, target)) {

        // replace a non-interrupting start event by a blank interrupting start event
        // when the target is not an event sub process
        if (!isInterrupting(element)) {
          canExecute.replacements.push({
            oldElementId: element.id,
            newElementType: 'bpmn:StartEvent'
          });
        }

        // replace an error/escalation/compansate start event by a blank interrupting start event
        // when the target is not an event sub process
        if (hasErrorEventDefinition(element) ||
            hasEscalationEventDefinition(element) ||
            hasCompensateEventDefinition(element)) {
          canExecute.replacements.push({
            oldElementId: element.id,
            newElementType: 'bpmn:StartEvent'
          });
        }
      }
    }

    if (!is(target, 'bpmn:Transaction')) {
      if (hasEventDefinition(element, 'bpmn:CancelEventDefinition') &&
          element.type !== 'label') {

        if (is(element, 'bpmn:EndEvent') && canDrop(element, target)) {
          canExecute.replacements.push({
            oldElementId: element.id,
            newElementType: 'bpmn:EndEvent'
          });
        }

        if (is(element, 'bpmn:BoundaryEvent') && canAttach(element, target, null, position)) {
          canExecute.replacements.push({
            oldElementId: element.id,
            newElementType: 'bpmn:BoundaryEvent'
          });
        }
      }
    }
  });

  return canExecute.replacements.length ? canExecute : false;
}

function canMove(elements, target) {

  // do not move selection containing boundary events
  if (some(elements, isBoundaryEvent)) {
    return false;
  }

  // do not move selection containing lanes
  if (some(elements, isLane)) {
    return false;
  }

  // allow default move check to start move operation
  if (!target) {
    return true;
  }

  return elements.every(function(element) {
    return canDrop(element, target);
  });
}

function canCreate(shape, target, source, position) {

  if (!target) {
    return false;
  }

  if (isLabel(target)) {
    return null;
  }

  if (isSame(source, target)) {
    return false;
  }

  // ensure we do not drop the element
  // into source
  if (source && isParent(source, target)) {
    return false;
  }

  return canDrop(shape, target, position) || canInsert(shape, target, position);
}

function canResize(shape, newBounds) {
  if (is(shape, 'bpmn:SubProcess')) {
    return (
      isExpanded(shape) && (
        !newBounds || (newBounds.width >= 100 && newBounds.height >= 80)
      )
    );
  }

  if (is(shape, 'bpmn:Lane')) {
    return !newBounds || (newBounds.width >= 130 && newBounds.height >= 60);
  }

  if (is(shape, 'bpmn:Participant')) {
    return !newBounds || (newBounds.width >= 250 && newBounds.height >= 50);
  }

  if (isTextAnnotation(shape)) {
    return true;
  }

  return false;
}

/**
 * Check, whether one side of the relationship
 * is a text annotation.
 */
function isOneTextAnnotation(source, target) {

  var sourceTextAnnotation = isTextAnnotation(source),
      targetTextAnnotation = isTextAnnotation(target);

  return (
    (sourceTextAnnotation || targetTextAnnotation) &&
    (sourceTextAnnotation !== targetTextAnnotation)
  );
}


function canConnectAssociation(source, target) {

  // do not connect connections
  if (isConnection(source) || isConnection(target)) {
    return false;
  }

  // compensation boundary events are exception
  if (isCompensationBoundary(source) && isForCompensation(target)) {
    return true;
  }

  // don't connect parent <-> child
  if (isParent(target, source) || isParent(source, target)) {
    return false;
  }

  // allow connection of associations between <!TextAnnotation> and <TextAnnotation>
  return isOneTextAnnotation(source, target);
}

function canConnectMessageFlow(source, target) {

  return isMessageFlowSource(source) &&
         isMessageFlowTarget(target) &&
        !isSameOrganization(source, target);
}

function canConnectSequenceFlow(source, target) {

  return isSequenceFlowSource(source) &&
         isSequenceFlowTarget(target) &&
         isSameScope(source, target) &&
         !(is(source, 'bpmn:EventBasedGateway') && !isEventBasedTarget(target));
}


function canConnectDataAssociation(source, target) {

  if (isAny(source, [ 'bpmn:DataObjectReference', 'bpmn:DataStoreReference' ]) &&
      isAny(target, [ 'bpmn:Activity', 'bpmn:ThrowEvent' ])) {
    return { type: 'bpmn:DataInputAssociation' };
  }

  if (isAny(target, [ 'bpmn:DataObjectReference', 'bpmn:DataStoreReference' ]) &&
      isAny(source, [ 'bpmn:Activity', 'bpmn:CatchEvent' ])) {
    return { type: 'bpmn:DataOutputAssociation' };
  }

  return false;
}

function canInsert(shape, flow, position) {

  if (Array.isArray(shape)) {
    if (shape.length !== 1) {
      return false;
    }

    shape = shape[0];
  }

  if (flow.source === shape ||
      flow.target === shape) {
    return false;
  }

  // return true if we can drop on the
  // underlying flow parent
  //
  // at this point we are not really able to talk
  // about connection rules (yet)

  return (
    isAny(flow, [ 'bpmn:SequenceFlow', 'bpmn:MessageFlow' ]) &&
    !isLabel(flow) &&
    is(shape, 'bpmn:FlowNode') &&
    !is(shape, 'bpmn:BoundaryEvent') &&
    canDrop(shape, flow.parent, position));
}

function contains(collection, element) {
  return (collection && element) && collection.indexOf(element) !== -1;
}

function canCopy(collection, element) {
  if (is(element, 'bpmn:Lane') && !contains(collection, element.parent)) {
    return false;
  }

  if (is(element, 'bpmn:BoundaryEvent') && !contains(collection, element.host)) {
    return false;
  }

  return true;
}
