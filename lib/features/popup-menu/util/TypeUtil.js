'use strict';

var getBusinessObject = require('../../../util/ModelUtil').getBusinessObject;
var isExpanded = require('../../../util/DiUtil').isExpanded;

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

    var isTypeEqual = businessObject.$type === target.type;

    var isEventDefinitionEqual = (
      (eventDefinition && eventDefinition.$type) === target.eventDefinitionType
    );

    var isTriggeredByEventEqual = (
      businessObject.triggeredByEvent === target.triggeredByEvent
    );

    var isExpandedEqual = (
        target.isExpanded === undefined ||
        target.isExpanded === isExpanded(businessObject)
    );

    return !isTypeEqual || !isEventDefinitionEqual || !isTriggeredByEventEqual || !isExpandedEqual;
  };
}

module.exports.isDifferentType = isDifferentType;