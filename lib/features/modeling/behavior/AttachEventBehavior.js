import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { isAny } from '../util/ModelingUtil';
import { getBusinessObject } from '../../../util/ModelUtil';


/**
 * BPMN specific attach event behavior
 */
export default function AttachEventBehavior(eventBus, bpmnReplace) {

  CommandInterceptor.call(this, eventBus);

  /**
   * replace intermediate event with boundary event when
   * attaching it to a shape
   */

  this.preExecute('elements.move', function(context) {
    var shapes = context.shapes,
        host = context.newHost,
        shape,
        eventDefinition,
        boundaryEvent,
        newShape;

    if (shapes.length !== 1) {
      return;
    }

    shape = shapes[0];

    if (host && isAny(shape, [ 'bpmn:IntermediateThrowEvent', 'bpmn:IntermediateCatchEvent' ])) {

      eventDefinition = getEventDefinition(shape);

      boundaryEvent = {
        type: 'bpmn:BoundaryEvent',
        host: host
      };

      if (eventDefinition) {
        boundaryEvent.eventDefinitionType = eventDefinition.$type;
      }

      newShape = bpmnReplace.replaceElement(shape, boundaryEvent, { layoutConnection: false });

      context.shapes = [ newShape ];
    }
  }, true);
}

AttachEventBehavior.$inject = [
  'eventBus',
  'bpmnReplace'
];

inherits(AttachEventBehavior, CommandInterceptor);



// helper /////
function getEventDefinition(element) {
  var bo = getBusinessObject(element);

  return bo && bo.eventDefinitions && bo.eventDefinitions[0];
}
