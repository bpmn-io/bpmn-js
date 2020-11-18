import {
  getBusinessObject,
  is
} from '../../util/ModelUtil';

import {
  isEventSubProcess,
  isExpanded
} from '../../util/DiUtil';

import {
  isDifferentType
} from './util/TypeUtil';

import {
  forEach,
  filter
} from 'min-dash';

import * as replaceOptions from '../replace/ReplaceOptions';


/**
 * This module is an element agnostic replace menu provider for the popup menu.
 */
export default function ReplaceMenuProvider(
    popupMenu, modeling, moddle,
    bpmnReplace, rules, translate) {

  this._popupMenu = popupMenu;
  this._modeling = modeling;
  this._moddle = moddle;
  this._bpmnReplace = bpmnReplace;
  this._rules = rules;
  this._translate = translate;

  this.register();
}

ReplaceMenuProvider.$inject = [
  'popupMenu',
  'modeling',
  'moddle',
  'bpmnReplace',
  'rules',
  'translate'
];


/**
 * Register replace menu provider in the popup menu
 */
ReplaceMenuProvider.prototype.register = function() {
  this._popupMenu.registerProvider('bpmn-replace', this);
};


/**
 * Get all entries from replaceOptions for the given element and apply filters
 * on them. Get for example only elements, which are different from the current one.
 *
 * @param {djs.model.Base} element
 *
 * @return {Array<Object>} a list of menu entry items
 */
ReplaceMenuProvider.prototype.getEntries = function(element) {

  var businessObject = element.businessObject;

  var rules = this._rules;

  var entries;

  if (!rules.allowed('shape.replace', { element: element })) {
    return [];
  }

  var differentType = isDifferentType(element);

  if (is(businessObject, 'bpmn:DataObjectReference')) {
    return this._createEntries(element, replaceOptions.DATA_OBJECT_REFERENCE);
  }

  if (is(businessObject, 'bpmn:DataStoreReference')) {
    return this._createEntries(element, replaceOptions.DATA_STORE_REFERENCE);
  }

  // start events outside sub processes
  if (is(businessObject, 'bpmn:StartEvent') && !is(businessObject.$parent, 'bpmn:SubProcess')) {

    entries = filter(replaceOptions.START_EVENT, differentType);

    return this._createEntries(element, entries);
  }

  // expanded/collapsed pools
  if (is(businessObject, 'bpmn:Participant')) {

    entries = filter(replaceOptions.PARTICIPANT, function(entry) {
      return isExpanded(businessObject) !== entry.target.isExpanded;
    });

    return this._createEntries(element, entries);
  }

  // start events inside event sub processes
  if (is(businessObject, 'bpmn:StartEvent') && isEventSubProcess(businessObject.$parent)) {
    entries = filter(replaceOptions.EVENT_SUB_PROCESS_START_EVENT, function(entry) {

      var target = entry.target;

      var isInterrupting = target.isInterrupting !== false;

      var isInterruptingEqual = getBusinessObject(element).isInterrupting === isInterrupting;

      // filters elements which types and event definition are equal but have have different interrupting types
      return differentType(entry) || !differentType(entry) && !isInterruptingEqual;

    });

    return this._createEntries(element, entries);
  }

  // start events inside sub processes
  if (is(businessObject, 'bpmn:StartEvent') && !isEventSubProcess(businessObject.$parent)
      && is(businessObject.$parent, 'bpmn:SubProcess')) {
    entries = filter(replaceOptions.START_EVENT_SUB_PROCESS, differentType);

    return this._createEntries(element, entries);
  }

  // end events
  if (is(businessObject, 'bpmn:EndEvent')) {

    entries = filter(replaceOptions.END_EVENT, function(entry) {
      var target = entry.target;

      // hide cancel end events outside transactions
      if (target.eventDefinitionType == 'bpmn:CancelEventDefinition' && !is(businessObject.$parent, 'bpmn:Transaction')) {
        return false;
      }

      return differentType(entry);
    });

    return this._createEntries(element, entries);
  }

  // boundary events
  if (is(businessObject, 'bpmn:BoundaryEvent')) {

    entries = filter(replaceOptions.BOUNDARY_EVENT, function(entry) {

      var target = entry.target;

      if (target.eventDefinition == 'bpmn:CancelEventDefinition' &&
         !is(businessObject.attachedToRef, 'bpmn:Transaction')) {
        return false;
      }
      var cancelActivity = target.cancelActivity !== false;

      var isCancelActivityEqual = businessObject.cancelActivity == cancelActivity;

      return differentType(entry) || !differentType(entry) && !isCancelActivityEqual;
    });

    return this._createEntries(element, entries);
  }

  // intermediate events
  if (is(businessObject, 'bpmn:IntermediateCatchEvent') ||
      is(businessObject, 'bpmn:IntermediateThrowEvent')) {

    entries = filter(replaceOptions.INTERMEDIATE_EVENT, differentType);

    return this._createEntries(element, entries);
  }

  // gateways
  if (is(businessObject, 'bpmn:Gateway')) {

    entries = filter(replaceOptions.GATEWAY, differentType);

    return this._createEntries(element, entries);
  }

  // transactions
  if (is(businessObject, 'bpmn:Transaction')) {

    entries = filter(replaceOptions.TRANSACTION, differentType);

    return this._createEntries(element, entries);
  }

  // expanded event sub processes
  if (isEventSubProcess(businessObject) && isExpanded(businessObject)) {

    entries = filter(replaceOptions.EVENT_SUB_PROCESS, differentType);

    return this._createEntries(element, entries);
  }

  // expanded sub processes
  if (is(businessObject, 'bpmn:SubProcess') && isExpanded(businessObject)) {

    entries = filter(replaceOptions.SUBPROCESS_EXPANDED, differentType);

    return this._createEntries(element, entries);
  }

  // collapsed ad hoc sub processes
  if (is(businessObject, 'bpmn:AdHocSubProcess') && !isExpanded(businessObject)) {

    entries = filter(replaceOptions.TASK, function(entry) {

      var target = entry.target;

      var isTargetSubProcess = target.type === 'bpmn:SubProcess';

      var isTargetExpanded = target.isExpanded === true;

      return isDifferentType(element, target) && (!isTargetSubProcess || isTargetExpanded);
    });

    return this._createEntries(element, entries);
  }

  // sequence flows
  if (is(businessObject, 'bpmn:SequenceFlow')) {
    return this._createSequenceFlowEntries(element, replaceOptions.SEQUENCE_FLOW);
  }

  // flow nodes
  if (is(businessObject, 'bpmn:FlowNode')) {
    entries = filter(replaceOptions.TASK, differentType);

    // collapsed SubProcess can not be replaced with itself
    if (is(businessObject, 'bpmn:SubProcess') && !isExpanded(businessObject)) {
      entries = filter(entries, function(entry) {
        return entry.label !== 'Sub Process (collapsed)';
      });
    }

    return this._createEntries(element, entries);
  }

  return [];
};


