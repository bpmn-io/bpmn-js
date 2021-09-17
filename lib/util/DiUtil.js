import {
  is,
  getBusinessObject,
  getDi
} from './ModelUtil';

import {
  forEach
} from 'min-dash';


export function isExpanded(element, di) {

  if (is(element, 'bpmn:CallActivity')) {
    return false;
  }

  if (is(element, 'bpmn:SubProcess')) {
    di = di || getDi(element);

    if (di && is(di, 'bpmndi:BPMNPlane')) {
      return true;
    }

    return di && !!di.isExpanded;
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

export function hasErrorEventDefinition(element) {
  return hasEventDefinition(element, 'bpmn:ErrorEventDefinition');
}

export function hasEscalationEventDefinition(element) {
  return hasEventDefinition(element, 'bpmn:EscalationEventDefinition');
}

export function hasCompensateEventDefinition(element) {
  return hasEventDefinition(element, 'bpmn:CompensateEventDefinition');
}
