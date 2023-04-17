import {
  find,
  forEach,
  has,
  isArray,
  isDefined,
  isFunction,
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
  'outgoing',
  'categoryValue'
];

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../modeling/BpmnFactory').default} BpmnFactory
 * @typedef {import('../../model/Types').Moddle} Moddle
 *
 * @typedef {import('../../model/Types').ModdleElement} ModdleElement
 */

/**
 * Utility for copying model properties from source element to target element.
 *
 * @param {EventBus} eventBus
 * @param {BpmnFactory} bpmnFactory
 * @param {Moddle} moddle
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

  // default check whether property can be copied
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
 * @param {string[]} [propertyNames]
 * @param {boolean} [clone=false]
 *
 * @return {ModdleElement}
 */
ModdleCopy.prototype.copyElement = function(sourceElement, targetElement, propertyNames, clone = false) {
  var self = this;

  if (propertyNames && !isArray(propertyNames)) {
    propertyNames = [ propertyNames ];
  }

  propertyNames = propertyNames || getPropertyNames(sourceElement.$descriptor);

  var canCopyProperties = this._eventBus.fire('moddleCopy.canCopyProperties', {
    propertyNames: propertyNames,
    sourceElement: sourceElement,
    targetElement: targetElement,
    clone: clone
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

    var copiedProperty = self.copyProperty(sourceProperty, targetElement, propertyName, clone);

    if (!isDefined(copiedProperty)) {
      return;
    }

    var canSetProperty = self._eventBus.fire('moddleCopy.canSetCopiedProperty', {
      parent: targetElement,
      property: copiedProperty,
      propertyName: propertyName
    });

    if (canSetProperty === false) {
      return;
    }

    // TODO(nikku): unclaim old IDs if ID property is copied over
    // this._moddle.getPropertyDescriptor(parent, propertyName)
    targetElement.set(propertyName, copiedProperty);
  });

  return targetElement;
};

/**
 * Copy model property.
 *
 * @param {any} property
 * @param {ModdleElement} parent
 * @param {string} propertyName
 * @param {boolean} [clone=false]
 *
 * @return {any}
 */
ModdleCopy.prototype.copyProperty = function(property, parent, propertyName, clone = false) {
  var self = this;

  // allow others to copy property
  var copiedProperty = this._eventBus.fire('moddleCopy.canCopyProperty', {
    parent: parent,
    property: property,
    propertyName: propertyName,
    clone: clone
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

  // do NOT copy references
  if (propertyDescriptor.isReference) {
    return;
  }

  // copy id
  if (propertyDescriptor.isId) {
    return property && this._copyId(property, parent, clone);
  }

  // copy arrays
  if (isArray(property)) {
    return reduce(property, function(childProperties, childProperty) {

      // recursion
      copiedProperty = self.copyProperty(childProperty, parent, propertyName, clone);

      // copying might NOT be allowed
      if (copiedProperty) {
        return childProperties.concat(copiedProperty);
      }

      return childProperties;
    }, []);
  }

  // copy model elements
  if (isObject(property) && property.$type) {
    if (this._moddle.getElementDescriptor(property).isGeneric) {
      return;
    }

    copiedProperty = self._bpmnFactory.create(property.$type);

    copiedProperty.$parent = parent;

    // recursion
    copiedProperty = self.copyElement(property, copiedProperty, null, clone);

    return copiedProperty;
  }

  // copy primitive properties
  return property;
};

ModdleCopy.prototype._copyId = function(id, element, clone = false) {
  if (clone) {
    return id;
  }

  // disallow if already taken
  if (this._moddle.ids.assigned(id)) {
    return;
  } else {

    this._moddle.ids.claim(id, element);
    return id;
  }
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
  return element && isFunction(element.$instanceOf) && element.$instanceOf(type);
}