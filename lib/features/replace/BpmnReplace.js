'use strict';

var pick = require('lodash/object/pick'),
    assign = require('lodash/object/assign'),
    has = require('lodash/object/has');

var is = require('../../util/ModelUtil').is,
    isExpanded = require('../../util/DiUtil').isExpanded,
    isEventSubProcess = require('../../util/DiUtil').isEventSubProcess;

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
function BpmnReplace(bpmnFactory, replace, selection, modeling) {

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

    // initialize custom BPMN extensions
    if (target.eventDefinitionType) {
      newElement.eventDefinitionType = target.eventDefinitionType;
    }

    // initialize special properties defined in target definition
    assign(newBusinessObject, pick(target, CUSTOM_PROPERTIES));


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

    // retain loop characteristics if the target element is not an event sub process
    if (!isEventSubProcess(newBusinessObject)) {
      newBusinessObject.loopCharacteristics = oldBusinessObject.loopCharacteristics;
    }

    // retain default flow's reference between inclusive <-> exclusive gateways and activities
    if ((is(oldBusinessObject, 'bpmn:ExclusiveGateway') || is(oldBusinessObject, 'bpmn:InclusiveGateway') ||
         is(oldBusinessObject, 'bpmn:Activity')) &&
        (is(newBusinessObject, 'bpmn:ExclusiveGateway') || is(newBusinessObject, 'bpmn:InclusiveGateway') ||
         is(newBusinessObject, 'bpmn:Activity')))
    {
      newBusinessObject.default = oldBusinessObject.default;
    }

    if (oldBusinessObject.isForCompensation) {
      newBusinessObject.isForCompensation = true;
    }

    newElement = replace.replaceElement(element, newElement, hints);

    if (hints.select !== false) {
      selection.select(newElement);
    }

    return newElement;
  }

  this.replaceElement = replaceElement;
}

BpmnReplace.$inject = [ 'bpmnFactory', 'replace', 'selection', 'modeling' ];

module.exports = BpmnReplace;
