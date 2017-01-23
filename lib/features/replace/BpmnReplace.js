'use strict';

var pick = require('lodash/object/pick'),
    assign = require('lodash/object/assign'),
    intersection = require('lodash/array/intersection'),
    filter = require('lodash/collection/filter'),
    has = require('lodash/object/has');

var is = require('../../util/ModelUtil').is,
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

  var oldCollapsed = has(element, 'collapsed') ?
                     element.collapsed : !isExpanded(element);

  var targetCollapsed;

  if (has(target, 'collapsed') || has(target, 'isExpanded')) {
    // property is explicitly set so use it
    targetCollapsed = has(target, 'collapsed') ?
                      target.collapsed : !target.isExpanded;
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

  var helper = new ModelCloneHelper(eventBus);

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

    if (is(oldBusinessObject, 'bpmn:SubProcess')) {
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
        properties = intersection(elementProps, newElementProps);

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

      if (is(oldBusinessObject, 'bpmn:SubProcess')) {
        // no toggeling, so keep old state
        newElement.isExpanded = isExpanded(oldBusinessObject);
      }
      // else if property is explicitly set, use it
      else if (has(target, 'isExpanded')) {
        newElement.isExpanded = target.isExpanded;
      }

      // TODO: need also to respect min/max Size
      // copy size, from an expanded subprocess to an expanded alternative subprocess
      // except bpmn:Task, because Task is always expanded
      if ((isExpanded(oldBusinessObject) && !is(oldBusinessObject, 'bpmn:Task')) && target.isExpanded) {
        newElement.width = element.width;
        newElement.height = element.height;
      }
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
    if ((is(oldBusinessObject, 'bpmn:ExclusiveGateway') || is(oldBusinessObject, 'bpmn:InclusiveGateway') ||
         is(oldBusinessObject, 'bpmn:Activity')) &&
        (is(newBusinessObject, 'bpmn:ExclusiveGateway') || is(newBusinessObject, 'bpmn:InclusiveGateway') ||
         is(newBusinessObject, 'bpmn:Activity')))
    {
      newBusinessObject.default = oldBusinessObject.default;
    }

    newElement = replace.replaceElement(element, newElement, hints);

    if (hints.select !== false) {
      selection.select(newElement);
    }

    return newElement;
  }

  this.replaceElement = replaceElement;
}

BpmnReplace.$inject = [ 'bpmnFactory', 'replace', 'selection', 'modeling', 'eventBus' ];

module.exports = BpmnReplace;
