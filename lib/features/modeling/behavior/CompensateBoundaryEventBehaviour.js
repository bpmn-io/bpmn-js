import inherits from 'inherits-browser';

import { is } from '../../../util/ModelUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';
import { hasEventDefinition } from '../../../util/DiUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('diagram-js/lib/features/modeling/Modeling').default} Modeling
 */

export default function CompensateBoundaryEventBehaviour(eventBus, modeling) {

  CommandInterceptor.call(this, eventBus);

  function addIsForCompensationProperty(source, target) {
    if (isCompensationBoundaryEvent(source)) {
      if (is(target, 'bpmn:Activity') && !isForCompensation(target)) {
        modeling.updateProperties(target, { isForCompensation: true });
      }
    }
  }

  function removeIsForCompensationProperty(source, target) {
    if (isCompensationBoundaryEvent(source)) {
      if (is(target, 'bpmn:Activity') && isForCompensation(target)) {
        modeling.updateProperties(target, { isForCompensation: false });
      }
    }
  }

  this.preExecute('connection.create', function(context) {
    var source = context.source,
        target = context.target;

    addIsForCompensationProperty(source, target);
  }, true);

  this.postExecute('connection.reconnect', function(context) {
    var newSource = context.newSource,
        newTarget = context.newTarget,
        oldSource = context.oldSource,
        oldTarget = context.oldTarget;

    // add `isForCompensation` to new target
    addIsForCompensationProperty(newSource, newTarget);

    // remove `isForCompensation` from old target
    removeIsForCompensationProperty(oldSource, oldTarget);
  }, true);

  this.postExecute('connection.delete', function(context) {
    var source = context.source,
        target = context.target;

    removeIsForCompensationProperty(source, target);
  }, true);

}

inherits(CompensateBoundaryEventBehaviour, CommandInterceptor);

CompensateBoundaryEventBehaviour.$inject = [
  'eventBus',
  'modeling'
];

// helpers //////////

function isForCompensation(element) {
  return element && element.businessObject.isForCompensation;
}

function isCompensationBoundaryEvent(element) {
  return element && is(element, 'bpmn:BoundaryEvent') &&
    hasEventDefinition(element, 'bpmn:CompensateEventDefinition');
}