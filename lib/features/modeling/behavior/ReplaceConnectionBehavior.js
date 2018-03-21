'use strict';

var forEach = require('min-dash').forEach,
    find = require('min-dash').find,
    inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var is = require('../../../util/ModelUtil').is;

function ReplaceConnectionBehavior(eventBus, modeling, bpmnRules) {

  CommandInterceptor.call(this, eventBus);

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

    if (is(connection, 'bpmn:Association') && !bpmnRules.canConnectAssociation(source, target)) {
      remove = true;
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

  this.postExecuted('elements.move', function(context) {

    var closure = context.closure,
        allConnections = closure.allConnections;

    forEach(allConnections, fixConnection);
  }, true);

  this.postExecuted([
    'connection.reconnectStart',
    'connection.reconnectEnd'
  ], function(event) {

    var connection = event.context.connection;

    fixConnection(connection);
  });

  this.postExecuted('element.updateProperties', function(event) {
    var context = event.context,
        properties = context.properties,
        element = context.element,
        businessObject = element.businessObject,
        connection;

    // remove condition expression when morphing to default flow
    if (properties.default) {
      connection = find(element.outgoing, { id: element.businessObject.default.id });

      if (connection) {
        modeling.updateProperties(connection, { conditionExpression: undefined });
      }
    }

    // remove default property from source when morphing to conditional flow
    if (properties.conditionExpression && businessObject.sourceRef.default === businessObject) {
      modeling.updateProperties(element.source, { default: undefined });
    }
  });
}

inherits(ReplaceConnectionBehavior, CommandInterceptor);

ReplaceConnectionBehavior.$inject = [ 'eventBus', 'modeling', 'bpmnRules' ];

module.exports = ReplaceConnectionBehavior;
