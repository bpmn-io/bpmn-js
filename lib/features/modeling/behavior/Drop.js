'use strict';

var forEach = require('lodash/collection/forEach');


function DropBehavior(eventBus, modeling) {

  // sequence flow handling

  eventBus.on([
    'commandStack.shapes.move.postExecute'
  ], function(e) {

    var context = e.context,
        closure = context.closure,
        allConnections = closure.allConnections;

    forEach(allConnections, function(c) {

      // remove sequence flows having source / target on different parents
      if (c.businessObject.$instanceOf('bpmn:SequenceFlow') && c.source.parent !== c.target.parent) {
        modeling.removeConnection(c);
      }
    });
  });

}

DropBehavior.$inject = [ 'eventBus', 'modeling' ];

module.exports = DropBehavior;