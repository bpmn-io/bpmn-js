import inherits from 'inherits-browser';

import { getBusinessObject, is } from '../../../util/ModelUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';
import { hasEventDefinition, isEventSubProcess } from '../../../util/DiUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../lib/features/modeling/Modeling').default} Modeling
 */

/**
 * Behavior ensuring that only a single compensation activity is connected to a
 * compensation boundary event when connecting, reconnecting or replacing shapes.
 *
 * @param {import('diagram-js/lib/core/EventBus').default} eventBus
 * @param {import('../Modeling').default} modeling
 * @param {import('../../rules/BpmnRules').default} bpmnRules
 */
export default function CompensateBoundaryEventBehavior(eventBus, modeling, bpmnRules) {

  CommandInterceptor.call(this, eventBus);

  this.preExecute('shape.replace', handleReplacement, true);
  this.postExecuted('shape.replace', handleReplacementPostExecuted, true);
  this.preExecute('connection.create', handleNewConnection, true);
  this.postExecuted('connection.delete', handleConnectionRemoval, true);
  this.postExecuted('connection.reconnect', handleReconnection, true);
  this.postExecuted('element.updateProperties', handlePropertiesUpdate, true);

  /**
   * Given a connection from boundary event is removed, remove the `isForCompensation` property.
   */
  function handleConnectionRemoval(context) {
    const source = context.source,
          target = context.target;

    if (isCompensationBoundaryEvent(source) && isForCompensation(target)) {
      removeIsForCompensationProperty(target);
    }
  }

  /**
   * Add `isForCompensation` property and make sure only a single compensation activity is connected.
   */
  function handleNewConnection(context) {
    const connection = context.connection,
          source = context.source,
          target = context.target;

    if (isCompensationBoundaryEvent(source) && isForCompensationAllowed(target)) {
      addIsForCompensationProperty(target);
      removeExistingAssociations(source, [ connection ]);
    }
  }

  function handleReconnection(context) {
    const newTarget = context.newTarget,
          oldSource = context.oldSource,
          oldTarget = context.oldTarget;

    // target changes
    if (oldTarget !== newTarget) {
      const source = oldSource;

      // oldTarget perspective
      if (isForCompensation(oldTarget)) {
        removeIsForCompensationProperty(oldTarget);
      }

      // newTarget perspective
      if (isCompensationBoundaryEvent(source) && isForCompensationAllowed(newTarget)) {
        addIsForCompensationProperty(newTarget);
      }
    }
  }

  function handlePropertiesUpdate(context) {
    const { element } = context;

    if (isForCompensation(element)) {
      removeDisallowedConnections(element);
      removeAttachments(element);
    } else if (isForCompensationAllowed(element)) {
      removeIncomingCompensationAssociations(element);
    }
  }

  /**
   * When replacing a boundary event, make sure the compensation activity is connected,
   * and remove the potential candidates for connection replacement to have a single compensation activity.
   */
  function handleReplacement(context) {
    const {
      newData,
      oldShape
    } = context;

    // from compensate boundary event
    if (isCompensationBoundaryEvent(context.oldShape) &&
      newData.eventDefinitionType !== 'bpmn:CompensateEventDefinition' ||
      newData.type !== 'bpmn:BoundaryEvent'
    ) {
      const targetConnection = oldShape.outgoing.find(
        ({ target }) => isForCompensation(target)
      );

      if (targetConnection && targetConnection.target) {
        context._connectionTarget = targetConnection.target;
      }
    }

    // to compensate boundary event
    else if (
      !isCompensationBoundaryEvent(context.oldShape) &&
      newData.eventDefinitionType === 'bpmn:CompensateEventDefinition' &&
      newData.type === 'bpmn:BoundaryEvent'
    ) {
      const targetConnection = oldShape.outgoing.find(
        ({ target }) => isForCompensationAllowed(target)
      );

      if (targetConnection && targetConnection.target) {
        context._connectionTarget = targetConnection.target;
      }

      removeOutgoingSequenceFlows(oldShape);
    }
  }

  function handleReplacementPostExecuted(context) {
    const { _connectionTarget: target, newShape } = context;

    if (target) {
      modeling.connect(newShape, target);
    }
  }

  function addIsForCompensationProperty(target) {
    modeling.updateProperties(target, { isForCompensation: true });
  }

  function removeIsForCompensationProperty(target) {
    modeling.updateProperties(target, { isForCompensation: undefined });
  }

  function removeDisallowedConnections(element) {

    for (const connection of element.incoming) {
      if (!bpmnRules.canConnect(connection.source, element)) {
        modeling.removeConnection(connection);
      }
    }

    for (const connection of element.outgoing) {
      if (!bpmnRules.canConnect(element, connection.target)) {
        modeling.removeConnection(connection);
      }
    }
  }

  function removeExistingAssociations(boundaryEvent, ignoredAssociations) {
    const associations = boundaryEvent.outgoing.filter(connection => is(connection, 'bpmn:Association'));
    const associationsToRemove = associations.filter(association => {
      return isForCompensation(association.target) && !ignoredAssociations.includes(association);
    });

    // remove existing associations
    associationsToRemove.forEach(association => modeling.removeConnection(association));
  }

  function removeAttachments(element) {
    const attachments = element.attachers.slice();

    if (!attachments.length) {
      return;
    }

    modeling.removeElements(attachments);
  }

  function removeIncomingCompensationAssociations(element) {
    const compensationAssociations = element.incoming.filter(
      connection => isCompensationBoundaryEvent(connection.source)
    );

    modeling.removeElements(compensationAssociations);
  }

  function removeOutgoingSequenceFlows(element) {
    const sequenceFlows = element.outgoing.filter(
      connection => is(connection, 'bpmn:SequenceFlow')
    );

    modeling.removeElements(sequenceFlows);
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

function isForCompensationAllowed(element) {
  return element && is(element, 'bpmn:Activity') && !isEventSubProcess(element);
}
