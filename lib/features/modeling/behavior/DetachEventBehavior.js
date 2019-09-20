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
   * copying from a shape and pasting outside
   */
  this.postExecute('elements.create', function(context) {
    var elements = context.elements;

    elements.forEach(function(shape, index, ary) {
      if (shouldReplace(shape, shape.host)) {
        ary[ index ] = getNewShape(shape, bpmnReplace);
      }
    });
  }, true);

  /**
   * replace boundary event with intermediate event when
   * dragging from a shape
   */
  this.preExecute('elements.move', function(context) {
    var shapes = context.shapes,
        host = context.newHost,
        shape;

    if (shapes.length !== 1) {
      return;
    }

    shape = shapes[0];

    if (shouldReplace(shape, host)) {
      context.shapes = [ getNewShape(shape, bpmnReplace) ];
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

function shouldReplace(shape, host) {
  return !isLabel(shape) && !host && is(shape, 'bpmn:BoundaryEvent');
}

function getNewShape(oldShape, bpmnReplace) {
  var eventDefinition = getEventDefinition(oldShape),

      intermediateEvent = eventDefinition ? {
        type: 'bpmn:IntermediateCatchEvent',
        eventDefinitionType: eventDefinition.$type
      } : {
        type: 'bpmn:IntermediateThrowEvent'
      };

  return bpmnReplace.replaceElement(oldShape, intermediateEvent, { layoutConnection: false });
}
