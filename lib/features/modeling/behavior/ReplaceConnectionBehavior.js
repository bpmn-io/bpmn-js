'use strict';

var forEach = require('lodash/collection/forEach'),
    inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var is = require('../../../util/ModelUtil').is,
    getSharedParent = require('../ModelingUtil').getSharedParent;

function ReplaceConnectionBehavior(eventBus, modeling, bpmnRules) {

  CommandInterceptor.call(this, eventBus);

  function replaceConnection(connection) {

    var source = connection.source,
        target = connection.target;

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


    // remove invalid connection
    if (remove) {
      modeling.removeConnection(connection);
    }

    // replace SequenceFlow <> MessageFlow

    if (replacementType) {
      modeling.createConnection(source, target, {
        type: replacementType,
        waypoints: connection.waypoints.slice()
      }, getSharedParent(source, target));
    }
  }

  this.postExecuted('shapes.move', function(context) {

    var closure = context.closure,
        allConnections = closure.allConnections;

    forEach(allConnections, replaceConnection);
  }, true);

  this.postExecuted([
    'connection.reconnectStart',
    'connection.reconnectEnd'
  ], function(event){

    var connection = event.context.connection;

    replaceConnection(connection);
  });

}

inherits(ReplaceConnectionBehavior, CommandInterceptor);

ReplaceConnectionBehavior.$inject = [ 'eventBus', 'modeling', 'bpmnRules' ];

module.exports = ReplaceConnectionBehavior;
