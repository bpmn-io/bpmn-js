import {
  pick,
  assign,
  filter,
  forEach,
  isArray,
  isUndefined,
  has,
  isDefined
} from 'min-dash';

import {
  is,
  getDi,
  getBusinessObject
} from '../../util/ModelUtil';

import {
  isAny
} from '../modeling/util/ModelingUtil';

import {
  isExpanded,
  isEventSubProcess,
  isHorizontal
} from '../../util/DiUtil';

import { getPropertyNames } from '../copy-paste/ModdleCopy';

const TASK_TYPES = [
  'bpmn:BusinessRuleTask',
  'bpmn:ManualTask',
  'bpmn:ReceiveTask',
  'bpmn:ScriptTask',
  'bpmn:SendTask',
  'bpmn:ServiceTask',
  'bpmn:Task',
  'bpmn:UserTask'
];

/**
 * @typedef {import('../modeling/BpmnFactory').default} BpmnFactory
 * @typedef {import('../modeling/ElementFactory').default} ElementFactory
 * @typedef {import('../copy-paste/ModdleCopy').default} ModdleCopy
 * @typedef {import('../modeling/Modeling').default} Modeling
 * @typedef {import('diagram-js/lib/features/replace/Replace').default} Replace
 * @typedef {import('diagram-js/lib/features/rules/Rules').default} Rules
 *
 * @typedef {import('../../model/Types').Element} Element
 * @typedef {import('../../model/Types').Shape} Shape
 * @typedef {import('../../model/Types').ModdleElement} ModdleElement
 *
 * @typedef { {
 *   type: string;
 *   cancelActivity: boolean;
 *   instantiate: boolean;
 *   eventGatewayType: string;
 *   triggeredByEvent: boolean;
 *   isInterrupting: boolean;
 *   collapsed: boolean;
 *   isExpanded: boolean;
 *   eventDefinitionType: string;
 *   eventDefinitionAttrs: Object;
 *   host: Shape;
 * } } TargetElement
 *
 * @typedef { {
 *   moveChildren: boolean;
 * } & Record<string, any> } Hints
 */

function copyProperties(source, target, properties) {
  if (!isArray(properties)) {
    properties = [ properties ];
  }

  forEach(properties, function(property) {
    if (!isUndefined(source[property])) {
      target[property] = source[property];
    }
  });
}


var CUSTOM_PROPERTIES = [
  'cancelActivity',
  'instantiate',
  'eventGatewayType',
  'triggeredByEvent',
  'isInterrupting'
];

/**
 * Check if element should be collapsed or expanded.
 */
function shouldToggleCollapsed(element, targetElement) {

  var oldCollapsed = (
    element && has(element, 'collapsed') ? element.collapsed : !isExpanded(element)
  );

  var targetCollapsed;

  if (targetElement && (has(targetElement, 'collapsed') || has(targetElement, 'isExpanded'))) {

    // property is explicitly set so use it
    targetCollapsed = (
      has(targetElement, 'collapsed') ? targetElement.collapsed : !targetElement.isExpanded
    );
  } else {

    // keep old state
    targetCollapsed = oldCollapsed;
  }

  if (oldCollapsed !== targetCollapsed) {
    return true;
  }

  return false;
}


/**
 * BPMN-specific replace.
 *
 * @param {BpmnFactory} bpmnFactory
 * @param {ElementFactory} elementFactory
 * @param {ModdleCopy} moddleCopy
 * @param {Modeling} modeling
 * @param {Replace} replace
 * @param {Rules} rules
 */
