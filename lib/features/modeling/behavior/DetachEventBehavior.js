import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  getBusinessObject,
  is
} from '../../../util/ModelUtil';

import { isLabel } from '../../../util/LabelUtil';

var LOW_PRIORITY = 500;


/**
 * Replace boundary event with intermediate event when creating or moving results in detached event.
 */
export default function DetachEventBehavior(bpmnReplace, injector) {
  injector.invoke(CommandInterceptor, this);

  this._bpmnReplace = bpmnReplace;

  var self = this;

  this.postExecuted('elements.create', LOW_PRIORITY, function(context) {
    var elements = context.elements;

    elements.filter(function(shape) {
      var host = shape.host;

      return shouldReplace(shape, host);
    }).map(function(shape) {
      return elements.indexOf(shape);
    }).forEach(function(index) {
      context.elements[ index ] = self.replaceShape(elements[ index ]);
    });
  }, true);

  this.preExecute('elements.move', LOW_PRIORITY, function(context) {
    var shapes = context.shapes,
        newHost = context.newHost;

    shapes.forEach(function(shape, index) {
      var host = shape.host;

      if (shouldReplace(shape, includes(shapes, host) ? host : newHost)) {
        shapes[ index ] = self.replaceShape(shape);
      }
    });
  }, true);
}

DetachEventBehavior.$inject = [
  'bpmnReplace',
  'injector'
];

inherits(DetachEventBehavior, CommandInterceptor);

DetachEventBehavior.prototype.replaceShape = function(shape) {
  var eventDefinition = getEventDefinition(shape),
      intermediateEvent;

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

  return this._bpmnReplace.replaceElement(shape, intermediateEvent, { layoutConnection: false });
};


// helpers //////////

function getEventDefinition(element) {
  var businessObject = getBusinessObject(element),
      eventDefinitions = businessObject.eventDefinitions;

  return eventDefinitions && eventDefinitions[0];
}

function shouldReplace(shape, host) {
  return !isLabel(shape) && is(shape, 'bpmn:BoundaryEvent') && !host;
}

function includes(array, item) {
  return array.indexOf(item) !== -1;
}