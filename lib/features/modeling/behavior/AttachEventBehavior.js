import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';


/**
 * BPMN specific attach event behavior
 */
export default function AttachEventBehavior(eventBus, bpmnFactory, bpmnReplace) {

  CommandInterceptor.call(this, eventBus);

  /**
   * replace intermediate event with boundary event when
   * attaching it to a shape
   */

  this.preExecute('elements.move', function(context) {
    var shapes = context.shapes,
        host = context.newHost,
        shape,
        newShape,
        businessObject,
        boundaryEvent;

    if (shapes.length !== 1) {
      return;
    }

    shape = shapes[0];

    var attrs = {
      cancelActivity: true
    };

    if (host && is(shape, 'bpmn:IntermediateThrowEvent')) {
      attrs.attachedToRef = host.businessObject;

      businessObject = bpmnFactory.create('bpmn:BoundaryEvent', attrs);

      boundaryEvent = {
        type: 'bpmn:BoundaryEvent',
        businessObject: businessObject
      };

      newShape = bpmnReplace.replaceElement(shape, boundaryEvent);

      context.shapes = [ newShape ];
    }
  }, true);
}

AttachEventBehavior.$inject = [
  'eventBus',
  'bpmnFactory',
  'bpmnReplace'
];

inherits(AttachEventBehavior, CommandInterceptor);