export default function BpmnReplace(
    bpmnFactory,
    elementFactory,
    moddleCopy,
    modeling,
    replace,
    rules
) {

  /**
   * Prepares a new business object for the replacement element
   * and triggers the replace operation.
   *
   * @param  {Element} element
   * @param  {TargetElement} targetElement
   * @param  {Hints} [hints]
   *
   * @return {Element}
   */
  function replaceElement(element, targetElement, hints) {

    hints = hints || {};

    var type = targetElement.type,
        oldBusinessObject = element.businessObject;

    if (isSubProcess(oldBusinessObject) && type === 'bpmn:SubProcess') {
      if (shouldToggleCollapsed(element, targetElement)) {

        // expanding or collapsing process
        modeling.toggleCollapse(element);

        return element;
      }
    }

    var newBusinessObject = bpmnFactory.create(type);

    var newElement = {
      type: type,
      businessObject: newBusinessObject,
    };

    newElement.di = {};

    if (type === 'bpmn:ExclusiveGateway') {
      newElement.di.isMarkerVisible = true;
    }

    // colors will be set to DI
    copyProperties(element.di, newElement.di, [
      'fill',
      'stroke',
      'background-color',
      'border-color',
      'color'
    ]);

    var elementProps = getPropertyNames(oldBusinessObject.$descriptor),
        newElementProps = getPropertyNames(newBusinessObject.$descriptor, true),
        copyProps = intersection(elementProps, newElementProps);

    // initialize special properties defined in target definition
    assign(newBusinessObject, pick(targetElement, CUSTOM_PROPERTIES));

    var properties = filter(copyProps, function(propertyName) {

      // copying event definitions, unless we replace
      if (propertyName === 'eventDefinitions') {
        return hasEventDefinition(element, targetElement.eventDefinitionType);
      }

      // retain loop characteristics if the target element
      // is not an event sub process
      if (propertyName === 'loopCharacteristics') {
        return !isEventSubProcess(newBusinessObject);
      }

      // so the applied properties from 'target' don't get lost
      if (has(newBusinessObject, propertyName)) {
        return false;
      }

      if (propertyName === 'processRef' && targetElement.isExpanded === false) {
        return false;
      }

      if (propertyName === 'triggeredByEvent') {
        return false;
      }

      if (propertyName === 'isForCompensation') {
        return !isEventSubProcess(newBusinessObject);
      }

      return true;
    });

    newBusinessObject = moddleCopy.copyElement(
      oldBusinessObject,
      newBusinessObject,
      properties
    );

    // initialize custom BPMN extensions
    if (targetElement.eventDefinitionType) {

      // only initialize with new eventDefinition
      // if we did not set an event definition yet,
      // i.e. because we copied it
      if (!hasEventDefinition(newBusinessObject, targetElement.eventDefinitionType)) {
        newElement.eventDefinitionType = targetElement.eventDefinitionType;
        newElement.eventDefinitionAttrs = targetElement.eventDefinitionAttrs;
      }
    }

    if (is(oldBusinessObject, 'bpmn:Activity')) {

      if (isSubProcess(oldBusinessObject)) {

        // no toggeling, so keep old state
        newElement.isExpanded = isExpanded(element);
      }

      // else if property is explicitly set, use it
      else if (targetElement && has(targetElement, 'isExpanded')) {
        newElement.isExpanded = targetElement.isExpanded;

        // assign default size of new expanded element
        var defaultSize = elementFactory.getDefaultSize(newBusinessObject, {
          isExpanded: newElement.isExpanded
        });

        newElement.width = defaultSize.width;
        newElement.height = defaultSize.height;

        // keep element centered
        newElement.x = element.x - (newElement.width - element.width) / 2;
        newElement.y = element.y - (newElement.height - element.height) / 2;
      }

      // TODO: need also to respect min/max Size
      // copy size, from an expanded subprocess to an expanded alternative subprocess
      // except bpmn:Task, because Task is always expanded
      if ((isExpanded(element) && !is(oldBusinessObject, 'bpmn:Task')) && newElement.isExpanded) {
        newElement.width = element.width;
        newElement.height = element.height;
      }
    }

    // remove children if not expanding sub process
    if (isSubProcess(oldBusinessObject) && !isSubProcess(newBusinessObject)) {
      hints.moveChildren = false;
    }

    // transform collapsed/expanded pools
    if (is(oldBusinessObject, 'bpmn:Participant')) {

      // create expanded pool
      if (targetElement.isExpanded === true) {
        newBusinessObject.processRef = bpmnFactory.create('bpmn:Process');
      } else {

        // remove children when transforming to collapsed pool
        hints.moveChildren = false;
      }

      // apply same directionality
      var isHorizontalPool = isHorizontal(element);
      if (!getDi(element).isHorizontal) {
        getDi(newElement).isHorizontal = isHorizontalPool;
      }

      // keep the existing size of the pool's direction to
      // prevent dangling message flows
      newElement.width = isHorizontalPool ? element.width : elementFactory.getDefaultSize(newElement).width;
      newElement.height = isHorizontalPool ? elementFactory.getDefaultSize(newElement).height : element.height;
    }

    if (!rules.allowed('shape.resize', { shape: newBusinessObject })) {
      newElement.height = elementFactory.getDefaultSize(newElement).height;
      newElement.width = elementFactory.getDefaultSize(newElement).width;
    }

    newBusinessObject.name = oldBusinessObject.name;

    // retain default flow's reference between inclusive <-> exclusive gateways and activities
    if (
      isAny(oldBusinessObject, [
        'bpmn:ExclusiveGateway',
        'bpmn:InclusiveGateway',
        'bpmn:Activity'
      ]) &&
      isAny(newBusinessObject, [
        'bpmn:ExclusiveGateway',
        'bpmn:InclusiveGateway',
        'bpmn:Activity'
      ])
    ) {
      newBusinessObject.default = oldBusinessObject.default;
    }

    if (
      targetElement.host &&
      !is(oldBusinessObject, 'bpmn:BoundaryEvent') &&
      is(newBusinessObject, 'bpmn:BoundaryEvent')
    ) {
      newElement.host = targetElement.host;
    }

    // The DataStoreReference element is 14px wider than the DataObjectReference element
    // This ensures that they stay centered on the x axis when replaced
    if (
      newElement.type === 'bpmn:DataStoreReference' ||
      newElement.type === 'bpmn:DataObjectReference'
    ) {
      newElement.x = element.x + (element.width - newElement.width) / 2;
    }

    return replace.replaceElement(element, newElement, { ...hints, targetElement });
  }

  this.replaceElement = replaceElement;

  function canReplace(element, target) {
    if (!target || !target.type) {
      throw new Error('target must have a type');
    }

    if (!isTargetDifferent(element, target)) {
      return false;
    }

    /**
     * Task
     */
    if (is(element, 'bpmn:Task')) {
      if (target.type === 'bpmn:SubProcess') {
        return !target.triggeredByEvent;
      }

      return [
        'bpmn:CallActivity',
        ...TASK_TYPES
      ].includes(target.type);
    }

    /**
     * Start event
     */
    if (is(element, 'bpmn:StartEvent')) {

      if (isEventSubProcess(element.parent)) {
        return target.type === 'bpmn:StartEvent' && target.eventDefinitionType;
      } else if (is(element.parent, 'bpmn:SubProcess')) {
        return [
          'bpmn:StartEvent',
          'bpmn:IntermediateThrowEvent',
          'bpmn:EndEvent'
        ].includes(target.type) && !target.eventDefinitionType;
      } else {
        return [
          'bpmn:StartEvent',
          'bpmn:IntermediateThrowEvent',
          'bpmn:EndEvent'
        ].includes(target.type);
      }
    }

    /**
     * End event
     */
    if (is(element, 'bpmn:EndEvent')) {

      if (![
        'bpmn:StartEvent',
        'bpmn:IntermediateThrowEvent',
        'bpmn:EndEvent'
      ].includes(target.type)) {
        return false;
      }

      if (!is(element.parent, 'bpmn:Transaction')) {
        return target.eventDefinitionType !== 'bpmn:CancelEventDefinition';
      }

      return true;
    }

    /**
     * Boundary event
     */
    if (is(element, 'bpmn:BoundaryEvent')) {
      if (is(element.host, 'bpmn:Transaction')) {
        return target.type === 'bpmn:BoundaryEvent' && target.eventDefinitionType !== 'bpmn:CancelEventDefinition';
      }

      return target.type === 'bpmn:BoundaryEvent';
    }

    /**
     * Intermediate event
     */
    if (isAny(element, [
      'bpmn:IntermediateCatchEvent',
      'bpmn:IntermediateThrowEvent'
    ])) {
      return [
        'bpmn:StartEvent',
        'bpmn:IntermediateCatchEvent',
        'bpmn:IntermediateThrowEvent',
        'bpmn:EndEvent'
      ].includes(target.type);
    }

    /**
     * Gateway
     */
    if (is(element, 'bpmn:Gateway')) {
      return [
        'bpmn:ComplexGateway',
        'bpmn:EventBasedGateway',
        'bpmn:ExclusiveGateway',
        'bpmn:InclusiveGateway',
        'bpmn:ParallelGateway'
      ].includes(target.type);
    }

    /**
     * Sub process
     */
    if (is(element, 'bpmn:SubProcess')) {

      if (isExpanded(element)) {
        return target.type === 'bpmn:Transaction' || (target.type === 'bpmn:SubProcess' && (!target.isExpanded || target.triggeredByEvent));
      } else {
        if (target.type === 'bpmn:SubProcess') {
          return target.isExpanded;
        }

        return [
          'bpmn:CallActivity',
          ...TASK_TYPES
        ].includes(target.type);
      }
    }

    /**
     * Transaction
     */
    if (is(element, 'bpmn:Transaction')) {
      return target.type === 'bpmn:SubProcess';
    }

    if (is(element, 'bpmn:DataObjectReference')) {
      return target.type === 'bpmn:DataStoreReference';
    }

    if (is(element, 'bpmn:DataStoreReference') && !is(element.parent, 'bpmn:Collaboration')) {
      return target.type === 'bpmn:DataObjectReference';
    }

    /**
     * Participant
     */
    if (is(element, 'bpmn:Participant')) {
      return target.type === 'bpmn:Participant';
    }

    return false;
  }

  this.canReplace = canReplace;
}

