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

import replaceOptions from '../replace/ReplaceOptions';
import { canBeNonInterrupting, getInterruptingProperty } from '../modeling/behavior/util/NonInterruptingUtil';
import Icons from './util/Icons';
import { isTargetDifferent } from '../replace/BpmnReplace';

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
    bpmnReplace, rules, translate, moddleCopy, commandStack, selection) {

  this._bpmnFactory = bpmnFactory;
  this._popupMenu = popupMenu;
  this._modeling = modeling;
  this._moddle = moddle;
  this._bpmnReplace = bpmnReplace;
  this._rules = rules;
  this._translate = translate;
  this._moddleCopy = moddleCopy;
  this._commandStack = commandStack;
  this._selection = selection;

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
  'moddleCopy',
  'commandStack',
  'selection'
];

ReplaceMenuProvider.prototype._register = function() {
  this._popupMenu.registerProvider('bpmn-replace', this);
};

/**
 * @param {PopupMenuTarget} targets
 *
 * @return {PopupMenuEntries}
 */
ReplaceMenuProvider.prototype.getPopupMenuEntries = function(targets) {
  if (!isArray(targets)) {
    targets = [ targets ];
  }

  return replaceOptions.reduce((entries, replaceOption) => {
    if (!replaceOption.target) {

      // e.g. sequence flows
      return entries;
    }

    if (targets.every(target => this._bpmnReplace.canReplace(target, replaceOption.target))
      && targets.some(target => isTargetDifferent(target, replaceOption.target))) {
      return {
        ...entries,
        ...this._createEntries(targets, [ replaceOption ])
      };
    }

    return entries;
  }, {});
};

/**
 * @param {PopupMenuTarget} targets
 *
 * @return {PopupMenuHeaderEntries}
 */
ReplaceMenuProvider.prototype.getPopupMenuHeaderEntries = function(targets) {
  if (!isArray(targets)) {
    targets = [ targets ];
  }

  var headerEntries = {};

  if (targets.every(target => is(target, 'bpmn:Activity') && !isEventSubProcess(target))) {
    headerEntries = {
      ...headerEntries,
      ...this._getLoopCharacteristicsHeaderEntries(targets)
    };
  }

  if (targets.every(target => is(target, 'bpmn:DataObjectReference'))) {
    headerEntries = {
      ...headerEntries,
      ...this._getCollectionHeaderEntries(targets)
    };
  }

  if (targets.every(target => is(target, 'bpmn:Participant'))) {
    headerEntries = {
      ...headerEntries,
      ...this._getParticipantMultiplicityHeaderEntries(targets)
    };
  }

  if (targets.every(target => {
    return is(target, 'bpmn:SubProcess') &&
    !is(target, 'bpmn:Transaction') &&
    !isEventSubProcess(target);
  })) {
    headerEntries = {
      ...headerEntries,
      ...this._getAdHocHeaderEntries(targets)
    };
  }

  if (targets.every(target => canBeNonInterrupting(target))) {
    headerEntries = {
      ...headerEntries,
      ...this._getNonInterruptingHeaderEntries(targets)
    };
  }

  return headerEntries;
};


/**
 * Create popup menu entries for the given target.
 *
 * @param  {PopupMenuTarget} targets
 * @param  {ReplaceOption[]} replaceOptions
 *
 * @return {PopupMenuEntries}
 */
