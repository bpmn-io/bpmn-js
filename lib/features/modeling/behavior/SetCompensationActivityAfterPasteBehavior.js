import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { getBusinessObject, is } from '../../../util/ModelUtil';

import { hasEventDefinition } from '../../../util/DiUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../../rules/BpmnRules').default} BpmnRules
 * @typedef {import('../Modeling').default} Modeling
 */


/**
 * A behavior that sets the property of Compensation Activity after paste operation
 *
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 */
export default function SetCompensationActivityAfterPasteBehavior(eventBus, modeling) {

  CommandInterceptor.call(this, eventBus);

  this.postExecuted('elements.create', function(event) {
    const context = event.context,
          elements = context.elements;

    // check if compensation activity is connected to compensation boundary event
    for (const element of elements) {
      if (isForCompensation(element) && !isConnectedToCompensationBoundaryEvent(element)) {
        modeling.updateProperties(element, { isForCompensation: undefined });
      }
    }
  });
}

inherits(SetCompensationActivityAfterPasteBehavior, CommandInterceptor);

SetCompensationActivityAfterPasteBehavior.$inject = [
  'eventBus',
  'modeling'
];


// helpers //////////////////////

function isForCompensation(element) {
  const bo = getBusinessObject(element);
  return bo && bo.isForCompensation;
}

function isCompensationBoundaryEvent(element) {
  return element && is(element, 'bpmn:BoundaryEvent') &&
      hasEventDefinition(element, 'bpmn:CompensateEventDefinition');
}

function isConnectedToCompensationBoundaryEvent(element) {
  const compensationAssociations = element.incoming.filter(
    connection => isCompensationBoundaryEvent(connection.source)
  );
  if (compensationAssociations.length > 0) {
    return true;
  }
  return false;
}