BpmnReplace.$inject = [
  'bpmnFactory',
  'elementFactory',
  'moddleCopy',
  'modeling',
  'replace',
  'rules'
];

/**
 * @param {ModdleElement} businessObject
 *
 * @return {boolean}
 */
function isSubProcess(businessObject) {
  return is(businessObject, 'bpmn:SubProcess');
}

/**
 * @param {Element|ModdleElement} element
 * @param {string} type
 *
 * @return {boolean}
 */
function hasEventDefinition(element, type) {
  var businessObject = getBusinessObject(element);

  return type && businessObject.get('eventDefinitions').some(function(definition) {
    return is(definition, type);
  });
}

/**
 * Compute intersection between two arrays.
 *
 * @param {Array} a
 * @param {Array} b
 *
 * @return {Array}
 */
function intersection(a, b) {
  return a.filter(function(item) {
    return b.includes(item);
  });
}

const EXPANDABLE_TYPES = [
  'bpmn:CallActivity',
  'bpmn:Participant',
  'bpmn:SubProcess'
];

export function isTargetDifferent(source, target) {
  const businessObject = getBusinessObject(source),
        eventDefinition = businessObject.get('eventDefinitions') && businessObject.get('eventDefinitions')[ 0 ];

  const typeDifferent = businessObject.$type !== target.type;

  const eventDefinitionDifferent = (isUndefined(eventDefinition) && isDefined(target.eventDefinitionType))
    || (isDefined(eventDefinition) && eventDefinition.$type !== target.eventDefinitionType);

  const triggeredByEventDifferent = businessObject.get('triggeredByEvent') !== target.triggeredByEvent;

  let isExpandedDifferent = false;

  if (isAny(businessObject, EXPANDABLE_TYPES) && EXPANDABLE_TYPES.includes(target.type)) {
    isExpandedDifferent = (isExpanded(source) && !target.isExpanded)
      || (!isExpanded(source) && target.isExpanded);
  }

  // if (source.type === 'bpmn:StartEvent' && target.type === 'bpmn:StartEvent') debugger;

  let isInterruptingDifferent = false;

  if (is(businessObject, 'bpmn:BoundaryEvent')) {
    isInterruptingDifferent = (businessObject.get('cancelActivity') && !target.cancelActivity === false) || (businessObject.get('cancelActivity') === false && target.cancelActivity);
  } else if (is(businessObject, 'bpmn:IntermediateCatchEvent')) {
    isInterruptingDifferent = (businessObject.get('isInterrupting') && !target.isInterrupting === false) || (businessObject.get('isInterrupting') === false && target.isInterrupting);
  }


  return typeDifferent || eventDefinitionDifferent || triggeredByEventDifferent || isExpandedDifferent || isInterruptingDifferent;
}