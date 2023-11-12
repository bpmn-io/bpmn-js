import {
  is,
  getBusinessObject,
  getDi
} from './ModelUtil';

import {
  some
} from 'min-dash';

/**
 * @typedef {import('../model/Types').Element} Element
 * @typedef {import('../model/Types').ModdleElement} ModdleElement
 */

/**
 * @param {Element} element
 * @param {ModdleElement} [di]
 *
 * @return {boolean}
 */
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

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
export function isHorizontal(element) {

  if (!is(element, 'bpmn:Participant') && !is(element, 'bpmn:Lane')) {
    return undefined;
  }

  var isHorizontal = getDi(element).isHorizontal;

  if (isHorizontal === undefined) {
    return true;
  }

  return isHorizontal;
}

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
export function isInterrupting(element) {
  return element && getBusinessObject(element).isInterrupting !== false;
}

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
export function isEventSubProcess(element) {
  return element && !!getBusinessObject(element).triggeredByEvent;
}

/**
 * @param {Element} element
 * @param {string} eventType
 *
 * @return {boolean}
 */
export function hasEventDefinition(element, eventType) {
  var eventDefinitions = getBusinessObject(element).eventDefinitions;

  return some(eventDefinitions, function(event) {
    return is(event, eventType);
  });
}

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
export function hasErrorEventDefinition(element) {
  return hasEventDefinition(element, 'bpmn:ErrorEventDefinition');
}

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
export function hasEscalationEventDefinition(element) {
  return hasEventDefinition(element, 'bpmn:EscalationEventDefinition');
}

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
export function hasCompensateEventDefinition(element) {
  return hasEventDefinition(element, 'bpmn:CompensateEventDefinition');
}
