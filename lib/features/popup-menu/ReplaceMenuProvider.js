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
  filter,
  isArray
} from 'min-dash';

import * as replaceOptions from '../replace/ReplaceOptions';

/**
 * @typedef {import('../modeling/BpmnFactory').default} BpmnFactory
 * @typedef {import('diagram-js/lib/features/popup-menu/PopupMenu').default} PopupMenu
 * @typedef {import('../modeling/Modeling').default} Modeling
 * @typedef {import('../replace/BpmnReplace').default} BpmnReplace
 * @typedef {import('diagram-js/lib/features/Rules').default} Rules
 * @typedef {import('diagram-js/lib/i18n/translate/translate').default} Translate
 * @typedef {import('../copy-paste/ModdleCopy').default} ModdleCopy
 *
 * @typedef {import('../../model/Types').Element} Element
 * @typedef {import('../../model/Types').Moddle} Moddle
 *
 * @typedef {import('diagram-js/lib/features/popup-menu/PopupMenuProvider').PopupMenuEntries} PopupMenuEntries
 * @typedef {import('diagram-js/lib/features/popup-menu/PopupMenuProvider').PopupMenuEntry} PopupMenuEntry
 * @typedef {import('diagram-js/lib/features/popup-menu/PopupMenuProvider').PopupMenuEntryAction} PopupMenuEntryAction
 * @typedef {import('diagram-js/lib/features/popup-menu/PopupMenuProvider').PopupMenuHeaderEntries} PopupMenuHeaderEntries
 * @typedef {import('diagram-js/lib/features/popup-menu/PopupMenuProvider').default} PopupMenuProvider
 * @typedef {import('diagram-js/lib/features/popup-menu/PopupMenu').PopupMenuTarget} PopupMenuTarget
 *
 * @typedef {import('./ReplaceOptions').ReplaceOption} ReplaceOption
 */

/**
 * A BPMN-specific popup menu provider.
 *
 * @implements {PopupMenuProvider}
 *
 * @param {BpmnFactory} bpmnFactory
 * @param {PopupMenu} popupMenu
 * @param {Modeling} modeling
 * @param {Moddle} moddle
 * @param {BpmnReplace} bpmnReplace
 * @param {Rules} rules
 * @param {Translate} translate
 * @param {ModdleCopy} moddleCopy
 */
export default function ReplaceMenuProvider(
    bpmnFactory, popupMenu, modeling, moddle,
    bpmnReplace, rules, translate, moddleCopy) {

  this._bpmnFactory = bpmnFactory;
  this._popupMenu = popupMenu;
  this._modeling = modeling;
  this._moddle = moddle;
  this._bpmnReplace = bpmnReplace;
  this._rules = rules;
  this._translate = translate;
  this._moddleCopy = moddleCopy;

  this._register();
}

ReplaceMenuProvider.$inject = [
  'bpmnFactory',
  'popupMenu',
  'modeling',
  'moddle',
  'bpmnReplace',
  'rules',
  'translate',
  'moddleCopy'
];

ReplaceMenuProvider.prototype._register = function() {
  this._popupMenu.registerProvider('bpmn-replace', this);
};

/**
 * @param {PopupMenuTarget} target
 *
 * @return {PopupMenuEntries}
 */
