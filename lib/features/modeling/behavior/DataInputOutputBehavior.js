import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  add as collectionAdd,
  remove as collectionRemove
} from 'diagram-js/lib/util/Collections';

import {
  getBusinessObject,
  is,
  isAny
} from '../../../util/ModelUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../Modeling').default} Modeling
 * @typedef {import('../BpmnFactory').default} BpmnFactory
 */

/**
 * BPMN specific data input/output behavior.
 *
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 * @param {BpmnFactory} bpmnFactory
 */
export default function DataInputOutputBehavior(eventBus, modeling, bpmnFactory) {

  CommandInterceptor.call(this, eventBus);

  // update parent on data input/output created
  this.preExecute('shape.create', 1500, function(event) {
    const context = event.context,
          shape = context.shape;


    if (!isAny(shape, [ 'bpmn:DataInput', 'bpmn:DataOutput' ]) || shape.type === 'label') {
      return;
    }

    // parent already configured
    if (shape.parent) {
      return;
    }

    const containment = is(shape, 'bpmn:DataInput') ? 'dataInputs' : 'dataOutputs';

    shape.parent = context.parent;

    let ioSpecification = getBusinessObject(shape.parent).get('ioSpecification');

    if (!ioSpecification) {
      ioSpecification = bpmnFactory.create('bpmn:InputOutputSpecification');
      ioSpecification.$parent = getBusinessObject(shape.parent);
      modeling.updateProperties(shape.parent, {
        ioSpecification
      });
    }

    shape.businessObject.$parent = ioSpecification;

    const container = ioSpecification.get(containment);
    collectionAdd(container, shape.businessObject);

    modeling.updateModdleProperties(shape.parent, ioSpecification, {
      [containment]: container
    });
  });

  this.postExecute('shape.delete', function(event) {
    const context = event.context,
          shape = context.shape;

    if (!isAny(shape, [ 'bpmn:DataInput', 'bpmn:DataOutput' ]) || shape.type === 'label') {
      return;
    }

    const containment = is(shape, 'bpmn:DataInput') ? 'dataInputs' : 'dataOutputs';

    let ioSpecification = getBusinessObject(context.oldParent).get('ioSpecification');

    if (!ioSpecification) {
      return;
    }

    const container = ioSpecification.get(containment);
    collectionRemove(container, shape.businessObject);

    modeling.updateModdleProperties(context.oldParent, ioSpecification, {
      [containment]: container
    });
  });
}

DataInputOutputBehavior.$inject = [
  'eventBus',
  'modeling',
  'bpmnFactory'
];

inherits(DataInputOutputBehavior, CommandInterceptor);
