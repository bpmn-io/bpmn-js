'use strict';

var pick = require('lodash/object/pick'),
    assign = require('lodash/object/assign');

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
        oldBusinessObject = element.businessObject,
        businessObject = bpmnFactory.create(type);

    var newElement = {
      type: type,
      businessObject: businessObject
    };

    // initialize custom BPMN extensions
    if (target.eventDefinition) {
      var eventDefinitions = businessObject.get('eventDefinitions'),
          eventDefinition = bpmnFactory.create(target.eventDefinition);

      eventDefinition.$parent = businessObject;
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

    businessObject.name = oldBusinessObject.name;

    // retain loop characteristics if the target element is not an event sub process
    if (!isEventSubProcess(businessObject)) {
      businessObject.loopCharacteristics = oldBusinessObject.loopCharacteristics;
    }

    // retain default flow's reference between inclusive <-> exclusive gateways and activities
    if ((is(oldBusinessObject, 'bpmn:ExclusiveGateway') || is(oldBusinessObject, 'bpmn:InclusiveGateway') ||
         is(oldBusinessObject, 'bpmn:Activity')) &&
        (is(businessObject, 'bpmn:ExclusiveGateway') || is(businessObject, 'bpmn:InclusiveGateway') ||
         is(businessObject, 'bpmn:Activity')))
    {
      businessObject.default = oldBusinessObject.default;
    }

    newElement = replace.replaceElement(element, newElement);

    if (hints.select !== false) {
      selection.select(newElement);
    }

    return newElement;
  }

  this.replaceElement = replaceElement;
}

BpmnReplace.$inject = [ 'bpmnFactory', 'replace', 'selection', 'modeling' ];

module.exports = BpmnReplace;
