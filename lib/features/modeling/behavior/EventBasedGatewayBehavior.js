import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../Modeling').default} Modeling
 */

/**
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 */
export default function EventBasedGatewayBehavior(eventBus, modeling) {

  CommandInterceptor.call(this, eventBus);

  /**
   * Remove incoming sequence flows of event-based target when creating
   * sequence flow.
   *
   * 1. If source is event-based gateway remove all incoming sequence flows
   * 2. If source is not event-based gateway remove all incoming sequence flows
   * whose source is event-based gateway
   */
  this.preExecuted('connection.create', function(event) {
    var context = event.context,
        connection = context.connection,
        source = context.source,
        target = context.target,
        hints = context.hints;

    if (hints && hints.createElementsBehavior === false) {
      return;
    }

    if (!isSequenceFlow(connection)) {
      return;
    }

    var sequenceFlows = [];

    if (is(source, 'bpmn:EventBasedGateway')) {
      sequenceFlows = target.incoming
        .filter(flow =>
          flow !== connection &&
          isSequenceFlow(flow)
        );
    } else {
      sequenceFlows = target.incoming
        .filter(flow =>
          flow !== connection &&
          isSequenceFlow(flow) &&
          is(flow.source, 'bpmn:EventBasedGateway')
        );
    }

    sequenceFlows.forEach(function(sequenceFlow) {
      modeling.removeConnection(sequenceFlow);
    });
  });

  /**
   * Remove incoming sequence flows of event-based targets when replacing source
   * with event-based gateway.
   */
  this.preExecuted('shape.replace', function(event) {
    var context = event.context,
        newShape = context.newShape;

    if (!is(newShape, 'bpmn:EventBasedGateway')) {
      return;
    }

    var targets = newShape.outgoing.filter(isSequenceFlow)
      .reduce(function(targets, sequenceFlow) {
        if (!targets.includes(sequenceFlow.target)) {
          return targets.concat(sequenceFlow.target);
        }

        return targets;
      }, []);

    targets.forEach(function(target) {
      target.incoming.filter(isSequenceFlow).forEach(function(sequenceFlow) {
        const sequenceFlowsFromNewShape = target.incoming.filter(isSequenceFlow).filter(function(sequenceFlow) {
          return sequenceFlow.source === newShape;
        });

        if (sequenceFlow.source !== newShape || sequenceFlowsFromNewShape.length > 1) {
          modeling.removeConnection(sequenceFlow);
        }
      });
    });
  });
}

EventBasedGatewayBehavior.$inject = [
  'eventBus',
  'modeling'
];

inherits(EventBasedGatewayBehavior, CommandInterceptor);

// helpers //////////

function isSequenceFlow(connection) {
  return is(connection, 'bpmn:SequenceFlow');
}