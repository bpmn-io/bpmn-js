import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';

import {
  filter,
  forEach
} from 'min-dash';


/**
 * BPMN specific boundary event behavior
 */
export default function BoundaryEventBehavior(eventBus, modeling) {

  CommandInterceptor.call(this, eventBus);

  function getBoundaryEvents(element) {
    return filter(element.attachers, function(attacher) {
      return is(attacher, 'bpmn:BoundaryEvent');
    });
  }

  // remove after connecting to event-based gateway
  this.postExecute('connection.create', function(event) {
    var source = event.context.source,
        target = event.context.target,
        boundaryEvents = getBoundaryEvents(target);

    if (
      is(source, 'bpmn:EventBasedGateway') &&
      is(target, 'bpmn:ReceiveTask') &&
      boundaryEvents.length > 0
    ) {
      modeling.removeElements(boundaryEvents);
    }

  });

  // remove after replacing connected gateway with event-based gateway
  this.postExecute('connection.reconnect', function(event) {
    var oldSource = event.context.oldSource,
        newSource = event.context.newSource;

    if (is(oldSource, 'bpmn:Gateway') &&
        is(newSource, 'bpmn:EventBasedGateway')) {
      forEach(newSource.outgoing, function(connection) {
        var target = connection.target,
            attachedboundaryEvents = getBoundaryEvents(target);

        if (is(target, 'bpmn:ReceiveTask') &&
            attachedboundaryEvents.length > 0) {
          modeling.removeElements(attachedboundaryEvents);
        }
      });
    }
  });
}

BoundaryEventBehavior.$inject = [
  'eventBus',
  'modeling'
];

inherits(BoundaryEventBehavior, CommandInterceptor);
