import { isEventSubProcess } from '../../../../util/DiUtil';
import { getBusinessObject, is } from '../../../../util/ModelUtil';

export const NON_INTERRUPTING_EVENT_TYPES = [
  'bpmn:MessageEventDefinition',
  'bpmn:TimerEventDefinition',
  'bpmn:EscalationEventDefinition',
  'bpmn:ConditionalEventDefinition',
  'bpmn:SignalEventDefinition'
];

export function canBeNonInterrupting(shape) {

  const businessObject = getBusinessObject(shape);

  if (
    !is(businessObject, 'bpmn:BoundaryEvent') &&
    !(is(businessObject, 'bpmn:StartEvent') && isEventSubProcess(businessObject.$parent))
  ) {
    return false;
  }

  const eventDefinitions = businessObject.get('eventDefinitions');
  if (!eventDefinitions || !eventDefinitions.length) {
    return false;
  }

  return NON_INTERRUPTING_EVENT_TYPES.some(event => is(eventDefinitions[0], event));
}

export function getInterruptingProperty(shape) {
  return is(shape, 'bpmn:BoundaryEvent') ? 'cancelActivity' : 'isInterrupting';
}