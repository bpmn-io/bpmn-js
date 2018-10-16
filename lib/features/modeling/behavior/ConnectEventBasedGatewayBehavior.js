import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';

import {
  filter
} from 'min-dash';


/**
 * Behavior for deleting boundaries from receive task after connecting them with event based gateway
 */
export default function ConnectEventBasedGatewayBehavior(eventBus, modeling) {

  CommandInterceptor.call(this, eventBus);

  function extractBoundaryEvents(element) {
    return filter(element.attachers, function(attacher) {
      return is(attacher, 'bpmn:BoundaryEvent');
    });
  }

  this.postExecute('connection.create', function(context) {
    var source = context.context.source,
        target = context.context.target,
        boundaries = extractBoundaryEvents(target);

    if (
      is(source, 'bpmn:EventBasedGateway') &&
      is(target, 'bpmn:ReceiveTask') &&
      boundaries.length > 0
    ) {
      modeling.removeElements(boundaries);
    }

  });
}

ConnectEventBasedGatewayBehavior.$inject = [
  'eventBus',
  'modeling',
  'bpmnRules'
];

inherits(ConnectEventBasedGatewayBehavior, CommandInterceptor);