ReplaceMenuProvider.prototype.getPopupMenuEntries = function(target) {

  var businessObject = target.businessObject;

  var rules = this._rules;

  var filteredReplaceOptions = [];

  if (isArray(target) || !rules.allowed('shape.replace', { element: target })) {
    return {};
  }

  var differentType = isDifferentType(target);

  if (is(businessObject, 'bpmn:DataObjectReference')) {
    return this._createEntries(target, replaceOptions.DATA_OBJECT_REFERENCE);
  }

  if (is(businessObject, 'bpmn:DataStoreReference') && !is(target.parent, 'bpmn:Collaboration')) {
    return this._createEntries(target, replaceOptions.DATA_STORE_REFERENCE);
  }

  // start events outside sub processes
  if (is(businessObject, 'bpmn:StartEvent') && !is(businessObject.$parent, 'bpmn:SubProcess')) {

    filteredReplaceOptions = filter(replaceOptions.START_EVENT, differentType);

    return this._createEntries(target, filteredReplaceOptions);
  }

  // expanded/collapsed pools
  if (is(businessObject, 'bpmn:Participant')) {

    filteredReplaceOptions = filter(replaceOptions.PARTICIPANT, function(replaceOption) {
      return isExpanded(target) !== replaceOption.target.isExpanded;
    });

    return this._createEntries(target, filteredReplaceOptions);
  }

  // start events inside event sub processes
  if (is(businessObject, 'bpmn:StartEvent') && isEventSubProcess(businessObject.$parent)) {
    filteredReplaceOptions = filter(replaceOptions.EVENT_SUB_PROCESS_START_EVENT, function(replaceOption) {

      var target = replaceOption.target;

      var isInterrupting = target.isInterrupting !== false;

      var isInterruptingEqual = businessObject.isInterrupting === isInterrupting;

      // filters elements which types and event definition are equal but have have different interrupting types
      return differentType(replaceOption) || !differentType(replaceOption) && !isInterruptingEqual;

    });

    return this._createEntries(target, filteredReplaceOptions);
  }

  // start events inside sub processes
  if (is(businessObject, 'bpmn:StartEvent') && !isEventSubProcess(businessObject.$parent)
      && is(businessObject.$parent, 'bpmn:SubProcess')) {
    filteredReplaceOptions = filter(replaceOptions.START_EVENT_SUB_PROCESS, differentType);

    return this._createEntries(target, filteredReplaceOptions);
  }

  // end events
  if (is(businessObject, 'bpmn:EndEvent')) {

    filteredReplaceOptions = filter(replaceOptions.END_EVENT, function(replaceOption) {
      var target = replaceOption.target;

      // hide cancel end events outside transactions
      if (target.eventDefinitionType == 'bpmn:CancelEventDefinition' && !is(businessObject.$parent, 'bpmn:Transaction')) {
        return false;
      }

      return differentType(replaceOption);
    });

    return this._createEntries(target, filteredReplaceOptions);
  }

  // boundary events
  if (is(businessObject, 'bpmn:BoundaryEvent')) {

    filteredReplaceOptions = filter(replaceOptions.BOUNDARY_EVENT, function(replaceOption) {

      var target = replaceOption.target;

      if (target.eventDefinitionType == 'bpmn:CancelEventDefinition' &&
         !is(businessObject.attachedToRef, 'bpmn:Transaction')) {
        return false;
      }
      var cancelActivity = target.cancelActivity !== false;

      var isCancelActivityEqual = businessObject.cancelActivity == cancelActivity;

      return differentType(replaceOption) || !differentType(replaceOption) && !isCancelActivityEqual;
    });

    return this._createEntries(target, filteredReplaceOptions);
  }

  // intermediate events
  if (is(businessObject, 'bpmn:IntermediateCatchEvent') ||
      is(businessObject, 'bpmn:IntermediateThrowEvent')) {

    filteredReplaceOptions = filter(replaceOptions.INTERMEDIATE_EVENT, differentType);

    return this._createEntries(target, filteredReplaceOptions);
  }

  // gateways
  if (is(businessObject, 'bpmn:Gateway')) {

    filteredReplaceOptions = filter(replaceOptions.GATEWAY, differentType);

    return this._createEntries(target, filteredReplaceOptions);
  }

  // transactions
  if (is(businessObject, 'bpmn:Transaction')) {

    filteredReplaceOptions = filter(replaceOptions.TRANSACTION, differentType);

    return this._createEntries(target, filteredReplaceOptions);
  }

  // expanded event sub processes
  if (isEventSubProcess(businessObject) && isExpanded(target)) {

    filteredReplaceOptions = filter(replaceOptions.EVENT_SUB_PROCESS, differentType);

    return this._createEntries(target, filteredReplaceOptions);
  }

  // expanded sub processes
  if (is(businessObject, 'bpmn:SubProcess') && isExpanded(target)) {

    filteredReplaceOptions = filter(replaceOptions.SUBPROCESS_EXPANDED, differentType);

    return this._createEntries(target, filteredReplaceOptions);
  }

  // collapsed ad hoc sub processes
  if (is(businessObject, 'bpmn:AdHocSubProcess') && !isExpanded(target)) {

    filteredReplaceOptions = filter(replaceOptions.TASK, function(replaceOption) {

      var target = replaceOption.target;

      var isTargetSubProcess = target.type === 'bpmn:SubProcess';

      var isTargetExpanded = target.isExpanded === true;

      return isDifferentType(target, target) && (!isTargetSubProcess || isTargetExpanded);
    });

    return this._createEntries(target, filteredReplaceOptions);
  }

  // sequence flows
  if (is(businessObject, 'bpmn:SequenceFlow')) {
    return this._createSequenceFlowEntries(target, replaceOptions.SEQUENCE_FLOW);
  }

  // flow nodes
  if (is(businessObject, 'bpmn:FlowNode')) {
    filteredReplaceOptions = filter(replaceOptions.TASK, differentType);

    // collapsed sub process cannot be replaced with itself
    if (is(businessObject, 'bpmn:SubProcess') && !isExpanded(target)) {
      filteredReplaceOptions = filter(filteredReplaceOptions, function(replaceOption) {
        return replaceOption.label !== 'Sub Process (collapsed)';
      });
    }

    return this._createEntries(target, filteredReplaceOptions);
  }

  return {};
};

