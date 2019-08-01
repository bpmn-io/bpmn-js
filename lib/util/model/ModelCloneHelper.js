import {
  find,
  forEach,
  isArray,
  isObject,
  matchPattern,
  reduce,
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
 * Utility for copying properties from source element to target element.
 *
 * @param {EventBus} eventBus
 * @param {BpmnFactory} bpmnFactory
 * @param {BpmnModdle} moddle
 */
export default function ModelCloneHelper(eventBus, bpmnFactory, moddle) {
  this._bpmnFactory = bpmnFactory;
  this._eventBus = eventBus;

  // default check wether property can be copied
  eventBus.on('element.copyProperty', function(context) {
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
}

ModelCloneHelper.$inject = [
  'eventBus',
  'bpmnFactory',
  'moddle'
];

/**
 * Copy properties of source element to target element.
 *
 * @param {ModdleElement} sourceElement
 * @param {ModdleElement} targetElement
 * @param {Array<string>} [propertyNames]
 *
 * @param {ModdleElement}
 */
ModelCloneHelper.prototype.clone = function(sourceElement, targetElement, propertyNames) {
  var self = this;

  if (propertyNames && !isArray(propertyNames)) {
    propertyNames = [ propertyNames ];
  }

  propertyNames = propertyNames || getPropertyNames(sourceElement.$descriptor);

  // copy extension elements last
  propertyNames = sortBy(propertyNames, function(propertyName) {
    return propertyName === 'extensionElements';
  });

  // copy properties
  forEach(propertyNames, function(propertyName) {
    var copiedProperty = self._eventBus.fire('element.copyProperty', {
      parent: targetElement,
      propertyName: propertyName
    });

    // return if copying is NOT allowed
    if (copiedProperty === false) {
      return;
    }

    var sourceProperty;

    if (sourceElement.hasOwnProperty(propertyName)) {
      sourceProperty = sourceElement.get(propertyName);
    }

    copiedProperty = copiedProperty ||
      self.copyProperty(sourceProperty, targetElement, propertyName);

    targetElement.set(propertyName, copiedProperty);
  });

  return targetElement;
};

/**
 * Clone property.
 *
 * @param {*} property
 * @param {ModdleElement} parent
 * @param {string} propertyName
 *
 * @returns {*}
 */
ModelCloneHelper.prototype.copyProperty = function(property, parent, propertyName) {
  var self = this;

  // allow others to copy property
  var copiedProperty = this._eventBus.fire('element.copyProperty', {
    parent: parent,
    property: property,
    propertyName: propertyName
  });

  // return if copying is NOT allowed
  if (copiedProperty === false) {
    return;
  }

  if (copiedProperty) {
    return copiedProperty;
  }

  var propertyDescriptor = parent.$model.getPropertyDescriptor(parent, propertyName);

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
    copiedProperty = self.clone(property, copiedProperty);

    // do NOT copy empty extension elements
    if (is(copiedProperty, 'bpmn:ExtensionElements') &&
      copiedProperty.values &&
      !copiedProperty.values.length) {
      return;
    }

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