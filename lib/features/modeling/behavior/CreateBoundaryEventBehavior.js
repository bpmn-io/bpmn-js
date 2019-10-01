import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { isAny } from '../util/ModelingUtil';
import { isLabel } from '../../../util/LabelUtil';

/**
 * BPMN specific create boundary event behavior
 */
export default function CreateBoundaryEventBehavior(
    eventBus, modeling, elementFactory,
    bpmnFactory, moddleCopy) {

  CommandInterceptor.call(this, eventBus);

  /**
   * replace intermediate event with boundary event when
   * attaching it to a shape
   */

  this.preExecute('shape.create', function(context) {
    var shape = context.shape,
        host = context.host,
        businessObject,
        boundaryEvent;

    if (isLabel(shape)) {
      return;
    }

    var attrs = {
      cancelActivity: true
    };

    if (host && isAny(shape, [ 'bpmn:IntermediateThrowEvent', 'bpmn:IntermediateCatchEvent' ])) {
      attrs.attachedToRef = host.businessObject;

      businessObject = bpmnFactory.create('bpmn:BoundaryEvent', attrs);

      moddleCopy.copyElement(shape.businessObject, businessObject);

      boundaryEvent = {
        type: 'bpmn:BoundaryEvent',
        businessObject: businessObject
      };

      var newShape = elementFactory.createShape(boundaryEvent);
      context.shape.labels.forEach(function(label) {
        newShape.labels.add(label);
        label.labelTarget = newShape;
        label.businessObject = newShape.businessObject;
      });

      context.shape = newShape;
    }
  }, true);
}

CreateBoundaryEventBehavior.$inject = [
  'eventBus',
  'modeling',
  'elementFactory',
  'bpmnFactory',
  'moddleCopy'
];

inherits(CreateBoundaryEventBehavior, CommandInterceptor);
