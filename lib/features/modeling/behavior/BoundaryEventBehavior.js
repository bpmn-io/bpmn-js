import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';

import {
  filter,
  forEach
} from 'min-dash';

var HIGH_PRIORITY = 2000;


/**
 * BPMN specific boundary event behavior
 */
export default function BoundaryEventBehavior(eventBus, moddle, modeling) {

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

  // copy reference to root element on replace
  eventBus.on('moddleCopy.canCopyProperty', HIGH_PRIORITY, function(context) {
    var parent = context.parent,
        property = context.property,
        propertyName = context.propertyName;

    var propertyDescriptor = moddle.getPropertyDescriptor(parent, propertyName);

    if (propertyDescriptor && propertyDescriptor.isReference && is(property, 'bpmn:RootElement')) {
      parent.set(propertyName, property);
    }
  });
}

BoundaryEventBehavior.$inject = [
  'eventBus',
  'moddle',
  'modeling'
];

inherits(BoundaryEventBehavior, CommandInterceptor);