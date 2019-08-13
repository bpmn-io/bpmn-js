import {
  find,
  forEach,
  isArray,
  isDefined,
  isObject,
  matchPattern,
  reduce,
  has,
  sortBy
} from 'min-dash';

var DISALLOWED_PROPERTIES = [
  'artifacts',
  'dataInputAssociations',
  'dataOutputAssociations',
  'default',
  'flowElements',
  'lanes',
  'incoming',
  'outgoing'
];

/**
 * @typedef {Function} <moddleCopy.canCopyProperties> listener
 *
 * @param {Object} context
 * @param {Array<string>} context.propertyNames
 * @param {ModdleElement} context.sourceElement
 * @param {ModdleElement} context.targetElement
 *
 * @returns {Array<string>|boolean} - Return properties to be copied or false to disallow
 * copying.
 */

/**
 * @typedef {Function} <moddleCopy.canCopyProperty> listener
 *
 * @param {Object} context
 * @param {ModdleElement} context.parent
 * @param {*} context.property
 * @param {string} context.propertyName
 *
 * @returns {*|boolean} - Return copied property or false to disallow
 * copying.
 */

/**
 * @typedef {Function} <moddleCopy.canSetCopiedProperty> listener
 *
 * @param {Object} context
 * @param {ModdleElement} context.parent
 * @param {*} context.property
 * @param {string} context.propertyName
 *
 * @returns {boolean} - Return false to disallow
 * setting copied property.
 */

/**
 * Utility for copying model properties from source element to target element.
 *
 * @param {EventBus} eventBus
 * @param {BpmnFactory} bpmnFactory
 * @param {BpmnModdle} moddle
 */
export default function ModdleCopy(eventBus, bpmnFactory, moddle) {
  this._bpmnFactory = bpmnFactory;
  this._eventBus = eventBus;
  this._moddle = moddle;

  // copy extension elements last
  eventBus.on('moddleCopy.canCopyProperties', function(context) {
    var propertyNames = context.propertyNames;

    if (!propertyNames || !propertyNames.length) {
      return;
    }

    return sortBy(propertyNames, function(propertyName) {
      return propertyName === 'extensionElements';
    });
  });

  // default check wether property can be copied
  eventBus.on('moddleCopy.canCopyProperty', function(context) {
    var parent = context.parent,
        parentDescriptor = isObject(parent) && parent.$descriptor,
        propertyName = context.propertyName;

    if (propertyName && DISALLOWED_PROPERTIES.indexOf(propertyName) !== -1) {

      // disallow copying property
      return false;
    }

    if (propertyName &&
      parentDescriptor &&
      !find(parentDescriptor.properties, matchPattern({ name: propertyName }))) {

      // disallow copying property
      return false;
    }
  });

  // do NOT allow to copy empty extension elements
  eventBus.on('moddleCopy.canSetCopiedProperty', function(context) {
    var property = context.property;

    if (is(property, 'bpmn:ExtensionElements') && (!property.values || !property.values.length)) {

      // disallow setting copied property
      return false;
    }
  });
}

ModdleCopy.$inject = [
  'eventBus',
  'bpmnFactory',
  'moddle'
];

/**
 * Copy model properties of source element to target element.
 *
 * @param {ModdleElement} sourceElement
 * @param {ModdleElement} targetElement
 * @param {Array<string>} [propertyNames]
 *
 * @param {ModdleElement}
 */
ModdleCopy.prototype.copyElement = function(sourceElement, targetElement, propertyNames) {
  var self = this;

  if (propertyNames && !isArray(propertyNames)) {
    propertyNames = [ propertyNames ];
  }

  propertyNames = propertyNames || getPropertyNames(sourceElement.$descriptor);

  var canCopyProperties = this._eventBus.fire('moddleCopy.canCopyProperties', {
    propertyNames: propertyNames,
    sourceElement: sourceElement,
    targetElement: targetElement
  });

  if (canCopyProperties === false) {
    return targetElement;
  }

  if (isArray(canCopyProperties)) {
    propertyNames = canCopyProperties;
  }

  // copy properties
  forEach(propertyNames, function(propertyName) {
    var sourceProperty;

    if (has(sourceElement, propertyName)) {
      sourceProperty = sourceElement.get(propertyName);
    }

    var copiedProperty = self.copyProperty(sourceProperty, targetElement, propertyName);

    var canSetProperty = self._eventBus.fire('moddleCopy.canSetCopiedProperty', {
      parent: parent,
      property: copiedProperty,
      propertyName: propertyName
    });

    if (canSetProperty === false) {
      return;
    }

    if (isDefined(copiedProperty)) {
      targetElement.set(propertyName, copiedProperty);
    }
  });

  return targetElement;
};

/**
 * Copy model property.
 *
 * @param {*} property
 * @param {ModdleElement} parent
 * @param {string} propertyName
 *
 * @returns {*}
 */
ModdleCopy.prototype.copyProperty = function(property, parent, propertyName) {
  var self = this;

  // allow others to copy property
  var copiedProperty = this._eventBus.fire('moddleCopy.canCopyProperty', {
    parent: parent,
    property: property,
    propertyName: propertyName
  });

  // return if copying is NOT allowed
  if (copiedProperty === false) {
    return;
  }

  if (copiedProperty) {
    if (isObject(copiedProperty) && copiedProperty.$type && !copiedProperty.$parent) {
      copiedProperty.$parent = parent;
    }

    return copiedProperty;
  }

  var propertyDescriptor = this._moddle.getPropertyDescriptor(parent, propertyName);

  // do NOT copy Ids and references
  if (propertyDescriptor.isId || propertyDescriptor.isReference) {
    return;
  }

  // copy arrays
  if (isArray(property)) {
    return reduce(property, function(childProperties, childProperty) {

      // recursion
      copiedProperty = self.copyProperty(childProperty, parent, propertyName);

      // copying might NOT be allowed
      if (copiedProperty) {
        copiedProperty.$parent = parent;

        return childProperties.concat(copiedProperty);
      }

      return childProperties;
    }, []);
  }

  // copy model elements
  if (isObject(property) && property.$type) {
    copiedProperty = self._bpmnFactory.create(property.$type);

    copiedProperty.$parent = parent;

    // recursion
    copiedProperty = self.copyElement(property, copiedProperty);

    return copiedProperty;
  }

  // copy primitive properties
  return property;
};

// helpers //////////

export function getPropertyNames(descriptor, keepDefaultProperties) {
  return reduce(descriptor.properties, function(properties, property) {

    if (keepDefaultProperties && property.default) {
      return properties;
    }

    return properties.concat(property.name);
  }, []);
}

function is(element, type) {
  return element && (typeof element.$instanceOf === 'function') && element.$instanceOf(type);
}