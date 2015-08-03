'use strict';

var forEach = require('lodash/collection/forEach'),
    filter = require('lodash/collection/filter'),
    pick = require('lodash/object/pick'),
    assign = require('lodash/object/assign');

var REPLACE_OPTIONS = require ('./ReplaceOptions');

var startEventReplace =  REPLACE_OPTIONS.START_EVENT,
    intermediateEventReplace =  REPLACE_OPTIONS.INTERMEDIATE_EVENT,
    endEventReplace =  REPLACE_OPTIONS.END_EVENT,
    gatewayReplace =  REPLACE_OPTIONS.GATEWAY,
    taskReplace =  REPLACE_OPTIONS.TASK,
    subProcessExpandedReplace = REPLACE_OPTIONS.SUBPROCESS_EXPANDED,
    transactionReplace = REPLACE_OPTIONS.TRANSACTION,
    boundaryEventReplace =  REPLACE_OPTIONS.BOUNDARY_EVENT;

var is = require('../../util/ModelUtil').is,
    getBusinessObject = require('../../util/ModelUtil').getBusinessObject,
    isExpanded = require('../../util/DiUtil').isExpanded;

var CUSTOM_PROPERTIES = [
  'cancelActivity',
  'instantiate',
  'eventGatewayType'
];


/**
 * A replace menu provider that gives users the controls to choose
 * and replace BPMN elements with each other.
 *
 * @param {BpmnFactory} bpmnFactory
 * @param {Moddle} moddle
 * @param {PopupMenu} popupMenu
 * @param {Replace} replace
 */
