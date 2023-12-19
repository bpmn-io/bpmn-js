import inherits from 'inherits-browser';

import { getBusinessObject, is } from '../../../util/ModelUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';
import { hasEventDefinition, isEventSubProcess } from '../../../util/DiUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../lib/features/modeling/Modeling').default} Modeling
 */

/**
 *
 * @param {import('diagram-js/lib/core/EventBus').default} eventBus
 * @param {import('../Modeling').default} modeling
 * @param {import('../../rules/BpmnRules').default} bpmnRules
 */
export default function CompensateBoundaryEventBehavior(eventBus, modeling, bpmnRules) {

  CommandInterceptor.call(this, eventBus);

  this.preExecute('shape.replace', handleReplacement, true);
  this.preExecute('connection.create', handleNewConnection, true);
  this.postExecuted('connection.delete', handleConnectionRemoval, true);
  this.postExecuted('connection.reconnect', handleReconnection, true);
  this.postExecuted('element.updateProperties', handlePropertiesUpdate, true);

  function handleConnectionRemoval(context) {
    const source = context.source,
          target = context.target;

    if (isCompensationBoundaryEvent(source)) {
      removeIsForCompensationProperty(target);
    }
  }

  function handleNewConnection(context) {
    const source = context.source,
          target = context.target;

    if (isCompensationBoundaryEvent(source) && canBeForCompensation(target)) {
      addIsForCompensationProperty(target);
      removeExistingAssociation(source);
    }
  }

  function handleReconnection(context) {
    const newSource = context.newSource,
          newTarget = context.newTarget,
          oldSource = context.oldSource,
          oldTarget = context.oldTarget;

    if (isCompensationBoundaryEvent(oldSource) && isForCompensation(oldTarget)) {
      removeIsForCompensationProperty(oldTarget);
    }

    if (isCompensationBoundaryEvent(newSource) && canBeForCompensation(newTarget)) {
      addIsForCompensationProperty(newTarget);
    }
  }

  function handlePropertiesUpdate(context) {
    const { element } = context;

    if (isForCompensation(element)) {
      removeIllegalConnections(element);
    }
  }

  function handleReplacement(context) {
    const { targetElement } = context.hints || {},
          { oldShape } = context;

    if (isCompensationBoundaryEvent(context.oldShape) &&
      targetElement.eventDefinitionType !== 'bpmn:CompensateEventDefinition' ||
      targetElement.type !== 'bpmn:BoundaryEvent'
    ) {
      const compensationAssociation = oldShape.outgoing.find(
        ({ target }) => isForCompensation(target)
      );

      if (compensationAssociation) {
        removeIsForCompensationProperty(compensationAssociation.target);
      }
    }
  }

  function addIsForCompensationProperty(target) {
    modeling.updateProperties(target, { isForCompensation: true });
  }

  function removeIsForCompensationProperty(target) {
    modeling.updateProperties(target, { isForCompensation: undefined });
  }

  function removeIllegalConnections(element, exception) {

    for (const connection of element.incoming) {
      if (connection === exception) {
        continue;
      }

      if (!bpmnRules.canConnect(connection.source, element)) {
        modeling.removeConnection(connection);
      }
    }

    for (const connection of element.outgoing) {
      if (connection === exception) {
        continue;
      }

      if (!bpmnRules.canConnect(element, connection.target)) {
        modeling.removeConnection(connection);
      }
    }
  }

  function removeExistingAssociation(boundaryEvent) {
    const associations = boundaryEvent.outgoing.filter(connection => is(connection, 'bpmn:Association'));
    const associationsToRemove = associations.filter(association => isForCompensation(association.target));

    // remove existing associations
    associationsToRemove.forEach(association => modeling.removeConnection(association));
  }
}

inherits(CompensateBoundaryEventBehavior, CommandInterceptor);

CompensateBoundaryEventBehavior.$inject = [
  'eventBus',
  'modeling',
  'bpmnRules'
];

// helpers //////////

function isForCompensation(element) {
  const bo = getBusinessObject(element);
  return bo && bo.get('isForCompensation');
}

function isCompensationBoundaryEvent(element) {
  return element && is(element, 'bpmn:BoundaryEvent') &&
    hasEventDefinition(element, 'bpmn:CompensateEventDefinition');
}

function canBeForCompensation(element) {
  return element && is(element, 'bpmn:Activity') && !isEventSubProcess(element);
}
