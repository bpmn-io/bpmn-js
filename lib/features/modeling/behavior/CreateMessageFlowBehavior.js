import inherits from 'inherits';

import { assign } from 'min-dash';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import ReplaceAndConnectHandler from './cmd/ReplaceAndConnectHandler';

import {
  is,
  getBusinessObject
} from '../../../util/ModelUtil';

import {
  getParent
} from '../util/ModelingUtil';


/**
 * BPMN specific create message flow behavior.
 * Allows connecting but prevents it and replaces before connecting.
 */
export default function CreateMessageFlowBehavior(
    bpmnReplace,
    commandStack,
    elementRegistry,
    eventBus
) {

  CommandInterceptor.call(this, eventBus);

  commandStack.registerHandler('replaceAndConnect', ReplaceAndConnectHandler);

  function hasEventDefinition(element) {
    return getBusinessObject(element).eventDefinitions;
  }

  function canReplace(target, source) {
    var sourceParent = getParent(source, 'bpmn:Participant'),
        targetParent = getParent(target, 'bpmn:Participant');

    return (
      is(target, 'bpmn:IntermediateThrowEvent') &&
      !hasEventDefinition(target) &&
      sourceParent &&
      targetParent &&
      sourceParent !== targetParent
    );
  }

  function canConnect(event) {
    var context = event.context,
        source = context.source || (context.connection || {}).source,
        target = context.hover || context.target;

    if (source && target && canReplace(target, source)) {
      return { type: 'bpmn:MessageFlow' };
    }
  }

  // replace on <connect.end>
  eventBus.on('connect.end', 2000, function(event) {
    var context = event.context,
        source = context.source,
        target = context.target;

    if (canConnect(event)) {
      commandStack.execute('replaceAndConnect', {
        source: source,
        target: target,
        replace: {
          target: {
            type: 'bpmn:IntermediateCatchEvent',
            eventDefinitionType: 'bpmn:MessageEventDefinition'
          }
        }
      });

      var newTarget = elementRegistry.get(target.id);

      assign(context, {
        target: newTarget
      });

      // fire original event with new target
      // TODO: firing this again will lead to connect being executed again
      // eventBus.fire('connect.end', event);

      // can't use event.stopPropagation since we fire the original event
      return false;
    }
  });

  // allow connecting to intermediate event that can be replaced with message event
  this.canExecute([
    'connection.create',
    'connection.reconnectEnd'
  ], 1500, canConnect);

  // replace on <commandStack.connection.create>
  this.preExecute('connection.create', function(event) {
    var context = event.context,
        source = context.source,
        target = context.target;

    if (canReplace(target, source)) {
      context.target = bpmnReplace.replaceElement(target, {
        type: 'bpmn:IntermediateCatchEvent',
        eventDefinitionType: 'bpmn:MessageEventDefinition'
      });
    }
  });

  // replace on <commandStack.connection.reconnectEnd>
  this.preExecute('connection.reconnectEnd', function(event) {
    var context = event.context,
        connection = context.connection,
        source = connection.source,
        target = context.newTarget;

    if (canReplace(target, source)) {
      context.newTarget = bpmnReplace.replaceElement(target, {
        type: 'bpmn:IntermediateCatchEvent',
        eventDefinitionType: 'bpmn:MessageEventDefinition'
      });
    }
  });
}

CreateMessageFlowBehavior.$inject = [
  'bpmnReplace',
  'commandStack',
  'elementRegistry',
  'eventBus'
];

inherits(CreateMessageFlowBehavior, CommandInterceptor);
