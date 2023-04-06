import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';

import { isExpanded } from '../../../util/DiUtil';

import { selfAndAllChildren } from 'diagram-js/lib/util/Elements';

import {
  getResizedSourceAnchor,
  getResizedTargetAnchor
} from 'diagram-js/lib/features/modeling/cmd/helper/AnchorsHelper';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../Modeling').default} Modeling
 */

/**
 * BPMN-specific message flow behavior.
 *
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 */
export default function MessageFlowBehavior(eventBus, modeling) {

  CommandInterceptor.call(this, eventBus);

  this.postExecute('shape.replace', function(context) {
    var oldShape = context.oldShape,
        newShape = context.newShape;

    if (!isParticipantCollapse(oldShape, newShape)) {
      return;
    }

    var messageFlows = getMessageFlows(oldShape);

    messageFlows.incoming.forEach(function(incoming) {
      var anchor = getResizedTargetAnchor(incoming, newShape, oldShape);

      modeling.reconnectEnd(incoming, newShape, anchor);
    });

    messageFlows.outgoing.forEach(function(outgoing) {
      var anchor = getResizedSourceAnchor(outgoing, newShape, oldShape);

      modeling.reconnectStart(outgoing, newShape, anchor);
    });
  }, true);

}

MessageFlowBehavior.$inject = [ 'eventBus', 'modeling' ];

inherits(MessageFlowBehavior, CommandInterceptor);

// helpers //////////

function isParticipantCollapse(oldShape, newShape) {
  return is(oldShape, 'bpmn:Participant')
    && isExpanded(oldShape)
    && is(newShape, 'bpmn:Participant')
    && !isExpanded(newShape);
}

function getMessageFlows(parent) {
  var elements = selfAndAllChildren([ parent ], false);

  var incoming = [],
      outgoing = [];

  elements.forEach(function(element) {
    if (element === parent) {
      return;
    }

    element.incoming.forEach(function(connection) {
      if (is(connection, 'bpmn:MessageFlow')) {
        incoming.push(connection);
      }
    });

    element.outgoing.forEach(function(connection) {
      if (is(connection, 'bpmn:MessageFlow')) {
        outgoing.push(connection);
      }
    });
  }, []);

  return {
    incoming: incoming,
    outgoing: outgoing
  };
}