/**
 * Get a list of header items for the given element. This includes buttons
 * for multi instance markers and for the ad hoc marker.
 *
 * @param {djs.model.Base} element
 *
 * @return {Array<Object>} a list of menu entry items
 */
ReplaceMenuProvider.prototype.getHeaderEntries = function(element) {

  var headerEntries = [];

  if (is(element, 'bpmn:Activity') && !isEventSubProcess(element)) {
    headerEntries = headerEntries.concat(this._getLoopEntries(element));
  }

  if (is(element, 'bpmn:DataObjectReference')) {
    headerEntries = headerEntries.concat(this._getDataObjectIsCollection(element));
  }

  if (is(element, 'bpmn:SubProcess') &&
      !is(element, 'bpmn:Transaction') &&
      !isEventSubProcess(element)) {
    headerEntries.push(this._getAdHocEntry(element));
  }

  return headerEntries;
};


/**
 * Creates an array of menu entry objects for a given element and filters the replaceOptions
 * according to a filter function.
 *
 * @param  {djs.model.Base} element
 * @param  {Object} replaceOptions
 *
 * @return {Array<Object>} a list of menu items
 */
ReplaceMenuProvider.prototype._createEntries = function(element, replaceOptions) {
  var menuEntries = [];

  var self = this;

  forEach(replaceOptions, function(definition) {
    var entry = self._createMenuEntry(definition, element);

    menuEntries.push(entry);
  });

  return menuEntries;
};

/**
 * Creates an array of menu entry objects for a given sequence flow.
 *
 * @param  {djs.model.Base} element
 * @param  {Object} replaceOptions

 * @return {Array<Object>} a list of menu items
 */
ReplaceMenuProvider.prototype._createSequenceFlowEntries = function(element, replaceOptions) {

  var businessObject = getBusinessObject(element);

  var menuEntries = [];

  var modeling = this._modeling,
      moddle = this._moddle;

  var self = this;

  forEach(replaceOptions, function(entry) {

    switch (entry.actionName) {
    case 'replace-with-default-flow':
      if (businessObject.sourceRef.default !== businessObject &&
            (is(businessObject.sourceRef, 'bpmn:ExclusiveGateway') ||
             is(businessObject.sourceRef, 'bpmn:InclusiveGateway') ||
             is(businessObject.sourceRef, 'bpmn:ComplexGateway') ||
             is(businessObject.sourceRef, 'bpmn:Activity'))) {

        menuEntries.push(self._createMenuEntry(entry, element, function() {
          modeling.updateProperties(element.source, { default: businessObject });
        }));
      }
      break;
    case 'replace-with-conditional-flow':
      if (!businessObject.conditionExpression && is(businessObject.sourceRef, 'bpmn:Activity')) {

        menuEntries.push(self._createMenuEntry(entry, element, function() {
          var conditionExpression = moddle.create('bpmn:FormalExpression', { body: '' });

          modeling.updateProperties(element, { conditionExpression: conditionExpression });
        }));
      }
      break;
    default:

      // default flows
      if (is(businessObject.sourceRef, 'bpmn:Activity') && businessObject.conditionExpression) {
        return menuEntries.push(self._createMenuEntry(entry, element, function() {
          modeling.updateProperties(element, { conditionExpression: undefined });
        }));
      }

      // conditional flows
      if ((is(businessObject.sourceRef, 'bpmn:ExclusiveGateway') ||
           is(businessObject.sourceRef, 'bpmn:InclusiveGateway') ||
           is(businessObject.sourceRef, 'bpmn:ComplexGateway') ||
           is(businessObject.sourceRef, 'bpmn:Activity')) &&
           businessObject.sourceRef.default === businessObject) {

        return menuEntries.push(self._createMenuEntry(entry, element, function() {
          modeling.updateProperties(element.source, { default: undefined });
        }));
      }
    }
  });

  return menuEntries;
};


