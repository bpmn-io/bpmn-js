'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

function RemoveElementBehavior(eventBus, bpmnRules, modeling) {

  CommandInterceptor.call(this, eventBus);

  /**
   * Combine sequence flows when deleting an element
   * if there is one incoming and one outgoing
   * sequence flow
   */

  this.preExecute('shape.delete', function(e) {

    var shape = e.context.shape;

    if (shape.incoming.length == 1 && shape.outgoing.length == 1) {

      var inConnection = shape.incoming[0],
          outConnection = shape.outgoing[0];

      var docking = outConnection.waypoints[outConnection.waypoints.length - 1];

      if (bpmnRules.canConnect(inConnection.source, outConnection.target, inConnection)) {
        modeling.reconnectEnd(inConnection, outConnection.target, docking);
      }

    }
  });
}

inherits(RemoveElementBehavior, CommandInterceptor);

RemoveElementBehavior.$inject = [ 'eventBus', 'bpmnRules', 'modeling' ];

module.exports = RemoveElementBehavior;