ReplaceMenuProvider.prototype._createEntries = function(targets, replaceOptions) {
  var entries = {};

  var self = this;

  forEach(replaceOptions, function(replaceOption) {
    entries[ replaceOption.actionName ] = self._createEntry(replaceOption, targets);
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
 * @param  {PopupMenuTarget} targets
 * @param  {PopupMenuEntryAction} [action]
 *
 * @return {PopupMenuEntry}
 */
ReplaceMenuProvider.prototype._createEntry = function(replaceOption, targets, action) {
  var translate = this._translate;

  const replaceAction = () => {
    if (!isArray(targets)) {
      targets = [ targets ];
    }

    console.log('targets', targets);

    const newElements = [];

    // WTF, why is this necessary?
    targets = [ ...targets ];

    for (const target of targets) {
      console.log('replacing element', target, replaceOption.target);

      console.log('targets length before', targets.length);

      const newElement = this._bpmnReplace.replaceElement(target, replaceOption.target, { select: false });

      console.log('targets length after', targets.length);

      newElements.push(newElement);
    }

    this._selection.select(newElements);
  };

  var label = replaceOption.label;

  if (label && typeof label === 'function') {
    label = label(targets);
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
 * @param  {PopupMenuTarget} targets
 *
 * @return {PopupMenuHeaderEntries}
 */
ReplaceMenuProvider.prototype._getLoopCharacteristicsHeaderEntries = function(targets) {
  if (!isArray(targets)) {
    targets = [ targets ];
  }

  const firstTarget = targets[ 0 ];

  var self = this;
  var translate = this._translate;

  function toggleLoopEntry(event, entry) {

    for (const target of targets) {

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
  }

  var businessObject = getBusinessObject(firstTarget),
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
      title: translate('Parallel multi-instance'),
      active: isParallel,
      action: toggleLoopEntry,
      options: {
        loopCharacteristics: 'bpmn:MultiInstanceLoopCharacteristics',
        isSequential: false
      }
    },
    'toggle-sequential-mi': {
      className: 'bpmn-icon-sequential-mi-marker',
      title: translate('Sequential multi-instance'),
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
 * @param  {PopupMenuTarget} targets
 *
 * @return {PopupMenuHeaderEntries}
 */
ReplaceMenuProvider.prototype._getCollectionHeaderEntries = function(targets) {

  var self = this;
  var translate = this._translate;

  if (!targets.every(target => target.businessObject.dataObjectRef)) return {};

  function toggleIsCollection(event, entry) {

    for (const target of targets) {
      const dataObject = target.businessObject.dataObjectRef;

      self._modeling.updateModdleProperties(
        target,
        dataObject,
        { isCollection: !entry.active });
    }
  }

  var firstTarget = targets[ 0 ];

  var dataObject = firstTarget.businessObject.dataObjectRef;

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
 * @param  {PopupMenuTarget} targets
 *
 * @return {PopupMenuHeaderEntries}
 */
ReplaceMenuProvider.prototype._getParticipantMultiplicityHeaderEntries = function(targets) {

  var self = this;
  var bpmnFactory = this._bpmnFactory;
  var translate = this._translate;

  function toggleParticipantMultiplicity(event, entry) {
    var isActive = entry.active;

    for (const target of targets) {
      var participantMultiplicity;

      if (!isActive) {
        participantMultiplicity = bpmnFactory.create('bpmn:ParticipantMultiplicity');
      }

      self._modeling.updateProperties(
        target,
        { participantMultiplicity: participantMultiplicity });
    }
  }

  const firstTarget = targets[ 0 ];

  var participantMultiplicity = firstTarget.businessObject.participantMultiplicity;

  return {
    'toggle-participant-multiplicity': {
      className: 'bpmn-icon-parallel-mi-marker',
      title: translate('Participant multiplicity'),
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


ReplaceMenuProvider.prototype._getNonInterruptingHeaderEntries = function(element) {
  const translate = this._translate;
  const businessObject = getBusinessObject(element);
  const self = this;

  const interruptingProperty = getInterruptingProperty(element);

  const icon = is(element, 'bpmn:BoundaryEvent') ? Icons['intermediate-event-non-interrupting'] : Icons['start-event-non-interrupting'];

  const isNonInterrupting = !businessObject[interruptingProperty];

  return {
    'toggle-non-interrupting': {
      imageHtml: icon,
      title: translate('Toggle non-interrupting'),
      active: isNonInterrupting,
      action: function() {
        self._modeling.updateProperties(element, {
          [interruptingProperty]: !!isNonInterrupting
        });
      }
    }
  };
};