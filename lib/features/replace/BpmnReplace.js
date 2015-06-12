'use strict';

var forEach = require('lodash/collection/forEach'),
    filter = require('lodash/collection/filter');

var REPLACE_OPTIONS = require ('./ReplaceOptions');

var startEventReplace =  REPLACE_OPTIONS.START_EVENT,
    intermediateEventReplace =  REPLACE_OPTIONS.INTERMEDIATE_EVENT,
    endEventReplace =  REPLACE_OPTIONS.END_EVENT,
    gatewayReplace =  REPLACE_OPTIONS.GATEWAY,
    taskReplace =  REPLACE_OPTIONS.TASK;

var is = require('../../util/ModelUtil').is,
    getBusinessObject = require('../../util/ModelUtil').getBusinessObject;


/**
 * A replace menu provider that gives users the controls to choose
 * and replace BPMN elements with each other.
 *
 * @param {BpmnFactory} bpmnFactory
 * @param {Moddle} moddle
 * @param {PopupMenu} popupMenu
 * @param {Replace} replace
 */
function BpmnReplace(bpmnFactory, moddle, popupMenu, replace, selection, modeling) {

  /**
   * Prepares a new business object for the replacement element
   * and triggers the replace operation.
   *
   * @param  {djs.model.Base} element
   * @param  {Object} target
   * @return {djs.model.Base} the newly created element
   */
  function replaceElement(element, target) {

    var type = target.type,
        oldBusinessObject = element.businessObject,
        businessObject = bpmnFactory.create(type);

    var newElement = {
      type: type,
      businessObject: businessObject
    };

    // initialize custom BPMN extensions

    if (target.eventDefinition) {
      var eventDefinitions = businessObject.get('eventDefinitions'),
          eventDefinition = moddle.create(target.eventDefinition);

      eventDefinitions.push(eventDefinition);
    }

    if (target.instantiate !== undefined) {
      businessObject.instantiate = target.instantiate;
    }

    if (target.eventGatewayType !== undefined) {
      businessObject.eventGatewayType = target.eventGatewayType;
    }

    // copy size (for activities only)
    if (oldBusinessObject.$instanceOf('bpmn:Activity')) {

      // TODO: need also to respect min/max Size

      newElement.width = element.width;
      newElement.height = element.height;
    }

    // TODO: copy other elligable properties from old business object
    businessObject.name = oldBusinessObject.name;
    businessObject.loopCharacteristics = oldBusinessObject.loopCharacteristics;

    newElement = replace.replaceElement(element, newElement);

    selection.select(newElement);

    return newElement;
  }

  var toggleEntries,
      toggledElement;


  function toggleMi(event, entry) {
    var loopCharacteristics;

    if (entry.active) {
      popupMenu.update(entry, { active: false });
      modeling.updateProperties(toggledElement, { loopCharacteristics: undefined });
      return;
    }

    forEach(toggleEntries, function(action) {
      var options = action.options;

      if (entry.id === action.id) {
        popupMenu.update(action.id, { active: true });

        loopCharacteristics = moddle.create(options.loopCharacteristics);

        if (options.isSequential) {
          loopCharacteristics.isSequential = options.isSequential;
        }
        return;
      }

      popupMenu.update(action.id, { active: false });
    });

    modeling.updateProperties(toggledElement, { loopCharacteristics: loopCharacteristics });
  }


  function getToggleOptions(element) {

    var businessObject = getBusinessObject(element),
        loopCharacteristics = businessObject.loopCharacteristics;

    var isSequential,
        isLoop,
        isParallel;

    if (loopCharacteristics) {
      isSequential = loopCharacteristics.isSequential;
      isLoop = loopCharacteristics.isSequential === undefined;
      isParallel = loopCharacteristics.isSequential !== undefined && !loopCharacteristics.isSequential;
    }

    toggledElement = element;

    toggleEntries = [
      {
        id: 'toggle-parallel-mi',
        className: 'icon-parallel-mi-marker',
        active: isParallel,
        action: toggleMi,
        options: {
          loopCharacteristics: 'bpmn:MultiInstanceLoopCharacteristics',
          isSequential: false
        }
      },
      {
        id: 'toggle-sequential-mi',
        className: 'icon-sequential-mi-marker',
        active: isSequential,
        action: toggleMi,
        options: {
          loopCharacteristics: 'bpmn:MultiInstanceLoopCharacteristics',
          isSequential: true
        }
      },
      {
        id: 'toggle-loop',
        className: 'icon-loop-marker',
        active: isLoop,
        action: toggleMi,
        options: {
          loopCharacteristics: 'bpmn:StandardLoopCharacteristics'
        }
      }
    ];

    return toggleEntries;
  }


  function getReplaceOptions(element) {

    var menuEntries = [];
    var businessObject = element.businessObject;

    if (businessObject.$instanceOf('bpmn:StartEvent')) {
      addEntries(startEventReplace, filterEvents);
    } else

    if (businessObject.$instanceOf('bpmn:IntermediateCatchEvent') ||
        businessObject.$instanceOf('bpmn:IntermediateThrowEvent')) {

      addEntries(intermediateEventReplace, filterEvents);
    } else

    if (businessObject.$instanceOf('bpmn:EndEvent')) {

      addEntries(endEventReplace, filterEvents);
    } else

    if (businessObject.$instanceOf('bpmn:Gateway')) {

      addEntries(gatewayReplace, function(entry) {

        return entry.target.type  !== businessObject.$type;
      });
    } else

    if (businessObject.$instanceOf('bpmn:FlowNode')) {
      addEntries(taskReplace, function(entry) {
        return entry.target.type  !== businessObject.$type;
      });
    }

    function filterEvents(entry) {

      var target = entry.target;

      var eventDefinition = businessObject.eventDefinitions && businessObject.eventDefinitions[0].$type;
      var isEventDefinitionEqual = target.eventDefinition == eventDefinition;
      var isEventTypeEqual =  businessObject.$type == target.type;

      return ((!isEventDefinitionEqual && isEventTypeEqual) ||
              !isEventTypeEqual) ||
              !(isEventDefinitionEqual && isEventTypeEqual);
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

      return {
        label: definition.label,
        className: definition.className,
        id: definition.actionName,
        action: function() {
          replaceElement(element, definition.target);
        }
      };
    }

    return menuEntries;
  }


  // API

  this.openChooser = function(position, element) {
    var entries = this.getReplaceOptions(element),
        headerEntries;

    if (is(element, 'bpmn:Activity')) {
      headerEntries = this.getToggleOptions(element);
    }

    popupMenu.open(
      {
        className: 'replace-menu',
        position: position,
        headerEntries: headerEntries,
        entries: entries
      }
    );
  };

  this.getReplaceOptions = getReplaceOptions;

  this.getToggleOptions = getToggleOptions;

  this.replaceElement = replaceElement;
}

BpmnReplace.$inject = [ 'bpmnFactory', 'moddle', 'popupMenu', 'replace', 'selection', 'modeling' ];

module.exports = BpmnReplace;
