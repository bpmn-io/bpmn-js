'use strict';

var pick = require('min-dash').pick,
    assign = require('min-dash').assign,
    uniqueBy = require('min-dash').uniqueBy,
    findIndex = require('min-dash').findIndex,
    filter = require('min-dash').filter;

var is = require('../../util/ModelUtil').is,
    isAny = require('../modeling/util/ModelingUtil').isAny,
    isExpanded = require('../../util/DiUtil').isExpanded,
    isEventSubProcess = require('../../util/DiUtil').isEventSubProcess,
    ModelCloneUtils = require('../../util/model/ModelCloneUtils'),
    getProperties = ModelCloneUtils.getProperties;

var IGNORED_PROPERTIES = ModelCloneUtils.IGNORED_PROPERTIES;

var ModelCloneHelper = require('../../util/model/ModelCloneHelper');

var CUSTOM_PROPERTIES = [
  'cancelActivity',
  'instantiate',
  'eventGatewayType',
  'triggeredByEvent',
  'isInterrupting'
];


function toggeling(element, target) {

  var oldCollapsed = (
    element && hasOwnProperty(element, 'collapsed') ? element.collapsed : !isExpanded(element)
  );

  var targetCollapsed;

  if (target && (hasOwnProperty(target, 'collapsed') || hasOwnProperty(target, 'isExpanded'))) {
    // property is explicitly set so use it
    targetCollapsed = (
      hasOwnProperty(target, 'collapsed') ? target.collapsed : !target.isExpanded
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
function BpmnReplace(bpmnFactory, replace, selection, modeling, eventBus) {

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
        properties = uniqueBy(function(e) { return e; }, filter(elementProps, function(value) {
          return findIndex(newElementProps, value) !== -1;
        }));

    // initialize special properties defined in target definition
    assign(newBusinessObject, pick(target, CUSTOM_PROPERTIES));

    properties = filter(properties, function(property) {
      var propName = property.replace(/bpmn:/, '');

      // so the applied properties from 'target' don't get lost
      if (newBusinessObject[property] !== undefined) {
        return false;
      }

      // retain loop characteristics if the target element is not an event sub process
      if (propName === 'loopCharacteristics') {
        return !isEventSubProcess(newBusinessObject);
      }

      if ((propName === 'processRef' && target.isExpanded === false) ||
           propName === 'triggeredByEvent' ||
           propName === 'eventDefinitions') {
        return false;
      }

      return IGNORED_PROPERTIES.indexOf(propName) === -1;
    });

    newBusinessObject = helper.clone(oldBusinessObject, newBusinessObject, properties);

    // initialize custom BPMN extensions
    if (target.eventDefinitionType) {
      newElement.eventDefinitionType = target.eventDefinitionType;
    }

    if (is(oldBusinessObject, 'bpmn:Activity')) {

      if (isSubProcess(oldBusinessObject)) {
        // no toggeling, so keep old state
        newElement.isExpanded = isExpanded(oldBusinessObject);
      }
      // else if property is explicitly set, use it
      else if (target && hasOwnProperty(target, 'isExpanded')) {
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

module.exports = BpmnReplace;


function isSubProcess(bo) {
  return is(bo, 'bpmn:SubProcess');
}