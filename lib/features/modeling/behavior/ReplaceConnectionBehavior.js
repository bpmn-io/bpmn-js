import {
  forEach,
  find,
  matchPattern
} from 'min-dash';

import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../Modeling').default} Modeling
 * @typedef {import('../../rules/BpmnRules').default} BpmnRules
 * @typedef {import('didi').Injector} Injector
 */

/**
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 * @param {BpmnRules} bpmnRules
 * @param {Injector} injector
 */
export default function ReplaceConnectionBehavior(eventBus, modeling, bpmnRules, injector) {

  CommandInterceptor.call(this, eventBus);

  var dragging = injector.get('dragging', false);

  function fixConnection(connection) {

    var source = connection.source,
        target = connection.target,
        parent = connection.parent;

    // do not do anything if connection
    // is already deleted (may happen due to other
    // behaviors plugged-in before)
    if (!parent) {
      return;
    }

    var replacementType,
        remove;

    /**
     * Check if incoming or outgoing connections
     * can stay or could be substituted with an
     * appropriate replacement.
     *
     * This holds true for SequenceFlow <> MessageFlow.
     */

    if (is(connection, 'bpmn:SequenceFlow')) {
      if (!bpmnRules.canConnectSequenceFlow(source, target)) {
        remove = true;
      }

      if (bpmnRules.canConnectMessageFlow(source, target)) {
        replacementType = 'bpmn:MessageFlow';
      }
    }

    // transform message flows into sequence flows, if possible

    if (is(connection, 'bpmn:MessageFlow')) {

      if (!bpmnRules.canConnectMessageFlow(source, target)) {
        remove = true;
      }

      if (bpmnRules.canConnectSequenceFlow(source, target)) {
        replacementType = 'bpmn:SequenceFlow';
      }
    }

    // remove invalid connection,
    // unless it has been removed already
    if (remove) {
      modeling.removeConnection(connection);
    }

    // replace SequenceFlow <> MessageFlow

    if (replacementType) {
      modeling.connect(source, target, {
        type: replacementType,
        waypoints: connection.waypoints.slice()
      });
    }
  }

  function replaceReconnectedConnection(event) {

    var context = event.context,
        connection = context.connection,
        source = context.newSource || connection.source,
        target = context.newTarget || connection.target,
        allowed,
        replacement;

    allowed = bpmnRules.canConnect(source, target);

    if (!allowed || allowed.type === connection.type) {
      return;
    }

    replacement = modeling.connect(source, target, {
      type: allowed.type,
      associationDirection: allowed.associationDirection,
      waypoints: connection.waypoints.slice()
    });

    // remove old connection unless it's already removed
    if (connection.parent) {
      modeling.removeConnection(connection);
    }

    // replace connection in context to reconnect end/start
    context.connection = replacement;

    if (dragging) {
      cleanDraggingSelection(connection, replacement);
    }
  }

  // monkey-patch selection saved in dragging in order to re-select it when operation is finished
  function cleanDraggingSelection(oldConnection, newConnection) {
    var context = dragging.context(),
        previousSelection = context && context.payload.previousSelection,
        index;

    // do nothing if not dragging or no selection was present
    if (!previousSelection || !previousSelection.length) {
      return;
    }

    index = previousSelection.indexOf(oldConnection);

    if (index === -1) {
      return;
    }

    previousSelection.splice(index, 1, newConnection);
  }

  // lifecycle hooks

  this.postExecuted('elements.move', function(context) {

    var closure = context.closure,
        allConnections = closure.allConnections;

    forEach(allConnections, fixConnection);
  }, true);

  this.preExecute('connection.reconnect', replaceReconnectedConnection);

  this.postExecuted('element.updateProperties', function(event) {
    var context = event.context,
        properties = context.properties,
        element = context.element,
        businessObject = element.businessObject,
        connection;

    // remove condition on change to default
    if (properties.default) {
      connection = find(
        element.outgoing,
        matchPattern({ id: element.businessObject.default.id })
      );

      if (connection) {
        modeling.updateProperties(connection, { conditionExpression: undefined });
      }
    }

    // remove default from source on change to conditional
    if (properties.conditionExpression && businessObject.sourceRef.default === businessObject) {
      modeling.updateProperties(element.source, { default: undefined });
    }
  });
}

inherits(ReplaceConnectionBehavior, CommandInterceptor);

ReplaceConnectionBehavior.$inject = [
  'eventBus',
  'modeling',
  'bpmnRules',
  'injector'
];