/**
 * @param {PopupMenuTarget} target
 *
 * @return {PopupMenuHeaderEntries}
 */
ReplaceMenuProvider.prototype.getPopupMenuHeaderEntries = function(target) {

  var headerEntries = {};

  if (is(target, 'bpmn:Activity') && !isEventSubProcess(target)) {
    headerEntries = {
      ...headerEntries,
      ...this._getLoopCharacteristicsHeaderEntries(target)
    };
  }

  if (is(target, 'bpmn:DataObjectReference')) {
    headerEntries = {
      ...headerEntries,
      ...this._getCollectionHeaderEntries(target)
    };
  }

  if (is(target, 'bpmn:Participant')) {
    headerEntries = {
      ...headerEntries,
      ...this._getParticipantMultiplicityHeaderEntries(target)
    };
  }

  if (is(target, 'bpmn:SubProcess') &&
      !is(target, 'bpmn:Transaction') &&
      !isEventSubProcess(target)) {
    headerEntries = {
      ...headerEntries,
      ...this._getAdHocHeaderEntries(target)
    };
  }

  return headerEntries;
};


/**
 * Create popup menu entries for the given target.
 *
 * @param  {PopupMenuTarget} target
 * @param  {ReplaceOption[]} replaceOptions
 *
 * @return {PopupMenuEntries}
 */
ReplaceMenuProvider.prototype._createEntries = function(target, replaceOptions) {
  var entries = {};

  var self = this;

  forEach(replaceOptions, function(replaceOption) {
    entries[ replaceOption.actionName ] = self._createEntry(replaceOption, target);
  });

  return entries;
};

/**
 * Creates popup menu entries for the given sequence flow.
 *
 * @param  {PopupMenuTarget} target
 * @param  {ReplaceOption[]} replaceOptions
 *
 * @return {PopupMenuEntries}
 */
