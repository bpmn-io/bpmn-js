import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { getBusinessObject } from '../../../util/ModelUtil';

import { isAny } from '../util/ModelingUtil';

import { isLabel } from '../../../util/LabelUtil';

/**
 * @typedef {import('../../replace/BpmnReplace').default} BpmnReplace
 * @typedef {import('didi').Injector} Injector
 */

var LOW_PRIORITY = 500;


/**
 * Replace intermediate event with boundary event when creating or moving results in attached event.
 *
 * @param {BpmnReplace} bpmnReplace
 * @param {Injector} injector
 */
export default function AttachEventBehavior(bpmnReplace, injector) {
  injector.invoke(CommandInterceptor, this);

  this._bpmnReplace = bpmnReplace;

  var self = this;

  this.postExecuted('elements.create', LOW_PRIORITY, function(context) {
    var elements = context.elements;

    elements = elements.filter(function(shape) {
      var host = shape.host;

      return shouldReplace(shape, host);
    });

    if (elements.length !== 1) {
      return;
    }

    elements.map(function(element) {
      return elements.indexOf(element);
    }).forEach(function(index) {
      var host = elements[ index ];

      context.elements[ index ] = self._replaceShape(elements[ index ], host);
    });
  }, true);


  this.preExecute('elements.move', LOW_PRIORITY, function(context) {
    var shapes = context.shapes,
        host = context.newHost;

    if (shapes.length !== 1) {
      return;
    }

    var shape = shapes[0];

    if (shouldReplace(shape, host)) {
      context.shapes = [ self._replaceShape(shape, host) ];
    }
  }, true);
}

AttachEventBehavior.$inject = [
  'bpmnReplace',
  'injector'
];

inherits(AttachEventBehavior, CommandInterceptor);

AttachEventBehavior.prototype._replaceShape = function(shape, host) {
  var eventDefinition = getEventDefinition(shape);

  var boundaryEvent = {
    type: 'bpmn:BoundaryEvent',
    host: host
  };

  if (eventDefinition) {
    boundaryEvent.eventDefinitionType = eventDefinition.$type;
  }

  return this._bpmnReplace.replaceElement(shape, boundaryEvent, { layoutConnection: false });
};


// helpers //////////

function getEventDefinition(element) {
  var businessObject = getBusinessObject(element),
      eventDefinitions = businessObject.eventDefinitions;

  return eventDefinitions && eventDefinitions[0];
}

function shouldReplace(shape, host) {
  return !isLabel(shape) &&
    isAny(shape, [ 'bpmn:IntermediateThrowEvent', 'bpmn:IntermediateCatchEvent' ]) && !!host;
}
