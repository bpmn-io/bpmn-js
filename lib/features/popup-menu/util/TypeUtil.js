'use strict';

var getBusinessObject = require('../../../util/ModelUtil').getBusinessObject;

/**
 * Returns true, if an element is from a different type
 * than a target definition. Takes into account the type,
 * event definition type and triggeredByEvent property.
 *
 * @param {djs.model.Base} element
 *
 * @return {Boolean}
 */
function isDifferentType(element) {

  return function(entry) {
    var target = entry.target;

    var businessObject = getBusinessObject(element),
        eventDefinition = businessObject.eventDefinitions && businessObject.eventDefinitions[0];

    var isEventDefinitionEqual = (eventDefinition && eventDefinition.$type) === target.eventDefinitionType,
        isTypeEqual = businessObject.$type === target.type,
        isTriggeredByEventEqual = businessObject.triggeredByEvent == target.triggeredByEvent;

    return !isTypeEqual || !isEventDefinitionEqual || !isTriggeredByEventEqual;
  };
}

module.exports.isDifferentType = isDifferentType;