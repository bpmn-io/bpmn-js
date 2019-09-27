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
    var shapes = context.shapes;

    shapes.forEach(function(shape, index) {
      var hasHost = (shape.host && (context.shapes.indexOf(shape.host) > -1)) || !!context.newHost;

      if (shouldReplace(shape, hasHost)) {
        shapes[ index ] = replaceShape(shape, bpmnReplace);
      }
    });
  }, true);
}

DetachEventBehavior.$inject = [
  'eventBus',
  'bpmnReplace'
];

inherits(DetachEventBehavior, CommandInterceptor);



// helper /////
function shouldReplace(shape, hasHost) {
  return !isLabel(shape) && !hasHost && is(shape, 'bpmn:BoundaryEvent');
}

function replaceShape(oldShape, bpmnReplace) {
  var eventDefinition = getEventDefinition(oldShape),
      intermediateEvent = eventDefinition ? {
        type: 'bpmn:IntermediateCatchEvent',
        eventDefinitionType: eventDefinition.$type
      } : {
        type: 'bpmn:IntermediateThrowEvent'
      };

  return bpmnReplace.replaceElement(oldShape, intermediateEvent, { layoutConnection: false });
}

function getEventDefinition(element) {
  var bo = getBusinessObject(element);

  return bo && bo.eventDefinitions && bo.eventDefinitions[0];
}
