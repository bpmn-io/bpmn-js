'use strict';

var  forEach = require('lodash/collection/forEach'),
     filter = require('lodash/collection/filter');

var ReplaceMenuEntries = require ('./ReplaceMenuEntries');

var startEventReplace =  ReplaceMenuEntries.startEventReplace,
    intermediateEventReplace =  ReplaceMenuEntries.intermediateEventReplace,
    endEventReplace =  ReplaceMenuEntries.endEventReplace,
    gatewayReplace =  ReplaceMenuEntries.gatewayReplace,
    taskReplace =  ReplaceMenuEntries.taskReplace;



function getReplacementMenuEntries(element, replaceElement) {

  var menuEntries = [];
  var bo = element.businessObject;


  if (bo.$instanceOf('bpmn:StartEvent')) {

    addEntries(startEventReplace, function(entry) {
      var eventDefinition = bo.eventDefinition ? bo.eventDefinition[0].$type : '';

      return entry.options.eventDefinition  !== eventDefinition.$type;
    });
  } else if (bo.$instanceOf('bpmn:IntermediateCatchEvent') ||
             bo.$instanceOf('bpmn:IntermediateThrowEvent')) {

    addEntries(intermediateEventReplace, function(entry) {

      var eventDefinition = bo.eventDefinitions ? bo.eventDefinitions[0].$type : '';
      var isEventDefinitionEqual = entry.options.eventDefinition  === eventDefinition;
      var isEventTypeEqual =  bo.$type === entry.targetType;

      return ((!isEventDefinitionEqual && isEventTypeEqual) ||
              !isEventTypeEqual) ||
              !(isEventDefinitionEqual && isEventTypeEqual);
    });
  } else if (bo.$instanceOf('bpmn:EndEvent')) {

    addEntries(endEventReplace, function(entry) {
      var eventDefinition = bo.eventDefinition ? bo.eventDefinition[0].$type : '';

      return entry.options.eventDefinition  !== eventDefinition.$type;
    });
  } else if (bo.$instanceOf('bpmn:Gateway')) {

    addEntries(gatewayReplace, function(entry) {

      return entry.targetType  !== bo.$type;
    });
  } else if (bo.$instanceOf('bpmn:FlowNode')) {

    addEntries(taskReplace, function(entry) {

      return entry.targetType  !== bo.$type;
    });
  }

  function addEntries(entries, filterFun) {
    // Filter selected type from the array
    var filteredEntries = filter(entries, filterFun);

    // Add entries to replace menu
    forEach(filteredEntries, function(definition) {

      var entry = addMenuEntry(definition);
      menuEntries.push(entry);
    });
  }

  function addMenuEntry(definition) {

    var label = definition.label,
        newType = definition.targetType,
        options = definition.options,
        actionName = definition.actionName,
        className = definition.className;

    function appendListener() {
      replaceElement(element, newType, options);
    }

    return {
      label: label,
      className: className,
      action: {
        name: actionName,
        handler: appendListener
      }
    };
  }

  return menuEntries;
}


module.exports.getReplacementMenuEntries = getReplacementMenuEntries;
