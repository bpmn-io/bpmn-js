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
        newBusinessObject = bpmnFactory.create(type);

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

    // copy size (for activities only)
    if (is(oldBusinessObject, 'bpmn:Activity')) {

      // TODO: need also to respect min/max Size

      newElement.width = element.width;
      newElement.height = element.height;
    }

    if (is(oldBusinessObject, 'bpmn:SubProcess')) {
      newElement.isExpanded = isExpanded(oldBusinessObject);
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