ReplaceMenuProvider.prototype._createSequenceFlowEntries = function(target, replaceOptions) {

  var businessObject = getBusinessObject(target);

  var entries = {};

  var modeling = this._modeling,
      moddle = this._moddle;

  var self = this;

  forEach(replaceOptions, function(replaceOption) {

    switch (replaceOption.actionName) {
    case 'replace-with-default-flow':
      if (businessObject.sourceRef.default !== businessObject &&
            (is(businessObject.sourceRef, 'bpmn:ExclusiveGateway') ||
             is(businessObject.sourceRef, 'bpmn:InclusiveGateway') ||
             is(businessObject.sourceRef, 'bpmn:ComplexGateway') ||
             is(businessObject.sourceRef, 'bpmn:Activity'))) {

        entries = {
          ...entries,
          [ replaceOption.actionName ]: self._createEntry(replaceOption, target, function() {
            modeling.updateProperties(target.source, { default: businessObject });
          })
        };
      }
      break;
    case 'replace-with-conditional-flow':
      if (!businessObject.conditionExpression && is(businessObject.sourceRef, 'bpmn:Activity')) {

        entries = {
          ...entries,
          [ replaceOption.actionName ]: self._createEntry(replaceOption, target, function() {
            var conditionExpression = moddle.create('bpmn:FormalExpression', { body: '' });

            modeling.updateProperties(target, { conditionExpression: conditionExpression });
          })
        };
      }
      break;
    default:

      // conditional flow -> sequence flow
      if (is(businessObject.sourceRef, 'bpmn:Activity') && businessObject.conditionExpression) {
        entries = {
          ...entries,
          [ replaceOption.actionName ]: self._createEntry(replaceOption, target, function() {
            modeling.updateProperties(target, { conditionExpression: undefined });
          })
        };
      }

      // default flow -> sequence flow
      if ((is(businessObject.sourceRef, 'bpmn:ExclusiveGateway') ||
           is(businessObject.sourceRef, 'bpmn:InclusiveGateway') ||
           is(businessObject.sourceRef, 'bpmn:ComplexGateway') ||
           is(businessObject.sourceRef, 'bpmn:Activity')) &&
           businessObject.sourceRef.default === businessObject) {
        entries = {
          ...entries,
          [ replaceOption.actionName ]: self._createEntry(replaceOption, target, function() {
            modeling.updateProperties(target.source, { default: undefined });
          })
        };
      }
    }
  });

  return entries;
};

/**
 * Create a popup menu entry for the given replace option.
 *
 * @param  {ReplaceOption} replaceOption
 * @param  {PopupMenuTarget} target
 * @param  {PopupMenuEntryAction} [action]
 *
 * @return {PopupMenuEntry}
 */
ReplaceMenuProvider.prototype._createEntry = function(replaceOption, target, action) {
  var translate = this._translate;
  var replaceElement = this._bpmnReplace.replaceElement;

  var replaceAction = function() {
    return replaceElement(target, replaceOption.target);
  };

  var label = replaceOption.label;
  if (label && typeof label === 'function') {
    label = label(target);
  }

  action = action || replaceAction;

  return {
    label: translate(label),
    className: replaceOption.className,
    action: action
  };
};

/**
 * Get popup menu header entries for the loop characteristics of the given BPMN element.
 *
 * @param  {PopupMenuTarget} target
 *
 * @return {PopupMenuHeaderEntries}
 */
