import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  getBusinessObject,
  is
} from '../../../util/ModelUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../Modeling').default} Modeling
 */

/**
 * A behavior that unsets the Default property of sequence flow source on
 * element delete, if the removed element is the Gateway or Task's default flow.
 *
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 */
export default function DeleteSequenceFlowBehavior(eventBus, modeling) {

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

DeleteSequenceFlowBehavior.$inject = [
  'eventBus',
  'modeling'
];


// helpers //////////////////////

function isDefaultFlow(connection, source) {

  if (!is(connection, 'bpmn:SequenceFlow')) {
    return false;
  }

  var sourceBo = getBusinessObject(source),
      sequenceFlow = getBusinessObject(connection);

  return sourceBo.get('default') === sequenceFlow;
}