'use strict';

var forEach = require('lodash/collection/forEach'),
    inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

function DropBehavior(eventBus, modeling) {

  CommandInterceptor.call(this, eventBus);

  // remove sequence flows that should not be allowed
  // after a move operation

  this.postExecute('shapes.move', function(context) {

    var closure = context.closure,
        allConnections = closure.allConnections;

    forEach(allConnections, function(c) {

      // remove sequence flows having source / target on different parents
      if (c.businessObject.$instanceOf('bpmn:SequenceFlow') && c.source.parent !== c.target.parent) {
        modeling.removeConnection(c);
      }
    });
  }, true);
}

inherits(DropBehavior, CommandInterceptor);

DropBehavior.$inject = [ 'eventBus', 'modeling' ];

module.exports = DropBehavior;