ReplaceMenuProvider.prototype._getLoopCharacteristicsHeaderEntries = function(target) {

  var self = this;
  var translate = this._translate;

  function toggleLoopEntry(event, entry) {

    // remove
    if (entry.active) {
      self._modeling.updateProperties(target, { loopCharacteristics: undefined });
      return;
    }

    const currentLoopCharacteristics = target.businessObject.get('loopCharacteristics'),
          newLoopCharacteristics = self._moddle.create(entry.options.loopCharacteristics);

    // copy old properties
    if (currentLoopCharacteristics) {
      self._moddleCopy.copyElement(currentLoopCharacteristics, newLoopCharacteristics);
    }

    // update `isSequential` property
    newLoopCharacteristics.set('isSequential', entry.options.isSequential);

    self._modeling.updateProperties(target, { loopCharacteristics: newLoopCharacteristics });
  }

  var businessObject = getBusinessObject(target),
      loopCharacteristics = businessObject.loopCharacteristics;

  var isSequential,
      isLoop,
      isParallel;

  if (loopCharacteristics) {
    isSequential = loopCharacteristics.isSequential;
    isLoop = loopCharacteristics.isSequential === undefined;
    isParallel = loopCharacteristics.isSequential !== undefined && !loopCharacteristics.isSequential;
  }


  return {
    'toggle-parallel-mi' : {
      className: 'bpmn-icon-parallel-mi-marker',
      title: translate('Parallel Multi Instance'),
      active: isParallel,
      action: toggleLoopEntry,
      options: {
        loopCharacteristics: 'bpmn:MultiInstanceLoopCharacteristics',
        isSequential: false
      }
    },
    'toggle-sequential-mi': {
      className: 'bpmn-icon-sequential-mi-marker',
      title: translate('Sequential Multi Instance'),
      active: isSequential,
      action: toggleLoopEntry,
      options: {
        loopCharacteristics: 'bpmn:MultiInstanceLoopCharacteristics',
        isSequential: true
      }
    },
    'toggle-loop': {
      className: 'bpmn-icon-loop-marker',
      title: translate('Loop'),
      active: isLoop,
      action: toggleLoopEntry,
      options: {
        loopCharacteristics: 'bpmn:StandardLoopCharacteristics'
      }
    }
  };
};

/**
 * Get popup menu header entries for the collection property of the given BPMN element.
 *
 * @param  {PopupMenuTarget} target
 *
 * @return {PopupMenuHeaderEntries}
 */
ReplaceMenuProvider.prototype._getCollectionHeaderEntries = function(target) {

  var self = this;
  var translate = this._translate;

  var dataObject = target.businessObject.dataObjectRef;

  if (!dataObject) {
    return {};
  }

  function toggleIsCollection(event, entry) {
    self._modeling.updateModdleProperties(
      target,
      dataObject,
      { isCollection: !entry.active });
  }

  var isCollection = dataObject.isCollection;

  return {
    'toggle-is-collection': {
      className: 'bpmn-icon-parallel-mi-marker',
      title: translate('Collection'),
      active: isCollection,
      action: toggleIsCollection,
    }
  };
};

/**
 * Get popup menu header entries for the participant multiplicity property of the given BPMN element.
 *
 * @param  {PopupMenuTarget} target
 *
 * @return {PopupMenuHeaderEntries}
 */
ReplaceMenuProvider.prototype._getParticipantMultiplicityHeaderEntries = function(target) {

  var self = this;
  var bpmnFactory = this._bpmnFactory;
  var translate = this._translate;

  function toggleParticipantMultiplicity(event, entry) {
    var isActive = entry.active;
    var participantMultiplicity;

    if (!isActive) {
      participantMultiplicity = bpmnFactory.create('bpmn:ParticipantMultiplicity');
    }

    self._modeling.updateProperties(
      target,
      { participantMultiplicity: participantMultiplicity });
  }

  var participantMultiplicity = target.businessObject.participantMultiplicity;

  return {
    'toggle-participant-multiplicity': {
      className: 'bpmn-icon-parallel-mi-marker',
      title: translate('Participant Multiplicity'),
      active: !!participantMultiplicity,
      action: toggleParticipantMultiplicity,
    }
  };
};

/**
 * Get popup menu header entries for the ad-hoc property of the given BPMN element.
 *
 * @param  {PopupMenuTarget} element
 *
 * @return {PopupMenuHeaderEntries}
 */
ReplaceMenuProvider.prototype._getAdHocHeaderEntries = function(element) {
  var translate = this._translate;
  var businessObject = getBusinessObject(element);

  var isAdHoc = is(businessObject, 'bpmn:AdHocSubProcess');

  var replaceElement = this._bpmnReplace.replaceElement;

  return {
    'toggle-adhoc': {
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
    }
  };
};
