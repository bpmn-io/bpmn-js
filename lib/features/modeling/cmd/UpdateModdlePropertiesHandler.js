import {
  reduce,
  keys,
  forEach
} from 'min-dash';

import {
  is,
  getBusinessObject
} from '../../../util/ModelUtil';

/**
 * @typedef {import('diagram-js/lib/command/CommandHandler').default} CommandHandler
 *
 * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
 *
 * @typedef {import('../../../model/Types').Shape} Shape
 * @typedef {import('../../../model/Types').ModdleElement} ModdleElement
 */

/**
 * @implements {CommandHandler}
 *
 * @param {ElementRegistry} elementRegistry
 */
export default function UpdateModdlePropertiesHandler(elementRegistry) {
  this._elementRegistry = elementRegistry;
}

UpdateModdlePropertiesHandler.$inject = [ 'elementRegistry' ];

UpdateModdlePropertiesHandler.prototype.execute = function(context) {

  var element = context.element,
      moddleElement = context.moddleElement,
      properties = context.properties;

  if (!moddleElement) {
    throw new Error('<moddleElement> required');
  }

  // TODO(nikku): we need to ensure that ID properties
  // are properly registered / unregistered via
  // this._moddle.ids.assigned(id)
  var changed = context.changed || this._getVisualReferences(moddleElement).concat(element);
  var oldProperties = context.oldProperties || getModdleProperties(moddleElement, keys(properties));

  setModdleProperties(moddleElement, properties);

  context.oldProperties = oldProperties;
  context.changed = changed;

  return changed;
};

UpdateModdlePropertiesHandler.prototype.revert = function(context) {
  var oldProperties = context.oldProperties,
      moddleElement = context.moddleElement,
      changed = context.changed;

  setModdleProperties(moddleElement, oldProperties);

  return changed;
};

/**
 * Return visual references of given moddle element within the diagram.
 *
 * @param {ModdleElement} moddleElement
 *
 * @return {Shape[]}
 */
UpdateModdlePropertiesHandler.prototype._getVisualReferences = function(moddleElement) {

  var elementRegistry = this._elementRegistry;

  if (is(moddleElement, 'bpmn:DataObject')) {
    return getAllDataObjectReferences(moddleElement, elementRegistry);
  }

  return [];
};


// helpers /////////////////

function getModdleProperties(moddleElement, propertyNames) {
  return reduce(propertyNames, function(result, key) {
    result[key] = moddleElement.get(key);
    return result;
  }, {});
}

function setModdleProperties(moddleElement, properties) {
  forEach(properties, function(value, key) {
    moddleElement.set(key, value);
  });
}

function getAllDataObjectReferences(dataObject, elementRegistry) {
  return elementRegistry.filter(function(element) {
    return (
      is(element, 'bpmn:DataObjectReference') &&
          getBusinessObject(element).dataObjectRef === dataObject
    );
  });
}