function BpmnReplace(bpmnFactory, moddle, popupMenu, replace, selection, modeling, eventBus) {

  var self = this,
      currentElement;


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

    // initialize special properties defined in target definition

    assign(businessObject, pick(target, CUSTOM_PROPERTIES));


    // copy size (for activities only)
    if (is(oldBusinessObject, 'bpmn:Activity')) {

      // TODO: need also to respect min/max Size

      newElement.width = element.width;
      newElement.height = element.height;
    }


    if (is(oldBusinessObject, 'bpmn:SubProcess')) {
      newElement.isExpanded = isExpanded(oldBusinessObject);
    }

    // TODO: copy other elligable properties from old business object
    businessObject.name = oldBusinessObject.name;
    businessObject.loopCharacteristics = oldBusinessObject.loopCharacteristics;

    newElement = replace.replaceElement(element, newElement);

    selection.select(newElement);

    return newElement;
  }


  function toggleLoopEntry(event, entry) {
    var loopEntries = self.getLoopEntries(currentElement);

    var loopCharacteristics;

    if (entry.active) {
      loopCharacteristics = undefined;
    } else {
      forEach(loopEntries, function(action) {
        var options = action.options;

        if (entry.id === action.id) {
          loopCharacteristics = moddle.create(options.loopCharacteristics);

          if (options.isSequential) {
            loopCharacteristics.isSequential = options.isSequential;
          }
        }
      });
    }
    modeling.updateProperties(currentElement, { loopCharacteristics: loopCharacteristics });
  }


  function getLoopEntries(element) {

    currentElement = element;

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

    var loopEntries = [
      {
        id: 'toggle-parallel-mi',
        className: 'icon-parallel-mi-marker',
        active: isParallel,
        action: toggleLoopEntry,
        options: {
          loopCharacteristics: 'bpmn:MultiInstanceLoopCharacteristics',
          isSequential: false
        }
      },
      {
        id: 'toggle-sequential-mi',
        className: 'icon-sequential-mi-marker',
        active: isSequential,
        action: toggleLoopEntry,
        options: {
          loopCharacteristics: 'bpmn:MultiInstanceLoopCharacteristics',
          isSequential: true
        }
      },
      {
        id: 'toggle-loop',
        className: 'icon-loop-marker',
        active: isLoop,
        action: toggleLoopEntry,
        options: {
          loopCharacteristics: 'bpmn:StandardLoopCharacteristics'
        }
      }
    ];
    return loopEntries;
  }


  function getAdHocEntry(element) {
    var businessObject = getBusinessObject(element);

    var isAdHoc = is(businessObject, 'bpmn:AdHocSubProcess');

    var adHocEntry = {
      id: 'toggle-adhoc',
      className: 'icon-ad-hoc-marker',
      active: isAdHoc,
      action: function(event, entry) {
        if (isAdHoc) {
          return replaceElement(element, { type: 'bpmn:SubProcess' });
        } else {
          return replaceElement(element, { type: 'bpmn:AdHocSubProcess' });
        }
      }
    };

    return adHocEntry;
  }


  function getReplaceOptions(element) {

    var menuEntries = [];
    var businessObject = element.businessObject;

    if (is(businessObject, 'bpmn:StartEvent')) {
      addEntries(startEventReplace, filterEvents);
    } else

    if (is(businessObject, 'bpmn:IntermediateCatchEvent') ||
        is(businessObject, 'bpmn:IntermediateThrowEvent')) {

      addEntries(intermediateEventReplace, filterEvents);
    } else

    if (is(businessObject, 'bpmn:EndEvent')) {

      addEntries(endEventReplace, filterEvents);
    } else

    if (is(businessObject, 'bpmn:Gateway')) {

      addEntries(gatewayReplace, function(entry) {

        return entry.target.type  !== businessObject.$type;
      });
    } else

    if (is(businessObject, 'bpmn:Transaction')) {

      addEntries(transactionReplace, filterEvents);
    } else

    if (is(businessObject, 'bpmn:SubProcess') && isExpanded(businessObject)) {

      addEntries(subProcessExpandedReplace, filterEvents);
    } else

    if (is(businessObject, 'bpmn:AdHocSubProcess') && !isExpanded(businessObject)) {

      addEntries(taskReplace, function(entry) {
        return entry.target.type !== 'bpmn:SubProcess';
      });
    } else

    if (is(businessObject, 'bpmn:BoundaryEvent')) {
      addEntries(boundaryEventReplace, filterEvents);
    } else

    if (is(businessObject, 'bpmn:FlowNode')) {
      addEntries(taskReplace, function(entry) {
        return entry.target.type  !== businessObject.$type;
      });
    }


    function filterEvents(entry) {

      var target = entry.target;

      var eventDefinition = businessObject.eventDefinitions && businessObject.eventDefinitions[0].$type,
          cancelActivity;

      if (businessObject.$type === 'bpmn:BoundaryEvent') {
        cancelActivity = target.cancelActivity !== false;
      }

      var isEventDefinitionEqual = target.eventDefinition == eventDefinition,
          isEventTypeEqual = businessObject.$type == target.type,
          isInterruptingEqual = businessObject.cancelActivity == cancelActivity;

      return ((!isEventDefinitionEqual && isEventTypeEqual) ||
              !isEventTypeEqual) ||
              !(isEventDefinitionEqual && isEventTypeEqual && isInterruptingEqual);
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
          return replaceElement(element, definition.target);
        }
      };
    }

    return menuEntries;
  }

  /**
   * [function description]
   * @param  {Object} position
   * @param  {Object} element
   */
  this.openChooser = function(position, element) {
    var entries = this.getReplaceOptions(element),
        headerEntries = [];

    if (is(element, 'bpmn:Activity')) {
      headerEntries = headerEntries.concat(this.getLoopEntries(element));
    }

    if (is(element, 'bpmn:SubProcess') && !is(element, 'bpmn:Transaction')) {
      headerEntries.push(this.getAdHocEntry(element));
    }

    popupMenu.open({
      className: 'replace-menu',
      element: element,
      position: position,
      headerEntries: headerEntries,
      entries: entries
    });
  };

  this.getReplaceOptions = getReplaceOptions;

  this.getLoopEntries = getLoopEntries;

  this.getAdHocEntry = getAdHocEntry;

  this.replaceElement = replaceElement;
}

BpmnReplace.$inject = [ 'bpmnFactory', 'moddle', 'popupMenu', 'replace', 'selection', 'modeling', 'eventBus' ];

module.exports = BpmnReplace;
