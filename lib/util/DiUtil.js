'use strict';

var is = require('./ModelUtil').is,
    getBusinessObject = require('./ModelUtil').getBusinessObject;

var forEach = require('lodash/collection/forEach');

module.exports.isExpanded = function(element) {

  if (is(element, 'bpmn:CallActivity')) {
    return false;
  }

  if (is(element, 'bpmn:SubProcess')) {
    return !!getBusinessObject(element).di.isExpanded;
  }

  if (is(element, 'bpmn:Participant')) {
    return !!getBusinessObject(element).processRef;
  }

  return true;
};

module.exports.isInterrupting = function(element) {
  return element && getBusinessObject(element).isInterrupting !== false;
};

module.exports.isEventSubProcess = function(element) {
  return element && !!getBusinessObject(element).triggeredByEvent;
};

function hasEventDefinition(element, eventType) {
  var bo = getBusinessObject(element),
      hasEventDefinition = false;

  if (bo.eventDefinitions) {
    forEach(bo.eventDefinitions, function(event) {
      if (is(event, eventType)) {
        hasEventDefinition = true;
      }
    });
  }

  return hasEventDefinition;
}

module.exports.hasEventDefinition = hasEventDefinition;

module.exports.hasErrorEventDefinition = function(element) {
  return hasEventDefinition(element, 'bpmn:ErrorEventDefinition');
};

module.exports.hasEscalationEventDefinition = function(element) {
  return hasEventDefinition(element, 'bpmn:EscalationEventDefinition');
};

module.exports.hasCompensateEventDefinition = function(element) {
  return hasEventDefinition(element, 'bpmn:CompensateEventDefinition');
};
