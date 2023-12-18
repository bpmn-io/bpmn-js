import inherits from 'inherits-browser';

import { is } from '../../../util/ModelUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';
import { hasEventDefinition, isEventSubProcess } from '../../../util/DiUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('diagram-js/lib/features/modeling/Modeling').default} Modeling
 */

export default function CompensateBoundaryEventBehaviour(eventBus, modeling, bpmnRules) {

  CommandInterceptor.call(this, eventBus);

  function addIsForCompensationProperty(target) {
    modeling.updateProperties(target, { isForCompensation: true });
  }

  function removeIsForCompensationProperty(target) {
    modeling.updateProperties(target, { isForCompensation: undefined });
  }

  function removeIlegalConnections(element, exception) {

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

  this.postExecuted('connection.delete', function(context) {
    const source = context.source,
          target = context.target;

    if (isCompensationBoundaryEvent(source)) {
      removeIsForCompensationProperty(target);
    }
  }, true);

  this.preExecute('connection.create', function(context) {
    const source = context.source,
          target = context.target;

    if (isCompensationBoundaryEvent(source) && canBeForCompensation(target)) {
      addIsForCompensationProperty(target);
    }
  }, true);

  this.postExecuted('connection.create', function(context) {
    const source = context.source,
          target = context.target,
          connection = context.connection;

    if (isCompensationBoundaryEvent(source) && isForCompensation(target)) {
      removeIlegalConnections(target, connection);
    }
  }, true);

  this.postExecuted('connection.reconnect', function(context) {
    const newSource = context.newSource,
          newTarget = context.newTarget,
          oldSource = context.oldSource,
          oldTarget = context.oldTarget;


    if (isCompensationBoundaryEvent(oldSource) && isForCompensation(oldTarget)) {

      // remove `isForCompensation` from old target
      removeIsForCompensationProperty(oldTarget);
    }

    if (isCompensationBoundaryEvent(newSource) && canBeForCompensation(newTarget)) {

      // add `isForCompensation` to new target
      addIsForCompensationProperty(newTarget);
      removeIlegalConnections(newTarget);
    }
  }, true);

  this.preExecute('shape.replace', function(context) {
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
  }, true);
}

inherits(CompensateBoundaryEventBehaviour, CommandInterceptor);

CompensateBoundaryEventBehaviour.$inject = [
  'eventBus',
  'modeling',
  'bpmnRules'
];

// helpers //////////

function isForCompensation(element) {
  return element && element.businessObject.isForCompensation;
}

function isCompensationBoundaryEvent(element) {
  return element && is(element, 'bpmn:BoundaryEvent') &&
    hasEventDefinition(element, 'bpmn:CompensateEventDefinition');
}

function canBeForCompensation(element) {
  return element && is(element, 'bpmn:Activity') && !isEventSubProcess(element);
}
