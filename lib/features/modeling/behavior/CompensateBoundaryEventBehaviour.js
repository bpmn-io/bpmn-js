import inherits from 'inherits-browser';

import { is } from '../../../util/ModelUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';
import { hasEventDefinition } from '../../../util/DiUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('diagram-js/lib/features/modeling/Modeling').default} Modeling
 */

export default function CompensateBoundaryEventBehaviour(eventBus, modeling, bpmnRules) {

  var replacing = false;

  CommandInterceptor.call(this, eventBus);

  function addIsForCompensationProperty(target) {
    if (is(target, 'bpmn:Activity') && !isForCompensation(target)) {
      modeling.updateProperties(target, { isForCompensation: true });

    }
  }

  function removeIsForCompensationProperty(target) {
    if (is(target, 'bpmn:Activity') && isForCompensation(target)) {
      modeling.updateProperties(target, { isForCompensation: false });

    }
  }

  function removeIlegalConnections(element) {

    if (element.incoming && element.incoming.length > 0) {
      element.incoming.forEach(function(connection) {
        if (!bpmnRules.canConnect(connection.source, element)) {
          modeling.removeConnection(connection);
        }
      });
    }

    if (element.outgoing && element.outgoing.length > 0) {
      element.outgoing.forEach(function(connection) {
        if (!bpmnRules.canConnect(element, connection.target)) {
          modeling.removeConnection(connection);
        }
      });
    }
  }

  this.postExecute('connection.delete', function(context) {
    var source = context.source,
        target = context.target;

    if (isCompensationBoundaryEvent(source)) {
      removeIsForCompensationProperty(target);
    }
  }, true);

  this.preExecute('connection.create', function(context) {
    var source = context.source,
        target = context.target;

    var incoming = target.incoming;

    if (isCompensationBoundaryEvent(source)) {

      addIsForCompensationProperty(target);

      if (!replacing) {
        removeIlegalConnections(target, incoming);
      }
    }

  }, true);

  this.postExecute('connection.reconnect', function(context) {
    var newSource = context.newSource,
        newTarget = context.newTarget,
        oldSource = context.oldSource,
        oldTarget = context.oldTarget;


    if (isCompensationBoundaryEvent(oldSource)) {

      // remove `isForCompensation` from old target
      removeIsForCompensationProperty(oldTarget);
    }

    if (isCompensationBoundaryEvent(newSource)) {

      // add `isForCompensation` to new target
      addIsForCompensationProperty(newTarget);

      if (!replacing) {
        removeIlegalConnections(newTarget);
      }

    }
  }, true);

  this.postExecute('shape.replace', function(context) {
    var oldShape = context.oldShape,
        newShape = context.newShape;

    if (replacing) {
      replacing = false;

      if (isCompensationBoundaryEvent(context.oldShape) && !isCompensationBoundaryEvent(context.newShape)) {

        // revert to sequence flow
        oldShape.outgoing.forEach(function(connection) {
          removeIsForCompensationProperty(connection.target);
          modeling.connect(newShape, connection.target);
        });

      }
    }
  }, true);

  this.preExecute('shape.replace', function(context) {
    var oldShape = context.oldShape,
        newData = context.newData;

    if ((is(oldShape, 'bpmn:BoundaryEvent') && newData.eventDefinitionType === 'bpmn:CompensateEventDefinition')
        || isCompensationBoundaryEvent(oldShape) && newData.eventDefinitionType !== 'bpmn:CompensateEventDefinition') {
      replacing = true;
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