'use strict';

var reduce = require('lodash/object/transform'),
    keys = require('lodash/object/keys'),
    forEach = require('lodash/collection/forEach');

var DEFAULT_FLOW = 'default',
    NAME = 'name',
    ID = 'id';


/**
 * A handler that implements a BPMN 2.0 property update.
 *
 * This should be used to set simple properties on elements with
 * an underlying BPMN business object.
 *
 * Use respective diagram-js provided handlers if you would
 * like to perform automated modeling.
 */
function UpdatePropertiesHandler(elementRegistry) {
  this._elementRegistry = elementRegistry;
}

UpdatePropertiesHandler.$inject = [ 'elementRegistry' ];

module.exports = UpdatePropertiesHandler;


function getProperties(businessObject, propertyNames) {
  return reduce(propertyNames, function(result, key) {
    result[key] = businessObject.get(key);
    return result;
  }, {});
}


function setProperties(businessObject, properties) {
  forEach(properties, function(value, key) {
    businessObject.set(key, value);
  });
}


////// api /////////////////////////////////////////////

/**
 * Updates a BPMN element with a list of new properties
 *
 * @param {Object} context
 * @param {djs.model.Base} context.element the element to update
 * @param {Object} context.properties a list of properties to set on the element's
 *                                    businessObject (the BPMN model element)
 *
 * @return {Array<djs.mode.Base>} the updated element
 */
UpdatePropertiesHandler.prototype.execute = function(context) {

  var element = context.element,
      changed = [ element ];

  if (!element) {
    throw new Error('element required');
  }

  var elementRegistry = this._elementRegistry;

  var businessObject = element.businessObject,
      properties = context.properties,
      oldProperties = context.oldProperties || getProperties(businessObject, keys(properties));

  if (ID in properties) {
    elementRegistry.updateId(element, properties[ID]);
  }

  // correctly indicate visual changes on default flow updates
  if (DEFAULT_FLOW in properties) {

    if (properties[DEFAULT_FLOW]) {
      changed.push(elementRegistry.get(properties[DEFAULT_FLOW].id));
    }

    if (businessObject[DEFAULT_FLOW]) {
      changed.push(elementRegistry.get(businessObject[DEFAULT_FLOW].id));
    }
  }

  if (NAME in properties && element.label) {
    changed.push(element.label);
  }

  // update properties
  setProperties(businessObject, properties);

  // store old values
  context.oldProperties = oldProperties;
  context.changed = changed;

  // indicate changed on objects affected by the update
  return changed;
};

/**
 * Reverts the update on a BPMN elements properties.
 *
 * @param  {Object} context
 *
 * @return {djs.mode.Base} the updated element
 */
UpdatePropertiesHandler.prototype.revert = function(context) {

  var element = context.element,
      oldProperties = context.oldProperties,
      businessObject = element.businessObject,
      elementRegistry = this._elementRegistry;

  // update properties
  setProperties(businessObject, oldProperties);

  if (ID in oldProperties) {
    elementRegistry.updateId(element, oldProperties[ID]);
  }

  return context.changed;
};