/**
 * Creates and returns a single menu entry item.
 *
 * @param  {Object} definition a single replace options definition object
 * @param  {djs.model.Base} element
 * @param  {Function} [action] an action callback function which gets called when
 *                             the menu entry is being triggered.
 *
 * @return {Object} menu entry item
 */
ReplaceMenuProvider.prototype._createMenuEntry = function(definition, element, action) {
  var translate = this._translate;
  var replaceElement = this._bpmnReplace.replaceElement;

  var replaceAction = function() {
    return replaceElement(element, definition.target);
  };

  action = action || replaceAction;

  var menuEntry = {
    label: translate(definition.label),
    className: definition.className,
    id: definition.actionName,
    action: action
  };

  return menuEntry;
};

/**
 * Get a list of menu items containing buttons for multi instance markers
 *
 * @param  {djs.model.Base} element
 *
 * @return {Array<Object>} a list of menu items
 */
ReplaceMenuProvider.prototype._getLoopEntries = function(element) {

  var self = this;
  var translate = this._translate;

  function toggleLoopEntry(event, entry) {
    var loopCharacteristics;

    if (entry.active) {
      loopCharacteristics = undefined;
    } else {
      loopCharacteristics = self._moddle.create(entry.options.loopCharacteristics);

      if (entry.options.isSequential) {
        loopCharacteristics.isSequential = entry.options.isSequential;
      }
    }
    self._modeling.updateProperties(element, { loopCharacteristics: loopCharacteristics });
  }

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
      className: 'bpmn-icon-parallel-mi-marker',
      title: translate('Parallel Multi Instance'),
      active: isParallel,
      action: toggleLoopEntry,
      options: {
        loopCharacteristics: 'bpmn:MultiInstanceLoopCharacteristics',
        isSequential: false
      }
    },
    {
      id: 'toggle-sequential-mi',
      className: 'bpmn-icon-sequential-mi-marker',
      title: translate('Sequential Multi Instance'),
      active: isSequential,
      action: toggleLoopEntry,
      options: {
        loopCharacteristics: 'bpmn:MultiInstanceLoopCharacteristics',
        isSequential: true
      }
    },
    {
      id: 'toggle-loop',
      className: 'bpmn-icon-loop-marker',
      title: translate('Loop'),
      active: isLoop,
      action: toggleLoopEntry,
      options: {
        loopCharacteristics: 'bpmn:StandardLoopCharacteristics'
      }
    }
  ];
  return loopEntries;
};

/**
 * Get a list of menu items containing buttons for multi instance markers
 *
 * @param  {djs.model.Base} element
 *
 * @return {Array<Object>} a list of menu items
 */
ReplaceMenuProvider.prototype._getDataObjectIsCollection = function(element) {

  var self = this;
  var translate = this._translate;

  function toggleIsCollection(event, entry) {
    self._modeling.updateModdleProperties(
      element,
      dataObject,
      { isCollection: !entry.active });
  }

  var dataObject = element.businessObject.dataObjectRef,
      isCollection = dataObject.isCollection;

  var dataObjectEntries = [
    {
      id: 'toggle-is-collection',
      className: 'bpmn-icon-parallel-mi-marker',
      title: translate('Collection'),
      active: isCollection,
      action: toggleIsCollection,
    }
  ];
  return dataObjectEntries;
};


/**
 * Get the menu items containing a button for the ad hoc marker
 *
 * @param  {djs.model.Base} element
 *
 * @return {Object} a menu item
 */
ReplaceMenuProvider.prototype._getAdHocEntry = function(element) {
  var translate = this._translate;
  var businessObject = getBusinessObject(element);

  var isAdHoc = is(businessObject, 'bpmn:AdHocSubProcess');

  var replaceElement = this._bpmnReplace.replaceElement;

  var adHocEntry = {
    id: 'toggle-adhoc',
    className: 'bpmn-icon-ad-hoc-marker',
    title: translate('Ad-hoc'),
    active: isAdHoc,
    action: function(event, entry) {
      if (isAdHoc) {
        return replaceElement(element, { type: 'bpmn:SubProcess' }, {
          autoResize: false,
          layoutConnection: false
        });
      } else {
        return replaceElement(element, { type: 'bpmn:AdHocSubProcess' }, {
          autoResize: false,
          layoutConnection: false
        });
      }
    }
  };

  return adHocEntry;
};
