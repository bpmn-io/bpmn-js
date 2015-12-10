'use strict';

var getBusinessObject = require('../../../util/ModelUtil').getBusinessObject;

/**
 * Returns true, if an element is from a different type than a target definition.
 * Takes into account the type and the event definition type.
 *
 * @param {djs.model.Base} element
 *
 * @return {Boolean}
 */
function isDifferentType(element) {

  return function(entry) {
    var target = entry.target;

    var businessObject = getBusinessObject(element),
        eventDefinition = businessObject.eventDefinitions && businessObject.eventDefinitions[0].$type;

    var isEventDefinitionEqual = target.eventDefinition == eventDefinition,
        isTypeEqual = businessObject.$type == target.type;

    return (!isEventDefinitionEqual && isTypeEqual) || !isTypeEqual;
  };
}

module.exports.isDifferentType = isDifferentType;