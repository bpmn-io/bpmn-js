import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';

export default function EventBasedGatewayBehavior(eventBus, modeling) {

  CommandInterceptor.call(this, eventBus);

  /**
   * Remove existing sequence flows of event-based target before connecting
   * from event-based gateway.
   */
  this.preExecuted('connection.create', function(event) {

    var context = event.context,
        source = context.source,
        target = context.target,
        existingIncomingConnections = target.incoming.slice();

    if (context.hints && context.hints.createElementsBehavior === false) {
      return;
    }

    if (
      is(source, 'bpmn:EventBasedGateway') &&
      target.incoming.length
    ) {

      existingIncomingConnections.filter(isSequenceFlow)
        .forEach(function(sequenceFlow) {
          modeling.removeConnection(sequenceFlow);
        });
    }
  });

  /**
   *  After replacing shape with event-based gateway, remove incoming sequence
   *  flows of event-based targets which do not belong to event-based gateway
   *  source.
   */
  this.preExecuted('shape.replace', function(event) {

    var newShape = event.context.newShape,
        newShapeTargets,
        newShapeTargetsIncomingSequenceFlows;

    if (!is(newShape, 'bpmn:EventBasedGateway')) {
      return;
    }

    newShapeTargets = newShape.outgoing.filter(isSequenceFlow)
      .map(function(sequenceFlow) {
        return sequenceFlow.target;
      });

    newShapeTargetsIncomingSequenceFlows = newShapeTargets.reduce(function(sequenceFlows, target) {
      var incomingSequenceFlows = target.incoming.filter(isSequenceFlow);

      return sequenceFlows.concat(incomingSequenceFlows);
    }, []);

    newShapeTargetsIncomingSequenceFlows.forEach(function(sequenceFlow) {
      if (sequenceFlow.source !== newShape) {
        modeling.removeConnection(sequenceFlow);
      }
    });
  });
}

EventBasedGatewayBehavior.$inject = [
  'eventBus',
  'modeling'
];

inherits(EventBasedGatewayBehavior, CommandInterceptor);



// helpers //////////////////////

function isSequenceFlow(connection) {
  return is(connection, 'bpmn:SequenceFlow');
}
