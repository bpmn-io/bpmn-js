import {
  every,
  find,
  forEach,
  some
} from 'min-dash';

import inherits from 'inherits-browser';

import {
  is,
  getBusinessObject
} from '../../util/ModelUtil';

import {
  getParent,
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

import { isConnection } from 'diagram-js/lib/util/ModelUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 *
 * @typedef {import('../../model/Types').Connection} Connection
 * @typedef {import('../../model/Types').Element} Element
 * @typedef {import('../../model/Types').Shape} Shape
 * @typedef {import('../../model/Types').ModdleElement} ModdleElement
 *
 * @typedef {import('diagram-js/lib/util/Types').Point} Point
 * @typedef {import('diagram-js/lib/util/Types').Rect} Rect
 *
 * @typedef { {
 *   associationDirection?: 'None' | 'One' | 'Both';
 *   type: string;
 * } | boolean | null } CanConnectResult
 *
 * @typedef { {
 *   id: string;
 *   type: string;
 * } | boolean } CanReplaceResult
 */

/**
 * BPMN-specific modeling rules.
 *
 * @param {EventBus} eventBus
 */
export default function BpmnRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

inherits(BpmnRules, RuleProvider);

BpmnRules.$inject = [ 'eventBus' ];

BpmnRules.prototype.init = function() {

  this.addRule('connection.start', function(context) {
    var source = context.source;

    return canStartConnection(source);
  });

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

  this.addRule('connection.reconnect', function(context) {

    var connection = context.connection,
        source = context.source,
        target = context.target;

    return canConnect(source, target, connection);
  });

  this.addRule('connection.updateWaypoints', function(context) {
    return {
      type: context.connection.type
    };
  });

  this.addRule('shape.resize', function(context) {

    var shape = context.shape,
        newBounds = context.newBounds;

    return canResize(shape, newBounds);
  });

  this.addRule('elements.create', function(context) {
    var elements = context.elements,
        position = context.position,
        target = context.target;

    if (isConnection(target) && !canInsert(elements, target, position)) {
      return false;
    }

    return every(elements, function(element) {
      if (isConnection(element)) {
        return canConnect(element.source, element.target, element);
      }

      if (element.host) {
        return canAttach(element, element.host, null, position);
      }

      return canCreate(element, target, null, position);
    });
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
    var element = context.element,
        elements = context.elements;

    return canCopy(elements, element);
  });
};

BpmnRules.prototype.canConnectMessageFlow = canConnectMessageFlow;

BpmnRules.prototype.canConnectSequenceFlow = canConnectSequenceFlow;

BpmnRules.prototype.canConnectDataAssociation = canConnectDataAssociation;

BpmnRules.prototype.canConnectAssociation = canConnectAssociation;

BpmnRules.prototype.canConnectCompensationAssociation = canConnectCompensationAssociation;

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

/**
 * Checks if given element can be used for starting connection.
 *
 * @param  {Element} source
 *
 * @return {boolean}
 */
function canStartConnection(element) {
  if (nonExistingOrLabel(element)) {
    return null;
  }

  return isAny(element, [
    'bpmn:FlowNode',
    'bpmn:InteractionNode',
    'bpmn:DataObjectReference',
    'bpmn:DataStoreReference',
    'bpmn:Group',
    'bpmn:TextAnnotation'
  ]);
}

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
function nonExistingOrLabel(element) {
  return !element || isLabel(element);
}

function isSame(a, b) {
  return a === b;
}

/**
 * @param {Element} element
 *
 * @return {ModdleElement}
 */
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

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
function isTextAnnotation(element) {
  return is(element, 'bpmn:TextAnnotation');
}

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
function isGroup(element) {
  return is(element, 'bpmn:Group') && !element.labelTarget;
}

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
function isCompensationBoundary(element) {
  return is(element, 'bpmn:BoundaryEvent') &&
         hasEventDefinition(element, 'bpmn:CompensateEventDefinition');
}

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
function isForCompensation(element) {
  return getBusinessObject(element).isForCompensation;
}

/**
 * @param {Element} a
 * @param {Element} b
 *
 * @return {boolean}
 */
function isSameOrganization(a, b) {
  var parentA = getOrganizationalParent(a),
      parentB = getOrganizationalParent(b);

  return parentA === parentB;
}

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
function isMessageFlowSource(element) {
  return (
    is(element, 'bpmn:InteractionNode') &&
    !is(element, 'bpmn:BoundaryEvent') && (
      !is(element, 'bpmn:Event') || (
        is(element, 'bpmn:ThrowEvent') &&
        hasEventDefinitionOrNone(element, 'bpmn:MessageEventDefinition')
      )
    )
  );
}

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
function isMessageFlowTarget(element) {
  return (
    is(element, 'bpmn:InteractionNode') &&
    !isForCompensation(element) && (
      !is(element, 'bpmn:Event') || (
        is(element, 'bpmn:CatchEvent') &&
        hasEventDefinitionOrNone(element, 'bpmn:MessageEventDefinition')
      )
    ) && !(
      is(element, 'bpmn:BoundaryEvent') &&
      !hasEventDefinition(element, 'bpmn:MessageEventDefinition')
    )
  );
}

/**
 * @param {Element} element
 *
 * @return {ModdleElement}
 */
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

/**
 * @param {Element} a
 * @param {Element} b
 *
 * @return {boolean}
 */
function isSameScope(a, b) {
  var scopeParentA = getScopeParent(a),
      scopeParentB = getScopeParent(b);

  return scopeParentA === scopeParentB;
}

/**
 * @param {Element} element
 * @param {string} eventDefinition
 *
 * @return {boolean}
 */
function hasEventDefinition(element, eventDefinition) {
  var businessObject = getBusinessObject(element);

  return !!find(businessObject.eventDefinitions || [], function(definition) {
    return is(definition, eventDefinition);
  });
}

/**
 * @param {Element} element
 * @param {string} eventDefinition
 *
 * @return {boolean}
 */
function hasEventDefinitionOrNone(element, eventDefinition) {
  var businessObject = getBusinessObject(element);

  return (businessObject.eventDefinitions || []).every(function(definition) {
    return is(definition, eventDefinition);
  });
}

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
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

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
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

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
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

/**
 * @param {Element} element
 *
 * @return {Shape[]}
 */
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

/**
 * @param {Shape} possibleParent
 * @param {Element} element
 *
 * @return {boolean}
 */
function isParent(possibleParent, element) {
  var allParents = getParents(element);

  return allParents.indexOf(possibleParent) !== -1;
}

/**
 * @param {Element} source
 * @param {Element} target
 * @param {Connection} connection
 *
 * @return {CanConnectResult}
 */
function canConnect(source, target, connection) {

  if (nonExistingOrLabel(source) || nonExistingOrLabel(target)) {
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

  if (canConnectCompensationAssociation(source, target)) {
    return {
      type: 'bpmn:Association',
      associationDirection: 'One'
    };
  }

  if (canConnectAssociation(source, target)) {
    return {
      type: 'bpmn:Association',
      associationDirection: 'None'
    };
  }

  return false;
}

/**
 * Can an element be dropped into the target element.
 *
 * @param {Element} element
 * @param {Shape} target
 *
 * @return {boolean}
 */
function canDrop(element, target) {

  // can move labels and groups everywhere
  if (isLabel(element) || isGroup(element)) {
    return true;
  }


  // disallow to create elements on collapsed pools
  if (is(target, 'bpmn:Participant') && !isExpanded(target)) {
    return false;
  }

  // allow to create new participants on
  // existing collaboration and process diagrams
  if (is(element, 'bpmn:Participant')) {
    return is(target, 'bpmn:Process') || is(target, 'bpmn:Collaboration');
  }

  // allow moving DataInput / DataOutput within its original container only
  if (isAny(element, [ 'bpmn:DataInput', 'bpmn:DataOutput' ])) {

    if (element.parent) {
      return target === element.parent;
    }
  }

  // allow creating lanes on participants and other lanes only
  if (is(element, 'bpmn:Lane')) {
    return is(target, 'bpmn:Participant') || is(target, 'bpmn:Lane');
  }

  // disallow dropping boundary events which cannot replace with intermediate event
  if (is(element, 'bpmn:BoundaryEvent') && !isDroppableBoundaryEvent(element)) {
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

  // disallow dropping data store reference if there is no process to append to
  if (is(element, 'bpmn:DataStoreReference') && is(target, 'bpmn:Collaboration')) {
    return some(getBusinessObject(target).get('participants'), function(participant) {
      return !!participant.get('processRef');
    });
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

/**
 * @param {Shape} event
 *
 * @return {boolean}
 */
function isDroppableBoundaryEvent(event) {
  return getBusinessObject(event).cancelActivity && (
    hasNoEventDefinition(event) || hasCommonBoundaryIntermediateEventDefinition(event)
  );
}

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
function isBoundaryEvent(element) {
  return !isLabel(element) && is(element, 'bpmn:BoundaryEvent');
}

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
function isLane(element) {
  return is(element, 'bpmn:Lane');
}

/**
 * `bpmn:IntermediateThrowEvents` are treated as boundary events during create.
 *
 * @param {Element} element
 *
 * @return {boolean}
 */
function isBoundaryCandidate(element) {
  if (isBoundaryEvent(element)) {
    return true;
  }

  if (is(element, 'bpmn:IntermediateThrowEvent') && hasNoEventDefinition(element)) {
    return true;
  }

  return (
    is(element, 'bpmn:IntermediateCatchEvent') &&
    hasCommonBoundaryIntermediateEventDefinition(element)
  );
}

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
function hasNoEventDefinition(element) {
  var businessObject = getBusinessObject(element);

  return businessObject && !(businessObject.eventDefinitions && businessObject.eventDefinitions.length);
}

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
function hasCommonBoundaryIntermediateEventDefinition(element) {
  return hasOneOfEventDefinitions(element, [
    'bpmn:MessageEventDefinition',
    'bpmn:TimerEventDefinition',
    'bpmn:SignalEventDefinition',
    'bpmn:ConditionalEventDefinition'
  ]);
}

/**
 * @param {Element} element
 * @param {string[]} eventDefinitions
 *
 * @return {boolean}
 */
function hasOneOfEventDefinitions(element, eventDefinitions) {
  return eventDefinitions.some(function(definition) {
    return hasEventDefinition(element, definition);
  });
}

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
function isReceiveTaskAfterEventBasedGateway(element) {
  return (
    is(element, 'bpmn:ReceiveTask') &&
    find(element.incoming, function(incoming) {
      return is(incoming.source, 'bpmn:EventBasedGateway');
    })
  );
}

/**
 * TODO(philippfromme): remove `source` parameter
 *
 * @param {Element[]} elements
 * @param {Shape} target
 * @param {Element} source
 * @param {Point} [position]
 *
 * @return {boolean | 'attach'}
 */
function canAttach(elements, target, source, position) {

  if (!Array.isArray(elements)) {
    elements = [ elements ];
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

  // do not attach on receive tasks after event based gateways
  if (isReceiveTaskAfterEventBasedGateway(target)) {
    return false;
  }

  return 'attach';
}

/**
 * Check whether the given elements can be replaced. Return all elements which
 * can be replaced.
 *
 * @example
 *
 * ```javascript
 * [{
 *   id: 'IntermediateEvent_1',
 *   type: 'bpmn:StartEvent'
 * },
 * {
 *   id: 'Task_1',
 *   type: 'bpmn:ServiceTask'
 * }]
 * ```
 *
 * @param  {Element[]} elements
 * @param  {Shape} [target]
 * @param  {Point} [position]
 *
 * @return {CanReplaceResult}
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

        // replace an error/escalation/compensate start event by a blank interrupting start event
        // when the target is not an event sub process
        if (hasErrorEventDefinition(element) ||
            hasEscalationEventDefinition(element) ||
            hasCompensateEventDefinition(element)) {
          canExecute.replacements.push({
            oldElementId: element.id,
            newElementType: 'bpmn:StartEvent'
          });
        }

        // replace a typed start event by a blank interrupting start event
        // when the target is a sub process but not an event sub process
        if (hasOneOfEventDefinitions(element,
          [
            'bpmn:MessageEventDefinition',
            'bpmn:TimerEventDefinition',
            'bpmn:SignalEventDefinition',
            'bpmn:ConditionalEventDefinition'
          ]) &&
            is(target, 'bpmn:SubProcess')) {
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

/**
 * @param {Element[]} elements
 * @param {Shape} target
 *
 * @return {boolean}
 */
function canMove(elements, target) {

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

/**
 * @param {Shape} shape
 * @param {Shape} target
 * @param {Element} source
 * @param {Point} position
 *
 * @return {boolean}
 */
function canCreate(shape, target, source, position) {

  if (!target) {
    return false;
  }

  if (isLabel(shape) || isGroup(shape)) {
    return true;
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

/**
 * @param {Shape} shape
 * @param {Rect} newBounds
 *
 * @return {boolean}
 */
function canResize(shape, newBounds) {
  if (is(shape, 'bpmn:SubProcess')) {
    return (
      isExpanded(shape) && (
        !newBounds || (newBounds.width >= 100 && newBounds.height >= 80)
      )
    );
  }

  if (is(shape, 'bpmn:Lane')) {
    return true;
  }

  if (is(shape, 'bpmn:Participant')) {
    return true;
  }

  if (isTextAnnotation(shape)) {
    return true;
  }

  if (isGroup(shape)) {
    return true;
  }

  return false;
}

/**
 * Check whether one of of the elements to be connected is a text annotation.
 *
 * @param {Element} source
 * @param {Element} target
 *
 * @return {boolean}
 */
function isOneTextAnnotation(source, target) {

  var sourceTextAnnotation = isTextAnnotation(source),
      targetTextAnnotation = isTextAnnotation(target);

  return (
    (sourceTextAnnotation || targetTextAnnotation) &&
    (sourceTextAnnotation !== targetTextAnnotation)
  );
}

/**
 * @param {Element} source
 * @param {Element} target
 *
 * @return {CanConnectResult}
 */
function canConnectAssociation(source, target) {

  // don't connect parent <-> child
  if (isParent(target, source) || isParent(source, target)) {
    return false;
  }

  // allow connection of associations between <!TextAnnotation> and <TextAnnotation>
  if (isOneTextAnnotation(source, target)) {
    return true;
  }

  // can connect associations where we can connect
  // data associations, too (!)
  return !!canConnectDataAssociation(source, target);
}

/**
 * @param {Element} source
 * @param {Element} target
 *
 * @return {boolean}
 */
function canConnectCompensationAssociation(source, target) {
  return (
    isSameScope(source, target) &&
    isCompensationBoundary(source) &&
    is(target, 'bpmn:Activity') &&
    !isHostOfElement(target, source) &&
    !isEventSubProcess(target)
  );
}

/**
 * @param {Element} source
 * @param {Element} target
 *
 * @return {boolean}
 */
function canConnectMessageFlow(source, target) {

  // during connect user might move mouse out of canvas
  // https://github.com/bpmn-io/bpmn-js/issues/1033
  if (getRootElement(source) && !getRootElement(target)) {
    return false;
  }

  return (
    isMessageFlowSource(source) &&
    isMessageFlowTarget(target) &&
    !isSameOrganization(source, target)
  );
}

/**
 * @param {Element} source
 * @param {Element} target
 *
 * @return {boolean}
 */
function canConnectSequenceFlow(source, target) {
  return isSequenceFlowSource(source) &&
         isSequenceFlowTarget(target) &&
         isSameScope(source, target) &&
         !(is(source, 'bpmn:EventBasedGateway') && !isEventBasedTarget(target));
}

/**
 * @param {Element} source
 * @param {Element} target
 *
 * @return {CanConnectResult}
 */
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

/**
 * @param {Shape} shape
 * @param {Connection} connection
 * @param {Point} position
 *
 * @return {boolean}
 */
function canInsert(shape, connection, position) {
  if (!connection) {
    return false;
  }

  if (Array.isArray(shape)) {
    if (shape.length !== 1) {
      return false;
    }

    shape = shape[ 0 ];
  }

  if (connection.source === shape ||
      connection.target === shape) {
    return false;
  }

  // return true if shape can be inserted into connection parent
  return (
    isAny(connection, [ 'bpmn:SequenceFlow', 'bpmn:MessageFlow' ]) &&
    !isLabel(connection) &&
    is(shape, 'bpmn:FlowNode') &&
    !is(shape, 'bpmn:BoundaryEvent') &&
    canDrop(shape, connection.parent, position));
}

/**
 * @param {Element[]} elements
 * @param {Element} element
 *
 * @return {boolean}
 */
function includes(elements, element) {
  return (elements && element) && elements.indexOf(element) !== -1;
}

/**
 * @param {Element[]} elements
 * @param {Element} element
 *
 * @return {boolean}
 */
function canCopy(elements, element) {
  if (isLabel(element)) {
    return true;
  }

  if (is(element, 'bpmn:Lane') && !includes(elements, element.parent)) {
    return false;
  }

  return true;
}

/**
 * @param {Element} element
 *
 * @return {Element|null}
 */
function getRootElement(element) {
  return getParent(element, 'bpmn:Process') || getParent(element, 'bpmn:Collaboration');
}

function isHostOfElement(potentialHost, element) {
  return potentialHost.attachers.includes(element);
}
