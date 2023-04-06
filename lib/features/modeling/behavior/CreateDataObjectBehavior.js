import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../BpmnFactory').default} BpmnFactory
 */

/**
 * BPMN specific create data object behavior.
 *
 * @param {EventBus} eventBus
 * @param {BpmnFactory} bpmnFactory
 */
export default function CreateDataObjectBehavior(eventBus, bpmnFactory) {

  CommandInterceptor.call(this, eventBus);

  this.preExecute('shape.create', function(event) {

    var context = event.context,
        shape = context.shape;

    if (is(shape, 'bpmn:DataObjectReference') && shape.type !== 'label') {

      // create a DataObject every time a DataObjectReference is created
      var dataObject = bpmnFactory.create('bpmn:DataObject');

      // set the reference to the DataObject
      shape.businessObject.dataObjectRef = dataObject;
    }
  });

}

CreateDataObjectBehavior.$inject = [
  'eventBus',
  'bpmnFactory'
];

inherits(CreateDataObjectBehavior, CommandInterceptor);