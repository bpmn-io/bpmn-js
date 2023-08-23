import {
  pick,
  assign,
  filter,
  forEach,
  isArray,
  isUndefined,
  has
} from 'min-dash';

import {
  is,
  getBusinessObject
} from '../../util/ModelUtil';

import {
  isAny
} from '../modeling/util/ModelingUtil';

import {
  isExpanded,
  isEventSubProcess
} from '../../util/DiUtil';

import { getPropertyNames } from '../copy-paste/ModdleCopy';

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

      // apply same width and default height
      newElement.width = element.width;
      newElement.height = elementFactory.getDefaultSize(newElement).height;
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

    return replace.replaceElement(element, newElement, hints);
  }

  this.replaceElement = replaceElement;
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
