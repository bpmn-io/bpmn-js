import {
  is,
  isAny,
  getBusinessObject
} from './ModelUtil';

import {
  isLabel
} from './LabelUtil';

import {
  forEach
} from 'min-dash';


export function isExpanded(element) {

  if (is(element, 'bpmn:CallActivity')) {
    return false;
  }

  if (is(element, 'bpmn:SubProcess')) {
    return !!getBusinessObject(element).di.isExpanded;
  }

  if (is(element, 'bpmn:Participant')) {
    return !!getBusinessObject(element).processRef;
  }

  return true;
}

export function isInterrupting(element) {
  return element && getBusinessObject(element).isInterrupting !== false;
}

export function isEventSubProcess(element) {
  return element && !!getBusinessObject(element).triggeredByEvent;
}

export function hasEventDefinition(element, eventType) {
  var bo = getBusinessObject(element),
      hasEventDefinition = false;

  if (bo.eventDefinitions) {
    forEach(bo.eventDefinitions, function(event) {
      if (is(event, eventType)) {
        hasEventDefinition = true;
      }
    });
  }

  return hasEventDefinition;
}

export function hasNoEventDefinition(element) {
  var bo = getBusinessObject(element);

  return bo && !(bo.eventDefinitions && bo.eventDefinitions.length);
}

export function hasErrorEventDefinition(element) {
  return hasEventDefinition(element, 'bpmn:ErrorEventDefinition');
}

export function hasEscalationEventDefinition(element) {
  return hasEventDefinition(element, 'bpmn:EscalationEventDefinition');
}

export function hasCompensateEventDefinition(element) {
  return hasEventDefinition(element, 'bpmn:CompensateEventDefinition');
}

function hasCommonBoundaryIntermediateEventDefinition(element) {
  return hasOneOfEventDefinitions(element, [
    'bpmn:MessageEventDefinition',
    'bpmn:TimerEventDefinition',
    'bpmn:SignalEventDefinition',
    'bpmn:ConditionalEventDefinition'
  ]);
}

function hasOneOfEventDefinitions(element, eventDefinitions) {
  return eventDefinitions.some(function(definition) {
    return hasEventDefinition(element, definition);
  });
}

/**
 * Return the parent of the element with any of the given types.
 *
 * @param {djs.model.Base} element
 * @param {String|Array<String>} anyType
 *
 * @return {djs.model.Base}
 */
export function getParent(element, anyType) {

  if (typeof anyType === 'string') {
    anyType = [ anyType ];
  }

  while ((element = element.parent)) {
    if (isAny(element, anyType)) {
      return element;
    }
  }

  return null;
}

/**
 * We treat IntermediateThrowEvents as boundary events during create,
 * this must be reflected in the rules.
 */
export function isBoundaryCandidate(element) {
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

export function isBoundaryEvent(element) {
  return !isLabel(element) && is(element, 'bpmn:BoundaryEvent');
}

export function isDroppableBoundaryEvent(event) {
  return getBusinessObject(event).cancelActivity && (
    hasNoEventDefinition(event) || hasCommonBoundaryIntermediateEventDefinition(event)
  );
}