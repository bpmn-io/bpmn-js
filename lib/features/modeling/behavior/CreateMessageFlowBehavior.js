import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  setSnapped,
  mid
} from 'diagram-js/lib/features/snapping/SnapUtil';

import {
  is,
  getBusinessObject
} from '../../../util/ModelUtil';


/**
 * Behavior for replacing none event to message catch event after connecting with message flow
 */
export default function CreateMessageFlowBehavior(eventBus, bpmnReplace) {

  CommandInterceptor.call(this, eventBus);

  function hasNoEventDefinition(element) {
    return !getBusinessObject(element).eventDefinitions;
  }

  function findParticipantParent(element) {
    var parent = element;

    while ((parent = (parent || {}).parent)) {
      if (is(parent, 'bpmn:Participant')) {
        return parent;
      }
    }

    return null;
  }

  function isReplaceCandidate(element, source) {
    var sourceParticipantParent = findParticipantParent(source),
        targetParticipantParent = findParticipantParent(element);

    return (
      is(element, 'bpmn:IntermediateThrowEvent') &&
      hasNoEventDefinition(element) &&
      sourceParticipantParent &&
      targetParticipantParent &&
      sourceParticipantParent !== targetParticipantParent
    );
  }

  // allows connecting to external none events, which will be converted to message receive event afterwards
  this.canExecute([
    'connection.create',
    'connection.reconnectEnd'
  ], 1500, function(context) {
    var source = context.source || (context.connection || {}).source,
        target = context.hover || context.target;

    if (isReplaceCandidate(target, source)) {

      return { type: 'bpmn:MessageFlow' };
    }
  }, true, this);

  // replace none event with message receive event
  this.postExecuted([
    'connection.create',
    'connection.reconnectEnd'
  ], function(event) {
    var context = event.context,
        source = context.source || (context.connection || {}).source,
        target = context.newTarget || context.target;

    if (isReplaceCandidate(target, source)) {

      bpmnReplace.replaceElement(target, {
        type: 'bpmn:IntermediateCatchEvent',
        eventDefinitionType: 'bpmn:MessageEventDefinition'
      });
    }
  });

  // can't use BpmnSnapping here because it uses the bpmn rules for allowing snapping
  eventBus.on([
    'connect.move',
    'connect.hover',
    'connect.end'
  ], 1500, function(event) {
    var context = event.context,
        source = context.source,
        target = context.target;

    if (isReplaceCandidate(target, source)) {

      var position = mid(target);
      setSnapped(event, 'x', position.x);
      setSnapped(event, 'y', position.y);
    }
  });
}

CreateMessageFlowBehavior.$inject = [
  'eventBus',
  'bpmnReplace'
];

inherits(CreateMessageFlowBehavior, CommandInterceptor);
