'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var is = require('../../../util/ModelUtil').is,
    getBusinessObject = require('../../../util/ModelUtil').getBusinessObject;

/**
 * A behavior that unsets the Default property of
 * sequence flow source on element delete, if the
 * removed element is the Gateway or Task's default flow.
 *
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 */
function DeleteSequenceFlowBehavior(eventBus, modeling) {

  CommandInterceptor.call(this, eventBus);


  this.preExecute('connection.delete', function(event) {
    var context = event.context,
        connection = context.connection,
        source = connection.source;

    if (isDefaultFlow(connection, source)) {
      modeling.updateProperties(source, {
        'default': null
      });
    }
  });
}

inherits(DeleteSequenceFlowBehavior, CommandInterceptor);

DeleteSequenceFlowBehavior.$inject = [ 'eventBus', 'modeling' ];

module.exports = DeleteSequenceFlowBehavior;


/////// helpers ///////////////////////////

function isDefaultFlow(connection, source) {

  if (!is(connection, 'bpmn:SequenceFlow')) {
    return false;
  }

  var sourceBo = getBusinessObject(source),
      sequenceFlow = getBusinessObject(connection);

  return sourceBo.get('default') === sequenceFlow;
}