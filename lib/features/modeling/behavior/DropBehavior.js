'use strict';

var forEach = require('lodash/collection/forEach'),
    inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var is = require('../../../util/ModelUtil').is,
    getSharedParent = require('../ModelingUtil').getSharedParent;


function DropBehavior(eventBus, modeling, bpmnRules) {

  CommandInterceptor.call(this, eventBus);

  // remove sequence flows that should not be allowed
  // after a move operation

  this.postExecute('shapes.move', function(context) {

    var closure = context.closure,
        allConnections = closure.allConnections;

    forEach(allConnections, function(c) {

      var source = c.source,
          target = c.target;

      var replacementType,
          remove;

      /**
       * Check if incoming or outgoing connections
       * can stay or could be substituted with an
       * appropriate replacement.
       *
       * This holds true for SequenceFlow <> MessageFlow.
       */

      if (is(c, 'bpmn:SequenceFlow')) {
        if (!bpmnRules.canConnectSequenceFlow(source, target)) {
          remove = true;
        }

        if (bpmnRules.canConnectMessageFlow(source, target)) {
          replacementType = 'bpmn:MessageFlow';
        }
      }

      // transform message flows into sequence flows, if possible

      if (is(c, 'bpmn:MessageFlow')) {

        if (!bpmnRules.canConnectMessageFlow(source, target)) {
          remove = true;
        }

        if (bpmnRules.canConnectSequenceFlow(source, target)) {
          replacementType = 'bpmn:SequenceFlow';
        }
      }

      if (is(c, 'bpmn:Association') && !bpmnRules.canConnectAssociation(source, target)) {
        remove = true;
      }


      // remove invalid connection
      if (remove) {
        modeling.removeConnection(c);
      }

      // replace SequenceFlow <> MessageFlow

      if (replacementType) {
        modeling.createConnection(source, target, {
          type: replacementType,
          waypoints: c.waypoints.slice()
        }, getSharedParent(source, target));
      }
    });
  }, true);
}

inherits(DropBehavior, CommandInterceptor);

DropBehavior.$inject = [ 'eventBus', 'modeling', 'bpmnRules' ];

module.exports = DropBehavior;