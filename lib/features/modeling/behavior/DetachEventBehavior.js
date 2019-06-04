import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  getBusinessObject,
  is
} from '../../../util/ModelUtil';

import { isLabel } from '../../../util/LabelUtil';


/**
 * BPMN specific detach event behavior
 */
export default function DetachEventBehavior(eventBus, bpmnReplace) {

  CommandInterceptor.call(this, eventBus);

  /**
   * replace boundary event with intermediate event when
   * detaching from a shape
   */

  this.preExecute('elements.move', function(context) {
    var shapes = context.shapes,
        host = context.newHost,
        shape,
        eventDefinition,
        intermediateEvent,
        newShape;

    if (shapes.length !== 1) {
      return;
    }

    shape = shapes[0];

    if (!isLabel(shape) && !host && is(shape, 'bpmn:BoundaryEvent')) {

      eventDefinition = getEventDefinition(shape);

      if (eventDefinition) {
        intermediateEvent = {
          type: 'bpmn:IntermediateCatchEvent',
          eventDefinitionType: eventDefinition.$type
        };
      } else {
        intermediateEvent = {
          type: 'bpmn:IntermediateThrowEvent'
        };
      }

      newShape = bpmnReplace.replaceElement(shape, intermediateEvent, { layoutConnection: false });

      context.shapes = [ newShape ];
    }
  }, true);
}

DetachEventBehavior.$inject = [
  'eventBus',
  'bpmnReplace'
];

inherits(DetachEventBehavior, CommandInterceptor);



// helper /////
function getEventDefinition(element) {
  var bo = getBusinessObject(element);

  return bo && bo.eventDefinitions && bo.eventDefinitions[0];
}
