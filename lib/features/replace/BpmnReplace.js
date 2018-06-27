import {
  pick,
  assign,
  filter,
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

import {
  getProperties,
  IGNORED_PROPERTIES
} from '../../util/model/ModelCloneUtils';

import ModelCloneHelper from '../../util/model/ModelCloneHelper';

var CUSTOM_PROPERTIES = [
  'cancelActivity',
  'instantiate',
  'eventGatewayType',
  'triggeredByEvent',
  'isInterrupting'
];


function toggeling(element, target) {

  var oldCollapsed = (
    element && has(element, 'collapsed') ? element.collapsed : !isExpanded(element)
  );

  var targetCollapsed;

  if (target && (has(target, 'collapsed') || has(target, 'isExpanded'))) {
    // property is explicitly set so use it
    targetCollapsed = (
      has(target, 'collapsed') ? target.collapsed : !target.isExpanded
    );
  } else {
    // keep old state
    targetCollapsed = oldCollapsed;
  }

  if (oldCollapsed !== targetCollapsed) {
    element.collapsed = oldCollapsed;
    return true;
  }

  return false;
}



/**
 * This module takes care of replacing BPMN elements
 */
export default function BpmnReplace(
    bpmnFactory, replace, selection,
    modeling, eventBus) {

  var helper = new ModelCloneHelper(eventBus, bpmnFactory);

  /**
   * Prepares a new business object for the replacement element
   * and triggers the replace operation.
   *
   * @param  {djs.model.Base} element
   * @param  {Object} target
   * @param  {Object} [hints]
   *
   * @return {djs.model.Base} the newly created element
   */
  function replaceElement(element, target, hints) {

    hints = hints || {};

    var type = target.type,
        oldBusinessObject = element.businessObject;

    if (isSubProcess(oldBusinessObject)) {
      if (type === 'bpmn:SubProcess') {
        if (toggeling(element, target)) {
          // expanding or collapsing process
          modeling.toggleCollapse(element);

          return element;
        }
      }
    }

    var newBusinessObject = bpmnFactory.create(type);

    var newElement = {
      type: type,
      businessObject: newBusinessObject
    };

    var elementProps = getProperties(oldBusinessObject.$descriptor),
        newElementProps = getProperties(newBusinessObject.$descriptor, true),
        copyProps = intersection(elementProps, newElementProps);

    // initialize special properties defined in target definition
    assign(newBusinessObject, pick(target, CUSTOM_PROPERTIES));

    var properties = filter(copyProps, function(property) {
      var propName = property.replace(/bpmn:/, '');

      // copying event definitions, unless we replace
      if (propName === 'eventDefinitions') {
        return hasEventDefinition(element, target.eventDefinitionType);
      }

      // retain loop characteristics if the target element
      // is not an event sub process
      if (propName === 'loopCharacteristics') {
        return !isEventSubProcess(newBusinessObject);
      }

      // so the applied properties from 'target' don't get lost
      if (property in newBusinessObject) {
        return false;
      }

      if (propName === 'processRef' && target.isExpanded === false) {
        return false;
      }

      if (propName === 'triggeredByEvent') {
        return false;
      }

      return IGNORED_PROPERTIES.indexOf(propName) === -1;
    });

    newBusinessObject = helper.clone(oldBusinessObject, newBusinessObject, properties);

    // initialize custom BPMN extensions
    if (target.eventDefinitionType) {

      // only initialize with new eventDefinition
      // if we did not set an event definition yet,
      // i.e. because we cloned it
      if (!hasEventDefinition(newBusinessObject, target.eventDefinitionType)) {
        newElement.eventDefinitionType = target.eventDefinitionType;
      }
    }

    if (is(oldBusinessObject, 'bpmn:Activity')) {

      if (isSubProcess(oldBusinessObject)) {
        // no toggeling, so keep old state
        newElement.isExpanded = isExpanded(oldBusinessObject);
      }
      // else if property is explicitly set, use it
      else if (target && has(target, 'isExpanded')) {
        newElement.isExpanded = target.isExpanded;
      }

      // TODO: need also to respect min/max Size
      // copy size, from an expanded subprocess to an expanded alternative subprocess
      // except bpmn:Task, because Task is always expanded
      if ((isExpanded(oldBusinessObject) && !is(oldBusinessObject, 'bpmn:Task')) && newElement.isExpanded) {
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
      if (target.isExpanded === true) {
        newBusinessObject.processRef = bpmnFactory.create('bpmn:Process');
      } else {
        // remove children when transforming to collapsed pool
        hints.moveChildren = false;
      }

      // apply same size
      newElement.width = element.width;
      newElement.height = element.height;
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

    if ('fill' in oldBusinessObject.di || 'stroke' in oldBusinessObject.di) {
      assign(newElement, { colors: pick(oldBusinessObject.di, [ 'fill', 'stroke' ]) });
    }

    newElement = replace.replaceElement(element, newElement, hints);

    if (hints.select !== false) {
      selection.select(newElement);
    }

    return newElement;
  }

  this.replaceElement = replaceElement;
}

BpmnReplace.$inject = [
  'bpmnFactory',
  'replace',
  'selection',
  'modeling',
  'eventBus'
];


function isSubProcess(bo) {
  return is(bo, 'bpmn:SubProcess');
}

function hasEventDefinition(element, type) {

  var bo = getBusinessObject(element);

  return type && bo.get('eventDefinitions').some(function(definition) {
    return is(definition, type);
  });
}

/**
 * Compute intersection between two arrays.
 */
function intersection(a1, a2) {
  return a1.filter(function(el) {
    return a2.indexOf(el) !== -1;
  });
}