'use strict';

var any = require('lodash/collection/any');

var ALLOWED_TYPES = {
  FailedJobRetryTimeCycle: [ 'bpmn:StartEvent', 'bpmn:BoundaryEvent', 'bpmn:IntermediateCatchEvent', 'bpmn:Activity' ],
  Connector: [ 'bpmn:EndEvent', 'bpmn:IntermediateThrowEvent' ],
  Field: [ 'bpmn:EndEvent', 'bpmn:IntermediateThrowEvent' ]
};


function is(element, type) {
  return element && (typeof element.$instanceOf === 'function') && element.$instanceOf(type);
}

function exists(element) {
  return element && element.length;
}

function includesType(collection, type) {
  return exists(collection) && any(collection, function(element) {
    return is(element, type);
  });
}

function anyType(element, types) {
  return any(types, function(type) {
    return is(element, type);
  });
}

function isAllowed(propName, propDescriptor, newElement) {
  var name = propDescriptor.name,
      types = ALLOWED_TYPES[ name.replace(/camunda:/, '') ];

  return name === propName && anyType(newElement, types);
}


function CamundaModdleExtension(eventBus) {

  eventBus.on('property.clone', function(context) {
    var newElement = context.newElement,
        propDescriptor = context.propertyDescriptor;

    if (isAllowed('camunda:FailedJobRetryTimeCycle', propDescriptor, newElement)) {
      return includesType(newElement.eventDefinitions, 'bpmn:TimerEventDefinition') ||
             includesType(newElement.eventDefinitions, 'bpmn:SignalEventDefinition') ||
             is(newElement.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics');
    }

    if (isAllowed('camunda:Connector', propDescriptor, newElement)) {
      return includesType(newElement.eventDefinitions, 'bpmn:MessageEventDefinition');
    }

    if (isAllowed('camunda:Field', propDescriptor, newElement)) {
      return includesType(newElement.eventDefinitions, 'bpmn:MessageEventDefinition');
    }
  });
}

CamundaModdleExtension.$inject = [ 'eventBus' ];

module.exports = {
  __init__: [ 'CamundaModdleExtension' ],
  CamundaModdleExtension: [ 'type', CamundaModdleExtension ]
};
